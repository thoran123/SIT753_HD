const request = require('supertest');

describe('Deployment Integration Tests', () => {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3001';
  
  describe('Application Deployment', () => {
    test('Application should be accessible after deployment', async () => {
      const res = await request(baseUrl).get('/');
      expect(res.statusCode).toBe(200);
    }, 30000);

    test('Health check should confirm application is running', async () => {
      const res = await request(baseUrl).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    }, 30000);
  });

  describe('API Integration', () => {
    test('Full authentication flow should work', async () => {
      // Test login
      const loginRes = await request(baseUrl)
        .post('/api/login')
        .send({ username: 'test', password: 'test' });
      
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      
      // Test protected resource access (if implemented)
      const usersRes = await request(baseUrl).get('/api/users');
      expect(usersRes.statusCode).toBe(200);
    }, 30000);
  });

  describe('Load Testing', () => {
    test('Application should handle concurrent requests', async () => {
      const requests = [];
      
      for (let i = 0; i < 10; i++) {
        requests.push(request(baseUrl).get('/api/health'));
      }
      
      const responses = await Promise.all(requests);
      
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
      });
    }, 60000);
  });
});