import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { supabaseConfigSchema, supabaseConfig } from './config/supabase.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
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
    BackgroundModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
