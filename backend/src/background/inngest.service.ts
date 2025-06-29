import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inngest } from 'inngest';
import { ENV, INNGEST_CONFIG } from '../common/helpers/string-const';

@Injectable()
export class InngestService {
  private readonly logger = new Logger(InngestService.name);
  private client: Inngest;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = this.configService.get<string>(ENV.NODE_ENV) || 'development';
    const isDevelopment = nodeEnv === 'development';

    if (isDevelopment) {
      this.logger.verbose('🏠 Inngest: Initialized in local development mode.');
      this.client = new Inngest({ id: INNGEST_CONFIG.CLIENT_ID as string });
    } else {
      this.logger.verbose('🚀 Inngest: Initialized with cloud credentials.');
      this.client = new Inngest({
        id: INNGEST_CONFIG.CLIENT_ID as string,
        eventKey: this.configService.get<string>(ENV.INNGEST_EVENT_KEY),
        signingKey: this.configService.get<string>(ENV.INNGEST_SIGNING_KEY),
      });
    }
  }

  /**
   * Returns the underlying Inngest client instance
   */
  getClient(): Inngest {
    return this.client;
  }

  /**
   * Helper method to emit an event
   */
  async sendEvent(event: { name: string; data: any }) {
    return this.client.send(event);
  }
} 