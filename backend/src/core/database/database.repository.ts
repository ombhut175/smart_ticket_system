import { Injectable } from '@nestjs/common';
import type {
  User,
  NewUser,
  Ticket,
  NewTicket,
  UserSkill,
  NewUserSkill,
  TicketSkill,
  NewTicketSkill,
} from './schema';
import { UsersRepository } from './repositories/users.repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { SkillsRepository } from './repositories/skills.repository';

@Injectable()
export class DatabaseRepository {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly ticketsRepo: TicketsRepository,
    private readonly skillsRepo: SkillsRepository,
  ) {}

  // Users operations
  async createUser(userData: NewUser): Promise<User> {
    return this.usersRepo.createUser(userData);
  }

  /**
   * Fetch active users by role with their skills (if any).
   * Returns a flattened list where each row may contain a user and optionally a skill record.
   */
  async findActiveUsersWithSkillsByRole(
    role: string,
  ): Promise<{ id: string; email: string; skillName?: string | null }[]> {
    return this.usersRepo.findActiveUsersWithSkillsByRole(role);
  }

  /**
   * Find a single active admin user (for fallback assignment).
   * Matches the original Supabase query that selected 'id, email' with limit(1).single()
   */
  async findSingleActiveAdmin(): Promise<{ id: string; email: string } | null> {
    return this.usersRepo.findSingleActiveAdmin();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.usersRepo.findUserById(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findUserByEmail(email);
  }

  async updateUser(
    id: string,
    userData: Partial<NewUser>,
  ): Promise<User | null> {
    return this.usersRepo.updateUser(id, userData);
  }

  /**
   * Update user's active status and return with snake_case for compatibility
   */
  async updateUserActiveStatus(id: string, isActive: boolean): Promise<any> {
    return this.usersRepo.updateUserActiveStatus(id, isActive);
  }

  /**
   * Update user's role and return with snake_case for compatibility
   */
  async updateUserRoleCompat(id: string, role: string): Promise<any> {
    return this.usersRepo.updateUserRoleCompat(id, role);
  }

  /**
   * Update user and return with snake_case fields for backward compatibility
   */
  async updateUserProfile(id: string, profileData: any): Promise<any> {
    return this.usersRepo.updateUserProfile(id, profileData);
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id: string): Promise<any> {
    return this.usersRepo.updateLastLogin(id);
  }

  async findAllUsers(
    limit = 20,
    offset = 0,
  ): Promise<{ users: User[]; total: number }> {
    return this.usersRepo.findAllUsers(limit, offset);
  }

  // Tickets operations
  async createTicket(ticketData: NewTicket): Promise<Ticket> {
    return this.ticketsRepo.createTicket(ticketData);
  }

  /**
   * Create ticket with snake_case input/output for backward compatibility
   */
  async createTicketCompat(
    title: string,
    description: string,
    createdBy: string,
    status: string,
    priority: string,
  ): Promise<any> {
    return this.ticketsRepo.createTicketCompat(
      title,
      description,
      createdBy,
      status,
      priority,
    );
  }

  async findTicketById(id: string): Promise<Ticket | null> {
    return this.ticketsRepo.findTicketById(id);
  }

  async findTicketsByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ tickets: Ticket[]; total: number }> {
    return this.ticketsRepo.findTicketsByUser(userId, limit, offset);
  }

  /**
   * Fetch user's tickets with optional filters
   */
  async findTicketsByUserWithFilters(
    userId: string,
    limit = 20,
    offset = 0,
    filters?: { status?: string; priority?: string },
  ): Promise<{ tickets: Ticket[]; total: number }> {
    return this.ticketsRepo.findTicketsByUserWithFilters(
      userId,
      limit,
      offset,
      filters,
    );
  }

  async findAllTickets(
    limit = 20,
    offset = 0,
  ): Promise<{ tickets: Ticket[]; total: number }> {
    return this.ticketsRepo.findAllTickets(limit, offset);
  }

  /**
   * Fetch tickets with optional filters for moderator view
   */
  async findAllTicketsWithFilters(
    limit = 20,
    offset = 0,
    filters?: { status?: string; priority?: string; assigned_to?: string },
  ): Promise<{ tickets: Ticket[]; total: number }> {
    return this.ticketsRepo.findAllTicketsWithFilters(limit, offset, filters);
  }

  /**
   * Fetch basic user records by list of ids
   */
  async findUsersByIds(
    ids: string[],
  ): Promise<Array<{ id: string; email: string }>> {
    return this.usersRepo.findUsersByIds(ids);
  }

  async updateTicket(
    id: string,
    ticketData: Partial<NewTicket>,
  ): Promise<Ticket | null> {
    return this.ticketsRepo.updateTicket(id, ticketData);
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.ticketsRepo.deleteTicket(id);
  }

  // User Skills operations
  async addUserSkill(skillData: NewUserSkill): Promise<UserSkill> {
    return this.skillsRepo.addUserSkill(skillData);
  }

  /**
   * Add user skill with snake_case input/output for backward compatibility
   */
  async addUserSkillCompat(
    userId: string,
    skillName: string,
    proficiencyLevel: string,
  ): Promise<any> {
    return this.skillsRepo.addUserSkillCompat(
      userId,
      skillName,
      proficiencyLevel,
    );
  }

  /**
   * Add multiple user skills in batch
   */
  async addUserSkillsBatch(
    userId: string,
    skills: Array<{ skill_name: string; proficiency_level: string }>,
  ): Promise<any[]> {
    return this.skillsRepo.addUserSkillsBatch(userId, skills);
  }

  async findUserSkills(userId: string): Promise<UserSkill[]> {
    return this.skillsRepo.findUserSkills(userId);
  }

  /**
   * Find all moderators with their skills and return snake_case fields/relations
   */
  async findModeratorsWithSkillsCompat(): Promise<any[]> {
    return this.usersRepo.findModeratorsWithSkillsCompat();
  }

  /**
   * Find a single moderator with skills by id and return snake_case fields/relations
   */
  async findModeratorWithSkillsByIdCompat(id: string): Promise<any> {
    return this.usersRepo.findModeratorWithSkillsByIdCompat(id);
  }

  // Ticket Skills operations
  async addTicketSkill(skillData: NewTicketSkill): Promise<TicketSkill> {
    return this.skillsRepo.addTicketSkill(skillData);
  }

  async findTicketSkills(ticketId: string): Promise<TicketSkill[]> {
    return this.skillsRepo.findTicketSkills(ticketId);
  }

  // Advanced queries
  async findUsersWithSkills(): Promise<any[]> {
    return this.usersRepo.findUsersWithSkills();
  }

  async findTicketsWithAssignees(): Promise<any[]> {
    return this.ticketsRepo.findTicketsWithAssignees();
  }
}
