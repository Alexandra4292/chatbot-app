# Tria – Tripodi värbamisassistent

Candidate-facing AI chatbot for Tripod. Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Prisma + PostgreSQL. AI answers are mocked (`src/lib/mock-ai.ts`, 1.5 s delay).

## Deployment (Render)

1. **Create the database:** in the Render dashboard choose **New → PostgreSQL** and create an instance. When it is ready, copy its **Internal Database URL**.
2. **Create the web service:** choose **New → Web Service** and connect this GitHub repo (branch `main`, runtime Node).
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
3. **Add the environment variable:** under the web service's **Environment**, add `DATABASE_URL` with the database URL from step 1 (see `.env.example`). Do not set `NODE_ENV=production` for the build, because the build needs the dev dependencies (Prisma CLI, Tailwind, TypeScript).
4. **Deploy:** Render builds and deploys automatically on every push to `main`.
   - `npm run build` runs `prisma generate && next build` and needs no database.
   - `npm run start` runs `prisma migrate deploy && node prisma/seed.mjs && next start`: it creates/updates the tables, adds the default system prompts, and listens on the `PORT` that Render provides.
   - `package.json` requires Node `>=20` via `engines`, so Render does not use its default Node version.
5. **Default prompts are automatic:** the seed runs on every start and adds the three default system prompts ("Kandidaadi KKK", "Protsessi selgitaja", "Tööandja nõustaja") only while the prompts table is empty. Restarts never duplicate them, and prompts you edit or delete in "Manage Prompts" are not brought back (unless you delete all of them). No Shell access is needed.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET, POST | `/api/chats` | list / create chat sessions |
| GET, PATCH, DELETE | `/api/chats/[id]` | load chat with messages / update model & settings / delete |
| POST, DELETE | `/api/chats/[id]/messages` | send message (saves user + mock answer) / clear chat |
| GET, POST, PUT, DELETE | `/api/prompts` | system prompts (PUT/DELETE take `id` in the JSON body) |

If the database is unreachable, the API answers `503` with an Estonian message and the UI shows it in a banner.
