import { IsString, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SKILL_PROFICIENCY } from '../../../common/helpers/string-const';

export class AddUserSkillDto {
  @ApiProperty({
    description: 'Name of the skill to add to the user',
    example: 'JavaScript',
    maxLength: 100,
    type: 'string'
  })
  @IsString()
  @MaxLength(100)
  skill_name: string;

  @ApiProperty({
    description: 'Proficiency level of the user in this skill',
    example: 'advanced',
    enum: SKILL_PROFICIENCY,
    enumName: 'SkillProficiency'
  })
  @IsEnum(SKILL_PROFICIENCY)
  proficiency_level: SKILL_PROFICIENCY;
} 