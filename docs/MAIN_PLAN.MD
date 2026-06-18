# MAIN_PLAN.md
# Restaurant Guest Waiting List App — Master Development Plan

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Project Structure](#4-project-structure)
5. [Configuration Strategy](#5-configuration-strategy)
6. [Database Schema](#6-database-schema)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [Authentication](#8-authentication)
9. [Core Features (MVP)](#9-core-features-mvp)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Templating Engine](#11-templating-engine)
12. [Real-Time Color Coding Logic](#12-real-time-color-coding-logic)
13. [Reporting & Audit](#13-reporting--audit)
14. [Responsive Design Strategy](#14-responsive-design-strategy)
15. [Dockerization](#15-dockerization)
16. [Future Integrations](#16-future-integrations)
17. [Development Stages](#17-development-stages)
18. [DRY Principles & Best Practices](#18-dry-principles--best-practices)
19. [Security Considerations](#19-security-considerations)
20. [Changelog & Versioning](#20-changelog--versioning)

---

## 1. Project Overview

**App Name:** Restaurant Guest Waiting List App
**Purpose:** A web-based application for restaurant staff to manage a live guest waiting list — tracking guests from arrival through seating, no-show, or cancellation.
**Target Users:** Restaurant Super Admins, Hosts, and Viewers.
**Timezone Policy:** All data stored in UTC. All rendered times displayed in UAE time (UTC+4).

---

## 2. Tech Stack

| Layer              | Technology                                      |
|--------------------|-------------------------------------------------|
| Language           | TypeScript (strict mode)                        |
| Runtime            | Node.js (LTS)                                   |
| Framework          | Express.js                                      |
| Database           | PostgreSQL                                      |
| ORM                | Prisma                                          |
| State Management   | Server-side persistent sessions (express-session + connect-pg-simple) |
| Session Cookies    | HTTP-only, Secure, SameSite cookies             |
| Templating Engine  | Nunjucks (server-side rendering)                |
| Styling            | SCSS compiled to CSS, CSS custom properties     |
| Fonts              | Google Fonts (via `<link>` in central HTML head)|
| Containerization   | Docker + Docker Compose                         |
| Config             | `_main_config.json` (non-sensitive) + `.env` (secrets) |
| Scheduler          | node-cron                                       |
| Linting            | ESLint + Prettier                               |
| Build Tool         | tsc + ts-node-dev (dev), compiled JS (prod)     |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                   │
│                                                     │
│  ┌──────────────────┐       ┌───────────────────┐  │
│  │   App Container  │◄─────►│  Postgres Container│  │
│  │  (Node/Express)  │       │   (persistent vol) │  │
│  └──────────────────┘       └───────────────────┘  │
│          │                                          │
│          │ Session Store (connect-pg-simple)        │
│          ▼                                          │
│  ┌──────────────────┐                              │
│  │  Session Storage │                              │
│  │  (PostgreSQL)    │                              │
│  └──────────────────┘                              │
└─────────────────────────────────────────────────────┘
```

- **Express.js** handles routing, middleware, and server-side rendering via Nunjucks.
- **Prisma** manages all DB access — no raw SQL except via Prisma's `$queryRaw` if unavoidable.
- **Sessions** are persisted in PostgreSQL via `connect-pg-simple` for stateful auth.
- **node-cron** handles scheduled tasks (daily report at 03:00 UTC).
- The front-end polls or uses SSE (Server-Sent Events) for live waitlist updates without a full WebSocket server.

---

## 4. Project Structure

```
/app
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   │   └── loadConfig.ts          # Loads & merges _main_config.json
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── guestController.ts
│   │   ├── reportController.ts
│   │   └── adminController.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts       # Role-based access guards
│   │   ├── sessionMiddleware.ts
│   │   └── sanitizeMiddleware.ts   # Input sanitization (email, strings)
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── guestRoutes.ts
│   │   ├── reportRoutes.ts
│   │   └── adminRoutes.ts
│   ├── services/
│   │   ├── guestService.ts         # All guest business logic
│   │   ├── authService.ts
│   │   ├── reportService.ts
│   │   └── schedulerService.ts     # node-cron jobs
│   ├── utils/
│   │   ├── dateUtils.ts            # UTC ↔ UAE time helpers
│   │   ├── sanitize.ts             # Email & string sanitization
│   │   └── colorStatus.ts          # Seating time color logic
│   ├── views/                      # Nunjucks templates
│   │   ├── layouts/
│   │   │   └── base.njk            # Master layout (head, header, footer)
│   │   ├── partials/
│   │   │   ├── _head.njk           # <head> with favicon, OG tags, fonts
│   │   │   ├── _header.njk         # Logo + burger menu nav
│   │   │   └── _footer.njk
│   │   ├── pages/
│   │   │   ├── login.njk
│   │   │   ├── waitlist.njk        # Main queue view
│   │   │   ├── addGuest.njk
│   │   │   ├── editGuest.njk
│   │   │   ├── reports.njk
│   │   │   └── admin.njk
│   │   └── errors/
│   │       ├── 403.njk
│   │       ├── 404.njk
│   │       └── 500.njk
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces & enums
│   ├── app.ts                      # Express app setup
│   └── server.ts                   # Entry point
├── public/
│   ├── css/
│   │   └── main.css                # Compiled from SCSS
│   ├── scss/
│   │   ├── _variables.scss         # Maps from _main_config.json colors
│   │   ├── _reset.scss
│   │   ├── _layout.scss
│   │   ├── _components.scss
│   │   ├── _media.scss             # ONLY 2 media queries (tablet, phone portrait)
│   │   └── main.scss
│   ├── js/
│   │   ├── waitlist.ts             # Client-side polling + color flash logic
│   │   └── ui.ts                   # Burger menu, toggle interactions
│   ├── favicon.ico
│   └── images/
│       └── logo.png
├── _main_config.json               # Central non-sensitive config
├── .env                            # Secrets (never committed)
├── .env.example                    # Template for .env
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── package.json
```

---

## 5. Configuration Strategy

### 5.1 `_main_config.json` — Non-Sensitive Settings

```json
{
  "app": {
    "name": "Restaurant Waitlist",
    "timezone_display": "Asia/Dubai",
    "timezone_storage": "UTC"
  },
  "colors": {
    "primary": "#1A1A2E",
    "secondary": "#16213E",
    "accent": "#E94560",
    "background": "#F5F5F5",
    "text_primary": "#212121",
    "text_secondary": "#757575",
    "success": "#4CAF50",
    "warning": "#FFC107",
    "danger": "#F44336",
    "neutral": "#9E9E9E",
    "status_upcoming": "#FFC107",
    "status_now": "#4CAF50",
    "status_overdue": "#F44336",
    "status_seated": "#2196F3",
    "status_noshow": "#9E9E9E",
    "status_cancelled": "#BDBDBD"
  },
  "waitlist": {
    "warning_minutes_before": 5,
    "default_seating_mode": "minutes",
    "polling_interval_ms": 30000
  },
  "scheduler": {
    "daily_report_cron": "0 3 * * *",
    "daily_report_time_utc": "03:00"
  },
  "og_meta": {
    "title": "Restaurant Waitlist",
    "description": "Guest waiting list management system",
    "image": "/images/og-image.png"
  },
  "fonts": {
    "primary": "Inter",
    "secondary": "Playfair Display",
    "google_fonts_url": "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600&display=swap"
  }
}
```

### 5.2 `.env` — Secrets & Sensitive Keys

```env
# Database
DATABASE_URL=postgresql://user:password@db:5432/waitlist_db

# Session
SESSION_SECRET=your-very-strong-secret-here
SESSION_MAX_AGE_MS=86400000

# App
NODE_ENV=production
PORT=3000

# Auth (future)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# WhatsApp Business API (future)
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Email/SMTP (for reports)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
REPORT_RECIPIENT_EMAIL=
```

---

## 6. Database Schema

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  SUPER_ADMIN
  HOST
  VIEWER
}

enum GuestStatus {
  WAITING
  SEATED
  NO_SHOW
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          UserRole  @default(HOST)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  guestsAdded   Guest[]   @relation("AddedBy")
  guestsUpdated Guest[]   @relation("UpdatedBy")
}

model Guest {
  id              String      @id @default(cuid())
  name            String
  partySize       Int
  phoneNumber     String?
  email           String?
  tableNumber     String?
  specialNotes    String?
  status          GuestStatus @default(WAITING)
  waitlistAt      DateTime    @default(now())   // UTC: auto-assigned on add
  scheduledSeatAt DateTime                       // UTC: assigned seating time
  seatedAt        DateTime?                      // UTC: actual seated time
  resolvedAt      DateTime?                      // UTC: no-show or cancelled time
  addedById       String
  addedBy         User        @relation("AddedBy", fields: [addedById], references: [id])
  updatedById     String?
  updatedBy       User?       @relation("UpdatedBy", fields: [updatedById], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Session {
  sid    String   @id
  sess   Json
  expire DateTime
  @@index([expire])
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  entity    String
  entityId  String
  actorId   String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

---

## 7. User Roles & Permissions

| Feature                        | Super Admin | Host | Viewer |
|-------------------------------|:-----------:|:----:|:------:|
| View waitlist                 | ✅          | ✅   | ✅     |
| Add guest                     | ✅          | ✅   | ❌     |
| Edit guest                    | ✅          | ✅   | ❌     |
| Remove guest                  | ✅          | ✅   | ❌     |
| Mark seated / no-show / cancel| ✅          | ✅   | ❌     |
| View reports                  | ✅          | ✅   | ✅     |
| Manage users                  | ✅          | ❌   | ❌     |
| Access admin panel            | ✅          | ❌   | ❌     |
| Change system settings        | ✅          | ❌   | ❌     |

---

## 8. Authentication

### 8.1 Basic Authentication (MVP)
- Username is **email format** — must be sanitized and validated server-side.
- Password is hashed using **bcrypt** (cost factor ≥ 12).
- Session persisted in PostgreSQL via `connect-pg-simple`.
- Sessions use HTTP-only, Secure, SameSite=Strict cookies.
- Login rate limiting via `express-rate-limit`.
- Email sanitization: trim whitespace, lowercase, validate RFC 5322 format.

### 8.2 Google OAuth (Future Stage)
- Passport.js `passport-google-oauth20` strategy — already scaffolded with empty env vars.
- OAuth callback routes pre-defined but inactive until `GOOGLE_CLIENT_ID` is set.
- On first Google login, auto-create user with `HOST` role pending Super Admin approval.

### 8.3 Session Strategy
- Session data: `{ userId, role, name, email }`
- Session cookie name: `wl_session`
- Max age defined in `.env` as `SESSION_MAX_AGE_MS`
- Regenerate session ID on privilege escalation.

---

## 9. Core Features (MVP)

### 9.1 Guest Queue Management

**Add Guest Form Fields:**
| Field             | Type              | Required | Notes                                  |
|-------------------|-------------------|----------|----------------------------------------|
| Guest Name        | Text              | ✅       | Trimmed, max 100 chars                 |
| Party Size        | Number (integer)  | ✅       | Min 1                                  |
| Phone Number      | Tel               | ❌       | E.164 format encouraged                |
| Email             | Email             | ❌       | Sanitized & validated                  |
| Table Number      | Text              | ❌       | Alphanumeric                           |
| Special Notes     | Multiline Textarea| ❌       | Max 500 chars                          |
| Seating Time Mode | Toggle            | ✅       | "Specific Time (HH:MM)" ↔ "Minutes from now" |
| Scheduled Seat At | Time / Number     | ✅       | Depends on toggle mode                 |

**Seating Time Toggle Behavior:**
- **Specific Time mode:** Time picker (HH:MM) → stored as today's date + that time in UTC.
- **Minutes from now mode:** Integer input → `scheduledSeatAt = now() + N minutes` in UTC.
- Toggle state is preserved per-session.

### 9.2 Guest Status Actions
- **Edit:** Modify any guest field while status is `WAITING`.
- **Remove:** Hard delete from list (with confirmation modal). Logged in `AuditLog`.
- **Mark Seated:** Sets `status = SEATED`, records `seatedAt = now()` in UTC.
- **Mark No-Show:** Sets `status = NO_SHOW`, records `resolvedAt = now()`.
- **Mark Cancelled:** Sets `status = CANCELLED`, records `resolvedAt = now()`.

### 9.3 Waitlist Timestamp
- `waitlistAt` is assigned automatically on record creation (`@default(now())`).
- Displayed to user in UAE time (UTC+4).

---

## 10. UI/UX Design System

### Design Principles
- Clean, minimal, functional — no decorative clutter.
- Colors driven entirely from `_main_config.json` → injected as CSS custom properties at build/startup.
- Typography from Google Fonts (defined in config).

### CSS Custom Properties Injection
At app startup, `loadConfig.ts` reads `_main_config.json` and exposes color values as CSS variables in a generated `_variables.scss` (or injected inline into the base template):

```css
:root {
  --color-primary: #1A1A2E;
  --color-accent: #E94560;
  --color-status-upcoming: #FFC107;
  --color-status-now: #4CAF50;
  --color-status-overdue: #F44336;
  /* ... all colors from config */
}
```

### Waitlist Table Columns (Desktop)
`#` | Guest Name | Party | Phone | Table | Notes | Scheduled Time | Waitlisted At | Status | Actions

---

## 11. Templating Engine

**Engine:** Nunjucks

### Central Templates

| Template           | Purpose                                                    |
|--------------------|------------------------------------------------------------|
| `base.njk`         | Master layout — extends all pages. Includes head, header, footer blocks. |
| `_head.njk`        | `<head>`: charset, viewport, favicon, OG meta tags, Google Fonts link, CSS link. All OG values from `_main_config.json`. |
| `_header.njk`      | Logo + burger menu nav. Nav items rendered based on user role. |
| `_footer.njk`      | Minimal footer with app name and version.                  |

### Page Template Pattern

```nunjucks
{% extends "layouts/base.njk" %}

{% block title %}Waitlist{% endblock %}

{% block content %}
  {# Page-specific content here #}
{% endblock %}
```

### Global Template Variables (injected via middleware)
- `config` — full `_main_config.json`
- `user` — current session user `{ name, role, email }`
- `appName` — from config
- `currentYear` — for footer

---

## 12. Real-Time Color Coding Logic

### Rules (evaluated client-side every `polling_interval_ms` from config)

| Condition                                     | Color         | Animation     |
|-----------------------------------------------|---------------|---------------|
| `scheduledSeatAt` > now + 5 min               | Default       | None          |
| `scheduledSeatAt` ≤ now + 5 min AND > now     | **Yellow**    | Flashing      |
| `scheduledSeatAt` = now (within ±30s window)  | **Green**     | Flashing      |
| `scheduledSeatAt` < now (overdue)             | **Red**       | Solid (no flash)|
| Status: SEATED                                | Blue          | None          |
| Status: NO_SHOW                               | Grey          | None          |
| Status: CANCELLED                             | Light Grey    | None          |

### Implementation
- Client-side `waitlist.ts` runs a `setInterval` based on `pollingInterval` from a data attribute injected into the page.
- Each row has a `data-scheduled-seat-at` attribute (ISO UTC string).
- The script computes the diff client-side, applies the appropriate CSS class.
- CSS `@keyframes flash` handles the flashing animation.
- Color values are read from CSS custom properties (derived from `_main_config.json`).

---

## 13. Reporting & Audit

### 13.1 Daily Waitlist Report
- Scheduled via `node-cron` using `daily_report_cron` from `_main_config.json` (default: `"0 3 * * *"` = 03:00 UTC).
- Only sends if records exist for the day.
- Report includes: total guests, seated count, no-shows, cancellations, average wait time.
- Delivered via SMTP email to `REPORT_RECIPIENT_EMAIL`.
- Report renders guest data in UAE time (UTC+4) for readability.

### 13.2 Seating History
- All status changes logged with timestamps in `AuditLog` table.
- Viewable in the Reports page (Super Admin + Host).
- Filterable by date range (UAE time displayed, UTC stored).

### 13.3 No-Show & Cancellation Tracking
- Dedicated report section on the Reports page.
- Shows guest name, party size, scheduled time, resolution time.

### 13.4 Audit Log
- Every create, update, delete, and status change is recorded in `AuditLog` with:
  - `action`: `CREATE | UPDATE | STATUS_CHANGE | DELETE`
  - `entity`: `Guest | User`
  - `entityId`: record ID
  - `actorId`: user who performed the action
  - `metadata`: JSON snapshot of before/after values

---

## 14. Responsive Design Strategy

### Breakpoints (EXACTLY 2 media queries)

```scss
// _media.scss

// Tablet (portrait + landscape, up to 1024px)
@media (max-width: 1024px) {
  // Tablet layout adjustments
  // Collapse table columns, adjust font sizes, etc.
}

// Phone portrait ONLY (up to 480px)
@media (max-width: 480px) {
  // Phone portrait layout
  // Stack table into cards, full-width forms, etc.
}
```

### Landscape Phone Orientation
- **Not supported.** A static overlay message is shown:
  > *"Please rotate your device to portrait orientation for the best experience."*
- Implemented via CSS `@media (orientation: landscape) and (max-height: 480px)`.

---

## 15. Dockerization

### `Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/views ./views
COPY _main_config.json .
COPY package.json .
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  app:
    build: .
    container_name: waitlist_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./_main_config.json:/app/_main_config.json:ro

  db:
    image: postgres:16-alpine
    container_name: waitlist_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

> **Note:** `_main_config.json` is mounted as a read-only volume so it can be updated without rebuilding the Docker image.

---

## 16. Future Integrations

### 16.1 Google OAuth
- Scaffolded in auth routes with feature flag check (`GOOGLE_CLIENT_ID` env presence).
- Passport.js already listed as a dependency.

### 16.2 WhatsApp Business API
- Service stub: `src/services/whatsappService.ts` created but inactive.
- Triggered on: guest added, 5-minute seating reminder, no-show/cancellation.
- Env vars pre-defined: `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`.
- Phone number field on guest form is prepared for this integration.

---

## 17. Development Stages

### ✅ Stage 1 — Project Foundation
- [ ] Initialize repo, TypeScript config, ESLint, Prettier
- [ ] Set up Express app with Nunjucks templating
- [ ] Set up `_main_config.json` loader (`loadConfig.ts`)
- [ ] Define global template variables middleware
- [ ] Build `base.njk`, `_head.njk`, `_header.njk`, `_footer.njk`
- [ ] Set up SCSS structure and CSS variable injection
- [ ] Configure Docker + Docker Compose
- [ ] Set up Prisma with PostgreSQL
- [ ] Run initial migration

### ✅ Stage 2 — Authentication & Session Management
- [ ] Implement basic email/password authentication
- [ ] Email sanitization and validation middleware
- [ ] bcrypt password hashing
- [ ] express-session + connect-pg-simple setup
- [ ] Auth middleware (route guards, role checks)
- [ ] Login page (login.njk)
- [ ] Rate limiting on login route
- [ ] Scaffold Google OAuth (inactive)

### ✅ Stage 3 — User Management (Super Admin)
- [ ] Admin panel: list, create, edit, deactivate users
- [ ] Role assignment
- [ ] Seed script: default Super Admin user

### ✅ Stage 4 — Core Waitlist MVP
- [ ] Guest model and Prisma migration
- [ ] Add guest form with seating time toggle (HH:MM / minutes)
- [ ] Edit guest form
- [ ] Remove guest (with confirmation, audit log)
- [ ] Mark seated / no-show / cancelled
- [ ] Waitlist main view (waitlist.njk) with full table
- [ ] All timestamps stored in UTC, rendered in UAE time

### ✅ Stage 5 — Real-Time Color Coding
- [ ] Client-side `waitlist.ts` polling and color logic
- [ ] CSS flash animations for yellow (upcoming) and green (now)
- [ ] Solid red for overdue
- [ ] Color values driven from CSS custom properties

### ✅ Stage 6 — Reporting & Audit
- [ ] AuditLog implementation across all write operations
- [ ] Reports page (seating history, no-shows, cancellations)
- [ ] node-cron daily report scheduler
- [ ] SMTP email delivery of daily report
- [ ] Report only sends if records exist for the day

### ✅ Stage 7 — Responsive Design & Polish
- [ ] Tablet media query
- [ ] Phone portrait media query
- [ ] Landscape phone unsupported overlay
- [ ] Final UI polish: spacing, typography, empty states, loading states
- [ ] Error pages (403, 404, 500)

### ✅ Stage 8 — Hardening & Production Readiness
- [ ] Helmet.js security headers
- [ ] CSRF protection
- [ ] Input validation (express-validator) on all forms
- [ ] Full `.env.example` documentation
- [ ] Health check endpoint (`/health`)
- [ ] Graceful shutdown handling
- [ ] Docker production build verification

### 🔲 Stage 9 (Future) — Google OAuth
- [ ] Activate Passport.js Google strategy
- [ ] Google login button on login page
- [ ] Auto-provisioning with pending approval flow

### 🔲 Stage 10 (Future) — WhatsApp Notifications
- [ ] Activate `whatsappService.ts`
- [ ] Notification triggers: added, reminder, no-show, cancelled
- [ ] Message templates defined in `_main_config.json`

---

## 18. DRY Principles & Best Practices

| Area                  | Practice                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| **Templates**         | All shared UI (head, header, footer) in partials — never duplicated       |
| **Config**            | Single source of truth: `_main_config.json` for all colors and settings   |
| **Date Utils**        | One `dateUtils.ts` module for all UTC ↔ UAE conversions                  |
| **Status Logic**      | `colorStatus.ts` is the single source for all color/status rules          |
| **Auth Guards**       | Centralized `authMiddleware.ts` — roles checked via reusable functions     |
| **Validation**        | All form validation logic in `sanitizeMiddleware.ts` and shared validators |
| **Services Layer**    | Business logic never lives in controllers — always in service files        |
| **Error Handling**    | Central async error handler middleware in `app.ts`                        |
| **Prisma Access**     | Database access only through service layer — never directly in routes      |

---

## 19. Security Considerations

- Passwords: bcrypt, cost factor ≥ 12
- Sessions: HTTP-only, Secure, SameSite=Strict cookies
- Email inputs: sanitized (trimmed, lowercased, RFC 5322 validated) before any DB operation
- All form inputs: validated and sanitized via `express-validator`
- CSRF: `csurf` token on all state-changing forms
- Security headers: `helmet.js`
- Rate limiting: `express-rate-limit` on `/login`
- `.env` never committed — `.gitignore` enforced
- `_main_config.json` contains zero secrets
- Audit log on all write/delete operations
- Docker: app runs as non-root user

---

## 20. Changelog & Versioning

| Version | Date       | Notes                        |
|---------|------------|------------------------------|
| 0.1.0   | TBD        | Stage 1–2: Foundation + Auth |
| 0.2.0   | TBD        | Stage 3–4: Waitlist MVP      |
| 0.3.0   | TBD        | Stage 5: Color Coding        |
| 0.4.0   | TBD        | Stage 6: Reporting & Audit   |
| 0.5.0   | TBD        | Stage 7–8: Polish + Hardening|
| 1.0.0   | TBD        | Production Release           |

---

*This document is the single source of truth for the project plan. All development decisions should reference and update this file.*
