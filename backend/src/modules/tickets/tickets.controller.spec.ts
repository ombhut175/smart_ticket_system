import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: jest.Mocked<TicketsService>;

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

  const mockRequest = {
    user: mockUser,
  };

  const mockModeratorRequest = {
    user: mockModerator,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: {
            create: jest.fn(),
            findAllByUser: jest.fn(),
            findAllForModerator: jest.fn(),
            findById: jest.fn(),
            updateTicket: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get(TicketsService);
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

    it('should create ticket successfully', async () => {
      service.create.mockResolvedValue(mockTicket as any);

      const result = await controller.create(createDto, mockRequest as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
      expect(result).toEqual(
        ApiResponseHelper.created(
          mockTicket,
          'Ticket created and processing started',
        ),
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      service.create.mockRejectedValue(error);

      await expect(
        controller.create(createDto, mockRequest as any),
      ).rejects.toThrow(error);
    });
  });

  //#endregion

  //#region ==================== TICKET RETRIEVAL TESTS ====================

  describe('findAll', () => {
    const mockTickets = [mockTicket];
    const query: TicketQueryDto = { status: 'todo' };

    it('should return user tickets for regular user', async () => {
      service.findAllByUser.mockResolvedValue(mockTickets as any);

      const result = await controller.findAll(mockRequest as any, query);

      expect(service.findAllByUser).toHaveBeenCalledWith(mockUser.id, query);
      expect(service.findAllForModerator).not.toHaveBeenCalled();
      expect(result).toEqual(
        ApiResponseHelper.success(
          mockTickets,
          'Tickets retrieved successfully',
        ),
      );
    });

    it('should return all tickets for moderator', async () => {
      service.findAllForModerator.mockResolvedValue(mockTickets as any);

      const result = await controller.findAll(
        mockModeratorRequest as any,
        query,
      );

      expect(service.findAllForModerator).toHaveBeenCalledWith(
        mockModerator.role,
        query,
      );
      expect(service.findAllByUser).not.toHaveBeenCalled();
      expect(result).toEqual(
        ApiResponseHelper.success(
          mockTickets,
          'Tickets retrieved successfully',
        ),
      );
    });
  });

  describe('findOne', () => {
    const ticketId = 'ticket-123';

    it('should return ticket by ID', async () => {
      service.findById.mockResolvedValue(mockTicket as any);

      const result = await controller.findOne(ticketId, mockRequest as any);

      expect(service.findById).toHaveBeenCalledWith(ticketId, mockUser);
      expect(result).toEqual(
        ApiResponseHelper.success(mockTicket, 'Ticket retrieved successfully'),
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Ticket not found');
      service.findById.mockRejectedValue(error);

      await expect(
        controller.findOne(ticketId, mockRequest as any),
      ).rejects.toThrow(error);
    });
  });

  //#endregion

  //#region ==================== TICKET UPDATES TESTS ====================

  describe('update', () => {
    const ticketId = 'ticket-123';
    const updateDto: UpdateTicketDto = {
      status: 'in_progress',
      helpful_notes: 'Working on this issue',
    };

    it('should update ticket as moderator', async () => {
      const updatedTicket = { ...mockTicket, ...updateDto };
      service.updateTicket.mockResolvedValue(updatedTicket as any);

      const result = await controller.update(
        ticketId,
        updateDto,
        mockModeratorRequest as any,
      );

      expect(service.updateTicket).toHaveBeenCalledWith(
        ticketId,
        updateDto,
        mockModerator,
      );
      expect(result).toEqual(
        ApiResponseHelper.success(updatedTicket, 'Ticket updated successfully'),
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Update failed');
      service.updateTicket.mockRejectedValue(error);

      await expect(
        controller.update(ticketId, updateDto, mockModeratorRequest as any),
      ).rejects.toThrow(error);
    });
  });

  //#endregion
});
