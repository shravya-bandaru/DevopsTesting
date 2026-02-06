const request = require('supertest');
const { app } = require('../src/index');

describe('Performance Tests', () => {
  describe('Response Time', () => {
    it('should respond to / within 100ms', async () => {
      const start = Date.now();
      await request(app).get('/');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    it('should respond to /health within 50ms', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(50);
    });

    it('should respond to /api/version within 50ms', async () => {
      const start = Date.now();
      await request(app).get('/api/version');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Load Handling', () => {
    it('should handle 10 sequential requests without degradation', async () => {
      const times = [];
      
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await request(app).get('/');
        times.push(Date.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(50);
    });

    it('should handle 20 concurrent requests', async () => {
      const requests = Array(20).fill().map(() => request(app).get('/health'));
      
      const start = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - start;
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      expect(duration).toBeLessThan(500);
    });

    it('should handle burst of 50 requests', async () => {
      const requests = Array(50).fill().map(() => request(app).get('/'));
      
      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;
      
      expect(successCount).toBe(50);
    });
  });

  describe('Memory Stability', () => {
    it('should not leak memory on repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app).get('/');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Allow up to 10MB increase (reasonable for test overhead)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Consistency Under Load', () => {
    it('should return consistent responses under load', async () => {
      const requests = Array(10).fill().map(() => request(app).get('/api/version'));
      const responses = await Promise.all(requests);
      
      const versions = responses.map(r => r.body.version);
      const uniqueVersions = [...new Set(versions)];
      
      expect(uniqueVersions.length).toBe(1);
    });

    it('should maintain health status under load', async () => {
      const requests = Array(10).fill().map(() => request(app).get('/health'));
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy');
      });
    });
  });
});
