import { apiRequest } from '@/helpers/request';
import { Ticket, CreateTicketData, UpdateTicketData, TicketQueryParams, PaginatedResponse } from '@/types';

export const ticketService = {
  // Create new ticket
  createTicket: async (ticketData: CreateTicketData): Promise<Ticket> => {
    return apiRequest.post<Ticket>('/tickets', ticketData);
  },

  // Get user's own tickets
  getUserTickets: async (params?: TicketQueryParams): Promise<PaginatedResponse<Ticket>> => {
    // If you need meta, consider using apiRequestRaw
    return apiRequest.get<PaginatedResponse<Ticket>>('/tickets');
  },

  // Get all tickets (moderator/admin only)
  getAllTickets: async (params?: TicketQueryParams): Promise<PaginatedResponse<Ticket>> => {
    // If you need meta, consider using apiRequestRaw
    return apiRequest.get<PaginatedResponse<Ticket>>('/tickets/all');
  },

  // Get ticket by ID
  getTicketById: async (id: string): Promise<Ticket> => {
    return apiRequest.get<Ticket>(`/tickets/${id}`);
  },

  // Update ticket (moderator/admin only)
  updateTicket: async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    return apiRequest.patch<Ticket>(`/tickets/${id}`, data);
  },

  // Delete ticket (moderator/admin only)
  deleteTicket: async (id: string): Promise<void> => {
    await apiRequest.delete(`/tickets/${id}`);
  },
};
