# Verseora — Premium Creative Writing & Poetry Platform

[![CI Pipeline](https://github.com/verseora/verseora/actions/workflows/ci.yml/badge.svg)](https://github.com/verseora/verseora/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-0.169-black.svg?logo=three.js&logoColor=white)](https://threejs.org)

> *"शब्दों का सफ़र, एहसासों की मंज़िल।"*
> A digital sanctuary where thoughts turn to poetry and words find a soul.

---

## 1. Product Vision & Principles

**Verseora** is a market-ready creative writing platform engineered for Hindi, English, and Hinglish Shayari writers, poets, reflective journalers, and passionate readers. Built to avoid basic CRUD tropes or noisy social media clones, it delivers an editorial, cinematic experience with distraction-free writing, selective 3D ambiance, and strict privacy boundaries.

- **Privacy First**: New entries strictly default to `status="draft"` and `visibility="private"`. Content is never published automatically or leaked via discovery APIs.
- **Writing Without Friction**: Real-time autosave with status indicator, stanza-aware formatting, word/character telemetry, and live reading preview.
- **Multilingual Dignity**: First-class Devanagari script (Noto Serif Devanagari), classic serif (Playfair Display), and clean sans-serif (Plus Jakarta Sans).
- **Creator Ownership**: One-click GDPR-compliant data export to JSON with permanent cascade deletion controls.
- **Purposeful Motion**: Three.js ambient stardust canvas responsive to cursor parallax, with automatic detection and manual toggle for low-effects / `prefers-reduced-motion`.

---

## 2. Technology Stack

### Frontend (`apps/web`)
- **Framework**: React 18 with TypeScript 5.6 & Vite 5
- **Styling**: Tailwind CSS with custom editorial charcoal & warm ivory palette
- **3D & Canvas**: Three.js with graceful fallback for low-power and reduced-motion modes
- **State & Server Sync**: TanStack Query v5 + React Context
- **Celebration Effects**: Canvas Confetti for publishing milestones
- **Icons**: Lucide React

### Backend (`apps/api`)
- **Web Framework**: Python FastAPI (0.115+) with OpenAPI auto-docs
- **Validation**: Pydantic v2 schemas (`ConfigDict(from_attributes=True)`)
- **ORM & Database**: SQLAlchemy 2.0 with PostgreSQL & SQLite dual-mode
- **Password Cryptography**: **Argon2id** (`time_cost=3, memory_cost=65536, parallelism=4, hash_len=32`)
- **Session Auth**: JWT with dual Bearer token & `HttpOnly; SameSite=Lax; Secure` cookie support
- **Sanitization**: Bleach with tinycss2 CSS sanitization, neutralizing stored XSS attacks
- **Security Headers**: OWASP middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, CSP)

### Infrastructure & DevOps
- **Containerization**: Docker Compose (`api`, `web`, `postgres`, `redis`)
- **Web Server**: Nginx reverse proxy with Gzip compression and security headers
- **CI/CD**: GitHub Actions workflow running automated pytest suite and frontend TypeScript builds

---

## 3. Project Structure

```
verseora/
├── apps/
│   ├── api/                     # FastAPI backend application
│   │   ├── app/
│   │   │   ├── api/v1/          # Endpoints (auth, posts, users, social, collections, admin, export)
│   │   │   ├── core/            # Config, security, database engine, sanitizer, security middleware
│   │   │   ├── models/          # SQLAlchemy 2.0 ORM entities
│   │   │   ├── schemas/         # Pydantic v2 schemas
│   │   │   ├── services/        # Business logic & privacy boundaries
│   │   │   └── tests/           # Automated pytest security suite
│   │   ├── requirements.txt     # Pinned Python dependencies
│   │   └── seed_db.py           # Database seeder with classical & modern poetry
│   └── web/                     # React 18 + Vite frontend
│       ├── src/
│       │   ├── components/      # Navigation, 3D canvas, footer
│       │   ├── context/         # AuthContext & ThemeContext
│       │   ├── lib/             # API client with token injection
│       │   ├── pages/           # Landing, Studio, Reading, Explore, Profile, Admin, Settings
│       │   └── styles/          # Tailwind design tokens & typography
│       └── package.json
├── packages/
│   └── shared-types/            # Shared TypeScript interfaces & enums
├── infrastructure/
│   └── docker/                  # Dockerfiles & Nginx reverse proxy
├── docs/                        # Architecture, Security, API, and Deployment documentation
├── docker-compose.yml           # Multi-container local & prod deployment
└── README.md
```

---

## 4. Getting Started & Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Quick Start (Zero-Config Development)

#### 1. Setup Backend API
```bash
# Navigate to API directory
cd apps/api

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample Hindi & English poetry and poets
python seed_db.py

# Start the API server
python -m uvicorn app.main:app --reload --port 8000
```
*API interactive documentation will be available at:* `http://localhost:8000/docs`

#### 2. Setup Web Client
In a separate terminal:
```bash
# Navigate to web directory
cd apps/web

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
*Web application will be running at:* `http://localhost:5173`

---

## 5. Docker Deployment

To launch the complete production-ready stack (FastAPI, React + Nginx, PostgreSQL 16, Redis 7):

```bash
# Copy environment configuration
cp .env.example .env

# Build and start all containers
docker-compose up --build -d

# Verify container health
docker-compose ps
```
The application will be live at `http://localhost:3000`.

---

## 6. Automated Testing & Verification

The test suite validates critical security invariants, draft isolation, XSS sanitization, and administrative RBAC:

```bash
cd apps/api
python -m pytest -v
```

### Verified Test Suite (100% Passing):
- [x] `test_health_check`: Verifies system liveness and readiness probe.
- [x] `test_auth_login_and_logout`: Verifies Argon2id password verification and session clearance.
- [x] `test_draft_privacy_isolation`: **Proves User A cannot read or edit User B's private draft, and feed never leaks it.**
- [x] `test_xss_sanitization`: **Proves malicious `<script>` tags, event handlers (`onerror`), and payloads are neutralized.**
- [x] `test_public_publishing_and_feed`: Verifies explicit publication workflow and public feed visibility filters.
- [x] `test_duplicate_likes_prevented`: Proves database unique constraints prevent duplicate likes.
- [x] `test_admin_rbac_enforcement`: Proves non-admin users receive `403 Forbidden` on moderation endpoints.
- [x] `test_user_data_export`: Verifies GDPR-compliant structured JSON user data portability.

---

## 7. Feature Status Checklist

### ✅ Completed & Production Ready
- [x] **Cinematic Editorial Design System**: Charcoal/Midnight surfaces, warm ivory text, violet/rose accents, light/dark themes.
- [x] **Ambient 3D Stardust Canvas**: Three.js floating literary particles with cursor parallax and low-effects toggle.
- [x] **Secure Authentication & Identity**: Argon2id password hashing, JWT sessions, HttpOnly cookies, profile management.
- [x] **Distraction-Free Writing Studio**: Autosave with status indicator, word/char counts, reading preview, genre/language/mood selectors.
- [x] **Explicit Visibility Boundaries**: Default private drafts, unlisted secret-link sharing, and public community publication.
- [x] **Public Discovery Feed**: Search by keyword/tag/title, sort by Latest/Popular/Trending, filter by Mood and Language.
- [x] **Immersive Poetry Reading**: Stanza typography, reading size toggles, reading themes (Midnight, Charcoal, Parchment).
- [x] **Social Interactions**: Likes with celebratory animations, private bookmarks, author follows, and discussion comments.
- [x] **Anthologies & Collections**: Create named volumes, organize personal entries, public/private collection permissions.
- [x] **Editorial Governance & Moderation**: Content reporting modal, admin moderation dashboard, report resolution, audit trail.
- [x] **Data Privacy & GDPR**: One-click complete JSON data export and permanent cascade account deletion.
- [x] **Automated CI/CD**: Pytest test suite and GitHub Actions workflow.

### 🟡 Incomplete / Requires External Credentials
- **Third-Party OAuth (Google / Apple)**: Endpoints prepared in schema; requires registration in Google Cloud Console / Apple Developer Console for production client IDs.
- **Transactional Email Verification**: SMTP configuration ready in settings; requires live SendGrid / AWS SES API credentials.

### 🚀 Planned Next Steps
- **Audio Recitation**: Voice recording attachment allowing poets to narrate their shayari.
- **Anthology Print-on-Demand**: One-click PDF export styled as an elegant physical poetry chapbook.

---

## 8. Mobile Application Roadmap (Verseora Mobile)

Verseora's architecture is built API-first with shared TypeScript definitions (`@verseora/shared-types`), ensuring rapid native mobile parity:

### Phase 1: Native Shell & Core Reading (React Native + Expo)
- Cross-platform iOS and Android shell using React Native and Expo Router.
- Offline-first cache utilizing TanStack Query and WatermelonDB or SQLite.
- Typography-first reading view with haptic feedback when turning pages or liking a verse.

### Phase 2: Native Writing Studio
- Offline draft creation and local auto-save with background sync when reconnected.
- Native Devanagari virtual keyboard enhancements and Urdu Nastaliq font rendering.
- Push notifications for new followers and poetry comments using Expo Notifications.

### Phase 3: Mobile-Exclusive Features
- Lock screen poetry widgets displaying daily Shayari couplets.
- Audio recitation studio with noise suppression and ambient acoustic background tracks.

---

## 9. License & Creator Ownership
Everything written by users on Verseora remains the 100% intellectual property of its respective author.
Platform code is released under the **MIT License**.

