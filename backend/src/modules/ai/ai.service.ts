import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TicketAnalysis } from './interfaces/ticket-analysis.interface';
import { ENV, AI_CONFIG, MESSAGES } from '../../common/helpers/string-const';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const geminiApiKey = this.configService.get<string>(ENV.GEMINI_API_KEY);
    if (!geminiApiKey) {
      this.logger.warn(
        `${ENV.GEMINI_API_KEY} is missing – AI analysis will be disabled.`,
      );
    }

    this.genAI = new GoogleGenerativeAI(geminiApiKey || 'test-key');
  }

  private getSystemPrompt(): string {
    return `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`;
  }

  private getTaskPrompt(title: string, description: string): string {
    return `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
"summary": "Short summary of the ticket",
"priority": "high",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Title: ${title}
- Description: ${description}`;
  }

  async analyzeTicket(
    title: string,
    description: string,
  ): Promise<TicketAnalysis | null> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: AI_CONFIG.MODEL,
        systemInstruction: this.getSystemPrompt(),
      });

      const taskPrompt = this.getTaskPrompt(title, description);

      const result = await model.generateContent(taskPrompt);
      const response = await result.response;
      const raw = response.text();

      try {
        const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
        const jsonString = match ? match[1] : raw.trim();
        return JSON.parse(jsonString) as TicketAnalysis;
      } catch (parseError) {
        this.logger.error(MESSAGES.AI_PARSE_FAILED, parseError as any);
        return null;
      }
    } catch (error) {
      this.logger.error(MESSAGES.AI_ANALYSIS_FAILED, error as any);
      return null;
    }
  }
}
