import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '../interfaces/ticket.interface';
import {
  TICKET_PRIORITY,
  TICKET_STATUS,
  USER_ROLES,
} from '../../../common/helpers/string-const';

export class TicketEntity implements Ticket {
  @ApiProperty({
    description: 'Unique identifier for the ticket',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the ticket',
    example: 'User cannot login to the dashboard',
  })
  title: string;

  @ApiProperty({
    description: 'A detailed description of the issue',
    example:
      'When a user tries to login, they are getting a 500 internal server error.',
  })
  description: string;

  @ApiProperty({
    description: 'The current status of the ticket',
    enum: TICKET_STATUS,
    example: 'in_progress',
  })
  status:
    | 'todo'
    | 'in_progress'
    | 'waiting_for_customer'
    | 'resolved'
    | 'closed'
    | 'cancelled';

  @ApiProperty({
    description: 'The priority of the ticket',
    enum: TICKET_PRIORITY,
    example: 'high',
  })
  priority: 'low' | 'medium' | 'high';

  @ApiProperty({
    description: 'The ID of the user who created the ticket',
    example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210',
  })
  created_by: string;

  @ApiProperty({
    description: 'The ID of the user to whom the ticket is assigned',
    required: false,
    example: 'e1d2c3b4-a596-8765-4321-fedcba987654',
  })
  assigned_to?: string;

  @ApiProperty({
    description: 'A short AI-generated summary of the ticket',
    required: false,
    example: 'User is unable to login due to a server error.',
  })
  summary?: string;

  @ApiProperty({
    description: 'AI-generated notes that might help resolve the issue',
    required: false,
    example:
      'The error seems to be related to the authentication service. Check the service logs.',
  })
  helpful_notes?: string;

  @ApiProperty({
    description: 'A list of skills relevant to resolving the ticket',
    required: false,
    type: [String],
    example: ['Node.js', 'PostgreSQL', 'Authentication'],
  })
  related_skills?: string[];

  @ApiProperty({
    description: 'The date and time when the ticket was created',
  })
  created_at: Date;

  @ApiProperty({
    description: 'The date and time when the ticket was last updated',
  })
  updated_at: Date;
}
