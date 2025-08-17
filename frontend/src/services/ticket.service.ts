import { apiRequest } from '@/lib/api';
import { Ticket, CreateTicketData, UpdateTicketData, TicketQueryParams, PaginatedResponse } from '@/types';

export const ticketService = {
  // Create new ticket
  createTicket: async (ticketData: CreateTicketData): Promise<Ticket> => {
    const response = await apiRequest.post<Ticket>('/tickets', ticketData);
    return response.data;
  },

  // Get user's own tickets
  getUserTickets: async (params?: TicketQueryParams): Promise<PaginatedResponse<Ticket>> => {
    return await apiRequest.getPaginated<Ticket>('/tickets', params);
  },

  // Get all tickets (moderator/admin only)
  getAllTickets: async (params?: TicketQueryParams): Promise<PaginatedResponse<Ticket>> => {
    return await apiRequest.getPaginated<Ticket>('/tickets/all', params);
  },

  // Get ticket by ID
  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await apiRequest.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  // Update ticket (moderator/admin only)
  updateTicket: async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    const response = await apiRequest.patch<Ticket>(`/tickets/${id}`, data);
    return response.data;
  },

  // Delete ticket (moderator/admin only)
  deleteTicket: async (id: string): Promise<void> => {
    await apiRequest.delete(`/tickets/${id}`);
  },
};
