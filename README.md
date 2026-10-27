# Tria – Tripodi värbamisassistent

Candidate-facing AI chatbot for Tripod. Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Prisma + PostgreSQL. AI answers are mocked (`src/lib/mock-ai.ts`, 1.5 s delay).

## Deployment (Railway)

1. Add a PostgreSQL service in the Railway project and link it to this app so `DATABASE_URL` is set (see `.env.example`).
2. Railway deploys automatically from `main`:
   - build: `prisma generate && next build` (no database needed)
   - start: `prisma migrate deploy && next start` (creates/updates tables, listens on `PORT`)
3. Once, after the first deploy, add the default system prompts:
   `npx prisma db seed` (e.g. via `railway run npx prisma db seed`).

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET, POST | `/api/chats` | list / create chat sessions |
| GET, PATCH, DELETE | `/api/chats/[id]` | load chat with messages / update model & settings / delete |
| POST, DELETE | `/api/chats/[id]/messages` | send message (saves user + mock answer) / clear chat |
| GET, POST, PUT, DELETE | `/api/prompts` | system prompts (PUT/DELETE take `id` in the JSON body) |

If the database is unreachable, the API answers `503` with an Estonian message and the UI shows it in a banner.
