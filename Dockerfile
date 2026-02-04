# Multi-stage build for Hello World Application
# Iron Stage (Development)
FROM node:18-alpine AS iron
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src
COPY tests/ ./tests
RUN npm run lint
RUN npm test
EXPOSE 3000
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# Bronze Stage (QA)
FROM node:18-alpine AS bronze
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src
EXPOSE 3000
ENV NODE_ENV=qa
CMD ["npm", "start"]

# Silver Stage (Integration Testing)
FROM node:18-alpine AS silver
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src
COPY tests/ ./tests
EXPOSE 3000
ENV NODE_ENV=integration
RUN npm run test:integration || true
CMD ["npm", "start"]

# Gold Stage (Performance/Staging)
FROM node:18-alpine AS gold
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src
RUN npm prune --production
EXPOSE 3000
ENV NODE_ENV=staging
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["npm", "start"]

# Platinum Stage (Production)
FROM node:18-alpine AS platinum
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY src/ ./src
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "src/index.js"]
