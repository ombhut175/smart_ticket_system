# Smart Ticket System API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:8080/api`  
**Authentication:** Cookie-based (HTTP-only cookie with JWT token)  

## Table of Contents

1. [Authentication Module](#authentication-module)
2. [Users Module](#users-module)
3. [Tickets Module](#tickets-module)
4. [Health Module](#health-module)
5. [Common Data Types](#common-data-types)
6. [Error Responses](#error-responses)
7. [Response Format](#response-format)
8. [Authentication & Headers](#authentication--headers)

---

## Authentication Module

**Base Path:** `/api/auth`

All authentication endpoints return standardized responses and handle user session management through HTTP-only cookies.

Notes:
- Content-Type for JSON requests: `application/json`
- Auth methods supported on protected routes: HTTP-only cookie (`supabaseToken`) or `Authorization: Bearer <token>` header.

### 1. Register New User

**Endpoint:** `POST /api/auth/signup`  
**Description:** Creates a new user account with email/password authentication.  
**Authentication:** None required  

#### Request Body

```typescript
{
  email: string;      // Valid email address
  password: string;   // Minimum 6 characters
}
```

#### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User signed up successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "email": "john.doe@example.com",
      "email_confirmed_at": null
    },
    "session": null
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Validation Rules

- `email`: Must be a valid email format
- `password`: Minimum 6 characters required

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`  
**Description:** Authenticates user and establishes session with HTTP-only cookie.  
**Authentication:** None required  

#### Request Body

```typescript
{
  email: string;      // User's email address
  password: string;   // User's password (min 6 chars)
}
```

#### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "email": "john.doe@example.com",
      "last_sign_in_at": "2023-01-01T00:00:00.000Z"
    },
    "sessionInfo": {
      "expires_at": 1234567890,
      "token_type": "bearer"
    }
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Side Effects

- Sets HTTP-only cookie named `supabaseToken` with JWT access token
- Cookie expires in 7 days
- Updates user's `last_login_at` timestamp
- Sets `is_email_verified` to true

---

### 3. User Logout

**Endpoint:** `POST /api/auth/logout`  
**Description:** Terminates user session and clears authentication cookie.  
**Authentication:** None required (but will use token if present)  

#### Request Body

No body required.

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged out successfully",
  "data": null,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Side Effects

- Invalidates session in Supabase Auth
- Clears the `supabaseToken` HTTP-only cookie
- Returns success even if no valid token exists (security measure)

---

## Users Module

**Base Path:** `/api/users`  
**Authentication:** Required for all endpoints (HTTP-only cookie)

### 1. Get Current User Profile

**Endpoint:** `GET /api/users/me`  
**Description:** Returns profile details of the authenticated user.  
**Required Role:** Any authenticated user  

#### Request Parameters

None required.

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "john.doe@example.com",
    "role": "user",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_email_verified": true,
    "is_profile_completed": true,
    "last_login_at": "2023-01-01T00:00:00.000Z",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Data Fields

- `is_profile_completed`: Computed field indicating whether both `first_name` and `last_name` are filled
- `role`: One of `"user"`, `"moderator"`, `"admin"`

---

### 2. Update Current User Profile

**Endpoint:** `PUT /api/users/me`  
**Description:** Updates first_name and/or last_name of the authenticated user.  
**Required Role:** Any authenticated user  

#### Request Body

```typescript
{
  first_name?: string;    // Optional, max 100 characters
  last_name?: string;     // Optional, max 100 characters
}
```

#### Example Request

```json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Updated",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "john.doe@example.com",
    "role": "user",
    "first_name": "John",
    "last_name": "Smith",
    "is_active": true,
    "is_email_verified": true,
    "is_profile_completed": true,
    "last_login_at": "2023-01-01T00:00:00.000Z",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Validation Rules

- `first_name`: Optional, string, maximum 100 characters
- `last_name`: Optional, string, maximum 100 characters

---

### 3. Update User Role (Admin Only)

**Endpoint:** `PATCH /api/users/:id/role`  
**Description:** Allows administrators to change the role of any user.  
**Required Role:** `admin`  

#### URL Parameters

- `id` (string): UUID of the user whose role will be updated

#### Request Body

```typescript
{
  role: "user" | "moderator" | "admin";
}
```

#### Example Request

```json
{
  "role": "moderator"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Updated",
  "data": {
    "id": "uuid-123-456-789",
    "email": "john.doe@example.com",
    "role": "moderator",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_email_verified": true,
    "last_login_at": "2023-01-01T00:00:00.000Z",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Available Roles

- `user`: Default role, can create and view own tickets
- `moderator`: Can manage all tickets, update status, assign tickets
- `admin`: Full system access, can manage users and roles

---

### 4. Add Skill to User (Admin Only)

**Endpoint:** `POST /api/users/:id/skills`  
**Description:** Adds a new skill with proficiency level to any user.  
**Required Role:** `admin`  

#### URL Parameters

- `id` (string): UUID of the user who will receive the new skill

#### Request Body

```typescript
{
  skill_name: string;                                           // Max 100 characters
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
}
```

#### Example Request

```json
{
  "skill_name": "JavaScript",
  "proficiency_level": "advanced"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Created",
  "data": {
    "id": "skill-uuid-456",
    "user_id": "uuid-123",
    "skill_name": "JavaScript",
    "proficiency_level": "advanced",
    "created_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Proficiency Levels

- `beginner`: Basic understanding
- `intermediate`: Moderate experience
- `advanced`: Strong expertise
- `expert`: Master-level proficiency

---

### 5. Toggle User Active Status (Admin Only)

**Endpoint:** `PATCH /api/users/:id/active`  
**Description:** Activates or deactivates a user account.  
**Required Role:** `admin`  

#### URL Parameters

- `id` (string): UUID of the user whose active status will be toggled

#### Request Body

```typescript
{
  is_active: boolean;    // true to activate, false to deactivate
}
```

#### Example Request

```json
{
  "is_active": false
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Updated",
  "data": {
    "id": "uuid-123-456-789",
    "email": "john.doe@example.com",
    "role": "user",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": false,
    "is_email_verified": true,
    "last_login_at": "2023-01-01T00:00:00.000Z",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

### 6. Promote User to Moderator (Admin Only)

**Endpoint:** `POST /api/users/moderator`  
**Description:** Promotes a user to moderator role and assigns multiple skills in a single transaction.  
**Required Role:** `admin`  

#### Request Body

```typescript
{
  email: string;           // Email address of user to promote
  skills: Array<{
    skill_name: string;                                           // Max 100 characters
    proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
}
```

#### Example Request

```json
{
  "email": "john.doe@example.com",
  "skills": [
    {
      "skill_name": "JavaScript",
      "proficiency_level": "advanced"
    },
    {
      "skill_name": "Customer Support",
      "proficiency_level": "expert"
    },
    {
      "skill_name": "Python",
      "proficiency_level": "intermediate"
    }
  ]
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Created",
  "data": {
    "id": "uuid-123-456-789",
    "email": "john.doe@example.com",
    "role": "moderator",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_email_verified": true,
    "last_login_at": "2023-01-01T00:00:00.000Z",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "skills": [
      {
        "id": "skill-uuid-1",
        "user_id": "uuid-123-456-789",
        "skill_name": "JavaScript",
        "proficiency_level": "advanced",
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": "skill-uuid-2",
        "user_id": "uuid-123-456-789",
        "skill_name": "Customer Support",
        "proficiency_level": "expert",
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ]
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Process

1. Finds user by email address
2. Validates user can be promoted (not already moderator/admin)
3. Updates role from "user" to "moderator"
4. Batch inserts all provided skills
5. Returns updated user with skills

---

### 7. Get All Moderators (Admin Only)

**Endpoint:** `GET /api/users/moderator`  
**Description:** Retrieves list of all users with moderator role including their skills.  
**Required Role:** `admin`  

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "uuid-123-456-789",
      "email": "moderator@example.com",
      "role": "moderator",
      "first_name": "Jane",
      "last_name": "Smith",
      "is_active": true,
      "is_email_verified": true,
      "last_login_at": "2023-01-01T00:00:00.000Z",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "skills": [
        {
          "id": "skill-uuid-1",
          "user_id": "uuid-123-456-789",
          "skill_name": "Customer Support",
          "proficiency_level": "expert",
          "created_at": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

### 8. Get Moderator by ID (Admin Only)

**Endpoint:** `GET /api/users/moderator/:id`  
**Description:** Retrieves detailed information about a specific moderator including all skills.  
**Required Role:** `admin`  

#### URL Parameters

- `id` (string): UUID of the moderator to retrieve

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid-123-456-789",
    "email": "moderator@example.com",
    "role": "moderator",
    "first_name": "Jane",
    "last_name": "Smith",
    "is_active": true,
    "is_email_verified": true,
    "last_login_at": "2023-01-01T00:00:00.000Z",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "skills": [
      {
        "id": "skill-uuid-1",
        "user_id": "uuid-123-456-789",
        "skill_name": "Customer Support",
        "proficiency_level": "expert",
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": "skill-uuid-2",
        "user_id": "uuid-123-456-789",
        "skill_name": "Technical Writing",
        "proficiency_level": "advanced",
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ]
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

## Tickets Module

**Base Path:** `/api/tickets`  
**Authentication:** Required for all endpoints

### 1. Create New Ticket

**Endpoint:** `POST /api/tickets`  
**Description:** Creates a new support ticket and triggers AI processing workflow.  
**Required Role:** Any authenticated user  

#### Request Body

```typescript
{
  title: string;        // 5-200 characters
  description: string;  // 10-5000 characters
}
```

#### Example Request

```json
{
  "title": "Cannot access user dashboard",
  "description": "When I try to access my dashboard, I get a 404 error. This started happening after the recent update. I've tried clearing my browser cache and using different browsers, but the issue persists."
}
```

#### Response (201 Created)

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

#### Process

1. Validates input data
2. Creates ticket with default priority "medium" and status "todo"
3. Triggers background AI processing workflow
4. AI analyzes ticket and updates summary, helpful_notes, related_skills
5. AI may update priority based on analysis
6. System attempts to auto-assign to suitable moderator

#### Validation Rules

- `title`: 5-200 characters required
- `description`: 10-5000 characters required

---

### 2. Get User's Own Tickets

**Endpoint:** `GET /api/tickets`  
**Description:** Retrieves paginated list of tickets created by the authenticated user.  
**Required Role:** Any authenticated user  

#### Query Parameters

```typescript
{
  page?: number;        // Page number (starts from 1), default: 1
  limit?: number;       // Items per page (1-100), default: 20
  status?: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  priority?: "low" | "medium" | "high";
  assigned_to?: string; // UUID of assigned user (moderator/admin view only)
}
```

#### Example Request

```
GET /api/tickets?page=1&limit=10&status=todo&priority=high
```

#### Response (200 OK)

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

---

### 3. Get All Tickets (Moderator/Admin Only)

**Endpoint:** `GET /api/tickets/all`  
**Description:** Retrieves paginated list of all tickets in the system with enhanced details.  
**Required Role:** `moderator` or `admin`  

#### Query Parameters

Same as user tickets endpoint, plus additional filtering options available to moderators.

#### Example Request

```
GET /api/tickets/all?page=1&limit=20&status=in_progress&assigned_to=moderator-uuid-789
```

#### Response (200 OK)

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

#### Enhanced Features

- Includes assignee and creator email information
- Can filter by assigned moderator
- Shows all tickets regardless of creator

---

### 4. Get Ticket by ID

**Endpoint:** `GET /api/tickets/:id`  
**Description:** Retrieves a specific ticket with role-based access control.  
**Required Role:** Any authenticated user (with access restrictions)  

#### URL Parameters

- `id` (string): UUID of the ticket to retrieve

#### Access Control

- **Users**: Can only view tickets they created
- **Moderators/Admins**: Can view any ticket

#### Response (200 OK)

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

---

### 5. Update Ticket (Moderator/Admin Only)

**Endpoint:** `PATCH /api/tickets/:id`  
**Description:** Updates ticket status and helpful notes.  
**Required Role:** `moderator` or `admin`  

#### URL Parameters

- `id` (string): UUID of the ticket to update

#### Request Body

```typescript
{
  status?: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  helpful_notes?: string;  // Max 2000 characters
}
```

#### Example Request

```json
{
  "status": "in_progress",
  "helpful_notes": "Started investigating the routing issue. Found that the dashboard route is missing from the main router configuration. Working on a fix."
}
```

#### Response (200 OK)

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
    "helpful_notes": "Started investigating the routing issue. Found that the dashboard route is missing from the main router configuration. Working on a fix.",
    "related_skills": ["Frontend Development", "React", "Routing"],
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:01:00.000Z"
  },
  "timestamp": "2023-01-01T00:01:00.000Z"
}
```

#### Ticket Statuses

- `todo`: Newly created, awaiting assignment
- `in_progress`: Being actively worked on
- `waiting_for_customer`: Waiting for customer response
- `resolved`: Issue has been fixed
- `closed`: Ticket completed and closed
- `cancelled`: Ticket cancelled/invalid

---

### 6. Delete Ticket (Moderator/Admin Only)

**Endpoint:** `DELETE /api/tickets/:id`  
**Description:** Permanently deletes a ticket from the system.  
**Required Role:** `moderator` or `admin`  

#### URL Parameters

- `id` (string): UUID of the ticket to delete

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ticket deleted successfully",
  "data": null,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

## Health Module

**Base Path:** `/api/health`

### 1. Health Check

**Endpoint:** `GET /api/health`  
**Description:** Returns basic application health information.  
**Authentication:** None

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "uptime": 123.45,
    "version": "1.0.0"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 2. Database Health

**Endpoint:** `GET /api/health/database`  
**Description:** Checks database connectivity and basic counts.  
**Authentication:** None

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Database connection is healthy",
  "data": {
    "database": {
      "isConnected": true,
      "databaseName": "supabase",
      "version": "1.0.0",
      "totalUsers": 10,
      "totalTickets": 25,
      "totalTestingRecords": 0
    }
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 3. Database Stats

**Endpoint:** `GET /api/health/database/stats`  
**Description:** Returns aggregated database statistics.  
**Authentication:** None

#### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Database statistics retrieved successfully",
  "data": {
    "totalTables": 4,
    "totalUsers": 10,
    "totalTickets": 25,
    "connectionInfo": {
      "isConnected": true,
      "databaseName": "supabase",
      "version": "1.0.0"
    }
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

---

## Common Data Types

### User Object

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Email address
  role: "user" | "moderator" | "admin";
  first_name?: string;           // Optional, max 100 chars
  last_name?: string;            // Optional, max 100 chars
  is_active: boolean;            // Account status
  is_email_verified: boolean;    // Email verification status
  is_profile_completed: boolean; // Computed: both names filled
  last_login_at?: string;        // ISO date string
  created_at: string;            // ISO date string
  updated_at: string;            // ISO date string
}
```

### UserSkill Object

```typescript
interface UserSkill {
  id: string;                    // UUID
  user_id: string;               // UUID of user
  skill_name: string;            // Name of skill, max 100 chars
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  created_at: string;            // ISO date string
}
```

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

### Pagination Parameters

```typescript
interface PaginationQuery {
  page?: number;                 // Page number (1-based), default: 1
  limit?: number;                // Items per page (1-100), default: 20
}
```

### Pagination Response

```typescript
interface PaginatedResponse<T> {
  success: true;
  statusCode: 200;
  message: string;
  data: T[];
  meta: {
    total: number;               // Total items available
    page: number;                // Current page number
    limit: number;               // Items per page
  };
  timestamp: string;
}
```

---

## Response Format

All API responses follow a standardized format:

### Success Response

```typescript
interface SuccessResponse<T> {
  success: true;
  statusCode: number;            // HTTP status code
  message: string;               // Human-readable message
  data: T;                       // Response payload
  timestamp: string;             // ISO date string
  meta?: {                       // Optional pagination info
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  statusCode: number;            // HTTP status code
  message: string;               // Error description
  timestamp: string;             // ISO date string
  path: string;                  // Request path
  error?: string;                // Additional error details
}
```

---

## Error Responses

### Common HTTP Status Codes

#### 400 Bad Request

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Bad request",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets",
  "error": "Validation failed: title must be at least 5 characters long"
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized access",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/me"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. Required roles: [admin], User role: user",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/uuid-123/role"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets/invalid-uuid"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/tickets"
}
```

---

## Authentication & Headers

### Cookie-Based Authentication

The system uses HTTP-only cookies for authentication:

- **Cookie Name**: `supabaseToken`
- **Expiration**: 7 days
- **Security**: HTTP-only, secure in production
- **Usage**: Automatically sent with requests

### Authorization Header Alternative

- You may alternatively send the JWT as an `Authorization` header: `Authorization: Bearer <token>`
- Both cookie and header are supported by the server guard; cookies are preferred for browsers due to XSS protection

### Required Headers

- `Content-Type: application/json` for all requests with bodies

### Authorization & Roles

#### User Roles

1. **user** (default)
   - Create and view own tickets
   - Update own profile

2. **moderator**
   - All user permissions
   - View and manage all tickets
   - Update ticket status and notes
   - Delete tickets

3. **admin**
   - All moderator permissions
   - Manage user roles
   - Add skills to users
   - Activate/deactivate accounts
   - Promote users to moderators

### Protected Endpoints

- **Authentication Required**: All endpoints except auth and health endpoints
- **Role Restrictions**: Clearly marked in endpoint descriptions
- **Access Control**: Automatic enforcement via guards

---

## Background Processing

### AI Analysis Workflow

When a ticket is created, the system automatically:

1. **AI Analysis**: Analyzes ticket content using Gemini AI
2. **Priority Assessment**: Updates priority based on urgency
3. **Summary Generation**: Creates concise summary
4. **Helpful Notes**: Generates troubleshooting suggestions
5. **Skill Identification**: Identifies relevant technical skills
6. **Auto-Assignment**: Attempts to assign to suitable moderator
7. **Email Notification**: Sends notification to assigned moderator

### Ticket States During Processing

- Initial: `status: "todo"`, `priority: "medium"`
- After AI: Updated priority (one of low/medium/high), summary, helpful_notes, related_skills
- After Assignment: `assigned_to` populated if suitable moderator found

---

This documentation provides comprehensive information for frontend developers to integrate with the Smart Ticket System API. All endpoints return standardized responses and include detailed error handling.