# IRaven Admin Dashboard - Deployment Guide

## Overview

This guide covers the complete deployment setup for the IRaven Admin Dashboard using:
- **Docker** for containerization
- **Harbor** as the container registry
- **Kubernetes** (K3s HA01 cluster) for orchestration
- **Helm** for package management
- **Argo Workflows** for CI/CD pipelines
- **Argo Events** for webhook-based deployments
- **ArgoCD** for GitOps continuous deployment
- **GitHub Actions** for triggering deployments on tag releases

## Architecture

```
GitHub (Tag Push)
    ↓
GitHub Actions
    ↓
Argo Events (Webhook)
    ↓
Argo Workflows (Build & Deploy)
    ↓
Harbor Registry
    ↓
ArgoCD (GitOps Sync)
    ↓
Kubernetes Cluster
    ↓
admin.iraven.io (Live)
```

## Prerequisites

1. **Kubernetes Cluster**: K3s HA01 cluster with:
   - Argo Workflows installed
   - Argo Events installed
   - ArgoCD installed
   - Nginx Ingress Controller
   - Cert-Manager with Let's Encrypt

2. **Harbor Registry**: `harbor.kousha.dev`
   - Project: `application-images`
   - Access credentials configured

3. **GitHub Repository**: `github.com/koushamad/iraven-admin`
   - SSH deploy key configured
   - Write access to repository

4. **DNS Configuration**:
   - `admin.iraven.io` → K3s cluster ingress

## Directory Structure

```
iraven-admin/
├── Dockerfile                              # Multi-stage Docker build
├── .dockerignore                           # Docker ignore patterns
├── .github/
│   └── workflows/
│       └── iraven-admin-cicd.yaml         # GitHub Actions workflow
├── .deployment/
│   ├── iraven-admin/                      # Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml                    # Default values
│   │   ├── k3s-ha01-values.yaml          # Production overrides
│   │   ├── version-values.yaml            # Auto-updated by workflow
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       ├── serviceaccount.yaml
│   │       ├── hpa.yaml
│   │       └── _helpers.tpl
│   ├── events/                            # Argo Events
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │       ├── github-webhook-source.yaml
│   │       ├── github-webhook-ingress.yaml
│   │       └── iraven-admin-sensor.yaml
│   └── workflows/                         # Argo Workflows
│       ├── build-and-deploy-template.yaml
│       ├── clone-template.yaml
│       ├── build-template.yaml
│       ├── push-template.yaml
│       ├── git-template.yaml
│       ├── deployment-template.yaml
│       ├── workflow-sa.yaml
│       └── workflow-rbac.yaml
```

## Deployment Steps

### 1. Setup Kubernetes Secrets

```bash
# Harbor registry credentials
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.kousha.dev \
  --docker-username=admin \
  --docker-password=YOUR_HARBOR_PASSWORD \
  --namespace=argo

# GitHub SSH key for repository access
kubectl create secret generic github-ssh-key \
  --from-file=id_rsa=~/.ssh/id_rsa \
  --namespace=argo
```

### 2. Deploy Argo Workflows Templates

```bash
cd .deployment/workflows

# Apply RBAC and ServiceAccount
kubectl apply -f workflow-sa.yaml
kubectl apply -f workflow-rbac.yaml

# Apply workflow templates
kubectl apply -f clone-template.yaml
kubectl apply -f build-template.yaml
kubectl apply -f push-template.yaml
kubectl apply -f git-template.yaml
kubectl apply -f deployment-template.yaml
kubectl apply -f build-and-deploy-template.yaml
```

### 3. Deploy Argo Events

```bash
cd .deployment/events

# Install using Helm
helm upgrade --install iraven-admin-events . \
  --namespace argo-events \
  --values k3s-ha01-values.yaml \
  --create-namespace
```

Verify the webhook endpoint:
```bash
kubectl get eventsource -n argo-events
kubectl get sensor -n argo-events
```

### 4. Create ArgoCD Application

Create `argocd-application.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: iraven-admin
  namespace: argocd
spec:
  project: default
  source:
    repoURL: git@github.com:koushamad/iraven-admin.git
    targetRevision: main
    path: .deployment/iraven-admin
    helm:
      valueFiles:
        - values.yaml
        - k3s-ha01-values.yaml
        - version-values.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: iraven-admin
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

Apply the ArgoCD application:
```bash
kubectl apply -f argocd-application.yaml
```

### 5. Trigger First Deployment

#### Option A: Using Git Tag (Recommended)
```bash
# Tag and push
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Trigger GitHub Actions
2. Send webhook to Argo Events
3. Start Argo Workflow
4. Build Docker image
5. Push to Harbor
6. Update version-values.yaml
7. ArgoCD syncs automatically

#### Option B: Manual Workflow Trigger
```bash
# Manually trigger Argo Workflow
kubectl create -n argo -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: iraven-admin-build-deploy-
spec:
  serviceAccountName: workflow-executor
  workflowTemplateRef:
    name: iraven-admin-build-and-deploy
  arguments:
    parameters:
      - name: repository
        value: "git@github.com:koushamad/iraven-admin.git"
      - name: branch
        value: "main"
      - name: docker-tag
        value: "v1.0.0"
      - name: app-name
        value: "iraven-admin"
      - name: namespace
        value: "iraven-admin"
EOF
```

## Configuration

### Environment Variables (values.yaml)

```yaml
config:
  database:
    host: "iraven-supabase-postgresql.iraven-supabase.svc.cluster.local"
    port: 5432
    database: "postgres"
    username: "postgres"
    password: "your-super-secret-postgres-password"

  auth:
    jwt_secret: "change_this_jwt_secret_in_production_min_32_chars"
    session_duration: 86400
```

### Resource Limits (k3s-ha01-values.yaml)

```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 70
```

### Ingress Configuration

Domain: `admin.iraven.io`
- SSL/TLS via Let's Encrypt
- Automatic HTTPS redirect
- Cert-Manager managed certificates

## Monitoring & Verification

### Check Deployment Status

```bash
# Check ArgoCD application
kubectl get application iraven-admin -n argocd

# Check pods
kubectl get pods -n iraven-admin

# Check ingress
kubectl get ingress -n iraven-admin

# Check HPA
kubectl get hpa -n iraven-admin
```

### View Logs

```bash
# Application logs
kubectl logs -n iraven-admin -l app.kubernetes.io/name=iraven-admin -f

# Argo Workflows
kubectl get workflows -n argo

# Argo Events
kubectl get sensor -n argo-events
kubectl logs -n argo-events -l eventsource-name=iraven-admin-github-webhook
```

### Access Application

- **Admin Dashboard**: https://admin.iraven.io
- **Argo Workflows UI**: Check your Argo Workflows instance
- **ArgoCD UI**: Check your ArgoCD instance

## Troubleshooting

### Build Fails

```bash
# Check workflow logs
kubectl logs -n argo <workflow-pod-name>

# Common issues:
# 1. Harbor credentials - verify harbor-registry-secret
# 2. GitHub SSH key - verify github-ssh-key
# 3. Kaniko cache issues - clear with --no-cache flag
```

### Deployment Not Updating

```bash
# Force ArgoCD sync
kubectl patch application iraven-admin -n argocd \
  --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}'

# Check ArgoCD sync status
kubectl describe application iraven-admin -n argocd
```

### Health Check Failing

```bash
# Check pod status
kubectl describe pod -n iraven-admin <pod-name>

# Common issues:
# 1. Database connection - verify config.database settings
# 2. Port mismatch - ensure container port 8081
# 3. Health endpoint - /login should be accessible
```

### DNS Not Resolving

```bash
# Check ingress
kubectl get ingress -n iraven-admin -o yaml

# Verify DNS
dig admin.iraven.io

# Check cert-manager
kubectl get certificate -n iraven-admin
kubectl describe certificate iraven-admin-tls-cert -n iraven-admin
```

## Rollback

### Rollback to Previous Version

```bash
# Via Kubernetes
kubectl rollout undo deployment/iraven-admin -n iraven-admin

# Via ArgoCD
kubectl patch application iraven-admin -n argocd \
  --type merge -p '{"spec":{"source":{"helm":{"valueFiles":["values.yaml","k3s-ha01-values.yaml","version-values.yaml"]}}}}'

# Manually edit version-values.yaml
cd .deployment/iraven-admin
echo 'image:\n  tag: "v1.0.0"' > version-values.yaml
git add version-values.yaml
git commit -m "Rollback to v1.0.0"
git push
```

## Scaling

### Manual Scaling

```bash
# Scale replicas
kubectl scale deployment iraven-admin -n iraven-admin --replicas=5

# Update HPA
kubectl edit hpa iraven-admin -n iraven-admin
```

### Auto-scaling

Configured via `autoscaling` in values.yaml:
- Min replicas: 2
- Max replicas: 5
- CPU threshold: 70%
- Memory threshold: 80%

## Security

### Update Secrets

```bash
# Update database password
kubectl edit secret -n iraven-admin

# Rotate JWT secret
# Update in values.yaml and re-deploy
```

### SSL Certificate

Automatically managed by cert-manager with Let's Encrypt.

Renewal: Automatic (60 days before expiry)

## Backup & Disaster Recovery

### Backup Helm Values

```bash
# Backup current configuration
helm get values iraven-admin -n iraven-admin > backup-values.yaml
```

### Disaster Recovery

```bash
# Re-deploy from scratch
kubectl delete namespace iraven-admin
kubectl apply -f argocd-application.yaml

# ArgoCD will automatically sync from Git
```

## Best Practices

1. **Always use tags** for production deployments
2. **Test in staging** before production
3. **Monitor logs** after deployment
4. **Keep secrets secure** and rotate regularly
5. **Document changes** in commit messages
6. **Use rollback** if issues arise
7. **Monitor resource usage** via HPA metrics

## Support

For issues:
- Check workflow logs in Argo
- Review ArgoCD sync status
- Verify Kubernetes events
- Check application logs

---

**Deployment Status**: Ready ✅
**Domain**: admin.iraven.io
**Cluster**: K3s HA01
**Namespace**: iraven-admin
