class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8080/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include', // Important for cookie handling
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // User management endpoints
  async getAllUsers() {
    const response = await this.request('/users/all');
    return response.data;
  }

  async updateUserRole(userId: string, role: string) {
    const response = await this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return response.data;
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    const response = await this.request(`/users/${userId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.request('/users/me');
    return response.data;
  }

  async updateProfile(profileData: { first_name?: string; last_name?: string }) {
    const response = await this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    return response.data;
  }

  async register(email: string, password: string) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  }

  // Ticket management endpoints
  async createTicket(title: string, description: string) {
    const response = await this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
    return response.data;
  }

  async getUserTickets(page: number = 1, limit: number = 20, filters: Record<string, any> = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await this.request(`/tickets?${queryParams}`);
    return {
      tickets: response.data,
      pagination: response.meta,
    };
  }

  async updateTicket(ticketId: string, updates: Record<string, any>) {
    const response = await this.request(`/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async deleteTicket(ticketId: string) {
    const response = await this.request(`/tickets/${ticketId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async getAllTickets(page: number = 1, limit: number = 20, filters: Record<string, any> = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await this.request(`/tickets/all?${queryParams}`);
    return {
      tickets: response.data,
      pagination: response.meta,
    };
  }
}

export const apiClient = new ApiClient();
