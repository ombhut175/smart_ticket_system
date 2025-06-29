import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { supabaseConfigSchema, supabaseConfig } from './config/supabase.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { BackgroundModule } from './background/background.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: supabaseConfigSchema,
      load: [supabaseConfig],
    }),
    AuthModule,
    UsersModule,
    TicketsModule, // Add tickets module
    BackgroundModule, // Ensure background processing is available
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
