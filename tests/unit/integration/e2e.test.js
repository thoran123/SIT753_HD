const request = require('supertest');

describe('End-to-End Integration Tests', () => {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3001';
  
  describe('Complete User Journey', () => {
    test('User should be able to complete full application workflow', async () => {
      // Step 1: Access home page
      const homeRes = await request(baseUrl).get('/');
      expect(homeRes.statusCode).toBe(200);
      
      // Step 2: Access login page
      const loginPageRes = await request(baseUrl).get('/login');
      expect(loginPageRes.statusCode).toBe(200);
      
      // Step 3: Perform login
      const loginRes = await request(baseUrl)
        .post('/api/login')
        .send({ username: 'admin', password: 'admin' });
      
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      
      // Step 4: Access user data
      const usersRes = await request(baseUrl).get('/api/users');
      expect(usersRes.statusCode).toBe(200);
      expect(Array.isArray(usersRes.body)).toBe(true);
      
      // Step 5: Access support page
      const supportRes = await request(baseUrl).get('/support');
      expect(supportRes.statusCode).toBe(200);
      
    }, 60000);
  });

  describe('Error Handling Integration', () => {
    test('Application should handle errors gracefully', async () => {
      // Test 404 handling
      const notFoundRes = await request(baseUrl).get('/nonexistent');
      expect(notFoundRes.statusCode).toBe(404);
      expect(notFoundRes.body.error).toBe('Not Found');
      
      // Test invalid login
      const invalidLoginRes = await request(baseUrl)
        .post('/api/login')
        .send({ username: 'invalid', password: 'invalid' });
      
      expect(invalidLoginRes.statusCode).toBe(401);
      expect(invalidLoginRes.body.success).toBe(false);
    }, 30000);
  });
});