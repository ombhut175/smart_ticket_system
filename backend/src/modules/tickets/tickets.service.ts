import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../core/database/supabase.client';
import { DatabaseRepository } from '../../core/database/database.repository';
import { InngestService } from '../../background/inngest.service';
import { Ticket } from './interfaces/ticket.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { 
  TABLES, 
  TICKET_STATUS, 
  INNGEST_EVENTS, 
  TICKET_DEFAULTS, 
  USER_ROLES,
  QUERY_SELECTORS,
  TABLE_COLUMNS,
  MESSAGES,
  LOG_MESSAGES,
  interpolateMessage
} from '../../common/helpers/string-const';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private dbRepo: DatabaseRepository,
    private inngestService: InngestService,
  ) {}

  //#region ==================== TICKET CREATION ====================

  async create(createTicketDto: CreateTicketDto, userId: string): Promise<Ticket> {
    // Log ticket creation start
    this.logger.log(interpolateMessage(LOG_MESSAGES.TICKET_CREATE_STARTED, { 
      userId, 
      title: createTicketDto.title 
    }));
    
    try {
      // Insert ticket into database using Drizzle
      const ticket = await this.dbRepo.createTicketCompat(
        createTicketDto.title,
        createTicketDto.description,
        userId,
        TICKET_STATUS.TODO,
        TICKET_DEFAULTS.PRIORITY
      );

      if (!ticket) {
        this.logger.error(interpolateMessage(LOG_MESSAGES.TICKET_CREATE_FAILED, { userId }));
        throw new BadRequestException('Failed to create ticket');
      }

      // Emit event for AI processing (following project helper)
      this.logger.log(`📤 Sending Inngest event for ticket: ${ticket.id}`);
      await this.inngestService.sendEvent({
        name: INNGEST_EVENTS.TICKET_CREATED,
        data: {
          ticketId: ticket.id,
          title: ticket.title,
          description: ticket.description,
          createdBy: userId,
        },
      });

      // Log successful ticket creation
      this.logger.log(interpolateMessage(LOG_MESSAGES.TICKET_CREATE_SUCCESS, { 
        ticketId: ticket.id 
      }));
      
      return ticket;
    } catch (error) {
      this.logger.error(interpolateMessage(LOG_MESSAGES.TICKET_CREATE_FAILED, { userId }), error);
      throw error;
    }
  }

  //#endregion

  //#region ==================== TICKET RETRIEVAL ====================

  async findAllByUser(userId: string, query?: TicketQueryDto): Promise<{ tickets: Ticket[], total: number, page: number, limit: number }> {
    const page = query?.page || 1;
    const limit = query?.limit || TICKET_DEFAULTS.PAGE_SIZE;
    const offset = (page - 1) * limit;

    const queryBuilder = this.supabaseService
      .getClient()
      .from(TABLES.TICKETS)
      .select(QUERY_SELECTORS.TICKET_WITH_SUMMARY, { count: 'exact' })
      .eq(TABLE_COLUMNS.CREATED_BY, userId)
      .order(TABLE_COLUMNS.CREATED_AT, { ascending: false })
      .range(offset, offset + limit - 1);

    if (query?.status) {
      queryBuilder.eq(TABLE_COLUMNS.STATUS, query.status);
    }
    if (query?.priority) {
      queryBuilder.eq(TABLE_COLUMNS.PRIORITY, query.priority);
    }

    const { data, error, count } = await queryBuilder;
    if (error) throw new BadRequestException(error.message);

    return {
      tickets: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  async findAllForModerator(userRole: string, query?: TicketQueryDto): Promise<{ tickets: Ticket[], total: number, page: number, limit: number }> {
    const page = query?.page || 1;
    const limit = query?.limit || TICKET_DEFAULTS.PAGE_SIZE;
    const offset = (page - 1) * limit;

    const queryBuilder = this.supabaseService
      .getClient()
      .from(TABLES.TICKETS)
      .select(QUERY_SELECTORS.TICKET_MODERATOR_VIEW, { count: 'exact' })
      .order(TABLE_COLUMNS.CREATED_AT, { ascending: false })
      .range(offset, offset + limit - 1);

    if (query?.status) queryBuilder.eq(TABLE_COLUMNS.STATUS, query.status);
    if (query?.priority) queryBuilder.eq(TABLE_COLUMNS.PRIORITY, query.priority);
    if (query?.assigned_to) queryBuilder.eq(TABLE_COLUMNS.ASSIGNED_TO, query.assigned_to);

    const { data, error, count } = await queryBuilder;
    if (error) throw new BadRequestException(error.message);

    return {
      tickets: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  async findById(id: string, user: any): Promise<Ticket> {
    let queryBuilder;

    if (user.role === USER_ROLES.USER) {
      // Users can only see their own tickets
      queryBuilder = this.supabaseService
        .getClient()
        .from(TABLES.TICKETS)
        .select(QUERY_SELECTORS.TICKET_WITH_SUMMARY)
        .eq(TABLE_COLUMNS.ID, id)
        .eq(TABLE_COLUMNS.CREATED_BY, user.id)
        .single();
    } else {
      // Moderators and admins can see full details
      queryBuilder = this.supabaseService
        .getClient()
        .from(TABLES.TICKETS)
        .select(QUERY_SELECTORS.TICKET_WITH_RELATIONS)
        .eq(TABLE_COLUMNS.ID, id)
        .single();
    }

    const { data, error } = await queryBuilder;
    if (error || !data) {
      throw new NotFoundException(MESSAGES.TICKET_NOT_FOUND);
    }
    return data;
  }

  //#endregion

  //#region ==================== TICKET UPDATES ====================

  async updateTicket(id: string, updateDto: UpdateTicketDto, user: any): Promise<Ticket> {
    // Convert snake_case DTO to camelCase for Drizzle
    const updateData: any = {};
    if (updateDto.status !== undefined) updateData.status = updateDto.status;
    if (updateDto.helpful_notes !== undefined) updateData.helpfulNotes = updateDto.helpful_notes;

    const ticket = await this.dbRepo.updateTicket(id, updateData);

    if (!ticket) {
      throw new NotFoundException(MESSAGES.TICKET_UPDATE_FAILED);
    }
    
    // Convert back to snake_case for API compatibility
    return {
      ...ticket,
      created_by: ticket.createdBy,
      assigned_to: ticket.assignedTo,
      helpful_notes: ticket.helpfulNotes,
      related_skills: ticket.relatedSkills,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
    } as any;
  }

  //#endregion

  //#region ==================== TICKET DELETION ====================

  async deleteTicket(id: string, user: any): Promise<void> {
    // First check if ticket exists
    const existingTicket = await this.dbRepo.findTicketById(id);

    if (!existingTicket) {
      throw new NotFoundException(MESSAGES.TICKET_NOT_FOUND);
    }

    // Delete the ticket
    const deleted = await this.dbRepo.deleteTicket(id);

    if (!deleted) {
      this.logger.error(`Failed to delete ticket ${id}`);
      throw new BadRequestException(MESSAGES.TICKET_DELETE_FAILED);
    }

    this.logger.log(interpolateMessage(MESSAGES.TICKET_DELETED_SUCCESS, { id, userId: user.id }));
  }

  //#endregion
} 