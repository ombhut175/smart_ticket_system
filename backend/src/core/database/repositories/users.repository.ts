import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { users, userSkills } from '../schema';
import type { NewUser, User } from '../schema';
import { USER_ROLES } from '../../../common/helpers/string-const';

@Injectable()
export class UsersRepository extends BaseRepository {
  // Basic CRUD
  async createUser(userData: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(userData).returning();
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || null;
  }

  async updateUser(
    id: string,
    userData: Partial<NewUser>,
  ): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async updateUserActiveStatus(id: string, isActive: boolean): Promise<any> {
    const user = await this.updateUser(id, { isActive });
    if (!user) return null;
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async updateUserRoleCompat(id: string, role: string): Promise<any> {
    const user = await this.updateUser(id, { role });
    if (!user) return null;
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async updateUserProfile(id: string, profileData: any): Promise<any> {
    const updateData: Partial<NewUser> = {};
    if (profileData.first_name !== undefined)
      updateData.firstName = profileData.first_name;
    if (profileData.last_name !== undefined)
      updateData.lastName = profileData.last_name;
    if (profileData.email !== undefined) updateData.email = profileData.email;
    if (profileData.role !== undefined) updateData.role = profileData.role;
    if (profileData.is_active !== undefined)
      updateData.isActive = profileData.is_active;

    const user = await this.updateUser(id, updateData);
    if (!user) return null;

    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async updateLastLogin(id: string): Promise<any> {
    const user = await this.updateUser(id, { lastLoginAt: new Date() });
    if (!user) return null;
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async findAllUsers(
    limit = 20,
    offset = 0,
  ): Promise<{ users: User[]; total: number }> {
    const usersResult = await this.db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
    const [{ total }] = await this.db.select({ total: count() }).from(users);
    return { users: usersResult, total: Number(total) };
  }

  // Query helpers
  async findUsersByIds(
    ids: string[],
  ): Promise<Array<{ id: string; email: string }>> {
    if (!ids || ids.length === 0) return [];
    const rows = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(inArray(users.id, ids));
    return rows;
  }

  async findActiveUsersWithSkillsByRole(role: string): Promise<
    {
      id: string;
      email: string;
      skillName?: string | null;
    }[]
  > {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        skillName: userSkills.skillName,
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .where(and(eq(users.role, role), eq(users.isActive, true)))
      .orderBy(asc(users.email));

    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      skillName: r.skillName ?? null,
    }));
  }

  async findSingleActiveAdmin(): Promise<{ id: string; email: string } | null> {
    const [admin] = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(and(eq(users.role, 'admin'), eq(users.isActive, true)))
      .limit(1);
    return admin || null;
  }

  async findUsersWithSkills(): Promise<any[]> {
    return await this.db
      .select({
        user: users,
        skill: {
          id: userSkills.id,
          userId: userSkills.userId,
          skillName: userSkills.skillName,
          proficiencyLevel: userSkills.proficiencyLevel,
          createdAt: userSkills.createdAt,
        },
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async findModeratorsWithSkillsCompat(): Promise<any[]> {
    const rows = await this.db
      .select({
        user: users,
        skill: {
          id: userSkills.id,
          userId: userSkills.userId,
          skillName: userSkills.skillName,
          proficiencyLevel: userSkills.proficiencyLevel,
          createdAt: userSkills.createdAt,
        },
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .where(eq(users.role, USER_ROLES.MODERATOR))
      .orderBy(asc(users.firstName), asc(users.lastName));

    const byUser: Record<string, any> = {};
    for (const r of rows) {
      const u = r.user;
      if (!byUser[u.id]) {
        byUser[u.id] = {
          ...u,
          first_name: u.firstName,
          last_name: u.lastName,
          is_active: u.isActive,
          last_login_at: u.lastLoginAt,
          created_at: u.createdAt,
          updated_at: u.updatedAt,
          user_skills: [],
        };
      }
      if (r.skill && r.skill.id) {
        byUser[u.id].user_skills.push({
          ...r.skill,
          user_id: r.skill.userId,
          skill_name: r.skill.skillName,
          proficiency_level: r.skill.proficiencyLevel,
          created_at: r.skill.createdAt,
        });
      }
    }
    return Object.values(byUser);
  }

  async findModeratorWithSkillsByIdCompat(id: string): Promise<any> {
    const rows = await this.db
      .select({
        user: users,
        skill: {
          id: userSkills.id,
          userId: userSkills.userId,
          skillName: userSkills.skillName,
          proficiencyLevel: userSkills.proficiencyLevel,
          createdAt: userSkills.createdAt,
        },
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .where(and(eq(users.id, id), eq(users.role, USER_ROLES.MODERATOR)));
    if (!rows || rows.length === 0) return null;
    const u = rows[0].user;
    return {
      ...u,
      first_name: u.firstName,
      last_name: u.lastName,
      is_active: u.isActive,
      last_login_at: u.lastLoginAt,
      created_at: u.createdAt,
      updated_at: u.updatedAt,
      user_skills: rows
        .filter((r) => r.skill && r.skill.id)
        .map((s) => ({
          ...s.skill!,
          user_id: s.skill!.userId,
          skill_name: s.skill!.skillName,
          proficiency_level: s.skill!.proficiencyLevel,
          created_at: s.skill!.createdAt,
        })),
    };
  }
}
