import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
