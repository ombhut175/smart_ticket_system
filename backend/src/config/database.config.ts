import * as Joi from 'joi';
import { ENV } from '../common/helpers/string-const';

export const databaseConfigSchema = Joi.object({
  [ENV.DATABASE_URL]: Joi.string().uri().required(),
  [ENV.DIRECT_URL]: Joi.string().uri().optional(),
  [ENV.NODE_ENV]: Joi.string().valid('development', 'production', 'test').default('development'),
});

export interface DatabaseConfig {
  databaseUrl: string;
  directUrl?: string;
  nodeEnv: string;
}

export const databaseConfig = (): DatabaseConfig => ({
  databaseUrl: process.env[ENV.DATABASE_URL] as string,
  directUrl: process.env[ENV.DIRECT_URL],
  nodeEnv: process.env[ENV.NODE_ENV] || 'development',
});
