# MedExplain AI — Deployment Guide

Comprehensive instructions for deploying MedExplain AI using Docker, Render, and GitHub Pages.

---

## 1. Local Development with Vite

```bash
# Clone the repository
git clone https://github.com/ArielElb/MedExplain.git
cd MedExplain/blood-test-app

# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Build production bundle (into dist/)
npm run build
```

---

## 2. Docker Containerization

The project includes a multi-stage `Dockerfile` and `nginx.conf`:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build & Run with Docker:
```bash
# Build the Docker image
docker build -t medexplain-app .

# Run container on port 80
docker run -d -p 80:80 --name medexplain medexplain-app
```

---

## 3. Render Blueprint Deployment

The repository includes a root `render.yaml` configuration file for 1-click Render Static Site deployment:

```yaml
services:
  - type: web
    name: medexplain-ai
    runtime: static
    rootDir: blood-test-app
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 4. GitHub Pages Documentation Deployment

GitHub Pages hosts the `/docs` directory as a static website:
1. Go to your GitHub repository: `https://github.com/ArielElb/MedExplain/settings/pages`.
2. Under **Build and deployment > Source**, select **Deploy from a branch**.
3. Under **Branch**, select `main` and folder `/docs`.
4. Click **Save**. The documentation site will be live at `https://arielelb.github.io/MedExplain/`.

