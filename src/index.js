const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello World! 🚀' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/version', (req, res) => {
  res.json({ version: '1.0.0', environment: process.env.NODE_ENV || 'development' });
});

let server;
if (require.main === module) {
  server = app.listen(port, () => {
    console.log(`Hello World app listening on port ${port}`);
  });
}

module.exports = { app, server };
