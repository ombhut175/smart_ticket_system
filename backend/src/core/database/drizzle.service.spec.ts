import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DrizzleService } from './drizzle.client';
import { DatabaseRepository } from './database.repository';

describe('DrizzleService', () => {
  let service: DrizzleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrizzleService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'DATABASE_URL') {
                return 'postgresql://test:test@localhost:5432/test_db';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DrizzleService>(DrizzleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getDb method', () => {
    expect(typeof service.getDb).toBe('function');
  });

  it('should have getClient method', () => {
    expect(typeof service.getClient).toBe('function');
  });

  it('should have close method', () => {
    expect(typeof service.close).toBe('function');
  });
});

describe('DatabaseRepository', () => {
  let repository: DatabaseRepository;
  let drizzleService: DrizzleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseRepository,
        {
          provide: DrizzleService,
          useValue: {
            getDb: jest.fn(() => ({
              insert: jest.fn().mockReturnValue({
                values: jest.fn().mockReturnValue({
                  returning: jest.fn().mockResolvedValue([{ id: 'test-id', email: 'test@example.com' }]),
                }),
              }),
              select: jest.fn().mockReturnValue({
                from: jest.fn().mockReturnValue({
                  where: jest.fn().mockResolvedValue([{ id: 'test-id', email: 'test@example.com' }]),
                }),
              }),
            })),
          },
        },
      ],
    }).compile();

    repository = module.get<DatabaseRepository>(DatabaseRepository);
    drizzleService = module.get<DrizzleService>(DrizzleService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create user', async () => {
    const userData = { email: 'test@example.com', role: 'user' };
    const result = await repository.createUser(userData);
    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
  });

  it('should find user by id', async () => {
    const result = await repository.findUserById('test-id');
    expect(result).toBeDefined();
    expect(result?.id).toBe('test-id');
  });
});
