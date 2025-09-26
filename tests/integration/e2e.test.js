const request = require('supertest');

describe('End-to-End Integration Tests', () => {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3001';
  
  test('Complete user workflow should work', async () => {
    // Step 1: Access home page
    const homeRes = await request(baseUrl).get('/');
    expect(homeRes.statusCode).toBe(200);
    
    // Step 2: Test login functionality
    const loginRes = await request(baseUrl)
      .post('/api/login')
      .send({ username: 'test', password: 'test' });
    
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    
    // Step 3: Access user data
    const usersRes = await request(baseUrl).get('/api/users');
    expect(usersRes.statusCode).toBe(200);
    expect(Array.isArray(usersRes.body)).toBe(true);
    
  }, 60000);

  test('Error handling should work correctly', async () => {
    // Test 404 handling
    const notFoundRes = await request(baseUrl).get('/nonexistent-page');
    expect(notFoundRes.statusCode).toBe(404);
    
    // Test invalid login
    const invalidLoginRes = await request(baseUrl)
      .post('/api/login')
      .send({ username: 'invalid', password: 'wrong' });
    
    expect(invalidLoginRes.statusCode).toBe(401);
    expect(invalidLoginRes.body.success).toBe(false);
  }, 30000);
});
