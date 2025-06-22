import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLES, UserRole } from '../../../common/helpers/string-const';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'New role to assign to the user. Available roles: user (default), moderator (can manage tickets), admin (full system access)',
    example: 'moderator',
    enum: USER_ROLES,
    enumName: 'UserRoles'
  })
  @IsEnum(USER_ROLES)
  role: UserRole;
} 