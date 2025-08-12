import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TICKET_STATUS } from '../../../common/helpers/string-const';

export class UpdateTicketDto {
  @ApiProperty({
    description: 'Ticket status',
    example: 'in_progress',
    enum: TICKET_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TICKET_STATUS, { message: 'Status must be a valid ticket status' })
  status?: string;

  @ApiProperty({
    description: 'Helpful notes from moderator',
    example:
      'This appears to be a caching issue. Please clear your browser cache and try again.',
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Helpful notes cannot exceed 2000 characters' })
  helpful_notes?: string;
}
