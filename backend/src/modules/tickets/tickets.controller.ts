import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiResponse as StandardApiResponse, ApiResponseHelper } from '../../common/helpers/api-response.helper';
import { Ticket } from './interfaces/ticket.interface';
import { TicketEntity } from './entities/ticket.entity';
import { USER_ROLES, SWAGGER_TAGS } from '../../common/helpers/string-const';

@Controller('tickets')
@UseGuards(SupabaseAuthGuard)
@ApiTags(SWAGGER_TAGS.TICKETS)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  //#region ==================== TICKET CREATION ====================

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({ 
    status: 201, 
    description: 'Ticket created successfully and AI processing started',
    type: TicketEntity
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @Request() req
  ): Promise<StandardApiResponse<Ticket>> {
    const ticket = await this.ticketsService.create(createTicketDto, req.user.id);
    return ApiResponseHelper.created(ticket, 'Ticket created and processing started');
  }

  //#endregion

  //#region ==================== TICKET RETRIEVAL ====================

  @Get()
  @ApiOperation({ summary: 'Get user\'s own tickets with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'User tickets retrieved successfully with pagination',
    type: [TicketEntity]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async findAll(
    @Request() req,
    @Query() query: TicketQueryDto
  ): Promise<StandardApiResponse<Ticket[]>> {
    const result = await this.ticketsService.findAllByUser(req.user.id, query);
    
    return ApiResponseHelper.paginated(
      result.tickets,
      result.total,
      result.page,
      result.limit,
      'Tickets retrieved successfully'
    );
  }

  @Get('all')
  @Roles(USER_ROLES.MODERATOR, USER_ROLES.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all tickets with pagination (moderator/admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'All tickets retrieved successfully with pagination',
    type: [TicketEntity]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden - only moderators and admins can access all tickets' })
  async findAllForModerators(
    @Request() req,
    @Query() query: TicketQueryDto
  ): Promise<StandardApiResponse<Ticket[]>> {
    const result = await this.ticketsService.findAllForModerator(req.user.role, query);
    
    return ApiResponseHelper.paginated(
      result.tickets,
      result.total,
      result.page,
      result.limit,
      'All tickets retrieved successfully'
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID with role-based access control' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket retrieved successfully',
    type: TicketEntity
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot access this ticket' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<StandardApiResponse<Ticket>> {
    const ticket = await this.ticketsService.findById(id, req.user);
    return ApiResponseHelper.success(ticket, 'Ticket retrieved successfully');
  }

  //#endregion

  //#region ==================== TICKET UPDATES ====================

  @Patch(':id')
  @Roles(USER_ROLES.MODERATOR, USER_ROLES.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update ticket (moderator/admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket updated successfully',
    type: TicketEntity
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden - only moderators can update tickets' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req
  ): Promise<StandardApiResponse<Ticket>> {
    const ticket = await this.ticketsService.updateTicket(id, updateTicketDto, req.user);
    return ApiResponseHelper.success(ticket, 'Ticket updated successfully');
  }

  //#endregion

  //#region ==================== TICKET DELETION ====================

  @Delete(':id')
  @Roles(USER_ROLES.MODERATOR, USER_ROLES.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete ticket by ID (admin/moderator only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket deleted successfully'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden - only admins and moderators can delete tickets' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<StandardApiResponse<null>> {
    await this.ticketsService.deleteTicket(id, req.user);
    return ApiResponseHelper.success(null, 'Ticket deleted successfully');
  }

  //#endregion
} 