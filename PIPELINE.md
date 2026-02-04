# CI/CD Pipeline Configuration Guide

This document explains the GitHub Actions CI/CD pipeline setup.

## Overview

The pipeline implements a multi-environment deployment strategy with progressive testing and validation.

```
PR/Push → Build → Dev Testing → QA Testing → INT Testing → PERF Testing → Staging → Production
```

## Trigger Conditions

| Trigger | Branches | Event |
|---------|----------|-------|
| Build | main, develop | PR, Push, Manual |
| Dev Testing | develop | PR, Push |
| QA Testing | develop | PR, Push |
| INT Testing | main, develop | Push |
| PERF Testing | main | Push |
| Staging Deploy | main | Push |
| Production Deploy | main | Push |
| Security Scan | Any | Always (if build succeeds) |
| Document Changes | main | Push |

## Job Dependencies

```
build
├── dev-testing
├── qa-testing
│   └── int-regression-testing
│       └── performance-testing
│           └── deploy-staging
│               └── deploy-production
└── security-scan (parallel)
    └── document-changes (parallel)
```

## Secrets Required

Add these secrets to your GitHub repository (Settings → Secrets):

```
GITHUB_TOKEN          # Auto-provided by GitHub Actions
DOCKER_REGISTRY_USER  # GitHub username or bot account
DOCKER_REGISTRY_PASS  # GitHub token with write:packages scope
KUBECONFIG            # Base64-encoded kubeconfig for Kubernetes
ARGOCD_TOKEN          # ArgoCD API token
SLACK_WEBHOOK_URL     # Optional: Slack notifications
```

## Environment Variables

Update in `.github/workflows/ci-cd-pipeline.yml`:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
  IMAGE_TAG: ${{ github.sha }}
```

## Docker Image Tagging Strategy

### Development/Testing

- **Iron**: `ghcr.io/owner/repo:iron-{sha}`
- **Bronze**: `ghcr.io/owner/repo:bronze-{sha}`

### Integration/Staging

- **Silver**: `ghcr.io/owner/repo:silver-{sha}`
- **Gold**: `ghcr.io/owner/repo:gold-{sha}` + `gold-latest`

### Production

- **Platinum**: `ghcr.io/owner/repo:platinum-{sha}` + `platinum-latest` + `latest`

## Pipeline Permissions

The workflow requires these GitHub permissions:

```yaml
permissions:
  contents: read           # Read repository contents
  packages: write          # Push to GitHub Container Registry
  security-events: write   # Upload security reports
  pull-requests: read      # Read PR information
```

## Stage Details

### Build Stage

**Jobs:** 1 job (build)

Builds all 5 Docker images using multi-stage Dockerfile.

```yaml
- Iron:    Unit tests, linting → DEV environment
- Bronze:  Production deps → QA environment
- Silver:  Integration tests → INT environment
- Gold:    Health checks → STAGING environment
- Platinum: Security hardened → PRODUCTION environment
```

**Push Strategy:**
- develop branch → Iron, Bronze
- develop/main branches → Silver
- main branch → Gold, Platinum

### Dev Testing (Iron)

**Conditions:** PR or develop branch

Runs on Node.js environment:
1. Unit tests (Jest)
2. ESLint linting
3. Code quality analysis

**Failure Actions:** Blocks PR merge

### QA Testing (Bronze)

**Conditions:** PR or develop branch

1. Automated tests
2. Contract tests

**Failure Actions:** Blocks PR merge

### INT Regression Testing (Silver)

**Conditions:** develop or main branch

Runs after QA testing passes:
1. Regression tests
2. Integration tests
3. Exploratory/Acceptance tests

**Failure Actions:** Blocks promotion to production

### Performance Testing (Gold)

**Conditions:** main branch only

Runs after INT testing passes:
1. Performance benchmarks
2. Health check validation
3. Endpoint verification

**Failure Actions:** Blocks staging deployment

### Deploy to Staging

**Conditions:** main branch, push event

After all tests pass:
1. Deploys Gold image to staging
2. Uses canary deployment (25% → 50% → 75% → 100%)
3. Runs sanity tests
4. Waits for 5 minutes between stages

**Duration:** ~15 minutes (with pauses)

### Deploy to Production

**Conditions:** main branch, push event

After staging passes:
1. Requires manual approval (GitHub Environments)
2. Deploys Platinum image
3. Uses blue-green deployment
4. Creates release tag
5. Sends notifications

**Approval:** GitHub Environments page

### Security Scan

**Conditions:** Always (if build succeeds)

1. Trivy vulnerability scanning
2. Container image scanning
3. Filesystem scanning
4. SARIF report generation
5. Upload to GitHub Security tab

**Failure Actions:** Creates GitHub security alerts

### Document Changes

**Conditions:** main branch, push event

After build succeeds:
1. Generates changelog
2. Creates release notes
3. Uploads artifacts

## Manual Workflow Trigger

```bash
gh workflow run ci-cd-pipeline.yml
```

Or via GitHub UI: Actions → CI/CD Pipeline → Run workflow

## Monitoring

### GitHub Actions Dashboard

Navigate to: Repository → Actions → CI/CD Pipeline

View:
- Workflow runs
- Job logs
- Artifact downloads
- Deployment status

### Real-time Logs

```bash
# Watch workflow
gh run watch <run-id>

# Get logs
gh run view <run-id> --log
```

## Troubleshooting

### Workflow not triggering

1. Check branch protection rules
2. Verify trigger conditions in yml
3. Ensure GITHUB_TOKEN has correct permissions
4. Check if workflow is disabled

### Build failing

```bash
# View build logs
gh run view <run-id> --log

# Re-run job
gh run rerun <run-id>
```

### Docker build timeout

1. Increase GitHub Actions timeout (job-level)
2. Optimize Dockerfile (reduce layers)
3. Use caching for dependencies

### Kubernetes deployment issues

1. Verify kubeconfig secret
2. Check cluster connectivity
3. Verify namespace exists
4. Check ArgoCD sync status

## Performance Tips

### Cache Dependencies

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Caches node_modules
```

### Parallel Jobs

Jobs run in parallel when possible to reduce overall workflow time.

### Docker Layer Caching

```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha  # Use GitHub Actions cache
    cache-to: type=gha,mode=max
```

## Cost Optimization

- Use self-hosted runners for heavy workloads
- Set job timeouts to prevent hanging
- Clean up artifacts regularly
- Use matrix builds for multiple configurations

## Security Best Practices

1. **Use environment secrets** for sensitive data
2. **Limit job permissions** to minimum required
3. **Review workflow logs** for exposed secrets
4. **Rotate GitHub tokens** regularly
5. **Use branch protection** rules
6. **Sign releases** with GPG keys
7. **Scan containers** before production

## Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Argo Rollouts](https://argoproj.github.io/argo-rollouts/)
