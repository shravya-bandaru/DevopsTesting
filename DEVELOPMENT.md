# Local Development Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Git ([Download](https://git-scm.com/))
- Optional: VS Code ([Download](https://code.visualstudio.com/))

## Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourusername/hello-world-app.git
cd hello-world-app

# Install dependencies
npm install
```

### 2. Environment Variables

Create `.env` file (optional):

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

### 3. Run Application

#### Development Mode (with auto-reload)
```bash
npm run dev
```

Application runs on `http://localhost:3000`

#### Production Mode
```bash
npm start
```

### 4. Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Contract tests only
npm run test:contract

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### 5. Linting

```bash
# Check for linting issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Docker Development

### Build Images

```bash
# Development image (Iron)
docker build --target iron -t hello-world:iron .

# Production image (Platinum)
docker build --target platinum -t hello-world:platinum .
```

### Run in Docker

```bash
# Run Iron image
docker run -p 3000:3000 -it hello-world:iron

# Run Platinum image
docker run -p 3000:3000 hello-world:platinum
```

### Docker Compose

If you have a docker-compose file:

```bash
docker-compose up
```

## API Testing

### Using cURL

```bash
# Get hello world message
curl http://localhost:3000

# Check health
curl http://localhost:3000/health

# Get version info
curl http://localhost:3000/api/version
```

### Using Postman/REST Client

Create a file `rest-client.http`:

```http
### Get Hello World
GET http://localhost:3000

### Get Health Status
GET http://localhost:3000/health

### Get Version
GET http://localhost:3000/api/version
```

## VS Code Extensions (Recommended)

- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- [Kubernetes](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools)

## Debugging

### Node.js Debugger

```bash
node --inspect src/index.js
```

Then open Chrome DevTools: `chrome://inspect`

### With nodemon
```bash
nodemon --inspect src/index.js
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
# GitHub Actions will run automatically
```

## Common Issues

### Port 3000 already in use
```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Docker build fails
```bash
# Remove dangling images
docker image prune

# Full clean
docker system prune -a
```

## Performance Optimization

### Check Node Memory Usage
```bash
node --max-old-space-size=512 src/index.js
```

### Profiling
```bash
node --prof src/index.js
node --prof-process isolate-*.log > profile.txt
```

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/)
- [Jest Testing](https://jestjs.io/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
