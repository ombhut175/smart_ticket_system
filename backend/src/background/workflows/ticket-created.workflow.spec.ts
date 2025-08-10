import { createTicketCreatedWorkflow } from './ticket-created.workflow';
import { InngestService } from '../inngest.service';
import { DatabaseRepository } from '../../core/database/database.repository';
import { AiService } from '../../modules/ai/ai.service';
import { AssignmentService } from '../../modules/assignment/assignment.service';
import { EmailService } from '../../modules/email/email.service';

describe('ticket-created workflow', () => {
  it('should register workflow with Inngest', () => {
    const createFunctionMock = jest.fn();
    const inngestServiceMock = {
      getClient: () => ({ createFunction: createFunctionMock }),
    } as unknown as InngestService;

    const workflow = createTicketCreatedWorkflow(
      inngestServiceMock,
      {} as DatabaseRepository,
      {} as AiService,
      {} as AssignmentService,
      {} as EmailService,
    );

    expect(createFunctionMock).toHaveBeenCalled();
    // workflow should equal whatever createFunction returned – simulate value
  });
}); 