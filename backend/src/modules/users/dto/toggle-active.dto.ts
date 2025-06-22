import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleActiveDto {
  @ApiProperty({
    description: 'Whether the user account should be active or inactive. Set to false to suspend the account, true to reactivate it.',
    example: false,
    type: 'boolean'
  })
  @IsBoolean()
  is_active: boolean;
}
