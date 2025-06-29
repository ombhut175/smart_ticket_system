# Smart Ticket System API Documentation

Welcome to the Smart Ticket System API documentation. This system provides a comprehensive support ticket management platform with AI-powered analysis, automatic assignment, and role-based access control.

## Documentation Structure

### 📁 Complete API Documentation
- **[api-documentation.md](./api-documentation.md)** - Complete consolidated API reference for all modules

### 📂 Module-Specific Documentation
- **[authentication-module.md](./authentication-module.md)** - User registration, login, logout
- **[users-module.md](./users-module.md)** - Profile management, role administration, skills
- **[tickets-module.md](./tickets-module.md)** - Ticket creation, management, AI processing

## Quick Start Guide

### Base Configuration
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: HTTP-only cookie (`supabaseToken`)
- **Content-Type**: `application/json`
- **Credentials**: `include` (for cookie handling)

### Authentication Flow
```javascript
// 1. Register
POST /api/auth/signup
{ "email": "user@example.com", "password": "password123" }

// 2. Login (sets HTTP-only cookie)
POST /api/auth/login
{ "email": "user@example.com", "password": "password123" }

// 3. Subsequent requests automatically include cookie
GET /api/users/me

// 4. Logout (clears cookie)
POST /api/auth/logout
```

## API Modules Overview

### 🔐 Authentication Module (`/api/auth`)
**Purpose**: User authentication and session management  
**Endpoints**: 3 endpoints (signup, login, logout)  
**Authentication**: None required  

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user account |
| POST | `/login` | Authenticate and establish session |
| POST | `/logout` | Terminate session and clear cookie |

### 👤 Users Module (`/api/users`)
**Purpose**: User profile and role management  
**Endpoints**: 8 endpoints  
**Authentication**: Required for all  

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/me` | Any | Get current user profile |
| PUT | `/me` | Any | Update current user profile |
| PATCH | `/:id/role` | Admin | Update user role |
| POST | `/:id/skills` | Admin | Add skill to user |
| PATCH | `/:id/active` | Admin | Toggle user active status |
| POST | `/moderator` | Admin | Promote user to moderator |
| GET | `/moderator` | Admin | Get all moderators |
| GET | `/moderator/:id` | Admin | Get specific moderator |

### 🎫 Tickets Module (`/api/tickets`)
**Purpose**: Support ticket management and AI processing  
**Endpoints**: 6 endpoints  
**Authentication**: Required for all  

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | Any | Create new ticket |
| GET | `/` | Any | Get user's own tickets |
| GET | `/all` | Mod/Admin | Get all tickets (enhanced) |
| GET | `/:id` | Any* | Get ticket by ID |
| PATCH | `/:id` | Mod/Admin | Update ticket |
| DELETE | `/:id` | Mod/Admin | Delete ticket |

*Users can only view their own tickets

## User Roles & Permissions

### 👤 User (Default)
- Create and view own tickets
- Update own profile
- Cannot manage other users or tickets

### 🛡️ Moderator
- All user permissions
- View and manage all tickets
- Update ticket status and notes
- Delete tickets

### 👑 Admin
- All moderator permissions
- Manage user roles and accounts
- Add skills to users
- Promote users to moderators
- Access to all admin endpoints

## Data Types Quick Reference

### Core Objects

#### User
```typescript
interface User {
  id: string;
  email: string;
  role: "user" | "moderator" | "admin";
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_profile_completed: boolean; // computed
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}
```

#### Ticket
```typescript
interface Ticket {
  id: string;
  title: string;                 // 5-200 chars
  description: string;           // 10-5000 chars
  status: "todo" | "in_progress" | "waiting_for_customer" | "resolved" | "closed" | "cancelled";
  priority: "low" | "medium" | "high";
  created_by: string;
  assigned_to?: string;
  summary?: string;              // AI-generated
  helpful_notes?: string;        // Moderator notes
  related_skills?: string[];     // AI-identified skills
  created_at: string;
  updated_at: string;
}
```

#### UserSkill
```typescript
interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;            // max 100 chars
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  created_at: string;
}
```

### Response Format
All API responses follow this standardized format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  meta?: {                       // For paginated responses
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

## Common Request Examples

### Frontend Integration Examples

#### Basic API Wrapper
```javascript
class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include', // Important for cookie handling
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }
}

const api = new ApiClient();
```

#### Authentication
```javascript
// Register
const registerUser = async (email, password) => {
  return await api.request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

// Login
const loginUser = async (email, password) => {
  return await api.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

// Logout
const logoutUser = async () => {
  return await api.request('/auth/logout', {
    method: 'POST'
  });
};
```

#### User Management
```javascript
// Get current user
const getCurrentUser = async () => {
  const response = await api.request('/users/me');
  return response.data;
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await api.request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
  return response.data;
};
```

#### Ticket Management
```javascript
// Create ticket
const createTicket = async (title, description) => {
  const response = await api.request('/tickets', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  });
  return response.data;
};

// Get user tickets with pagination
const getUserTickets = async (page = 1, limit = 20, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await api.request(`/tickets?${queryParams}`);
  return {
    tickets: response.data,
    pagination: response.meta
  };
};

// Update ticket (moderator only)
const updateTicket = async (ticketId, updates) => {
  const response = await api.request(`/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
  return response.data;
};
```

## Error Handling

### Standard Error Format
```typescript
interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  error?: string; // Additional details
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid authentication)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

### Error Handling Example
```javascript
try {
  const user = await getCurrentUser();
  console.log('User:', user);
} catch (error) {
  if (error.message.includes('401')) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // Show permission denied message
    alert('Access denied');
  } else {
    // Handle other errors
    console.error('API Error:', error.message);
  }
}
```

## AI Features

### Automatic Ticket Processing
When a ticket is created, the system automatically:

1. **Analyzes** content using Gemini AI
2. **Generates** summary and helpful notes
3. **Identifies** relevant skills needed
4. **Assesses** and potentially updates priority
5. **Assigns** to best-matched moderator
6. **Sends** email notification

### Ticket States During Processing
```
Initial:  { status: "todo", priority: "medium", summary: null }
          ↓
AI:       { summary: "...", helpful_notes: "...", related_skills: [...] }
          ↓
Assigned: { assigned_to: "moderator-uuid", email_sent: true }
```

## Database Schema Overview

### Main Tables
- **users** - User accounts and profiles
- **user_skills** - Skills assigned to users
- **tickets** - Support tickets with AI-enhanced fields

### Key Relationships
- `tickets.created_by` → `users.id`
- `tickets.assigned_to` → `users.id`
- `user_skills.user_id` → `users.id`

## Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Mailtrap)
MAILTRAP_SMTP_HOST=smtp.mailtrap.io
MAILTRAP_SMTP_PORT=587
MAILTRAP_SMTP_USER=your_username
MAILTRAP_SMTP_PASS=your_password

# Background Processing (Inngest)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Testing

### API Testing with curl
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login (save cookies)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (use saved cookies)
curl -X GET http://localhost:3000/api/users/me \
  -b cookies.txt

# Create ticket
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Issue","description":"This is a test ticket description."}'
```

## Support & Development

### Documentation Files
- **Complete API**: [api-documentation.md](./api-documentation.md)
- **Authentication**: [authentication-module.md](./authentication-module.md)
- **Users**: [users-module.md](./users-module.md)
- **Tickets**: [tickets-module.md](./tickets-module.md)

### Key Features
- ✅ RESTful API design
- ✅ Role-based access control
- ✅ AI-powered ticket analysis
- ✅ Automatic assignment
- ✅ Real-time processing
- ✅ Comprehensive error handling
- ✅ Standardized responses
- ✅ Complete TypeScript types
- ✅ Extensive validation
- ✅ Security best practices

This documentation provides everything needed for frontend developers to integrate with the Smart Ticket System API effectively. 