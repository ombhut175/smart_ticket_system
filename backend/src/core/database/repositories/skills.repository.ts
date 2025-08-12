import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { userSkills, ticketSkills } from '../schema';
import type {
  NewUserSkill,
  UserSkill,
  NewTicketSkill,
  TicketSkill,
} from '../schema';

@Injectable()
export class SkillsRepository extends BaseRepository {
  // User skills
  async addUserSkill(skillData: NewUserSkill): Promise<UserSkill> {
    const [skill] = await this.db
      .insert(userSkills)
      .values(skillData)
      .returning();
    return skill;
  }

  async addUserSkillCompat(
    userId: string,
    skillName: string,
    proficiencyLevel: string,
  ): Promise<any> {
    const skill = await this.addUserSkill({
      userId,
      skillName,
      proficiencyLevel,
    });
    return {
      ...skill,
      user_id: skill.userId,
      skill_name: skill.skillName,
      proficiency_level: skill.proficiencyLevel,
      created_at: skill.createdAt,
    };
  }

  async addUserSkillsBatch(
    userId: string,
    skills: Array<{ skill_name: string; proficiency_level: string }>,
  ): Promise<any[]> {
    if (!skills || skills.length === 0) return [];

    const skillData = skills.map((s) => ({
      userId,
      skillName: s.skill_name,
      proficiencyLevel: s.proficiency_level,
    }));
    const inserted = await this.db
      .insert(userSkills)
      .values(skillData)
      .returning();
    return inserted.map((s) => ({
      ...s,
      user_id: s.userId,
      skill_name: s.skillName,
      proficiency_level: s.proficiencyLevel,
      created_at: s.createdAt,
    }));
  }

  async findUserSkills(userId: string): Promise<UserSkill[]> {
    return await this.db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  // Ticket skills
  async addTicketSkill(skillData: NewTicketSkill): Promise<TicketSkill> {
    const [skill] = await this.db
      .insert(ticketSkills)
      .values(skillData)
      .returning();
    return skill;
  }

  async findTicketSkills(ticketId: string): Promise<TicketSkill[]> {
    return await this.db
      .select()
      .from(ticketSkills)
      .where(eq(ticketSkills.ticketId, ticketId));
  }
}
