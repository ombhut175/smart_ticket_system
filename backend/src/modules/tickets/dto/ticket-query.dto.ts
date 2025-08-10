import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
} from '../../../common/helpers/string-const';
import { PaginationDto } from './pagination.dto';

export class TicketQueryDto extends PaginationDto {
  @ApiProperty({
    description: 'Filter by ticket status',
    example: 'in_progress',
    enum: TICKET_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TICKET_STATUS, { message: 'Status must be a valid ticket status' })
  status?: string;

  @ApiProperty({
    description: 'Filter by ticket priority',
    example: 'high',
    enum: ['low', 'medium', 'high'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'], {
    message: 'Priority must be low, medium, or high',
  })
  priority?: string;

  @ApiProperty({
    description: 'Filter by assigned user ID (moderator/admin only)',
    example: 'user-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  assigned_to?: string;
}
