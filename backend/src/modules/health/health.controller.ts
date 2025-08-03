import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application health status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
          },
        },
      },
    },
  })
  async getHealth() {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    return ApiResponseHelper.success(
      healthData,
      'Application is healthy'
    );
  }

  @Get('database')
  @ApiOperation({ summary: 'Check database connection status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database connection status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                isConnected: { type: 'boolean' },
                databaseName: { type: 'string' },
                version: { type: 'string' },
                error: { type: 'string' },
                totalUsers: { type: 'number' },
                totalTickets: { type: 'number' },
                totalTestingRecords: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async getDatabaseHealth() {
    try {
      // Check database connection using Prisma
      const connectionInfo = await this.prismaService.checkConnection();

      // Get database statistics using Prisma
      let databaseHealth: {
        isConnected: boolean;
        databaseName?: string;
        version?: string;
        error?: string;
        totalUsers?: number;
        totalTickets?: number;
        totalTestingRecords?: number;
      };

      if (connectionInfo.isConnected) {
        try {
          // Get counts for various tables
          const [userCount, ticketCount] = await Promise.all([
            this.prismaService.public_users.count(),
            this.prismaService.tickets.count(),
            // this.prismaService.testing.count(), // Will be enabled after prisma generate
          ]);

          databaseHealth = {
            ...connectionInfo,
            totalUsers: userCount,
            totalTickets: ticketCount,
            totalTestingRecords: 0, // Will be updated after prisma generate
          };
        } catch (countError) {
          databaseHealth = {
            ...connectionInfo,
            error: `Connected but failed to get counts: ${countError instanceof Error ? countError.message : 'Unknown error'}`,
          };
        }
      } else {
        databaseHealth = connectionInfo;
      }

      const message = databaseHealth.isConnected 
        ? 'Database connection is healthy' 
        : 'Database connection is unhealthy';

      return ApiResponseHelper.success(
        {
          database: databaseHealth,
        },
        message
      );
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to check database health',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('database/stats')
  @ApiOperation({ summary: 'Get database statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database statistics',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            totalTables: { type: 'number' },
            totalUsers: { type: 'number' },
            totalTickets: { type: 'number' },
            connectionInfo: {
              type: 'object',
              properties: {
                isConnected: { type: 'boolean' },
                databaseName: { type: 'string' },
                version: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async getDatabaseStats() {
    try {
      const stats = await this.prismaService.getDatabaseStats();
      
      return ApiResponseHelper.success(
        stats,
        'Database statistics retrieved successfully'
      );
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get database statistics',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
