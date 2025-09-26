const request = require('supertest');
const app = require('../../server');

describe('Server Unit Tests', () => {
  describe('Health Check', () => {
    test('GET /api/health should return healthy status', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('API Info', () => {
    test('GET /api/info should return application info', async () => {
      const res = await request(app).get('/api/info');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('Authentication', () => {
    test('POST /api/login with valid credentials should succeed', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'test', password: 'test' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
    });

    test('POST /api/login with invalid credentials should fail', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'wrong', password: 'wrong' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Users API', () => {
    test('GET /api/users should return user array', async () => {
      const res = await request(app).get('/api/users');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Static Routes', () => {
    test('GET / should return main page', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Metrics', () => {
    test('GET /metrics should return Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('nodejs_');
    });
  });
});
