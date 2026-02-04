# Kubernetes Deployment Guide

This guide explains how to deploy the Hello World application to Kubernetes using Argo Rollouts.

## Prerequisites

- Kubernetes cluster 1.20+
- kubectl installed and configured
- Argo Rollouts controller installed
- Helm (optional)

## Installation

### 1. Install Argo Rollouts

```bash
# Add Helm repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Install Argo Rollouts
kubectl create namespace argo-rollouts
helm install argo-rollouts argo/argo-rollouts -n argo-rollouts

# Or using kubectl
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/download/stable/install.yaml
```

### 2. Verify Installation

```bash
# Check Argo Rollouts pods
kubectl get pods -n argo-rollouts

# Install Argo Rollouts CLI
# macOS
brew install argoproj/tap/kubectl-argo-rollouts

# Linux/Windows - download from releases
# https://github.com/argoproj/argo-rollouts/releases
```

## Deployment

### 1. Create Namespace and Services

```bash
kubectl apply -f k8s/namespace-and-services.yaml
```

This creates:
- `hello-world` namespace
- `hello-world` service (production traffic)
- `hello-world-canary` service (canary traffic)
- Network policies

### 2. Update Image References

Edit the rollout YAML files and update the image references:

```bash
# Replace yourusername with your GitHub username
sed -i 's/yourusername/<your-github-username>/g' k8s/rollout-*.yaml
```

### 3. Deploy Staging (Canary Strategy)

```bash
kubectl apply -f k8s/rollout-staging.yaml

# Verify
kubectl get rollout -n hello-world
kubectl get pods -n hello-world

# Watch progress
kubectl argo rollouts get rollout hello-world-staging -n hello-world --watch
```

### 4. Deploy Production (Blue-Green Strategy)

```bash
kubectl apply -f k8s/rollout-production.yaml

# Verify
kubectl get rollout -n hello-world
kubectl get pods -n hello-world

# Watch progress
kubectl argo rollouts get rollout hello-world-production -n hello-world --watch
```

### 5. Apply Analysis Templates (Optional)

For automated canary analysis with Prometheus metrics:

```bash
# Install Prometheus first (if not already installed)
helm install prometheus prometheus-community/kube-prometheus-stack

# Apply analysis templates
kubectl apply -f k8s/analysis-template.yaml
```

## Accessing the Application

### Port Forward

```bash
# Staging
kubectl port-forward -n hello-world svc/hello-world 3000:80

# Production
kubectl port-forward -n hello-world svc/hello-world 3001:80
```

Then access:
- http://localhost:3000
- http://localhost:3000/health
- http://localhost:3000/api/version

### Ingress Setup

If you have an Ingress controller:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-world
  namespace: hello-world
spec:
  rules:
    - host: hello-world.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello-world
                port:
                  number: 80
```

## Canary Deployments (Staging)

### Monitor Progress

```bash
# Get rollout status
kubectl argo rollouts get rollout hello-world-staging -n hello-world

# Continuous watch
kubectl argo rollouts get rollout hello-world-staging -n hello-world --watch

# Get detailed info
kubectl describe rollout hello-world-staging -n hello-world
```

### Promote Canary

```bash
# Promote to next step (after testing at current percentage)
kubectl argo rollouts promote hello-world-staging -n hello-world

# Promote and auto-promote future steps
kubectl argo rollouts promote hello-world-staging -n hello-world --skip-all-analysis
```

### Abort Deployment

```bash
# Stop and rollback canary
kubectl argo rollouts abort hello-world-staging -n hello-world
```

### Restart Rollout

```bash
# Restart deployment
kubectl argo rollouts restart hello-world-staging -n hello-world
```

## Blue-Green Deployments (Production)

### Monitor Progress

```bash
# Get rollout status
kubectl argo rollouts get rollout hello-world-production -n hello-world --watch

# Preview (green) should be running
# Active (blue) is current production
```

### Promote Green to Blue

```bash
# Switch traffic to green version
kubectl argo rollouts promote hello-world-production -n hello-world
```

### Abort Deployment

```bash
# Rollback to previous version (blue)
kubectl argo rollouts abort hello-world-production -n hello-world
```

## Monitoring

### Watch Pod Status

```bash
# All pods in hello-world namespace
kubectl get pods -n hello-world --watch

# Specific rollout
kubectl get pods -n hello-world -l app=hello-world
```

### Check Logs

```bash
# View pod logs
kubectl logs -n hello-world <pod-name>

# Follow logs
kubectl logs -n hello-world <pod-name> -f

# Get logs from all pods
kubectl logs -n hello-world -l app=hello-world --all-containers=true
```

### Health Checks

```bash
# Test health endpoint
kubectl exec -it <pod-name> -n hello-world -- curl localhost:3000/health

# Check readiness
kubectl get pods -n hello-world -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")]}'
```

### Metrics

```bash
# If Prometheus installed
kubectl port-forward -n prometheus svc/prometheus 9090:9090
# Open http://localhost:9090

# Query examples:
# - rate(http_requests_total[5m])
# - histogram_quantile(0.95, http_request_duration_seconds)
```

## Scaling

### Manual Scaling

```bash
# Scale staging
kubectl scale rollout hello-world-staging --replicas=5 -n hello-world

# Scale production
kubectl scale rollout hello-world-production --replicas=10 -n hello-world
```

### HPA (Horizontal Pod Autoscaler)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hello-world-staging
  namespace: hello-world
spec:
  scaleTargetRef:
    apiVersion: argoproj.io/v1alpha1
    kind: Rollout
    name: hello-world-staging
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

Apply HPA:
```bash
kubectl apply -f hpa.yaml
```

## Troubleshooting

### Rollout Stuck at Canary

```bash
# Check analysis results
kubectl get analysisrun -n hello-world

# Check metrics provider
kubectl describe analysistemplate hello-world-success-rate -n hello-world

# Promote manually
kubectl argo rollouts promote hello-world-staging -n hello-world
```

### Pod Fails to Start

```bash
# Check pod events
kubectl describe pod <pod-name> -n hello-world

# Check pod logs
kubectl logs <pod-name> -n hello-world

# Check image availability
kubectl get pod <pod-name> -n hello-world -o jsonpath='{.status.containerStatuses[*]}'
```

### Health Check Failing

```bash
# Test health endpoint directly
kubectl exec -it <pod-name> -n hello-world -- curl localhost:3000/health

# Check probe configuration
kubectl get rollout hello-world-staging -n hello-world -o yaml | grep -A 10 "livenessProbe"
```

### Service not accessible

```bash
# Check service
kubectl get svc -n hello-world

# Check endpoints
kubectl get endpoints -n hello-world

# Test service DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup hello-world.hello-world.svc.cluster.local
```

## Cleanup

### Delete Staging

```bash
kubectl delete rollout hello-world-staging -n hello-world
```

### Delete Production

```bash
kubectl delete rollout hello-world-production -n hello-world
```

### Delete Everything

```bash
kubectl delete namespace hello-world
```

## GitOps with ArgoCD

For automated deployments:

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Create application
kubectl apply -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hello-world
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
    automated:
      prune: true
      selfHeal: true
EOF

# Access ArgoCD UI
kubectl port-forward -n argocd svc/argocd-server 8080:443
```

## References

- [Argo Rollouts Documentation](https://argoproj.github.io/argo-rollouts/)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Helm Documentation](https://helm.sh/docs/)
