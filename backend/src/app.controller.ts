import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Test')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
