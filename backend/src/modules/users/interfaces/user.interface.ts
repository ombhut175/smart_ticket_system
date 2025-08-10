import { UserRole } from '../../../common/helpers/string-const';

/**
 * Interface representing a row in the `public.users` table.
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}
