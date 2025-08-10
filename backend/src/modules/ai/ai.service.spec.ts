import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest
              .fn()
              .mockReturnValue(
                '{"summary":"Short summary","priority":"high","helpfulNotes":"Some notes","relatedSkills":["React"]}',
              ),
          },
        }),
      }),
    })),
  };
});

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-gemini-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should analyze ticket and return structured data', async () => {
    const result = await service.analyzeTicket('Title', 'Description');
    expect(result).toEqual({
      summary: 'Short summary',
      priority: 'high',
      helpfulNotes: 'Some notes',
      relatedSkills: ['React'],
    });
  });

  it('should handle AI failure gracefully', async () => {
    const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai');
    (GoogleGenerativeAI as jest.Mock).mockImplementationOnce(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn().mockRejectedValue(new Error('AI error')),
      }),
    }));

    // Recreate service with failing AI
    const mockConfig = { get: jest.fn().mockReturnValue('fake-key') } as any;
    const failingService = new AiService(mockConfig as ConfigService);
    const res = await failingService.analyzeTicket('Title', 'Desc');
    expect(res).toBeNull();
  });
});
