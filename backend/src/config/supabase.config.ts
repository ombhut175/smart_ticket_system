import * as Joi from 'joi';
import { ENV } from '../common/helpers/string-const';

export const supabaseConfigSchema = Joi.object({
  [ENV.SUPABASE_URL]: Joi.string().uri().required(),
  [ENV.SUPABASE_ANON_KEY]: Joi.string().required(),
  [ENV.SUPABASE_SERVICE_ROLE_KEY]: Joi.string().required(),
  [ENV.INNGEST_EVENT_KEY]: Joi.string().when(ENV.NODE_ENV, {
    is: Joi.alternatives().try('production', 'staging'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  [ENV.INNGEST_SIGNING_KEY]: Joi.string().when(ENV.NODE_ENV, {
    is: Joi.alternatives().try('production', 'staging'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  [ENV.GEMINI_API_KEY]: Joi.string().required(),
  [ENV.SMTP_HOST]: Joi.string().required(),
  [ENV.SMTP_PORT]: Joi.number().default(587),
  [ENV.SMTP_USER]: Joi.string().required(),
  [ENV.SMTP_PASS]: Joi.string().required(),
});

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  inngestEventKey?: string;
  inngestSigningKey?: string;
  geminiApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
}

export const supabaseConfig = (): SupabaseConfig => ({
  url: process.env[ENV.SUPABASE_URL] as string,
  anonKey: process.env[ENV.SUPABASE_ANON_KEY] as string,
  serviceRoleKey: process.env[ENV.SUPABASE_SERVICE_ROLE_KEY] as string,
  inngestEventKey: process.env[ENV.INNGEST_EVENT_KEY],
  inngestSigningKey: process.env[ENV.INNGEST_SIGNING_KEY],
  geminiApiKey: process.env[ENV.GEMINI_API_KEY] as string,
  smtpHost: process.env[ENV.SMTP_HOST] as string,
  smtpPort: +(process.env[ENV.SMTP_PORT] || 587),
  smtpUser: process.env[ENV.SMTP_USER] as string,
  smtpPass: process.env[ENV.SMTP_PASS] as string,
}); 