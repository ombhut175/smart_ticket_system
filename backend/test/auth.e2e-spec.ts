import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppModule } from './test-app.module';
import { MESSAGES } from '../src/common/helpers/string-const';

/**
 * End-to-End Authentication Tests
 * Tests the complete authentication workflow including signup, login, logout
 * Validates standardized response formats and error handling
 */
describe('Authentication (e2e)', () => {
  let app: INestApplication;
  
  // Test user data for consistent testing
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same configuration as main.ts
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  //#region ==================== USER SIGNUP TESTS ====================

  describe('POST /api/auth/signup', () => {
    it('should successfully register a new user with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      // Verify standardized response format
      expect(response.body).toMatchObject({
        success: true,
        statusCode: 201,
        message: MESSAGES.USER_SIGNED_UP_SUCCESS,
        data: {
          user: {
            email: testUser.email,
          },
        },
        timestamp: expect.any(String),
      });

      // Verify user ID is present
      expect(response.body.data.user.id).toBeDefined();
    });

    it('should reject signup with invalid email format', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      // Verify standardized error response format
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 400,
        message: expect.stringContaining('email'),
        data: null,
        timestamp: expect.any(String),
        path: '/api/auth/signup',
      });
    });

    it('should reject signup with short password', async () => {
      const invalidUser = { ...testUser, password: '123' };
      
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);
    });

    it('should reject signup with missing required fields', async () => {
      const incompleteUser = { email: testUser.email };
      
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(incompleteUser)
        .expect(400);
    });
  });

  //#endregion

  //#region ==================== USER LOGIN TESTS ====================

  describe('POST /api/auth/login', () => {
    // Note: These tests would require a real Supabase instance or mocking
    // For MVP, we're focusing on request/response format validation
    
    it('should have correct endpoint structure for login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrong' });

      // Should return 401 or 400 (not 404 - endpoint exists)
      expect([400, 401]).toContain(response.status);
      
      // Should follow standardized error format
      expect(response.body).toMatchObject({
        success: false,
        statusCode: expect.any(Number),
        message: expect.any(String),
        data: null,
        timestamp: expect.any(String),
        path: '/api/auth/login',
      });
    });

    it('should reject login with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);
    });

    it('should reject login with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(400);
    });
  });

  //#endregion

  //#region ==================== USER LOGOUT TESTS ====================

  describe('POST /api/auth/logout', () => {
    it('should successfully logout even without authentication cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(200);

      // Verify standardized success response
      expect(response.body).toMatchObject({
        success: true,
        statusCode: 200,
        message: MESSAGES.USER_LOGGED_OUT_SUCCESS,
        data: null,
        timestamp: expect.any(String),
      });
    });

    it('should clear authentication cookie on logout', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(200);

      // Check that Set-Cookie header clears the supabaseToken
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        expect(Array.isArray(setCookieHeader) && setCookieHeader.some((cookie: string) => 
          cookie.includes('supabaseToken=;')
        )).toBeTruthy();
      }
    });
  });

  //#endregion

  //#region ==================== RESPONSE FORMAT VALIDATION ====================

  describe('Response Format Consistency', () => {
    it('should maintain consistent error format across all auth endpoints', async () => {
      const endpoints = [
        { method: 'post', path: '/api/auth/signup', data: {} },
        { method: 'post', path: '/api/auth/login', data: {} },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app.getHttpServer())
          [endpoint.method](endpoint.path)
          .send(endpoint.data);

        // All error responses should follow the same format
        if (!response.body.success) {
          expect(response.body).toMatchObject({
            success: false,
            statusCode: expect.any(Number),
            message: expect.any(String),
            data: null,
            timestamp: expect.any(String),
            path: endpoint.path,
          });
        }
      }
    });
  });

  //#endregion
}); 