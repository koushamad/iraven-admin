# ==============================================================================
# iRaven Admin Dashboard - Production Dockerfile
# ==============================================================================
# Multi-stage build for optimal image size and security
# Builds a static Go binary for the admin dashboard
#
# Build:
#   docker build -t iraven-admin:latest .
#   docker build -t iraven-admin:v1.0.0 .
#
# Run:
#   docker run -p 8081:8081 --env-file .env iraven-admin:latest
# ==============================================================================

# ==============================================================================
# STAGE 1: Builder
# ==============================================================================
ARG GO_VERSION=1.23
FROM harbor.kousha.dev/library/golang:${GO_VERSION}-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Allow Go to auto-download the required toolchain version
ENV GOTOOLCHAIN=auto

# Copy go.mod and go.sum for dependency caching
# This layer is cached unless dependencies change
COPY go.mod go.sum ./

# Download dependencies
# This layer is cached unless go.mod or go.sum changes
RUN go mod download && go mod verify

# Copy the entire source code
COPY . .

# Build the application binary
# CGO_ENABLED=0: Build static binary without C dependencies
# -a: Force rebuilding of packages
# -installsuffix cgo: Add suffix to separate build cache
# -ldflags="-w -s": Strip debug information and symbol table
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -mod=mod \
    -a \
    -installsuffix cgo \
    -ldflags="-w -s -X main.version=$(git describe --tags --always --dirty 2>/dev/null || echo 'dev') -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    -o iraven-admin \
    ./cmd/admin/main.go

# ==============================================================================
# STAGE 2: Production Image
# ==============================================================================
FROM harbor.kousha.dev/library/alpine:3.18

# Add metadata labels
LABEL maintainer="kousha@iraven.io" \
      org.opencontainers.image.title="iRaven Admin Dashboard" \
      org.opencontainers.image.description="Admin dashboard for iRaven API" \
      org.opencontainers.image.vendor="iRaven" \
      org.opencontainers.image.source="https://github.com/koushamad/iraven-admin"

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    wget \
    && update-ca-certificates

# Set working directory
WORKDIR /app

# Copy binary and required files from builder
COPY --from=builder /app/iraven-admin ./iraven-admin
COPY --from=builder /app/config.yaml ./config.yaml
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/static ./static

# Create application user and group
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app && \
    chmod +x /app/iraven-admin

# Switch to non-root user
USER appuser

# Set default environment variables
ENV APP_ENV=production \
    SERVER_HOST=0.0.0.0 \
    SERVER_PORT=8081 \
    TZ=UTC

# Expose the application port
EXPOSE 8081

# Add health check
HEALTHCHECK --interval=30s \
            --timeout=3s \
            --start-period=5s \
            --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/login || exit 1

# Run the application
CMD ["./iraven-admin"]

# ==============================================================================
# USAGE NOTES
# ==============================================================================
# Build:
#   docker build -t iraven-admin:latest .
#   docker build -t iraven-admin:v1.0.0 .
#
# Development:
#   docker build -t iraven-admin:dev .
#   docker run -p 8081:8081 --env-file .env.development iraven-admin:dev
#
# Production:
#   docker build -t iraven-admin:prod .
#   docker run -p 8081:8081 --env-file .env.production iraven-admin:prod
#
# Push to Harbor registry:
#   docker tag iraven-admin:latest harbor.kousha.dev/application-images/iraven-admin:latest
#   docker push harbor.kousha.dev/application-images/iraven-admin:latest
# ==============================================================================
