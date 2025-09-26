const request = require('supertest');
const app = require('../../server'); // This now gets the app without starting server

describe('Server Unit Tests', () => {
    test('Health check endpoint should work', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
    });

    test('Info endpoint should return application info', async () => {
        const res = await request(app).get('/api/info');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name');
    });

  describe('Health Check Endpoint', () => {
    test('GET /api/health should return 200 and health status', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('uptime');
    }, 10000);
  });

  describe('Info Endpoint', () => {
    test('GET /api/info should return application information', async () => {
      const res = await request(app).get('/api/info');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('description');
    });
  });

  describe('Authentication Endpoint', () => {
    test('POST /api/login with valid admin credentials should succeed', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'admin' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe('admin');
    });

    test('POST /api/login with valid test credentials should succeed', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'test', password: 'test' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toBe('test');
    });

    test('POST /api/login with invalid credentials should fail', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'invalid', password: 'invalid' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    test('POST /api/login without credentials should fail', async () => {
      const res = await request(app).post('/api/login').send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Username and password required');
    });
  });

  describe('Users Endpoint', () => {
    test('GET /api/users should return user list', async () => {
      const res = await request(app).get('/api/users');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('username');
    });
  });

  describe('Static Routes', () => {
    test('GET / should return index page', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });

    test('GET /login should return login page', async () => {
      const res = await request(app).get('/login');
      expect(res.statusCode).toBe(200);
    });

    test('GET /support should return support page', async () => {
      const res = await request(app).get('/support');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Metrics Endpoint', () => {
    test('GET /metrics should return Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      
      expect(res.statusCode).toBe(200);
      expect(res.header['content-type']).toContain('text/plain');
      expect(res.text).toContain('nodejs_');
    });
  });

  describe('Error Handling', () => {
    test('GET /nonexistent should return 404', async () => {
      const res = await request(app).get('/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });
});