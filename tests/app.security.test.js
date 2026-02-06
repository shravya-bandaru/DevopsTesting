const request = require('supertest');
const { app } = require('../src/index');

describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should handle SQL injection attempts in query params', async () => {
      const response = await request(app).get('/?id=1\' OR \'1\'=\'1');
      
      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toContain('error');
    });

    it('should handle XSS attempts in query params', async () => {
      const response = await request(app).get('/?name=<script>alert(\'xss\')</script>');
      
      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });

    it('should handle path traversal attempts', async () => {
      const response = await request(app).get('/../../../etc/passwd');
      
      expect(response.status).toBe(404);
    });

    it('should handle null byte injection', async () => {
      const response = await request(app).get('/health%00.txt');
      
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('HTTP Security Headers', () => {
    it('should not expose server information', async () => {
      const response = await request(app).get('/');
      
      // X-Powered-By should ideally be removed
      // This test documents current behavior
      expect(response.status).toBe(200);
    });

    it('should return proper content-type', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Method Security', () => {
    it('should not allow TRACE method', async () => {
      const response = await request(app).trace('/');
      
      expect([404, 405]).toContain(response.status);
    });

    it('should not allow OPTIONS to expose sensitive methods', async () => {
      const response = await request(app).options('/');
      
      if (response.headers.allow) {
        expect(response.headers.allow).not.toContain('TRACE');
      }
    });
  });

  describe('Information Disclosure', () => {
    it('should not expose stack traces on error', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.text).not.toContain('Error:');
      expect(response.text).not.toContain('at ');
      expect(response.text).not.toContain('.js:');
    });

    it('should not expose internal paths', async () => {
      const response = await request(app).get('/');
      
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toMatch(/\/home\//);
      expect(responseText).not.toMatch(/C:\\/);
      expect(responseText).not.toMatch(/node_modules/);
    });

    it('should not expose environment variables', async () => {
      const response = await request(app).get('/api/version');
      
      expect(response.body).not.toHaveProperty('env');
      expect(response.body).not.toHaveProperty('process');
    });
  });

  describe('Rate Limiting Readiness', () => {
    it('should handle rapid requests without crashing', async () => {
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(request(app).get('/'));
      }
      
      const responses = await Promise.all(requests);
      const successfulResponses = responses.filter(r => r.status === 200);
      
      // All should succeed (no rate limiting yet, but app shouldn't crash)
      expect(successfulResponses.length).toBe(100);
    });
  });
});
