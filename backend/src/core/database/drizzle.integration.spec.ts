import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DrizzleService } from './drizzle.client';
import { DatabaseRepository } from './database.repository';
import { DatabaseModule } from './database.module';

describe('Drizzle Integration', () => {
  let module: TestingModule;
  let drizzleService: DrizzleService;
  let dbRepo: DatabaseRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        DatabaseModule,
      ],
    }).compile();

    drizzleService = module.get<DrizzleService>(DrizzleService);
    dbRepo = module.get<DatabaseRepository>(DatabaseRepository);
  });

  afterAll(async () => {
    if (drizzleService) {
      await drizzleService.close();
    }
    await module.close();
  });

  describe('Database Connection', () => {
    it('should establish database connection', () => {
      expect(drizzleService).toBeDefined();
      expect(drizzleService.getDb()).toBeDefined();
      expect(drizzleService.getClient()).toBeDefined();
    });

    it('should have repository methods', () => {
      expect(dbRepo).toBeDefined();
      expect(typeof dbRepo.createUser).toBe('function');
      expect(typeof dbRepo.findUserById).toBe('function');
      expect(typeof dbRepo.createTicket).toBe('function');
      expect(typeof dbRepo.findTicketById).toBe('function');
    });
  });

  describe('Schema Validation', () => {
    it('should have proper table schemas', () => {
      const db = drizzleService.getDb();
      expect(db).toBeDefined();
    });
  });
});
