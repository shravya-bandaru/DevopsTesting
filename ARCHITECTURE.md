# Pipeline Architecture Diagram

## Complete CI/CD Pipeline Flow

```
                              ┌─────────────────────┐
                              │  Pull Request /     │
                              │  Push to main/dev   │
                              └──────────┬──────────┘
                                         │
                                         ▼
                         ┌───────────────────────────────┐
                         │      BUILD STAGE              │
                         │  Build 5 Docker Images        │
                         │  • Iron (dev)                 │
                         │  • Bronze (qa)                │
                         │  • Silver (int)               │
                         │  • Gold (perf/staging)        │
                         │  • Platinum (production)      │
                         └───────────┬─────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐
         │ DEV TESTING      │  │ QA TESTING       │  │ SECURITY SCAN   │
         │ (Iron Image)     │  │ (Bronze Image)   │  │ (All Stages)    │
         │                  │  │                  │  │                 │
         │ • Unit Tests     │  │ • Automated      │  │ • Trivy Scan    │
         │ • Linting        │  │ • Contract Tests │  │ • Code Quality  │
         │ • Code Quality   │  │                  │  │ • SARIF Report  │
         │                  │  │                  │  │                 │
         │ PR or Develop    │  │ PR or Develop    │  │ Always (if OK)  │
         └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘
                  │                     │                     │
                  └─────────────┬───────┘                     │
                                │                             │
                    ┌───────────▼──────────────┐              │
                    │ INT REGRESSION TESTING   │              │
                    │ (Silver Image)           │              │
                    │                          │              │
                    │ • Regression Tests       │              │
                    │ • Integration Tests      │              │
                    │ • Exploratory/Accept     │              │
                    │                          │              │
                    │ Develop or Main Branch   │              │
                    └───────────┬──────────────┘              │
                                │                             │
                    ┌───────────▼──────────────┐              │
                    │ PERFORMANCE TESTING      │              │
                    │ (Gold Image)             │              │
                    │                          │              │
                    │ • Perf Benchmarks        │              │
                    │ • Health Checks          │              │
                    │ • Load Testing           │              │
                    │                          │              │
                    │ Main Branch Only         │              │
                    └───────────┬──────────────┘              │
                                │                             │
                    ┌───────────▼──────────────┐              │
                    │ DEPLOY TO STAGING        │              │
                    │ (Gold Image)             │              │
                    │                          │              │
                    │ Strategy: Canary         │              │
                    │ • 25% replicas           │              │
                    │ • pause 5m               │              │
                    │ • 50% replicas           │              │
                    │ • pause 5m               │              │
                    │ • 75% replicas           │              │
                    │ • pause 5m               │              │
                    │ • 100% replicas          │              │
                    │                          │              │
                    │ • Sanity Tests           │              │
                    │ Main Branch (Push)       │              │
                    └───────────┬──────────────┘              │
                                │                             │
                    ┌───────────▼────────────────────┐        │
                    │ DEPLOY TO PRODUCTION           │        │
                    │ (Platinum Image)               │        │
                    │                                │        │
                    │ Strategy: Blue-Green           │        │
                    │ • Deploy green version         │        │
                    │ • Run tests                    │        │
                    │ • Manual approval required ✓   │        │
                    │ • Switch traffic               │        │
                    │ • Keep blue for rollback       │        │
                    │ • Auto-promote after 5m        │        │
                    │                                │        │
                    │ • Create release tags          │        │
                    │ • Send notifications           │        │
                    │ Main Branch (Push + Approval)  │        │
                    └────────────┬───────────────────┘        │
                                 │                            │
                                 │       ◄─────────────────────┘
                                 │
                        ┌────────▼─────────┐
                        │   MONITORING      │
                        │ & NOTIFICATIONS   │
                        │                   │
                        │ • Health Checks   │
                        │ • Slack/PagerDuty │
                        │ • Release Notes   │
                        │ • Artifacts       │
                        └───────────────────┘
```

## Environment & Docker Image Mapping

```
Development Cycle:
┌─────────────┬─────────────┬──────────────┬─────────────┬──────────────┐
│   IRON      │   BRONZE    │    SILVER    │    GOLD     │  PLATINUM    │
├─────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ Development │     QA      │ Integration  │  Staging    │ Production   │
├─────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ All Deps    │ Prod Deps   │  All Deps    │  Prod Deps  │  Prod Deps   │
│ Test Tools  │             │  Pruned      │  Pruned     │  Pruned      │
├─────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│ Dev Mode    │ Start       │  Start       │  Start      │  Start       │
│ Nodemon     │             │              │             │              │
├─────────────┼─────────────┼──────────────┼─────────────┼──────────────┤
│   NODE_ENV  │  NODE_ENV   │  NODE_ENV    │  NODE_ENV   │  NODE_ENV    │
│     =dev    │    =qa      │    =int      │  =staging   │   =prod      │
└─────────────┴─────────────┴──────────────┴─────────────┴──────────────┘
```

## Testing Progression

```
Unit Tests         Contract Tests      Integration Tests   Performance Tests
(Iron)             (Bronze)            (Silver)            (Gold)
   │                   │                    │                    │
   ├─ Endpoints        ├─ Response          ├─ E2E flows        ├─ Benchmarks
   ├─ Handlers         │  contracts         ├─ External APIs    ├─ Load tests
   ├─ Utils            ├─ Status codes      ├─ Dependencies     ├─ Health checks
   └─ Errors           ├─ Content types     └─ Databases        └─ Timeouts
                       └─ Properties


      ▼                   ▼                  ▼                    ▼
   Regression         Exploratory/          Canary Analysis    Manual Approval
   Testing            Acceptance            (Metrics)          Required
   (Silver)           (Silver)              (Gold)             (Platinum)
```

## Kubernetes Deployment Strategy

### Staging (Canary Deployment)

```
Version 1.0 (Blue)  ──────────────┬──────────────  100% traffic
                                   │
                                   ├─ Deploy 1.1 (Green)
                                   │
Version 1.1 (Green) ──────────────┬──────────────  0% traffic
                                   │
                    Pause 5m, Test │
                                   │
                    ├─ Promote to 25%
                    │
Version 1.1 @ 25%   ─────┬─────────┼──────────────  25% traffic
                         │         │
                    Pause 5m, Test │
                         │         │
                    ├─ Promote to 50%
                    │
Version 1.1 @ 50%   ────┬┬────────┼──────────────  50% traffic
                       ││        │
                    Pause 5m, Test│
                       ││        │
                    ├─ Promote to 75%
                    │
Version 1.1 @ 75%   ──┬┬┬───────┼──────────────  75% traffic
                     │││        │
                    Pause 5m, Test
                     │││        │
                    ├─ Promote to 100%
                    │
Version 1.1 (Prod)  ┬┬┬┬──────────────────────  100% traffic
```

### Production (Blue-Green Deployment)

```
BLUE (Current v1.0)              GREEN (New v1.1)
┌──────────────────────┐         ┌──────────────────────┐
│  5 replicas          │         │  5 replicas          │
│  100% traffic        │         │  0% traffic (preview)│
│  Production serving  │         │  Tests running       │
└──────────────────────┘         └──────────────────────┘
          │                               │
          │                               │
    ┌─────┴───────────────────────────────┘
    │
    ├─ All tests pass ✓
    │
    ├─ Manual Approval Required ✓
    │
    ├─ Switch LB → GREEN
    │
    │         BLUE (v1.0)              GREEN (v1.1)
    │    ┌──────────────────────┐   ┌──────────────────────┐
    │    │  5 replicas          │   │  5 replicas          │
    │    │  0% traffic          │   │  100% traffic        │
    │    │  Kept for rollback   │   │  Production serving  │
    │    └──────────────────────┘   └──────────────────────┘
    │
    ├─ Monitor metrics
    │
    └─ Keep old version 24 hours then delete
```

## Trigger Conditions Matrix

```
                 │ Unit/  │ QA/    │ INT/   │ PERF/  │ Staging│ Production
                 │ Lint   │ Automn │ Regres │ Health │ Deploy │ Deploy
─────────────────┼────────┼────────┼────────┼────────┼────────┼──────────
PR → develop     │   ✓    │   ✓    │   ✗    │   ✗    │   ✗    │    ✗
PR → main        │   ✓    │   ✓    │   ✗    │   ✗    │   ✗    │    ✗
Push develop     │   ✓    │   ✓    │   ✓    │   ✗    │   ✗    │    ✗
Push main        │   ✓    │   ✓    │   ✓    │   ✓    │   ✓    │    ✓
Manual trigger   │   ✓    │   ✓    │   ✓    │   ✓    │   ✓    │    ✓
─────────────────┴────────┴────────┴────────┴────────┴────────┴──────────
```

## Security Scanning Flow

```
Build Phase
    │
    ├─ Trivy Container Scan
    │  ├─ Vulnerabilities
    │  ├─ Configuration issues
    │  └─ SARIF report
    │
    ├─ ESLint Code Scan
    │  ├─ Code quality
    │  ├─ Security rules
    │  └─ Best practices
    │
    ├─ Dependency Check
    │  └─ npm audit
    │
    └─ Upload to GitHub Security Tab
       ├─ Alerts created
       ├─ PR comments
       └─ Blocking on severity
```

---

This diagram represents the complete pipeline architecture as implemented in the GitHub Actions workflow.
