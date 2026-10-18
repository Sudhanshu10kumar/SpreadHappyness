# Verseora Production Deployment & Operations Guide

## 1. Quick Local Development
```bash
# Terminal 1: Start FastAPI backend
cd apps/api
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start Vite frontend
cd apps/web
npm run dev
```

Visit `http://localhost:5173` in your browser. API documentation is available at `http://localhost:8000/docs`.

---

## 2. Docker Compose Production Deployment
To spin up the entire cluster (PostgreSQL 16, Redis 7, FastAPI backend, and Nginx frontend):

```bash
# 1. Create environment file from template
cp .env.example .env

# 2. Build and run containers
docker-compose up --build -d

# 3. Verify health
docker-compose ps
```

The web application is accessible at `http://localhost:3000` (or your domain on port 80/443).

---

## 3. Database Migration & Seeding
```bash
# Seed initial classical poets, Shayari, and samples
python apps/api/seed_db.py
```

---

## 4. Production Security Checklist
- [x] Rotate `SECRET_KEY` in `.env` to a cryptographically strong 64-character token.
- [x] Configure SSL/TLS with Let's Encrypt / Certbot on port 443.
- [x] Ensure `ENVIRONMENT=production` so cookies enforce `Secure; HttpOnly; SameSite=Lax`.
- [x] Configure regular automated PostgreSQL dumps:
  ```bash
  docker-compose exec -T postgres pg_dump -U verseora_user verseora > backup_$(date +%Y%m%d).sql
  ```

