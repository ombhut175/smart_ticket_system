import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { testConfigSchema, testConfig } from './test-config';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: testConfigSchema,
      load: [testConfig],
    }),
    AuthModule,
    UsersModule,
    // Note: BackgroundModule excluded for E2E tests to avoid ES module issues
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {} 