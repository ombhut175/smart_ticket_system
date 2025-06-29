import { NonRetriableError } from 'inngest';
import { 
  TICKET_STATUS, 
  TABLES, 
  TABLE_COLUMNS, 
  INNGEST_CONFIG, 
  INNGEST_STEPS, 
  INNGEST_EVENTS,
  MESSAGES 
} from '../../common/helpers/string-const';
import { InngestService } from '../inngest.service';
import { SupabaseService } from '../../core/database/supabase.client';
import { AiService } from '../../modules/ai/ai.service';
import { AssignmentService } from '../../modules/assignment/assignment.service';
import { EmailService } from '../../modules/email/email.service';

export const createTicketCreatedWorkflow = (
  inngestService: InngestService,
  supabaseService: SupabaseService,
  aiService: AiService,
  assignmentService: AssignmentService,
  emailService: EmailService,
) => {
  return inngestService.getClient().createFunction(
    { id: INNGEST_CONFIG.WORKFLOW_ID as string, retries: INNGEST_CONFIG.RETRIES },
    { event: INNGEST_EVENTS.TICKET_CREATED as string },
    async ({ event, step }) => {
      try {
        const { ticketId } = event.data as { ticketId: string };
        // Step 1: Fetch ticket
        const ticket = await step.run(INNGEST_STEPS.FETCH_TICKET as string, async () => {
          const { data, error } = await supabaseService
            .getClient()
            .from(TABLES.TICKETS)
            .select('*')
            .eq(TABLE_COLUMNS.ID, ticketId)
            .single();
          if (error || !data) {
            throw new NonRetriableError(MESSAGES.TICKET_NOT_FOUND);
          }
          return data as any;
        });

        // Step 2: mark status TODO (processing start)
        await step.run(INNGEST_STEPS.UPDATE_TICKET_STATUS as string, async () => {
          await supabaseService
            .getClient()
            .from(TABLES.TICKETS)
            .update({ [TABLE_COLUMNS.STATUS]: TICKET_STATUS.TODO })
            .eq(TABLE_COLUMNS.ID, ticket.id);
        });

        // Step 3: AI processing
        const relatedSkills = await step.run(INNGEST_STEPS.AI_PROCESSING as string, async () => {
          const aiResponse = await aiService.analyzeTicket(ticket.title, ticket.description);
          if (aiResponse) {
            const validPriority = ['low', 'medium', 'high'].includes(aiResponse.priority)
              ? aiResponse.priority
              : 'medium';

            await supabaseService
              .getClient()
              .from(TABLES.TICKETS)
              .update({
                [TABLE_COLUMNS.PRIORITY]: validPriority,
                [TABLE_COLUMNS.HELPFUL_NOTES]: aiResponse.helpfulNotes,
                [TABLE_COLUMNS.SUMMARY]: aiResponse.summary,
                [TABLE_COLUMNS.STATUS]: TICKET_STATUS.IN_PROGRESS,
                [TABLE_COLUMNS.RELATED_SKILLS]: aiResponse.relatedSkills,
              })
              .eq(TABLE_COLUMNS.ID, ticket.id);
            return aiResponse.relatedSkills || [];
          }
          return [];
        });

        // Step 4: Assign moderator
        const moderator = await step.run(INNGEST_STEPS.ASSIGN_MODERATOR as string, async () => {
          return assignmentService.assignModeratorToTicket(ticket.id, relatedSkills);
        });

        // Step 5: Email notification
        await step.run(INNGEST_STEPS.SEND_EMAIL_NOTIFICATION as string, async () => {
          if (moderator) {
            await emailService.sendTicketAssignmentNotification(
              moderator.email,
              ticket.title,
              ticket.id,
            );
          }
        });

        return { success: true, ticketId, assignedTo: moderator?.userId };
      } catch (error) {
        console.error(`❌ ${MESSAGES.WORKFLOW_ERROR}`, error);
        return { success: false, error: (error as any).message };
      }
    },
  );
}; 