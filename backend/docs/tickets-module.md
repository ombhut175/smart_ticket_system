# Tickets Module Documentation

**Base Path:** `/api/tickets`  
**Version:** 1.0  
**Authentication:** Required for all endpoints (HTTP-only cookie)  

## Overview

The Tickets module handles support ticket creation, management, and workflow automation. It provides endpoints for users to create and track their tickets, and for moderators/admins to manage all tickets in the system. The module includes AI-powered ticket analysis, automatic assignment, and comprehensive status tracking.

## Endpoints

### Ticket Creation

#### 1. Create New Ticket

**Endpoint:** `POST /api/tickets`  
**Description:** Creates a new support ticket and triggers AI processing workflow  
**Required Role:** Any authenticated user  

##### Request Body Schema

```typescript
interface CreateTicketRequest {
  title: string;        // 5-200 characters (required)
  description: string;  // 10-5000 characters (required)
}
```

##### Validation Rules

- `title`: 5-200 characters required
- `description`: 10-5000 characters required

##### Example Request

```json
{
  "title": "Cannot access user dashboard",
  "description": "When I try to access my dashboard, I get a 404 error. This started happening after the recent update. I've tried clearing my browser cache and using different browsers, but the issue persists. The error appears immediately when I click on the 'Dashboard' link in the navigation menu."
}
```

##### Success Response (201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Ticket created and processing started",
  "data": {
    "id": "ticket-uuid-123",
    "title": "Cannot access user dashboard",
    "description": "When I try to access my dashboard, I get a 404 error...",
    "status": "todo",
    "priority": "medium",
    "created_by": "user-uuid-456",
    "assigned_to": null,
    "summary": null,
    "helpful_notes": null,
    "related_skills": null,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

##### Background Processing Workflow

1. **Initial Creation**: Ticket created with default values:
   - `status`: "todo"
   - `priority`: "medium"
   - `assigned_to`: null
   - AI fields: null (will be populated by background processing)

2. **AI Analysis** (Asynchronous):
   - Analyzes ticket content using Gemini AI
   - Generates concise summary
   - Creates helpful troubleshooting notes
   - Identifies relevant technical skills
   - Assesses and updates priority if needed

3. **Auto-Assignment** (Asynchronous):
   - Searches for active moderators with matching skills
   - Assigns ticket to most suitable moderator
   - Sends email notification to assigned moderator

4. **Final State** (After processing):
   ```json
   {
     "status": "todo",
     "priority": "high", // May be updated by AI
     "summary": "User experiencing 404 errors on dashboard access",
     "helpful_notes": "This appears to be a routing issue. Check dashboard route configuration.",
     "related_skills": ["Frontend Development", "React", "Routing"],
     "assigned_to": "moderator-uuid-789"
   }
   ```

##### Error Responses

**400 Bad Request** - Validation failed
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Bad request",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets",
  "error": "title must be at least 5 characters long"
}
```

---

### Ticket Retrieval

#### 2. Get User's Own Tickets

**Endpoint:** `GET /api/tickets`  
**Description:** Retrieves paginated list of tickets created by the authenticated user  
**Required Role:** Any authenticated user  

##### Query Parameters

```typescript
interface TicketQueryParams {
  page?: number;        // Page number (starts from 1), default: 1
  limit?: number;       // Items per page (1-100), default: 20
  status?: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  priority?: "low" | "medium" | "high";
  assigned_to?: string; // UUID of assigned user (for moderator/admin views)
}
```

##### Example Request

```
GET /api/tickets?page=1&limit=10&status=todo&priority=high
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Tickets retrieved successfully",
  "data": [
    {
      "id": "ticket-uuid-123",
      "title": "Cannot access user dashboard",
      "description": "When I try to access my dashboard...",
      "status": "todo",
      "priority": "high",
      "created_by": "user-uuid-456",
      "assigned_to": "moderator-uuid-789",
      "summary": "User experiencing 404 errors on dashboard access",
      "helpful_notes": "This appears to be a routing issue. Check the dashboard route configuration.",
      "related_skills": ["Frontend Development", "React", "Routing"],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

##### Filtering Options

- **status**: Filter by ticket status
- **priority**: Filter by priority level
- **page/limit**: Standard pagination
- **assigned_to**: Not applicable for user view (shows their own tickets only)

---

#### 3. Get All Tickets (Moderator/Admin Only)

**Endpoint:** `GET /api/tickets/all`  
**Description:** Retrieves paginated list of all tickets in the system with enhanced details  
**Required Role:** `moderator` or `admin`  

##### Query Parameters

Same as user tickets endpoint, plus:
- **assigned_to**: Can filter by specific moderator UUID

##### Example Request

```
GET /api/tickets/all?page=1&limit=20&status=in_progress&assigned_to=moderator-uuid-789
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All tickets retrieved successfully",
  "data": [
    {
      "id": "ticket-uuid-123",
      "title": "Cannot access user dashboard",
      "description": "When I try to access my dashboard...",
      "status": "in_progress",
      "priority": "high",
      "created_by": "user-uuid-456",
      "assigned_to": "moderator-uuid-789",
      "summary": "User experiencing 404 errors on dashboard access",
      "helpful_notes": "This appears to be a routing issue. Check the dashboard route configuration.",
      "related_skills": ["Frontend Development", "React", "Routing"],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "assignee": {
        "email": "moderator@example.com"
      },
      "creator": {
        "email": "user@example.com"
      }
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

##### Enhanced Features for Moderators

- **assignee**: Email of assigned moderator
- **creator**: Email of ticket creator
- **All tickets**: Regardless of creator
- **Assignment filtering**: Filter by assigned moderator

---

#### 4. Get Ticket by ID

**Endpoint:** `GET /api/tickets/:id`  
**Description:** Retrieves a specific ticket with role-based access control  
**Required Role:** Any authenticated user (with access restrictions)  

##### URL Parameters

- `id` (string): UUID of the ticket to retrieve

##### Access Control Rules

- **Users**: Can only view tickets they created
- **Moderators/Admins**: Can view any ticket

##### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ticket retrieved successfully",
  "data": {
    "id": "ticket-uuid-123",
    "title": "Cannot access user dashboard",
    "description": "When I try to access my dashboard, I get a 404 error. This started happening after the recent update.",
    "status": "in_progress",
    "priority": "high",
    "created_by": "user-uuid-456",
    "assigned_to": "moderator-uuid-789",
    "summary": "User experiencing 404 errors on dashboard access",
    "helpful_notes": "This appears to be a routing issue. Check the dashboard route configuration and verify that the dashboard component is properly registered.",
    "related_skills": ["Frontend Development", "React", "Routing", "Debugging"],
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

##### Error Responses

**403 Forbidden** - Access denied
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden - cannot access this ticket",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/ticket-uuid-123"
}
```

**404 Not Found** - Ticket not found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Ticket not found",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/invalid-uuid"
}
```

---

### Ticket Management (Moderator/Admin Only)

#### 5. Update Ticket

**Endpoint:** `PATCH /api/tickets/:id`  
**Description:** Updates ticket status and helpful notes  
**Required Role:** `moderator` or `admin`  

##### URL Parameters

- `id` (string): UUID of the ticket to update

##### Request Body Schema

```typescript
interface UpdateTicketRequest {
  status?: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  helpful_notes?: string;  // Max 2000 characters
}
```

##### Ticket Statuses

- `todo`: Newly created, awaiting assignment or work
- `in_progress`: Being actively worked on by moderator
- `waiting_for_customer`: Waiting for customer response/action
- `resolved`: Issue has been fixed, awaiting confirmation
- `closed`: Ticket completed and closed
- `cancelled`: Ticket cancelled/invalid/duplicate

##### Example Request

```json
{
  "status": "in_progress",
  "helpful_notes": "Started investigating the routing issue. Found that the dashboard route is missing from the main router configuration. Working on a fix and will update the user once deployed."
}
```

##### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ticket updated successfully",
  "data": {
    "id": "ticket-uuid-123",
    "title": "Cannot access user dashboard",
    "description": "When I try to access my dashboard...",
    "status": "in_progress",
    "priority": "high",
    "created_by": "user-uuid-456",
    "assigned_to": "moderator-uuid-789",
    "summary": "User experiencing 404 errors on dashboard access",
    "helpful_notes": "Started investigating the routing issue. Found that the dashboard route is missing from the main router configuration. Working on a fix and will update the user once deployed.",
    "related_skills": ["Frontend Development", "React", "Routing"],
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:01:00.000Z"
  },
  "timestamp": "2023-01-01T00:01:00.000Z"
}
```

##### Validation Rules

- `status`: Must be one of the valid status values
- `helpful_notes`: Optional, maximum 2000 characters

##### Error Responses

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Only moderators can update tickets",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/ticket-uuid-123"
}
```

---

#### 6. Delete Ticket

**Endpoint:** `DELETE /api/tickets/:id`  
**Description:** Permanently deletes a ticket from the system  
**Required Role:** `moderator` or `admin`  

##### URL Parameters

- `id` (string): UUID of the ticket to delete

##### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ticket deleted successfully",
  "data": null,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

##### Use Cases

- Remove spam tickets
- Delete duplicate tickets
- Clean up test data
- Handle incorrectly created tickets

##### Error Responses

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Only moderators and admins can delete tickets",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/ticket-uuid-123"
}
```

**404 Not Found** - Ticket not found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Ticket not found",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/invalid-uuid"
}
```

---

## Data Structures

### Ticket Object

```typescript
interface Ticket {
  id: string;                    // UUID
  title: string;                 // 5-200 characters
  description: string;           // 10-5000 characters
  status: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  priority: "low" | "medium" | "high";
  created_by: string;            // UUID of creator
  assigned_to?: string;          // UUID of assigned moderator
  summary?: string;              // AI-generated summary
  helpful_notes?: string;        // Moderator notes, max 2000 chars
  related_skills?: string[];     // AI-identified relevant skills
  created_at: string;            // ISO date string
  updated_at: string;            // ISO date string
}
```

### DTOs

#### CreateTicketDto

```typescript
class CreateTicketDto {
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  description: string;
}
```

#### UpdateTicketDto

```typescript
class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TICKET_STATUS, { message: 'Status must be a valid ticket status' })
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Helpful notes cannot exceed 2000 characters' })
  helpful_notes?: string;
}
```

#### TicketQueryDto

```typescript
class TicketQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TICKET_STATUS, { message: 'Status must be a valid ticket status' })
  status?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'], { message: 'Priority must be low, medium, or high' })
  priority?: string;

  @IsOptional()
  @IsString()
  assigned_to?: string;
}
```

#### PaginationDto

```typescript
class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Page must be greater than 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 20;
}
```

## Role-Based Access Control

### Permission Matrix

| Endpoint | User | Moderator | Admin |
|----------|------|-----------|-------|
| POST / | ✅ | ✅ | ✅ |
| GET / | ✅ (own only) | ✅ (own only) | ✅ (own only) |
| GET /all | ❌ | ✅ | ✅ |
| GET /:id | ✅ (own only) | ✅ | ✅ |
| PATCH /:id | ❌ | ✅ | ✅ |
| DELETE /:id | ❌ | ✅ | ✅ |

### Access Control Logic

#### Users
- Can create new tickets
- Can view only tickets they created
- Cannot update or delete any tickets

#### Moderators & Admins
- Can create new tickets
- Can view all tickets in the system
- Can update ticket status and notes
- Can delete tickets
- Have access to enhanced ticket views with creator/assignee information

## Background Processing

### AI Analysis Workflow

When a ticket is created, the system triggers an asynchronous background workflow:

#### 1. Ticket Analysis Phase

```typescript
interface TicketAnalysis {
  summary: string;              // Concise ticket summary
  priority: 'low' | 'medium' | 'high';  // Priority assessment
  helpfulNotes: string;         // Troubleshooting suggestions
  relatedSkills: string[];      // Relevant technical skills
}
```

**AI Processing Steps:**
1. Analyzes ticket title and description
2. Extracts key technical concepts
3. Assesses urgency and complexity
4. Generates helpful troubleshooting steps
5. Identifies required skills for resolution

#### 2. Automatic Assignment Phase

**Assignment Algorithm:**
1. Fetches all active moderators with skills
2. Matches moderator skills with `related_skills`
3. Calculates compatibility scores based on:
   - Skill relevance match
   - Proficiency levels
   - Current workload
4. Assigns to best-matched moderator
5. Sends email notification

#### 3. Workflow Error Handling

- **AI Analysis Fails**: Ticket remains with default priority and null AI fields
- **Assignment Fails**: Ticket remains unassigned but with AI analysis complete
- **Email Fails**: Assignment completes but notification error is logged

### Inngest Workflow Steps

The system uses Inngest for reliable background processing:

1. **fetch-ticket**: Retrieves ticket data
2. **update-ticket-status**: Updates status to processing
3. **ai-processing**: Performs AI analysis
4. **assign-moderator**: Auto-assignment logic
5. **send-email-notification**: Notifies assigned moderator

## Database Schema

### tickets table

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'waiting_for_customer', 'resolved', 'closed', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  summary TEXT,
  helpful_notes TEXT,
  related_skills TEXT[], -- PostgreSQL array type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
```

## Error Handling

### Common Error Scenarios

**401 Unauthorized** - Missing authentication
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized access",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden - cannot access this ticket",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/ticket-uuid-123"
}
```

**400 Bad Request** - Validation errors
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Bad request",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets",
  "error": "title must be at least 5 characters long"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Ticket not found",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/invalid-uuid"
}
```

## Frontend Integration Examples

### Create New Ticket

```javascript
const createTicket = async (ticketData) => {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(ticketData)
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data; // Created ticket
  }
  throw new Error('Failed to create ticket');
};

// Usage
const newTicket = await createTicket({
  title: "Cannot access user dashboard",
  description: "Detailed description of the issue..."
});
```

### Get User Tickets with Pagination

```javascript
const getUserTickets = async (params = {}) => {
  const queryString = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 20,
    ...(params.status && { status: params.status }),
    ...(params.priority && { priority: params.priority })
  });
  
  const response = await fetch(`/api/tickets?${queryString}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (response.ok) {
    const data = await response.json();
    return {
      tickets: data.data,
      pagination: data.meta
    };
  }
  throw new Error('Failed to fetch tickets');
};

// Usage
const result = await getUserTickets({
  page: 1,
  limit: 10,
  status: 'in_progress'
});
```

### Update Ticket Status (Moderator Only)

```javascript
const updateTicket = async (ticketId, updates) => {
  const response = await fetch(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(updates)
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data; // Updated ticket
  }
  throw new Error('Failed to update ticket');
};

// Usage
const updatedTicket = await updateTicket('ticket-uuid-123', {
  status: 'resolved',
  helpful_notes: 'Issue has been fixed by updating the router configuration.'
});
```

## Business Logic Notes

### Ticket Lifecycle

1. **Creation**: User creates ticket → AI analysis begins → Auto-assignment attempted
2. **Assignment**: Moderator assigned → Email notification sent
3. **In Progress**: Moderator updates status → User can track progress
4. **Resolution**: Issue fixed → Status updated to resolved
5. **Closure**: User confirms fix → Ticket closed

### Priority Levels

- **Low**: Minor issues, feature requests, cosmetic problems
- **Medium**: Standard functionality issues, moderate impact
- **High**: Critical functionality broken, security issues, urgent problems

### Status Workflow

```
todo → in_progress → waiting_for_customer ↔ in_progress → resolved → closed
  ↓                                                          ↑
cancelled ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←↩
```

### AI-Generated Content

- **Summary**: 1-2 sentence concise description
- **Helpful Notes**: Step-by-step troubleshooting guide
- **Related Skills**: Technical skills needed for resolution
- **Priority**: May be upgraded based on analysis

This documentation provides complete information for integrating with the Tickets module of the Smart Ticket System API. 