import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket title',
    example: 'Cannot access user dashboard',
    maxLength: 200,
    minLength: 5,
  })
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Detailed ticket description',
    example:
      'When I try to access my dashboard, I get a 404 error. This started happening after the recent update.',
    maxLength: 5000,
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  description: string;
}
