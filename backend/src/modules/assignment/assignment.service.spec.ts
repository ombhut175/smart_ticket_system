import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { SupabaseService } from '../../core/database/supabase.client';
import { TABLES } from '../../common/helpers/string-const';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let supabaseMock: any;

  beforeEach(async () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
    };

    supabaseMock = {
      getClient: jest.fn().mockReturnValue({
        from: jest.fn().mockImplementation((table: string) => {
          if (table === TABLES.USERS) {
            return mockQueryBuilder;
          }
          if (table === TABLES.TICKETS) {
            return {
              update: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({}),
            };
          }
          return mockQueryBuilder;
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        { provide: SupabaseService, useValue: supabaseMock },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);

    // default: admin user returned
    mockQueryBuilder.single.mockResolvedValue({
      data: { id: 'admin-1', email: 'admin@example.com' },
    });
  });

  it('should assign admin when no moderator found', async () => {
    const result = await service.assignModeratorToTicket('ticket-1', []);
    expect(result).toEqual({ userId: 'admin-1', email: 'admin@example.com' });
    expect(supabaseMock.getClient).toHaveBeenCalled();
  });

  it('should return null if no user found', async () => {
    // Make single return null
    const { getClient } = supabaseMock;
    const qb = getClient().from(TABLES.USERS);
    qb.single.mockResolvedValueOnce({ data: null }); // moderator search
    qb.single.mockResolvedValueOnce({ data: null }); // admin search

    const res = await service.assignModeratorToTicket('ticket-1', ['React']);
    expect(res).toBeNull();
  });
});
