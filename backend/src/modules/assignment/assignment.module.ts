import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { SupabaseService } from '../../core/database/supabase.client';

@Module({
  providers: [AssignmentService, SupabaseService],
  exports: [AssignmentService],
})
export class AssignmentModule {} 