const request = require('supertest');
const { app, server } = require('../src/index');

describe('Contract Tests', () => {
  afterAll(() => {
    server.close();
  });

  describe('API Response Contracts', () => {
    it('GET / should return JSON with message property', async () => {
      const response = await request(app).get('/');
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('GET /health should return status and timestamp', async () => {
      const response = await request(app).get('/health');
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('healthy');
    });

    it('GET /api/version should return version and environment', async () => {
      const response = await request(app).get('/api/version');
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });

    it('All endpoints should return status 200', async () => {
      const endpoints = ['/', '/health', '/api/version'];
      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(200);
      }
    });
  });
});
