import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ENV, EMAIL_CONFIG, MESSAGES, interpolateMessage } from '../../common/helpers/string-const';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>(ENV.SMTP_HOST),
      port: this.configService.get<number>(ENV.SMTP_PORT) || EMAIL_CONFIG.DEFAULT_PORT,
      secure: false,
      auth: {
        user: this.configService.get<string>(ENV.SMTP_USER),
        pass: this.configService.get<string>(ENV.SMTP_PASS),
      },
    });
  }

  async sendTicketAssignmentNotification(
    moderatorEmail: string,
    ticketTitle: string,
    ticketId: string,
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(ENV.SMTP_USER),
        to: moderatorEmail,
        subject: EMAIL_CONFIG.SUBJECT_TICKET_ASSIGNED as string,
        html: `<h2>New Ticket Assigned</h2>
<p>A new ticket has been assigned to you:</p>
<p><strong>Title:</strong> ${ticketTitle}</p>
<p><strong>Ticket ID:</strong> ${ticketId}</p>
<p>Please review and take appropriate action.</p>`,
      });
      this.logger.log(interpolateMessage(MESSAGES.EMAIL_SENT_SUCCESS, { 
        email: moderatorEmail, 
        ticketId 
      }));
      return true;
    } catch (error) {
      this.logger.error(MESSAGES.EMAIL_SEND_FAILED, error as any);
      return false;
    }
  }
} 