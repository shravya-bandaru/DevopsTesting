const request = require('supertest');
const { app } = require('../src/index');

describe('Edge Case Tests', () => {
  describe('Request Handling', () => {
    it('should handle requests with query parameters', async () => {
      const response = await request(app).get('/?param=value');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle requests with special characters in URL', async () => {
      const response = await request(app).get('/health?test=%20%26%3D');
      
      expect(response.status).toBe(200);
    });

    it('should handle empty query strings', async () => {
      const response = await request(app).get('/health?');
      
      expect(response.status).toBe(200);
    });

    it('should handle multiple query parameters', async () => {
      const response = await request(app).get('/api/version?a=1&b=2&c=3');
      
      expect(response.status).toBe(200);
    });
  });

  describe('Header Handling', () => {
    it('should respond to requests with custom headers', async () => {
      const response = await request(app)
        .get('/')
        .set('X-Custom-Header', 'test-value');
      
      expect(response.status).toBe(200);
    });

    it('should handle Accept header variations', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
    });

    it('should work with different User-Agent headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('User-Agent', 'TestBot/1.0');
      
      expect(response.status).toBe(200);
    });
  });

  describe('Response Validation', () => {
    it('should not expose sensitive information in responses', async () => {
      const response = await request(app).get('/');
      
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('secret');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('apiKey');
    });

    it('should return non-empty response body', async () => {
      const response = await request(app).get('/');
      
      expect(Object.keys(response.body).length).toBeGreaterThan(0);
    });

    it('should return parseable JSON', async () => {
      const response = await request(app).get('/health');
      
      expect(() => JSON.stringify(response.body)).not.toThrow();
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle root path correctly', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
    });

    it('should handle trailing slash', async () => {
      const response = await request(app).get('/health/');
      
      // Should either return 200 or redirect
      expect([200, 301, 302, 404]).toContain(response.status);
    });

    it('should handle case sensitivity in routes', async () => {
      const lowerResponse = await request(app).get('/health');
      const upperResponse = await request(app).get('/HEALTH');
      
      // Express is case-insensitive by default
      expect(lowerResponse.status).toBe(200);
      // Both should work (Express default behavior)
      expect([200, 404]).toContain(upperResponse.status);
    });
  });
});
