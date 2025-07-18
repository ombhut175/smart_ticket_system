import { Injectable, OnModuleInit } from '@nestjs/common';
import { InngestService } from './inngest.service';
import { SupabaseService } from '../core/database/supabase.client';
import { AiService } from '../modules/ai/ai.service';
import { AssignmentService } from '../modules/assignment/assignment.service';
import { EmailService } from '../modules/email/email.service';
import { createTicketCreatedWorkflow } from './workflows';

@Injectable()
export class BackgroundService implements OnModuleInit {
  private workflows: any[] = [];

  constructor(
    private readonly inngestService: InngestService,
    private readonly supabaseService: SupabaseService,
    private readonly aiService: AiService,
    private readonly assignmentService: AssignmentService,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    // Register workflows
    const ticketWorkflow = createTicketCreatedWorkflow(
      this.inngestService,
      this.supabaseService,
      this.aiService,
      this.assignmentService,
      this.emailService,
    );
    this.workflows = [ticketWorkflow];
  }

  getWorkflows() {
    return this.workflows;
  }

  getInngestClient() {
    return this.inngestService.getClient();
  }
} 