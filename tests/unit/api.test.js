const request = require('supertest');
const app = require('../../server');

describe('API Unit Tests', () => {
  describe('API Response Format', () => {
    test('API endpoints should return proper JSON format', async () => {
      const endpoints = ['/api/health', '/api/info', '/api/users'];
      
      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.header['content-type']).toContain('application/json');
        expect(() => JSON.parse(JSON.stringify(res.body))).not.toThrow();
      }
    });
  });

  describe('API Performance', () => {
    test('API endpoints should respond within reasonable time', async () => {
      const start = Date.now();
      await request(app).get('/api/health');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('API Security Headers', () => {
    test('API should include security headers', async () => {
      const res = await request(app).get('/api/health');
      
      // Helmet middleware should add security headers
      expect(res.header).toHaveProperty('x-dns-prefetch-control');
      expect(res.header).toHaveProperty('x-frame-options');
      expect(res.header).toHaveProperty('x-download-options');
    });
  });
});