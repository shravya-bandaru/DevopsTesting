# GitOps Configuration for Argo CD

ArgoCD application manifests for managing deployments.

## Staging Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hello-world-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourusername/hello-world-app
    targetRevision: develop
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: hello-world
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
  notifications:
    - name: slack-notification
      when:
        - SyncSucceeded
        - SyncFailed
```

## Production Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hello-world-production
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourusername/hello-world-app
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: hello-world
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
  notifications:
    - name: slack-notification
    - name: pagerduty-notification
```

## Installation

1. Install Argo CD:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

2. Access Argo CD UI:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080
```

3. Get admin password:
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

4. Add Git repository:
```bash
argocd repo add https://github.com/yourusername/hello-world-app \
  --username <github-username> \
  --password <github-token>
```

5. Create applications:
```bash
argocd app create hello-world-staging \
  --repo https://github.com/yourusername/hello-world-app \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace hello-world \
  --revision develop

argocd app create hello-world-production \
  --repo https://github.com/yourusername/hello-world-app \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace hello-world \
  --revision main
```

## Syncing

Auto-sync is enabled for staging, manual for production:

```bash
# Sync staging (automatic)
argocd app sync hello-world-staging

# Sync production (requires manual approval)
argocd app sync hello-world-production

# Watch sync progress
argocd app wait hello-world-production
```
