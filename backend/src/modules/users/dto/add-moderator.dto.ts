import { IsArray, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddUserSkillDto } from './add-user-skill.dto';

export class AddModeratorDto {
  @ApiProperty({
    description:
      'Email address of the user to promote to moderator role. The system will look up the user by this email address.',
    example: 'john.doe@example.com',
    type: 'string',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Array of skills to assign to the moderator. Each skill must have a name and proficiency level. These skills will be bulk inserted into the user_skills table after the user role is updated to moderator.',
    type: [AddUserSkillDto],
    example: [
      {
        skill_name: 'JavaScript',
        proficiency_level: 'advanced',
      },
      {
        skill_name: 'Customer Support',
        proficiency_level: 'expert',
      },
      {
        skill_name: 'Python',
        proficiency_level: 'intermediate',
      },
    ],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddUserSkillDto)
  skills: AddUserSkillDto[];
}
