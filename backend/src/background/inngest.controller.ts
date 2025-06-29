import { All, Controller, Req, Res } from '@nestjs/common';
import { serve } from 'inngest/express';
import { BackgroundService } from './background.service';
import { Request, Response } from 'express';
import { API_PATHS } from '../common/helpers/string-const';

@Controller(API_PATHS.INNGEST)
export class InngestController {
  constructor(private readonly backgroundService: BackgroundService) {}

  @All()
  async handleInngest(@Req() req: Request, @Res() res: Response) {
    const handler = serve({
      client: this.backgroundService.getInngestClient(),
      functions: this.backgroundService.getWorkflows(),
    });

    return handler(req, res);
  }
} 