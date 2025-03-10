# ML Benchmark Platform

A modern web application for benchmarking machine learning models. Upload your models and datasets, run benchmarks, and visualize performance metrics with a beautiful UI.

## Project Structure

- **Backend**: FastAPI application for model benchmarking
- **Frontend**: Next.js application with modern UI components

## Deployment on Railway

### Method 1: Deploy Individual Services (Recommended)

1. **Deploy Backend Service**:
   - Go to [Railway](https://railway.app/)
   - Click "New Project" → "Deploy from GitHub"
   - Select this repository
   - Choose "Deploy specific directory" → `backend`
   - Add these environment variables:
     ```
     PORT=8000
     ALLOWED_ORIGINS=https://your-frontend-url.up.railway.app
     ```

2. **Deploy Frontend Service**:
   - Create another project on Railway
   - Choose "Deploy specific directory" → `frontend`
   - Add these environment variables:
     ```
     PORT=3000
     NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
     ```

### Method 2: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

## Local Development

```bash
# Install dependencies
npm run install:backend
npm run install:frontend

# Run both services
npm run dev

# Or run them separately
npm run start:backend
npm run start:frontend
```

## Features

- Upload ML models (.pkl files)
- Upload datasets (.csv files)
- Run benchmarks with performance metrics
- Modern UI with animations and glass-morphism effects
- Responsive design for all devices