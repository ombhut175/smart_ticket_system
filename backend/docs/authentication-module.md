# Authentication Module Documentation

**Base Path:** `/api/auth`  
**Version:** 1.0  
**Authentication:** None required for all endpoints  

## Overview

The Authentication module handles user registration, login, and logout operations. All endpoints use Supabase Auth for secure user management and return standardized responses. Session management is handled through HTTP-only cookies for enhanced security.

## Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/signup`  
**Description:** Creates a new user account with email/password authentication  
**Authentication:** None required  

#### Request Body Schema

```typescript
interface SignupRequest {
  email: string;      // Valid email address (required)
  password: string;   // Minimum 6 characters (required)
}
```

#### Validation Rules

- **email**: Must be a valid email format
- **password**: Minimum 6 characters required

#### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Success Response (201 Created)

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

#### Process Flow

1. Validates input data through `SignupDto` class-validator decorators
2. Calls `AuthService.signUp()` which interfaces with Supabase Auth API
3. Supabase creates user record and sends confirmation email (if configured)
4. Returns standardized success response with user data (excluding sensitive info)

#### Error Responses

**400 Bad Request** - Validation failed
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Bad request",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/auth/signup",
  "error": "email must be a valid email"
}
```

**409 Conflict** - Email already exists
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User with this email already exists",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/auth/signup"
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`  
**Description:** Authenticates user and establishes session with HTTP-only cookie  
**Authentication:** None required  

#### Request Body Schema

```typescript
interface LoginRequest {
  email: string;      // User's email address (required)
  password: string;   // User's password, min 6 chars (required)
}
```

#### Validation Rules

- **email**: Must be a valid email format
- **password**: Minimum 6 characters required

#### Example Request

```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### Success Response (200 OK)

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

#### Process Flow

1. Validates credentials through `LoginDto` class-validator decorators
2. Calls `AuthService.signIn()` which uses Supabase `signInWithPassword` API
3. Supabase verifies password hash and returns session with access_token
4. Updates user record in `public.users` table:
   - Sets `is_email_verified` to `true`
   - Updates `last_login_at` to current timestamp
5. Stores access_token in secure HTTP-only cookie via `CookieHelper`
6. Returns success response with user info (token excluded for security)

#### Side Effects

- Sets HTTP-only cookie named `supabaseToken` with JWT access token
- Cookie expires in 7 days (configurable)
- Updates user's `last_login_at` timestamp in database
- Sets `is_email_verified` to `true`

#### Error Responses

**400 Bad Request** - Invalid credentials
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid email or password",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

**401 Unauthorized** - Authentication failed
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

---

### 3. User Logout

**Endpoint:** `POST /api/auth/logout`  
**Description:** Terminates user session and clears authentication cookie  
**Authentication:** None required (but will use token if present)  

#### Request Body

No body required.

#### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged out successfully",
  "data": null,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### Process Flow

1. Extracts authentication token from HTTP-only cookie
2. If token exists, calls `AuthService.signOut()` to invalidate session in Supabase
3. Clears the authentication cookie via `CookieHelper`
4. Returns success response confirming logout completion
5. Even if no token exists, returns success for security (no information leakage)

#### Side Effects

- Invalidates session in Supabase Auth system
- Clears the `supabaseToken` HTTP-only cookie
- Returns success even if no valid token exists (security measure)

---

## Data Structures

### SignupDto

```typescript
class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### LoginDto

```typescript
class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

## Security Features

### HTTP-Only Cookies

- **Cookie Name**: `supabaseToken`
- **Security**: HTTP-only flag prevents JavaScript access
- **SameSite**: Strict (CSRF protection)
- **Secure**: True in production (HTTPS only)
- **Expiration**: 7 days (configurable)

### Password Security

- Passwords are hashed using Supabase Auth's bcrypt implementation
- Minimum 6 characters required
- No maximum length limit (handled by Supabase)

### Session Management

- JWT tokens are stateless and contain user information
- Token expiration is handled by Supabase
- Logout invalidates the session server-side

## Error Handling

All authentication endpoints use the standardized error response format:

```typescript
interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  error?: string;
}
```

Common authentication errors:

- **400**: Validation errors, invalid input format
- **401**: Invalid credentials, authentication failed
- **409**: Resource conflict (email already exists)
- **500**: Internal server error

## Integration Notes

### Frontend Integration

1. **Registration Flow**:
   ```javascript
   const response = await fetch('/api/auth/signup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   ```

2. **Login Flow**:
   ```javascript
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password }),
     credentials: 'include' // Important for cookie handling
   });
   ```

3. **Logout Flow**:
   ```javascript
   const response = await fetch('/api/auth/logout', {
     method: 'POST',
     credentials: 'include' // Important for cookie handling
   });
   ```

### Authentication State

After successful login, subsequent requests will automatically include the authentication cookie. No additional headers required.

### Email Verification

- Email verification is handled by Supabase Auth
- Users may need to verify their email before full access (configurable)
- The `email_confirmed_at` field indicates verification status

## Environment Configuration

The authentication module requires these environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

### Example Test Cases

1. **Successful Registration**:
   - Valid email and password
   - Verify user creation in database
   - Check response format

2. **Registration Validation**:
   - Invalid email format
   - Password too short
   - Missing required fields

3. **Successful Login**:
   - Valid credentials
   - Cookie is set correctly
   - User data is returned

4. **Login Failures**:
   - Invalid email
   - Invalid password
   - Non-existent user

5. **Logout**:
   - With valid session
   - Without valid session
   - Cookie is cleared

This documentation provides complete information for integrating with the Authentication module of the Smart Ticket System API. 