import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from './core/database/supabase.client';

@ApiTags('Test')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('db-test')
  @ApiOperation({ summary: 'Database test', description: 'Check database connectivity' })
  @ApiResponse({ status: 200, description: 'Database is connected.' })
  @ApiResponse({ status: 500, description: 'Database connection failed.' })
  async testDatabase() {
    try {
      // Test database connection using Supabase
      const { data, error } = await this.supabaseService.getClient().from('users').select('count').limit(1);
      return error ? 'Database connection failed.' : 'Database is connected.';
    } catch (error) {
      return 'Database connection failed.';
    }
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  @ApiOperation({ summary: 'Test route', description: 'Returns a test message for Swagger documentation.' })
  @ApiResponse({ status: 200, description: 'Test route is working.' })
  testRoute(): string {
    return 'Swagger test route is working!';
  }
}
