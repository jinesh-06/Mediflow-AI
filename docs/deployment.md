# ResiliHealth AI: Production Deployment Guide

## 1. Containerization & Architecture
ResiliHealth AI is architected for containerized deployment on **Google Cloud Run** or Kubernetes:
- **Backend Service**: FastAPI container running behind Uvicorn.
- **Frontend SPA**: Static asset bundle hosted via Cloud Storage + Cloud CDN, Firebase Hosting, or Vercel.

---

## 2. Dockerfile Specification

### Backend (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build & Deploy to Google Cloud Run
```bash
# 1. Build and tag the container
gcloud builds submit --tag gcr.io/[PROJECT_ID]/resilihealth-backend backend/

# 2. Deploy to Cloud Run
gcloud run deploy resilihealth-backend \
  --image gcr.io/[PROJECT_ID]/resilihealth-backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=[YOUR_KEY],DUAL_AUTH_THRESHOLD=1000
```

---

## 3. Frontend Deployment to Firebase Hosting

```bash
cd frontend
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

---

## 4. Secret Management Best Practices
- Never commit `.env` or production API keys to Git.
- Pass `GEMINI_API_KEY` via Google Cloud Secret Manager or Cloud Run environment variables.
