import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
  interpolateMessage,
} from '../../common/helpers/string-const';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private dbRepo: DatabaseRepository,
    private inngestService: InngestService,
  ) {}

  //#region ==================== TICKET CREATION ====================

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
  ): Promise<Ticket> {
    // Log ticket creation start
    this.logger.log(
      interpolateMessage(LOG_MESSAGES.TICKET_CREATE_STARTED, {
        userId,
        title: createTicketDto.title,
      }),
    );

    try {
      // Insert ticket into database using Drizzle
      const ticket = await this.dbRepo.createTicketCompat(
        createTicketDto.title,
        createTicketDto.description,
        userId,
        TICKET_STATUS.TODO,
        TICKET_DEFAULTS.PRIORITY,
      );

      if (!ticket) {
        this.logger.error(
          interpolateMessage(LOG_MESSAGES.TICKET_CREATE_FAILED, { userId }),
        );
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
      this.logger.log(
        interpolateMessage(LOG_MESSAGES.TICKET_CREATE_SUCCESS, {
          ticketId: ticket.id,
        }),
      );

      return ticket;
    } catch (error) {
      this.logger.error(
        interpolateMessage(LOG_MESSAGES.TICKET_CREATE_FAILED, { userId }),
        error,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== TICKET RETRIEVAL ====================

  async findAllByUser(
    userId: string,
    query?: TicketQueryDto,
  ): Promise<{
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query?.page || 1;
    const limit = query?.limit || TICKET_DEFAULTS.PAGE_SIZE;
    const offset = (page - 1) * limit;

    const { tickets, total } = await this.dbRepo.findTicketsByUserWithFilters(
      userId,
      limit,
      offset,
      { status: query?.status, priority: query?.priority },
    );

    const mapped = tickets.map((t: any) => ({
      ...t,
      created_by: t.createdBy,
      assigned_to: t.assignedTo,
      helpful_notes: t.helpfulNotes,
      related_skills: t.relatedSkills,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    }));

    return { tickets: mapped as any, total, page, limit };
  }

  async findAllForModerator(
    userRole: string,
    query?: TicketQueryDto,
  ): Promise<{
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (userRole !== USER_ROLES.MODERATOR && userRole !== USER_ROLES.ADMIN) {
      throw new ForbiddenException(MESSAGES.ACCESS_DENIED);
    }

    const page = query?.page || 1;
    const limit = query?.limit || TICKET_DEFAULTS.PAGE_SIZE;
    const offset = (page - 1) * limit;

    const { tickets, total } = await this.dbRepo.findAllTicketsWithFilters(
      limit,
      offset,
      {
        status: query?.status,
        priority: query?.priority,
        assigned_to: query?.assigned_to,
      },
    );

    // attach assignee and creator emails to mimic previous shape
    const userIds = Array.from(
      new Set(
        tickets.flatMap(
          (t: any) => [t.createdBy, t.assignedTo].filter(Boolean) as string[],
        ),
      ),
    );
    const users = await this.dbRepo.findUsersByIds(userIds);
    const idToEmail = new Map(users.map((u) => [u.id, u.email] as const));

    const mapped = tickets.map((t: any) => ({
      ...t,
      created_by: t.createdBy,
      assigned_to: t.assignedTo,
      helpful_notes: t.helpfulNotes,
      related_skills: t.relatedSkills,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
      assignee: t.assignedTo
        ? { email: idToEmail.get(t.assignedTo) || null }
        : null,
      creator: t.createdBy
        ? { email: idToEmail.get(t.createdBy) || null }
        : null,
    }));

    return { tickets: mapped as any, total, page, limit };
  }

  async findById(id: string, user: any): Promise<Ticket> {
    const ticket = await this.dbRepo.findTicketById(id);
    if (!ticket) throw new NotFoundException(MESSAGES.TICKET_NOT_FOUND);

    if (user.role === USER_ROLES.USER && ticket.createdBy !== user.id) {
      throw new NotFoundException(MESSAGES.TICKET_NOT_FOUND);
    }

    const mapped: any = {
      ...ticket,
      created_by: ticket.createdBy,
      assigned_to: ticket.assignedTo,
      helpful_notes: ticket.helpfulNotes,
      related_skills: ticket.relatedSkills,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
    };

    if (user.role !== USER_ROLES.USER) {
      const ids = [ticket.createdBy, ticket.assignedTo].filter(
        Boolean,
      ) as string[];
      const users = await this.dbRepo.findUsersByIds(ids);
      const idToEmail = new Map(users.map((u) => [u.id, u.email] as const));
      mapped.assignee = ticket.assignedTo
        ? { email: idToEmail.get(ticket.assignedTo!) || null }
        : null;
      mapped.creator = ticket.createdBy
        ? { email: idToEmail.get(ticket.createdBy) || null }
        : null;
    }

    return mapped as any;
  }

  //#endregion

  //#region ==================== TICKET UPDATES ====================

  async updateTicket(
    id: string,
    updateDto: UpdateTicketDto,
    user: any,
  ): Promise<Ticket> {
    // Convert snake_case DTO to camelCase for Drizzle
    const updateData: any = {};
    if (updateDto.status !== undefined) updateData.status = updateDto.status;
    if (updateDto.helpful_notes !== undefined)
      updateData.helpfulNotes = updateDto.helpful_notes;

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

    this.logger.log(
      interpolateMessage(MESSAGES.TICKET_DELETED_SUCCESS, {
        id,
        userId: user.id,
      }),
    );
  }

  //#endregion
}
