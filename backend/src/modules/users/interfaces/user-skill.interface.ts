import { SKILL_PROFICIENCY } from '../../../common/helpers/string-const';

/**
 * Interface representing a row in the `public.user_skills` table.
 */
export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency_level: `${SKILL_PROFICIENCY}`;
  created_at: string | Date;
}
