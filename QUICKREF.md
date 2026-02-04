# Quick Reference Guide

## 🚀 Start Here

### Local Development (5 minutes)

```bash
# Install and run
npm install
npm run dev

# Open browser
http://localhost:3000
```

### Build Docker Images (2 minutes each)

```bash
# Pick one to start
docker build --target platinum -t hello-world:platinum .
docker run -p 3000:3000 hello-world:platinum
```

### Run Tests (1 minute)

```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:contract      # Contract tests only
npm run lint               # Lint check
```

---

## 📚 Documentation Quick Links

| Need | Document | Key Info |
|------|----------|----------|
| Getting started | [SETUP.md](SETUP.md) | Project overview & checklist |
| Local coding | [DEVELOPMENT.md](DEVELOPMENT.md) | npm scripts, debugging, etc |
| CI/CD pipeline | [PIPELINE.md](PIPELINE.md) | Jobs, triggers, secrets |
| Kubernetes | [K8S_DEPLOYMENT.md](K8S_DEPLOYMENT.md) | kubectl commands, rollouts |
| ArgoCD GitOps | [ARGOCD_SETUP.md](ARGOCD_SETUP.md) | GitOps automation |
| Pipeline diagram | [ARCHITECTURE.md](ARCHITECTURE.md) | Visual pipeline flow |

---

## 🐳 Docker Commands

```bash
# Build specific stage
docker build --target iron -t hello-world:iron .
docker build --target bronze -t hello-world:bronze .
docker build --target silver -t hello-world:silver .
docker build --target gold -t hello-world:gold .
docker build --target platinum -t hello-world:platinum .

# Run container
docker run -p 3000:3000 hello-world:platinum

# Check logs
docker logs <container_id>

# Interactive shell
docker run -it --entrypoint /bin/sh hello-world:iron
```

---

## ☸️ Kubernetes Commands

```bash
# Deploy
kubectl apply -f k8s/namespace-and-services.yaml
kubectl apply -f k8s/rollout-staging.yaml
kubectl apply -f k8s/rollout-production.yaml

# Monitor
kubectl get pods -n hello-world
kubectl logs <pod> -n hello-world
kubectl describe pod <pod> -n hello-world

# Argo Rollouts
kubectl argo rollouts get rollout hello-world-staging -n hello-world
kubectl argo rollouts promote hello-world-staging -n hello-world
kubectl argo rollouts abort hello-world-staging -n hello-world

# Port forward
kubectl port-forward -n hello-world svc/hello-world 3000:80
```

---

## 🔍 API Endpoints

```bash
# Hello World
curl http://localhost:3000

# Health Check
curl http://localhost:3000/health

# Version Info
curl http://localhost:3000/api/version

# All at once
curl http://localhost:3000
curl http://localhost:3000/health
curl http://localhost:3000/api/version
```

---

## 📝 npm Scripts

```bash
npm start              # Run production
npm run dev            # Run with auto-reload (development)
npm test               # Run all tests
npm run test:unit      # Unit tests only
npm run test:contract  # Contract tests only
npm run test:integration # Integration tests
npm run lint           # Check code style
npm run lint:fix       # Auto-fix style issues
```

---

## 🚦 Pipeline Status

### Check GitHub Actions

1. Go to: **Repository → Actions**
2. Click on latest workflow run
3. View job logs and artifacts

### Check Kubernetes

```bash
# Staging status
kubectl argo rollouts get rollout hello-world-staging -n hello-world

# Production status
kubectl argo rollouts get rollout hello-world-production -n hello-world

# Watch in real-time
kubectl argo rollouts get rollout hello-world-staging -n hello-world --watch
```

---

## 🔐 Security

### Scan Locally

```bash
# Vulnerability scan (requires Trivy)
trivy image hello-world:platinum

# Lint check
npm run lint

# Dependency audit
npm audit
npm audit fix
```

### Check GitHub

1. **Security Tab**: Repository → Security
2. **Dependabot**: Settings → Code security → Dependabot
3. **Code Scanning**: Settings → Code security & analysis

---

## 🐛 Troubleshooting

### Application won't start

```bash
# Check logs
npm run dev 2>&1 | head -20

# Check port
lsof -i :3000
```

### Tests failing

```bash
# Install fresh
rm -rf node_modules package-lock.json
npm install

# Run with verbose output
npm test -- --verbose
```

### Docker build fails

```bash
# Clean build (no cache)
docker build --no-cache --target platinum -t hello-world:platinum .

# Check Dockerfile syntax
docker build --dry-run .
```

### Kubernetes pod won't start

```bash
# Check events
kubectl describe pod <pod-name> -n hello-world

# Check logs
kubectl logs <pod-name> -n hello-world

# Check image
kubectl get pod <pod-name> -n hello-world -o jsonpath='{.spec.containers[0].image}'
```

### Rollout stuck

```bash
# Check status
kubectl argo rollouts get rollout hello-world-staging -n hello-world

# Check analysis
kubectl get analysisrun -n hello-world

# Manually promote
kubectl argo rollouts promote hello-world-staging -n hello-world

# Abort if needed
kubectl argo rollouts abort hello-world-staging -n hello-world
```

---

## 📊 Development Workflow

### Creating a feature

```bash
# Create branch
git checkout -b feature/my-feature

# Make changes
# Edit files...

# Test
npm test

# Commit
git add .
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Create Pull Request on GitHub
# → GitHub Actions runs automatically
```

### Merging to main

```bash
# When PR approved and tests pass:
# 1. Click "Merge Pull Request" on GitHub
# 2. Pipeline runs full tests
# 3. Deploys to staging (canary)
# 4. Waits for production approval
# 5. Deploy to production (blue-green)
```

---

## 🎯 Environment Variables

### Development

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

### Production (in Kubernetes)

```yaml
NODE_ENV: "production"
PORT: "3000"
LOG_LEVEL: "warn"
```

---

## 📦 Key Files

| File | Purpose |
|------|---------|
| `src/index.js` | Main application |
| `Dockerfile` | Container definition |
| `.github/workflows/ci-cd-pipeline.yml` | CI/CD jobs |
| `k8s/rollout-*.yaml` | Kubernetes manifests |
| `package.json` | Dependencies & scripts |
| `jest.config.js` | Test configuration |

---

## 🔗 External Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Docker Docs](https://docs.docker.com/)
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [GitHub Actions](https://github.com/features/actions)
- [Argo Rollouts](https://argoproj.github.io/argo-rollouts/)

---

## ✅ Common Tasks

### Release to production

```bash
# 1. Merge PR to main
git checkout main
git merge feature/my-feature
git push

# 2. GitHub Actions runs pipeline
# → builds → tests → staging (canary) → production (requires approval)

# 3. Go to GitHub → Actions → Deployments
# → Click "Review deployments"
# → Click "Approve and deploy"
```

### Scale application

```bash
# Kubernetes manual scale
kubectl scale rollout hello-world-production --replicas=10 -n hello-world

# Or setup HPA (auto-scale)
kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hello-world
  namespace: hello-world
spec:
  scaleTargetRef:
    apiVersion: argoproj.io/v1alpha1
    kind: Rollout
    name: hello-world-production
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
EOF
```

### Rollback production

```bash
# Check current version
kubectl argo rollouts get rollout hello-world-production -n hello-world

# Abort current rollout (goes back to previous)
kubectl argo rollouts abort hello-world-production -n hello-world

# Or manually promote blue (previous)
kubectl argo rollouts promote hello-world-production -n hello-world
```

---

## 💡 Tips & Tricks

### Test API locally

```bash
# Using curl
curl -s http://localhost:3000 | jq

# Using httpie (if installed)
http http://localhost:3000

# Using node
node -e "require('http').get('http://localhost:3000', r => r.pipe(process.stdout))"
```

### Watch logs live

```bash
# Kubernetes
kubectl logs -f <pod-name> -n hello-world

# Docker
docker logs -f <container-id>

# Application
npm run dev
```

### Development shortcuts

```bash
# Quick restart app
npm run dev
# Press Ctrl+C and npm run dev again

# Skip tests while developing
npm run dev

# Run only one test file
npm test -- app.unit.test.js

# Run tests in watch mode
npm test -- --watch
```

---

## 🆘 When Stuck

1. **Check the logs**
   ```bash
   npm run dev 2>&1 | head -50
   ```

2. **Review documentation**
   - Start with [SETUP.md](SETUP.md)
   - Then [DEVELOPMENT.md](DEVELOPMENT.md)

3. **Search similar issues**
   - GitHub Issues
   - Stack Overflow
   - Docker/Kubernetes docs

4. **Try clean slate**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm test
   ```

---

**For more details, see the full documentation in this repository.**
