import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { 
  APP_CONFIG, 
  URL_PATTERNS, 
  ENV,
  interpolateMessage 
} from './common/helpers/string-const';

// Helper to get required env variable or throw error
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    // Environment configuration
    // const port = parseInt(getRequiredEnv(ENV.PORT));
    const port = 8080;
    const nodeEnv = getRequiredEnv(ENV.NODE_ENV);
    const isProduction = nodeEnv === 'production';

    // Global prefix
    app.setGlobalPrefix(APP_CONFIG.GLOBAL_PREFIX as string);

    // Enable CORS
    app.enableCors({ origin: true, credentials: true });

    // Cookie parser
    app.use(cookieParser());

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Global exception filter for standardized error responses
    app.useGlobalFilters(new HttpExceptionFilter());

    // Swagger setup
    const config = new DocumentBuilder()
      .setTitle(APP_CONFIG.API_TITLE)
      .setDescription(APP_CONFIG.API_DESCRIPTION)
      .setVersion(APP_CONFIG.API_VERSION)
      .addCookieAuth(APP_CONFIG.COOKIE_AUTH_NAME)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(APP_CONFIG.SWAGGER_PATH, app, document);

    // Start server
    await app.listen(port);
    
    // Generate URLs
    const baseUrl = isProduction 
      ? URL_PATTERNS.PRODUCTION_BASE 
      : interpolateMessage(URL_PATTERNS.LOCALHOST_HTTP, { port: port.toString() });
    const swaggerUrl = `${baseUrl}/${APP_CONFIG.SWAGGER_PATH}`;
    
    // Simple startup logs
    Logger.log(`Application is running on: ${baseUrl}`);
    Logger.log(`Swagger documentation: ${swaggerUrl}`);
    
  } catch (error) {
    logger.error('❌ Failed to start the application:', error);
    process.exit(1);
  }
}

bootstrap();
