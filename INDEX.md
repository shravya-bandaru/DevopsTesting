# 📚 Project Documentation Index

Welcome to the Hello World Application with Advanced CI/CD Pipeline project!

## 🎯 Start Here

1. **New to this project?** → Start with [QUICKREF.md](QUICKREF.md) (5 min read)
2. **Want to set up locally?** → See [DEVELOPMENT.md](DEVELOPMENT.md)
3. **Need complete overview?** → Read [SETUP.md](SETUP.md)

---

## 📖 Documentation Guide

### Quick References
- **[QUICKREF.md](QUICKREF.md)** - Essential commands & troubleshooting
  - Docker commands
  - Kubernetes commands
  - npm scripts
  - Common tasks

### Getting Started
- **[SETUP.md](SETUP.md)** - Project initialization & checklist
  - What's been created
  - Architecture overview
  - Next steps
  - File structure

### Development
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Local development guide
  - Installation & setup
  - Running the application
  - Testing locally
  - Debugging tips
  - VS Code extensions

### CI/CD Pipeline
- **[PIPELINE.md](PIPELINE.md)** - CI/CD configuration details
  - Pipeline overview
  - Trigger conditions
  - Job dependencies
  - Required secrets
  - Troubleshooting

### Kubernetes & Deployment
- **[K8S_DEPLOYMENT.md](K8S_DEPLOYMENT.md)** - Kubernetes deployment guide
  - Installation steps
  - Deployment procedures
  - Canary deployments
  - Blue-green deployments
  - Scaling & monitoring
  - Troubleshooting

### ArgoCD & GitOps
- **[ARGOCD_SETUP.md](ARGOCD_SETUP.md)** - GitOps with ArgoCD
  - ArgoCD installation
  - Application setup
  - Syncing strategies
  - Integration with pipeline

### Architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Pipeline diagrams & visual explanations
  - Complete pipeline flow
  - Environment mapping
  - Testing progression
  - Deployment strategies
  - Security scanning flow

---

## 📁 Project Files Overview

### Source Code
```
src/
├── index.js              # Express.js REST API application
```

**Key endpoints:**
- `GET /` - Returns hello world message
- `GET /health` - Health check endpoint
- `GET /api/version` - Version and environment info

### Testing
```
tests/
├── app.unit.test.js      # Unit tests (Jest + Supertest)
└── app.contract.test.js  # Contract tests (API validation)
```

### Docker
```
Dockerfile                # Multi-stage build (Iron → Platinum)
.dockerignore             # Docker ignore patterns
docker-compose.yml        # Docker compose configuration
docker/                   # Additional Docker files (if needed)
```

**Stages:**
1. **Iron** - Development (unit tests, linting)
2. **Bronze** - QA (automated tests)
3. **Silver** - Integration (integration tests)
4. **Gold** - Staging (performance tests)
5. **Platinum** - Production (security hardened)

### CI/CD Pipeline
```
.github/workflows/
├── ci-cd-pipeline.yml           # Main CI/CD workflow (9 jobs)
└── update-dependencies.yml      # Weekly dependency updates
```

**Main Jobs:**
1. Build - Build 5 Docker images
2. Dev Testing - Unit tests + Linting
3. QA Testing - Automated + Contract tests
4. INT Testing - Regression + Integration
5. PERF Testing - Performance tests
6. Deploy Staging - Canary deployment
7. Deploy Production - Blue-green deployment
8. Security Scan - Trivy vulnerability scanning
9. Document Changes - Changelog generation

### Kubernetes
```
k8s/
├── namespace-and-services.yaml  # Namespace, services, network policies
├── rollout-staging.yaml         # Argo Rollout for staging (canary)
├── rollout-production.yaml      # Argo Rollout for production (blue-green)
└── analysis-template.yaml       # Argo analysis templates
```

### Configuration
```
package.json              # Node.js dependencies & scripts
jest.config.js           # Jest testing configuration
.eslintrc.json           # ESLint linting rules
.gitignore               # Git ignore patterns
```

---

## 🚀 Quick Start Commands

### Local Development
```bash
npm install              # Install dependencies
npm run dev             # Run with auto-reload
npm test                # Run all tests
npm run lint            # Check code style
```

### Docker
```bash
docker build --target platinum -t hello-world:platinum .
docker run -p 3000:3000 hello-world:platinum
```

### Kubernetes
```bash
kubectl apply -f k8s/namespace-and-services.yaml
kubectl apply -f k8s/rollout-staging.yaml
kubectl apply -f k8s/rollout-production.yaml
kubectl argo rollouts get rollout hello-world-staging -n hello-world --watch
```

---

## 🎯 Key Concepts

### Multi-Stage Docker Builds
Each stage targets a different environment with progressively refined configurations:
- **Iron**: Full development tools → **Bronze**: Slim QA → **Silver**: Integration testing → **Gold**: Staging → **Platinum**: Production

### Deployment Strategies
- **Staging**: Canary deployment (25% → 50% → 75% → 100%)
- **Production**: Blue-green deployment (old ↔ new with manual approval)

### CI/CD Pipeline
- **Build phase**: Creates all Docker images
- **Test phases**: Progressive testing (unit → contract → integration → performance)
- **Deployment**: Automated staging, approved production
- **Security**: Continuous scanning and monitoring

### GitHub Actions
- Runs on PR and push to main/develop
- Progressive testing gates
- Automatic builds and deployments
- Scheduled dependency updates

### Kubernetes & Argo Rollouts
- Advanced deployment strategies
- Automated canary analysis
- Health monitoring
- Automatic rollback on failure

---

## 📊 Pipeline Stages by Branch

### Pull Request (to develop or main)
✅ Build  
✅ Dev Testing  
✅ QA Testing  
✗ INT Testing  
✗ PERF Testing  
✗ Deployments  

### Push to develop
✅ Build  
✅ Dev Testing  
✅ QA Testing  
✅ INT Testing  
✗ PERF Testing  
✗ Deployments  

### Push to main
✅ Build  
✅ Dev Testing  
✅ QA Testing  
✅ INT Testing  
✅ PERF Testing  
✅ Deploy Staging (canary)  
✅ Deploy Production (requires approval)  

---

## 🔐 Security Features

- ✅ Non-root container user in production
- ✅ Health checks (liveness + readiness)
- ✅ Network policies
- ✅ Resource limits
- ✅ Trivy vulnerability scanning
- ✅ ESLint code quality
- ✅ Pod Disruption Budgets
- ✅ SARIF security reports

---

## 🆘 Common Issues & Solutions

### "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
```

### "npm install fails"
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Tests fail locally"
```bash
npm install
npm test -- --verbose
```

### "Kubernetes pod won't start"
```bash
kubectl describe pod <pod-name> -n hello-world
kubectl logs <pod-name> -n hello-world
```

### "Rollout stuck"
```bash
kubectl argo rollouts promote hello-world-staging -n hello-world
```

**For more troubleshooting:** See [QUICKREF.md](QUICKREF.md#-troubleshooting)

---

## 📋 Setup Checklist

- [ ] Read [QUICKREF.md](QUICKREF.md)
- [ ] Review [SETUP.md](SETUP.md)
- [ ] Install Node.js & Docker
- [ ] Run `npm install`
- [ ] Test locally: `npm run dev`
- [ ] Build Docker image
- [ ] Push to container registry
- [ ] Install Argo Rollouts on K8s
- [ ] Deploy to Kubernetes
- [ ] Setup GitHub Actions secrets
- [ ] Create first pull request
- [ ] Monitor pipeline execution

---

## 🔗 External Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/)
- [GitHub Actions](https://github.com/features/actions)
- [Argo Rollouts](https://argoproj.github.io/argo-rollouts/)

### Tools & Frameworks
- [Express.js](https://expressjs.com/) - Web framework
- [Jest](https://jestjs.io/) - Testing framework
- [ESLint](https://eslint.org/) - Code linting
- [Trivy](https://github.com/aquasecurity/trivy) - Vulnerability scanner

### Learning Resources
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [GitHub Actions Best Practices](https://github.com/features/actions)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📞 Support

For questions or issues:
1. Check the relevant documentation above
2. Review [QUICKREF.md](QUICKREF.md#-troubleshooting)
3. Check GitHub Issues
4. Consult external documentation links

---

## 📝 Documentation Structure

```
ROOT (You are here)
│
├── QUICKREF.md              ← Essential commands (start if in a hurry!)
├── SETUP.md                 ← Project overview & setup
├── DEVELOPMENT.md           ← Local development guide
├── PIPELINE.md              ← CI/CD details
├── K8S_DEPLOYMENT.md        ← Kubernetes guide
├── ARGOCD_SETUP.md          ← GitOps setup
├── ARCHITECTURE.md          ← Pipeline diagrams
│
├── Source Code
│   ├── src/index.js
│   └── tests/
│       ├── app.unit.test.js
│       └── app.contract.test.js
│
├── Docker
│   ├── Dockerfile
│   ├── .dockerignore
│   └── docker-compose.yml
│
├── CI/CD
│   └── .github/workflows/
│       ├── ci-cd-pipeline.yml
│       └── update-dependencies.yml
│
├── Kubernetes
│   └── k8s/
│       ├── namespace-and-services.yaml
│       ├── rollout-staging.yaml
│       ├── rollout-production.yaml
│       └── analysis-template.yaml
│
└── Configuration
    ├── package.json
    ├── jest.config.js
    └── .eslintrc.json
```

---

## 🎓 Learning Path

1. **Day 1: Understanding the Project**
   - Read [QUICKREF.md](QUICKREF.md) (5 min)
   - Read [SETUP.md](SETUP.md) (15 min)
   - Review [ARCHITECTURE.md](ARCHITECTURE.md) (10 min)

2. **Day 1-2: Local Development**
   - Follow [DEVELOPMENT.md](DEVELOPMENT.md)
   - Run application locally
   - Run tests
   - Build Docker images

3. **Day 2-3: CI/CD Pipeline**
   - Study [PIPELINE.md](PIPELINE.md)
   - Understand GitHub Actions workflow
   - Create test pull request
   - Monitor pipeline execution

4. **Day 3-4: Kubernetes**
   - Review [K8S_DEPLOYMENT.md](K8S_DEPLOYMENT.md)
   - Install Argo Rollouts
   - Deploy to test cluster
   - Test canary and blue-green deployments

5. **Day 4-5: Production Ready**
   - Setup [ARGOCD_SETUP.md](ARGOCD_SETUP.md)
   - Configure GitOps
   - Setup monitoring & alerts
   - Create runbooks

---

**Happy DevOps-ing! 🚀**

For the quickest start, go to [QUICKREF.md](QUICKREF.md).
