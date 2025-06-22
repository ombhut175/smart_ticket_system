import * as Joi from 'joi';

export const supabaseConfigSchema = Joi.object({
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
});

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export const supabaseConfig = (): SupabaseConfig => ({
  url: process.env.SUPABASE_URL as string,
  anonKey: process.env.SUPABASE_ANON_KEY as string,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
}); 