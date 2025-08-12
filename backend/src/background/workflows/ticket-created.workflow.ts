import { NonRetriableError } from 'inngest';
import {
  TICKET_STATUS,
  TABLES,
  TABLE_COLUMNS,
  INNGEST_CONFIG,
  INNGEST_STEPS,
  INNGEST_EVENTS,
  MESSAGES,
} from '../../common/helpers/string-const';
import { InngestService } from '../inngest.service';
import { TicketsRepository } from '../../core/database/repositories/tickets.repository';
import { AiService } from '../../modules/ai/ai.service';
import { AssignmentService } from '../../modules/assignment/assignment.service';
import { EmailService } from '../../modules/email/email.service';

export const createTicketCreatedWorkflow = (
  inngestService: InngestService,
  ticketsRepo: TicketsRepository,
  aiService: AiService,
  assignmentService: AssignmentService,
  emailService: EmailService,
) => {
  return inngestService
    .getClient()
    .createFunction(
      {
        id: INNGEST_CONFIG.WORKFLOW_ID as string,
        retries: INNGEST_CONFIG.RETRIES,
      },
      { event: INNGEST_EVENTS.TICKET_CREATED as string },
      async ({ event, step }) => {
        try {
          const { ticketId } = event.data as { ticketId: string };
          console.log(`🎫 Processing ticket workflow for ID: ${ticketId}`);

          // Step 1: Fetch ticket
          const ticket = await step.run(
            INNGEST_STEPS.FETCH_TICKET as string,
            async () => {
              console.log(`📋 Fetching ticket with ID: ${ticketId}`);
              const data = await ticketsRepo.findTicketById(ticketId);
              if (!data) {
                console.error(`❌ Ticket not found: ${ticketId}`);
                throw new NonRetriableError(MESSAGES.TICKET_NOT_FOUND);
              }
              console.log(`✅ Ticket fetched successfully: ${data.title}`);
              return data as any;
            },
          );

          // Step 2: mark status TODO (processing start)
          await step.run(
            INNGEST_STEPS.UPDATE_TICKET_STATUS as string,
            async () => {
              console.log(
                `🔄 Updating ticket status to TODO for: ${ticket.id}`,
              );
              await ticketsRepo.updateTicket(ticket.id, {
                status: TICKET_STATUS.TODO,
              } as any);
              console.log(`✅ Ticket status updated to TODO`);
            },
          );

          // Step 3: AI processing
          const relatedSkills = await step.run(
            INNGEST_STEPS.AI_PROCESSING as string,
            async () => {
              console.log(
                `🤖 Starting AI analysis for ticket: ${ticket.title}`,
              );
              const aiResponse = await aiService.analyzeTicket(
                ticket.title,
                ticket.description,
              );
              if (aiResponse) {
                console.log(
                  `🧠 AI analysis complete. Priority: ${aiResponse.priority}, Skills: ${aiResponse.relatedSkills?.join(', ')}`,
                );
                const validPriority = ['low', 'medium', 'high'].includes(
                  aiResponse.priority,
                )
                  ? aiResponse.priority
                  : 'medium';

                await ticketsRepo.updateTicket(ticket.id, {
                  priority: validPriority,
                  helpfulNotes: aiResponse.helpfulNotes,
                  summary: aiResponse.summary,
                  status: TICKET_STATUS.IN_PROGRESS,
                  relatedSkills: aiResponse.relatedSkills as any,
                } as any);
                console.log(`✅ Ticket updated with AI insights`);
                return aiResponse.relatedSkills || [];
              }
              console.log(`⚠️ No AI response received`);
              return [];
            },
          );

          // Step 4: Assign moderator
          const moderator = await step.run(
            INNGEST_STEPS.ASSIGN_MODERATOR as string,
            async () => {
              return assignmentService.assignModeratorToTicket(
                ticket.id,
                relatedSkills,
              );
            },
          );

          // Step 5: Email notification
          await step.run(
            INNGEST_STEPS.SEND_EMAIL_NOTIFICATION as string,
            async () => {
              if (moderator) {
                await emailService.sendTicketAssignmentNotification(
                  moderator.email,
                  ticket.title,
                  ticket.id,
                );
              }
            },
          );

          return { success: true, ticketId, assignedTo: moderator?.userId };
        } catch (error) {
          console.error(`❌ ${MESSAGES.WORKFLOW_ERROR}`, error);
          return { success: false, error: (error as any).message };
        }
      },
    );
};
