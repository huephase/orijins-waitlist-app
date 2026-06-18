# orijins-waitlist-app
# Restaurant Waitlist App

A server-rendered TypeScript/Express app for restaurant hosts to manage a live guest waiting list.

## Stack

- TypeScript, Express, Nunjucks
- PostgreSQL, Prisma
- Server-side sessions with `express-session` and `connect-pg-simple`
- SCSS compiled to static CSS
- Docker and Docker Compose

## Local setup

1. Copy `.env.example` to `.env` and adjust secrets.
2. Install dependencies with `npm install`.
3. Start Postgres with `docker compose up db`.
4. Run `npm run prisma:migrate`, then `npm run seed`.
5. Start the app with `npm run dev`.

The seed account defaults to `admin@example.com` / `ChangeMe123!` unless changed in `.env`.

## Useful scripts

- `npm run dev` starts the TypeScript dev server.
- `npm run build` compiles SCSS, TypeScript, and views.
- `npm run start` runs the compiled app.
- `npm run seed` creates or updates the default super admin.
- `npm run prisma:migrate` creates and applies local Prisma migrations.

## Notes

- `_main_config.json` is intentionally non-sensitive and drives colors, fonts, waitlist timing, and scheduler defaults.
- `.env` is ignored and should contain database, session, SMTP, and future integration secrets.
- All persisted timestamps are UTC; templates render operational times for `Asia/Dubai`.
