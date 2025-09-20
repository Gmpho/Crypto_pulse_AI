# Deployment and Scaling

This guide covers the deployment and scaling strategy for the CryptoPulse AI project, with a focus on using Docker and Fly.io.

## Docker Configuration

We use Docker to containerize our application, ensuring a consistent and reproducible environment for development, testing, and production. Our `docker-compose.dev.yml` file defines the services for our local development environment, including the frontend, backend, database, and other services.

### Production Dockerfiles

For production, we use multi-stage Dockerfiles to create lean and secure images. This helps to reduce the image size and attack surface.

**Backend Dockerfile (`backend/Dockerfile.prod`)**

```dockerfile
# Stage 1: Build the application
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Stage 2: Create the production image
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app /app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile (`frontend/Dockerfile.prod`)**

```dockerfile
# Stage 1: Build the application
FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the application with a lightweight server
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Deployment with Fly.io

We use [Fly.io](https://fly.io/) for deploying our application. Fly.io allows us to deploy our Docker containers to multiple regions around the world, which helps to reduce latency for our users.

### `fly.toml` Configuration

We use a `fly.toml` file to configure our Fly.io deployment. We have separate configuration files for our staging and production environments.

**Example `fly.production.toml`**

```toml
app = "cryptopulse-ai-prod"
primary_region = "iad"

[build]
  image = "ghcr.io/your-repo/backend:latest"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  size = "shared-cpu-1x"
  memory = "256mb"
```

### Continuous Deployment with GitHub Actions

We use GitHub Actions to automate our deployment process. Our CI/CD pipeline builds and pushes our Docker images to the GitHub Container Registry, and then deploys them to Fly.io.

## Scaling

Our architecture is designed to be scalable. We can scale our application horizontally by adding more instances of our frontend and backend containers.

### Database Scaling

Supabase provides a scalable Postgres database. We can easily upgrade our database instance as our needs grow.

### LLM Scaling

We use a multi-LLM approach with fallback logic. This allows us to distribute the load between different LLM providers and to handle failures gracefully.
