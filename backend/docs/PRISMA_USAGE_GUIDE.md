# Centralized Prisma Service Usage Guide

## Overview

This project uses a centralized Prisma service that provides database access across all modules. The `PrismaService` is globally available throughout the application, eliminating the need to import the `PrismaModule` in every feature module.

## Architecture

### Core Components

1. **PrismaService** (`src/core/prisma/prisma.service.ts`): The main service that extends PrismaClient
2. **PrismaModule** (`src/core/prisma/prisma.module.ts`): Global module that exports PrismaService
3. **Health Controller** (`src/core/health/health.controller.ts`): Provides database health checks

## How to Use Prisma Service in Your Modules

### 1. Basic Usage

Since `PrismaModule` is marked as `@Global()`, you can inject `PrismaService` directly into any service or controller without importing the module:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class YourService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers() {
    return await this.prisma.public_users.findMany();
  }

  async createTicket(ticketData: any) {
    return await this.prisma.tickets.create({
      data: ticketData,
    });
  }
}
```

### 2. Example: Testing Service

See `src/modules/testing/testing.service.ts` for a complete example that demonstrates:

- Creating records
- Fetching records
- Updating records  
- Deleting records
- Counting records
- Filtering by fields

### 3. Available Database Tables

Based on your Prisma schema, you can access these tables:

#### Public Schema:
- `prisma.public_users` (mapped from `users`)
- `prisma.tickets`
- `prisma.ticket_skills`
- `prisma.user_skills`
- `prisma.testing` (new table)

#### Auth Schema (Supabase Auth):
- `prisma.auth_users` (mapped from `users`)
- `prisma.identities`
- `prisma.sessions`
- And other auth-related tables...

## Database Setup Commands

### 1. Push Schema to Supabase

To push your current schema (including the new testing table) to your Supabase database:

```bash
npx prisma db push
```

This command will:
- Apply schema changes to your database
- Not create migration files
- Useful for development/testing

### 2. Create Migration (Recommended for Production)

```bash
npx prisma migrate dev --name add_testing_table
```

This command will:
- Create a migration file
- Apply the migration to your database
- Generate the Prisma client

### 3. Generate Prisma Client

After schema changes, regenerate the client:

```bash
npx prisma generate
```

### 4. Reset Database (Development Only)

To reset your development database:

```bash
npx prisma migrate reset
```

## Health Check Endpoints

The application provides several health check endpoints:

### 1. Application Health
```
GET /health
```
Returns basic application health information.

### 2. Database Health
```
GET /health/database
```
Returns database connection status and basic statistics including:
- Connection status
- Database name and version
- Record counts for users, tickets, and testing table

### 3. Database Statistics
```
GET /health/database/stats
```
Returns detailed database statistics including:
- Total number of tables
- Record counts for main tables
- Connection information

## Best Practices

### 1. Error Handling

Always wrap Prisma operations in try-catch blocks:

```typescript
async createUser(userData: any) {
  try {
    return await this.prisma.public_users.create({
      data: userData,
    });
  } catch (error) {
    this.logger.error('Failed to create user:', error);
    throw error;
  }
}
```

### 2. Logging

Use NestJS Logger for database operations:

```typescript
import { Logger } from '@nestjs/common';

export class YourService {
  private readonly logger = new Logger(YourService.name);
  
  async someOperation() {
    this.logger.log('Starting database operation...');
    // ... database operations
    this.logger.log('Database operation completed');
  }
}
```

### 3. Transactions

For operations that need to be atomic:

```typescript
async complexOperation() {
  return await this.prisma.$transaction(async (tx) => {
    const user = await tx.public_users.create({ data: userData });
    const ticket = await tx.tickets.create({ 
      data: { ...ticketData, created_by: user.id } 
    });
    return { user, ticket };
  });
}
```

### 4. Relations

When fetching related data:

```typescript
async getTicketWithUser(ticketId: string) {
  return await this.prisma.tickets.findUnique({
    where: { id: ticketId },
    include: {
      users_tickets_created_byTousers: true,
      users_tickets_assigned_toTousers: true,
      ticket_skills: true,
    },
  });
}
```

## Testing Your Setup

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the development server:**
   ```bash
   npm run start:dev
   ```

3. **Test the health endpoints:**
   - Visit `http://localhost:3000/health`
   - Visit `http://localhost:3000/health/database`
   - Visit `http://localhost:3000/health/database/stats`

## Troubleshooting

### 1. "Property 'testing' does not exist on type 'PrismaService'"

This means the Prisma client hasn't been regenerated after adding the testing table. Run:
```bash
npx prisma generate
```

### 2. Permission Errors During Generation

If you get EPERM errors, try:
- Close your IDE/editor
- Stop the development server
- Run the command again

### 3. Database Connection Issues

Check your `.env` file for correct DATABASE_URL configuration:
```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
DATABASE_URL="your_supabase_database_url"
SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

This centralized approach ensures consistent database access patterns across your entire application while maintaining clean separation of concerns.
