import * as Joi from 'joi';
import { ENV } from '../src/common/helpers/string-const';

export const testConfigSchema = Joi.object({
  [ENV.SUPABASE_URL]: Joi.string().uri().required(),
  [ENV.SUPABASE_ANON_KEY]: Joi.string().required(),
  [ENV.SUPABASE_SERVICE_ROLE_KEY]: Joi.string().required(),
  // Make these optional for E2E tests
  [ENV.INNGEST_EVENT_KEY]: Joi.string().optional(),
  [ENV.INNGEST_SIGNING_KEY]: Joi.string().optional(),
  [ENV.GEMINI_API_KEY]: Joi.string().optional().default('test-key'),
  [ENV.SMTP_HOST]: Joi.string().optional().default('localhost'),
  [ENV.SMTP_PORT]: Joi.number().optional().default(587),
  [ENV.SMTP_USER]: Joi.string().optional().default('test@example.com'),
  [ENV.SMTP_PASS]: Joi.string().optional().default('password'),
});

export interface TestConfig {
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

export const testConfig = (): TestConfig => ({
  url: process.env[ENV.SUPABASE_URL] as string,
  anonKey: process.env[ENV.SUPABASE_ANON_KEY] as string,
  serviceRoleKey: process.env[ENV.SUPABASE_SERVICE_ROLE_KEY] as string,
  inngestEventKey: process.env[ENV.INNGEST_EVENT_KEY],
  inngestSigningKey: process.env[ENV.INNGEST_SIGNING_KEY],
  geminiApiKey: process.env[ENV.GEMINI_API_KEY] || 'test-key',
  smtpHost: process.env[ENV.SMTP_HOST] || 'localhost',
  smtpPort: +(process.env[ENV.SMTP_PORT] || 587),
  smtpUser: process.env[ENV.SMTP_USER] || 'test@example.com',
  smtpPass: process.env[ENV.SMTP_PASS] || 'password',
});
