# Users Module Documentation

**Base Path:** `/api/users`  
**Version:** 1.0  
**Authentication:** Required for all endpoints (HTTP-only cookie)  

## Overview

The Users module handles user profile management, role administration, and skill tracking. It provides endpoints for users to manage their own profiles and for administrators to manage user roles, skills, and account status. All endpoints require authentication and use role-based access control.

## Endpoints

### User Profile Endpoints

#### 1. Get Current User Profile

**Endpoint:** `GET /api/users/me`  
**Description:** Returns complete profile details of the authenticated user  
**Required Role:** Any authenticated user  

##### Request Parameters

None required.

##### Success Response (200 OK)

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

##### Data Fields Explanation

- `is_profile_completed`: Computed field indicating whether both `first_name` and `last_name` are filled
- `role`: One of `"user"`, `"moderator"`, `"admin"`
- `is_active`: Account status (can be toggled by admins)
- `is_email_verified`: Email verification status from Supabase Auth

##### Process Flow

1. Extracts user ID from authenticated request (set by `SupabaseAuthGuard`)
2. Queries `public.users` table to get complete profile data
3. Adds computed `is_profile_completed` field based on name completion
4. Returns standardized response with profile data

---

#### 2. Update Current User Profile

**Endpoint:** `PUT /api/users/me`  
**Description:** Updates first_name and/or last_name of the authenticated user  
**Required Role:** Any authenticated user  

##### Request Body Schema

```typescript
interface UpdateProfileRequest {
  first_name?: string;    // Optional, max 100 characters
  last_name?: string;     // Optional, max 100 characters
}
```

##### Validation Rules

- `first_name`: Optional, string, maximum 100 characters
- `last_name`: Optional, string, maximum 100 characters

##### Example Request

```json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

##### Success Response (200 OK)

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

---

### Admin-Only Endpoints

#### 3. Update User Role

**Endpoint:** `PATCH /api/users/:id/role`  
**Description:** Allows administrators to change the role of any user  
**Required Role:** `admin`  

##### URL Parameters

- `id` (string): UUID of the user whose role will be updated

##### Request Body Schema

```typescript
interface UpdateRoleRequest {
  role: "user" | "moderator" | "admin";
}
```

##### Example Request

```json
{
  "role": "moderator"
}
```

##### Success Response (200 OK)

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

##### Available Roles

- `user`: Default role, can create and view own tickets
- `moderator`: Can manage all tickets, update status, assign tickets
- `admin`: Full system access, can manage users and roles

##### Error Responses

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. Required roles: [admin], User role: user",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/uuid-123/role"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/uuid-123/role"
}
```

---

#### 4. Add Skill to User

**Endpoint:** `POST /api/users/:id/skills`  
**Description:** Adds a new skill with proficiency level to any user  
**Required Role:** `admin`  

##### URL Parameters

- `id` (string): UUID of the user who will receive the new skill

##### Request Body Schema

```typescript
interface AddUserSkillRequest {
  skill_name: string;                                           // Max 100 characters
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
}
```

##### Proficiency Levels

- `beginner`: Basic understanding
- `intermediate`: Moderate experience
- `advanced`: Strong expertise
- `expert`: Master-level proficiency

##### Example Request

```json
{
  "skill_name": "JavaScript",
  "proficiency_level": "advanced"
}
```

##### Success Response (201 Created)

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

##### Error Responses

**400 Bad Request** - Skill already exists or invalid data
```json
{
  "success": false,
  "statusCode": 400,
  "message": "User already has this skill",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/uuid-123/skills"
}
```

---

#### 5. Toggle User Active Status

**Endpoint:** `PATCH /api/users/:id/active`  
**Description:** Activates or deactivates a user account  
**Required Role:** `admin`  

##### URL Parameters

- `id` (string): UUID of the user whose active status will be toggled

##### Request Body Schema

```typescript
interface ToggleActiveRequest {
  is_active: boolean;    // true to activate, false to deactivate
}
```

##### Example Request

```json
{
  "is_active": false
}
```

##### Success Response (200 OK)

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

##### Use Cases

- Temporarily suspend problematic users
- Deactivate former employees
- Reactivate previously suspended accounts

---

#### 6. Promote User to Moderator

**Endpoint:** `POST /api/users/moderator`  
**Description:** Promotes a user to moderator role and assigns multiple skills in a single transaction  
**Required Role:** `admin`  

##### Request Body Schema

```typescript
interface AddModeratorRequest {
  email: string;           // Email address of user to promote
  skills: Array<{
    skill_name: string;                                           // Max 100 characters
    proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
}
```

##### Validation Rules

- `email`: Must be a valid email address of an existing user
- `skills`: Array must contain at least 1 skill, maximum 50 skills

##### Example Request

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

##### Success Response (201 Created)

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

##### Process Flow

1. Finds user by email address in `public.users` table
2. Validates user can be promoted (not already moderator/admin)
3. Updates user role from "user" to "moderator"
4. Batch inserts all provided skills into `user_skills` table
5. Returns updated user object with newly created skills

##### Error Responses

**400 Bad Request** - User cannot be promoted
```json
{
  "success": false,
  "statusCode": 400,
  "message": "User john.doe@example.com is already a moderator",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/moderator"
}
```

**404 Not Found** - User not found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User with email john.doe@example.com not found",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/moderator"
}
```

---

#### 7. Get All Moderators

**Endpoint:** `GET /api/users/moderator`  
**Description:** Retrieves list of all users with moderator role including their skills  
**Required Role:** `admin`  

##### Success Response (200 OK)

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

##### Query Details

- Performs JOIN query between `users` and `user_skills` tables
- Filters for users with role = 'moderator'
- Includes all skills for each moderator
- Useful for admin dashboards and moderator management

---

#### 8. Get Moderator by ID

**Endpoint:** `GET /api/users/moderator/:id`  
**Description:** Retrieves detailed information about a specific moderator including all skills  
**Required Role:** `admin`  

##### URL Parameters

- `id` (string): UUID of the moderator to retrieve

##### Success Response (200 OK)

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

##### Use Cases

- Detailed moderator profile pages
- Skill management interfaces
- Assignment algorithm data

---

## Data Structures

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

### DTOs

#### UpdateProfileDto

```typescript
class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;
}
```

#### UpdateRoleDto

```typescript
class UpdateRoleDto {
  @IsEnum(USER_ROLES)
  role: UserRole;
}
```

#### AddUserSkillDto

```typescript
class AddUserSkillDto {
  @IsString()
  @MaxLength(100)
  skill_name: string;

  @IsEnum(SKILL_PROFICIENCY)
  proficiency_level: SKILL_PROFICIENCY;
}
```

#### ToggleActiveDto

```typescript
class ToggleActiveDto {
  @IsBoolean()
  is_active: boolean;
}
```

#### AddModeratorDto

```typescript
class AddModeratorDto {
  @IsEmail()
  email: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddUserSkillDto)
  skills: AddUserSkillDto[];
}
```

## Role-Based Access Control

### Permission Matrix

| Endpoint | User | Moderator | Admin |
|----------|------|-----------|-------|
| GET /me | ✅ | ✅ | ✅ |
| PUT /me | ✅ | ✅ | ✅ |
| PATCH /:id/role | ❌ | ❌ | ✅ |
| POST /:id/skills | ❌ | ❌ | ✅ |
| PATCH /:id/active | ❌ | ❌ | ✅ |
| POST /moderator | ❌ | ❌ | ✅ |
| GET /moderator | ❌ | ❌ | ✅ |
| GET /moderator/:id | ❌ | ❌ | ✅ |

### Guards Used

- `SupabaseAuthGuard`: Validates authentication for all endpoints
- `RolesGuard`: Enforces role-based access control for admin endpoints
- `@Roles()` decorator: Specifies required roles for each endpoint

## Database Schema

### users table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_skills table

```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(20) NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);
```

## Error Handling

### Common Error Responses

**401 Unauthorized** - Missing or invalid authentication
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized access",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/me"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. Required roles: [admin], User role: moderator",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/uuid-123/role"
}
```

**400 Bad Request** - Validation errors
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Bad request",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users/me",
  "error": "first_name must be shorter than or equal to 100 characters"
}
```

## Frontend Integration Examples

### Get Current User Profile

```javascript
const getCurrentUser = async () => {
  const response = await fetch('/api/users/me', {
    method: 'GET',
    credentials: 'include' // Include authentication cookie
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data; // User object
  }
  throw new Error('Failed to fetch user profile');
};
```

### Update User Profile

```javascript
const updateProfile = async (profileData) => {
  const response = await fetch('/api/users/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data; // Updated user object
  }
  throw new Error('Failed to update profile');
};
```

### Promote User to Moderator (Admin Only)

```javascript
const promoteToModerator = async (email, skills) => {
  const response = await fetch('/api/users/moderator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, skills })
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.data; // Updated user with skills
  }
  throw new Error('Failed to promote user to moderator');
};
```

## Business Logic Notes

### Profile Completion

The `is_profile_completed` field is computed based on:
- Both `first_name` and `last_name` must be non-null and non-empty
- Used by frontend to prompt users to complete their profiles
- Affects user experience and feature access

### Skill Management

- Skills are used by the AI assignment system to match tickets with appropriate moderators
- Each skill has a proficiency level that affects assignment priority
- Skills can be added individually or in bulk during moderator promotion
- Duplicate skills for the same user are prevented by database constraints

### Role Hierarchy

- `user` → `moderator` → `admin`
- Role upgrades should follow this hierarchy
- Admins cannot demote other admins (business rule)
- Role changes are logged for audit purposes

This documentation provides complete information for integrating with the Users module of the Smart Ticket System API. 