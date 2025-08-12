# Drizzle ORM Setup and Configuration

This document describes the Drizzle ORM setup in the Smart Ticket System backend.

## Overview

Drizzle ORM is a TypeScript ORM that provides type-safe database operations with excellent performance. It's configured alongside the existing Supabase setup to provide an alternative database access layer.

## Installation

The following packages have been installed:

```bash
npm install drizzle-orm postgres @types/pg
npm install -D drizzle-kit drizzle-zod zod
```

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
DIRECT_URL="postgresql://username:password@localhost:5432/database_name"
```

### Drizzle Config

The main configuration is in `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/core/database/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

## Schema Definition

### Tables

The following tables are defined in the schema:

1. **users** - User accounts and profiles
2. **tickets** - Support tickets
3. **user_skills** - User skill mappings
4. **ticket_skills** - Ticket skill requirements

### Schema Location

All schemas are located in `src/core/database/schema/`:
- `users.schema.ts` - Users table schema
- `tickets.schema.ts` - Tickets table schema
- `user-skills.schema.ts` - User skills table schema
- `ticket-skills.schema.ts` - Ticket skills table schema
- `index.ts` - Schema exports

## Database Services

### DrizzleService

Located at `src/core/database/drizzle.client.ts`, this service provides:
- Database connection management
- Connection pooling configuration
- Raw database client access

### DatabaseRepository

Located at `src/core/database/database.repository.ts`, this service provides:
- Type-safe CRUD operations
- Complex query methods
- Relationship handling

## Usage Examples

### Basic CRUD Operations

```typescript
import { DatabaseRepository } from '../core/database/database.repository';

@Injectable()
export class UserService {
  constructor(private readonly dbRepo: DatabaseRepository) {}

  async createUser(userData: NewUser): Promise<User> {
    return await this.dbRepo.createUser(userData);
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.dbRepo.findUserById(id);
  }

  async updateUser(id: string, userData: Partial<NewUser>): Promise<User | null> {
    return await this.dbRepo.updateUser(id, userData);
  }
}
```

### Complex Queries

```typescript
// Find users with their skills
const usersWithSkills = await this.dbRepo.findUsersWithSkills();

// Find tickets with assignee and creator information
const ticketsWithAssignees = await this.dbRepo.findTicketsWithAssignees();
```

## Available Scripts

The following npm scripts are available for database management:

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Push schema changes directly to database (development)
npm run db:push

# Open Drizzle Studio for database inspection
npm run db:studio

# Drop all tables (dangerous!)
npm run db:drop
```

## Migration Workflow

1. **Development**: Use `npm run db:push` for quick schema updates
2. **Production**: Use `npm run db:generate` to create migration files, then `npm run db:migrate` to apply them

## Type Safety

All database operations are fully type-safe:
- Table schemas define the structure
- Zod schemas provide runtime validation
- TypeScript types are automatically inferred
- Query results are properly typed

## Performance Features

- Connection pooling with configurable limits
- Prepared statements for repeated queries
- Efficient query building with Drizzle's query builder
- Minimal overhead compared to raw SQL

## Integration with Existing Code

The Drizzle setup is designed to work alongside the existing Supabase implementation:
- Both services are available in the DatabaseModule
- Existing Supabase code remains unchanged
- Gradual migration to Drizzle is possible
- Services can be used interchangeably based on requirements

## Best Practices

1. **Use Repository Pattern**: Always use DatabaseRepository for database operations
2. **Type Safety**: Leverage TypeScript types for all database operations
3. **Connection Management**: Let the service handle connection lifecycle
4. **Error Handling**: Implement proper error handling for database operations
5. **Testing**: Use the repository in unit tests for better isolation

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check DATABASE_URL environment variable
2. **Schema Generation**: Ensure all schema files are properly exported
3. **Type Errors**: Verify schema definitions match expected types
4. **Migration Issues**: Check database permissions and connection

### Debug Mode

Enable verbose logging in `drizzle.config.ts`:
```typescript
export default defineConfig({
  // ... other config
  verbose: true,
});
```

## Future Enhancements

- Add database connection health checks
- Implement connection retry logic
- Add query performance monitoring
- Support for multiple database connections
- Integration with NestJS health checks
