const request = require('supertest');
const { app } = require('../src/index');

describe('Integration Tests', () => {
  describe('End-to-End API Flow', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [
        request(app).get('/'),
        request(app).get('/health'),
        request(app).get('/api/version'),
      ];
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.type).toBe('application/json');
      });
    });

    it('should maintain consistent responses across multiple calls', async () => {
      const firstResponse = await request(app).get('/');
      const secondResponse = await request(app).get('/');
      
      expect(firstResponse.body.message).toBe(secondResponse.body.message);
    });

    it('should return proper content-type headers', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).toBe(404);
    });

    it('should handle invalid HTTP methods gracefully', async () => {
      const response = await request(app).delete('/');
      
      expect(response.status).toBe(404);
    });

    it('should reject POST requests to GET-only endpoints', async () => {
      const response = await request(app).post('/health');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Health Check Integration', () => {
    it('should return valid timestamp format', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body.timestamp).toBeDefined();
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should return current time within acceptable range', async () => {
      const before = new Date();
      const response = await request(app).get('/health');
      const after = new Date();
      
      const responseTime = new Date(response.body.timestamp);
      expect(responseTime >= before).toBe(true);
      expect(responseTime <= after).toBe(true);
    });
  });

  describe('Version Endpoint Integration', () => {
    it('should return valid semver version', async () => {
      const response = await request(app).get('/api/version');
      
      const semverRegex = /^\d+\.\d+\.\d+$/;
      expect(response.body.version).toMatch(semverRegex);
    });

    it('should return valid environment value', async () => {
      const response = await request(app).get('/api/version');
      
      const validEnvironments = ['development', 'staging', 'production', 'test'];
      expect(validEnvironments).toContain(response.body.environment);
    });
  });
});
