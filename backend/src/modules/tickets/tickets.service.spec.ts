import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { SupabaseService } from '../../core/database/supabase.client';
import { InngestService } from '../../background/inngest.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import {
  TABLES,
  TICKET_STATUS,
  INNGEST_EVENTS,
} from '../../common/helpers/string-const';

describe('TicketsService', () => {
  let service: TicketsService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let inngestService: jest.Mocked<InngestService>;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };

  const mockUser = {
    id: 'user-123',
    role: 'user',
    email: 'test@example.com',
  };

  const mockModerator = {
    id: 'mod-123',
    role: 'moderator',
    email: 'moderator@example.com',
  };

  const mockTicket = {
    id: 'ticket-123',
    title: 'Test Issue',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    created_by: 'user-123',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue(mockSupabaseClient),
          },
        },
        {
          provide: InngestService,
          useValue: {
            sendEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    supabaseService = module.get(SupabaseService);
    inngestService = module.get(InngestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //#region ==================== TICKET CREATION TESTS ====================

  describe('create', () => {
    const createDto: CreateTicketDto = {
      title: 'Test Issue',
      description: 'Test description for the issue',
    };

    it('should create ticket and emit event successfully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const result = await service.create(createDto, mockUser.id);

      expect(supabaseService.getClient().from).toHaveBeenCalledWith(
        TABLES.TICKETS,
      );
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        title: createDto.title,
        description: createDto.description,
        created_by: mockUser.id,
        status: TICKET_STATUS.TODO,
        priority: 'medium',
      });
      expect(inngestService.sendEvent).toHaveBeenCalledWith({
        name: INNGEST_EVENTS.TICKET_CREATED,
        data: {
          ticketId: mockTicket.id,
          title: mockTicket.title,
          description: mockTicket.description,
          createdBy: mockUser.id,
        },
      });
      expect(result).toEqual(mockTicket);
    });

    it('should throw BadRequestException on database error', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.create(createDto, mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle Inngest event emission failure gracefully', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockTicket,
        error: null,
      });
      inngestService.sendEvent.mockRejectedValue(new Error('Inngest error'));

      await expect(service.create(createDto, mockUser.id)).rejects.toThrow();
    });
  });

  //#endregion

  //#region ==================== TICKET RETRIEVAL TESTS ====================

  describe('findAllByUser', () => {
    it('should return user tickets only', async () => {
      const mockTickets = [mockTicket];
      mockSupabaseClient.eq.mockResolvedValue({
        data: mockTickets,
        error: null,
      });

      const result = await service.findAllByUser(mockUser.id);

      expect(mockSupabaseClient.select).toHaveBeenCalledWith(
        'id, title, description, status, priority, created_at, summary',
      );
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'created_by',
        mockUser.id,
      );
      expect(result).toEqual(mockTickets);
    });

    it('should apply status filter when provided', async () => {
      const query: TicketQueryDto = { status: 'in_progress' };
      mockSupabaseClient.eq.mockResolvedValue({
        data: [mockTicket],
        error: null,
      });

      await service.findAllByUser(mockUser.id, query);

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'status',
        'in_progress',
      );
    });

    it('should throw BadRequestException on database error', async () => {
      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.findAllByUser(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllForModerator', () => {
    it('should return all tickets for moderator', async () => {
      const mockTickets = [mockTicket];
      mockSupabaseClient.order.mockResolvedValue({
        data: mockTickets,
        error: null,
      });

      const result = await service.findAllForModerator(mockModerator.role);

      expect(mockSupabaseClient.select).toHaveBeenCalledWith(
        expect.stringContaining('assignee:assigned_to'),
      );
      expect(result).toEqual(mockTickets);
    });

    it('should throw ForbiddenException for regular user', async () => {
      await expect(service.findAllForModerator('user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findById', () => {
    it('should return ticket for owner (user role)', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const result = await service.findById(mockTicket.id, mockUser);

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', mockTicket.id);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'created_by',
        mockUser.id,
      );
      expect(result).toEqual(mockTicket);
    });

    it('should return full ticket details for moderator', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockTicket,
        error: null,
      });

      const result = await service.findById(mockTicket.id, mockModerator);

      expect(mockSupabaseClient.select).toHaveBeenCalledWith(
        expect.stringContaining('assignee:assigned_to'),
      );
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.findById('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  //#endregion

  //#region ==================== TICKET UPDATES TESTS ====================

  describe('updateTicket', () => {
    const updateDto: UpdateTicketDto = {
      status: 'in_progress',
      helpful_notes: 'Working on this issue',
    };

    it('should update ticket as moderator', async () => {
      const updatedTicket = { ...mockTicket, ...updateDto };
      mockSupabaseClient.single.mockResolvedValue({
        data: updatedTicket,
        error: null,
      });

      const result = await service.updateTicket(
        mockTicket.id,
        updateDto,
        mockModerator,
      );

      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        ...updateDto,
        updated_at: expect.any(String),
      });
      expect(result).toEqual(updatedTicket);
    });

    it('should throw ForbiddenException for regular user', async () => {
      await expect(
        service.updateTicket(mockTicket.id, updateDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        service.updateTicket('nonexistent', updateDto, mockModerator),
      ).rejects.toThrow(NotFoundException);
    });
  });

  //#endregion
});
