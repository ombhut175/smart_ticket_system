import { Controller, Post, Get, Body, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { TestingService } from './testing.service';
import { ApiResponseHelper } from '../../common/helpers/api-response.helper';
import { InsertTestingDto } from './dto/insert-testing.dto';

@Controller('testing')
export class TestingController {
  private readonly logger = new Logger(TestingController.name);

  constructor(private readonly testingService: TestingService) {}

  /**
   * Check the testing table structure and existence
   */
  @Get('check-table')
  async checkTestingTable() {
    try {
      const result = await this.testingService.checkTestingTable();
      
      return ApiResponseHelper.success(
        result,
        'Testing table check completed'
      );
    } catch (error) {
      throw new HttpException(
        'Failed to check testing table',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Insert a new record into the testing table
   */
  @Post('insert')
  async insertTestingRecord(@Body() data: InsertTestingDto) {
    try {
      this.logger.log(`Received insert request with data: ${JSON.stringify(data)}`);
      
      const result = await this.testingService.insertTestingRecord(data);
      
      return ApiResponseHelper.created(
        result,
        'Testing record inserted successfully'
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HTTP exceptions as-is
      }
      
      this.logger.error(`Insert error details: ${error.message}`, error.stack);
      throw new HttpException(
        `Failed to insert testing record: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get all records from the testing table
   */
  @Get('records')
  async getAllTestingRecords() {
    try {
      const records = await this.testingService.getAllTestingRecords();
      
      return ApiResponseHelper.success(
        records,
        'Testing records retrieved successfully'
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve testing records',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get join result between users and tickets tables
   * Returns users with their created tickets
   */
  @Get('users-with-tickets')
  async getUsersWithTickets() {
    try {
      const result = await this.testingService.getUsersWithTickets();
      
      return ApiResponseHelper.success(
        result,
        'Users with tickets retrieved successfully'
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve users with tickets',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get join result between tickets and users (assigned tickets)
   * Returns tickets with assigned user information
   */
  @Get('tickets-with-assigned-users')
  async getTicketsWithAssignedUsers() {
    try {
      const result = await this.testingService.getTicketsWithAssignedUsers();
      
      return ApiResponseHelper.success(
        result,
        'Tickets with assigned users retrieved successfully'
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve tickets with assigned users',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
