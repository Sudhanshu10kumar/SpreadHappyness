# Verseora Architecture & Design Manual

## 1. Architectural Philosophy
Verseora is designed as an editorial creative writing sanctuary that merges the tactile dignity of a fine journal with modern community discovery.

### Core Tenets
- **Privacy as Invariant**: Creative writing is deeply personal. All new entries default to `status="draft"` and `visibility="private"`. A piece is only ever exposed to discovery feeds or profiles upon explicit, voluntary publication by its author.
- **Script & Script-Agnostic Harmony**: First-class Devanagari and Latin script typography (Cinzel, Playfair Display, Noto Serif Devanagari).
- **Graceful 3D Degradation**: The Three.js ambient stardust canvas enhances mood on capable devices while honoring `prefers-reduced-motion` and providing an instant zero-WebGL low-effects mode.

---

## 2. Monorepo Organization
```
verseora/
├── apps/
│   ├── api/                     # Python FastAPI Service
│   │   ├── app/
│   │   │   ├── api/v1/          # Endpoints (auth, posts, users, social, collections, admin, export)
│   │   │   ├── core/            # Config, security, DB engine, sanitizer, security middleware
│   │   │   ├── models/          # SQLAlchemy 2.0 ORM entities
│   │   │   ├── schemas/         # Pydantic v2 validation contracts
│   │   │   ├── services/        # Domain logic & business boundaries
│   │   │   └── tests/           # Automated pytest security suite
│   │   ├── requirements.txt
│   │   └── seed_db.py           # Database seeder
│   └── web/                     # React 18 + TypeScript + Vite Client
│       ├── src/
│       │   ├── components/      # Navigation, Three.js canvas, editorial layout
│       │   ├── context/         # AuthContext & ThemeContext
│       │   ├── lib/             # API client
│       │   ├── pages/           # Landing, Studio, Reading, Explore, Profile, Admin, Settings
│       │   └── styles/          # Tailwind design tokens & typography
│       └── package.json
├── packages/
│   └── shared-types/            # Shared TypeScript data contracts
├── infrastructure/
│   └── docker/                  # Production Dockerfiles & Nginx reverse proxy
├── docs/                        # Architecture, Security, API, and Deployment guides
├── docker-compose.yml           # Local & production multi-container orchestration
└── README.md
```

---

## 3. Data Integrity & Concurrency Controls
- **Duplicate Prevention**: Composite unique database constraints enforce singular likes (`user_id`, `post_id`), bookmarks (`user_id`, `post_id`), and follows (`follower_id`, `following_id`).
- **Atomic Counters**: Read counters and engagement counts are updated within transactions, preventing desynchronization.
- **Draft Versioning**: Substantial edits to published or drafted verses trigger incremental snapshots in `post_versions`, preserving author revisions.

