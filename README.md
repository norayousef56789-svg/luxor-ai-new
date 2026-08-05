# Luxor AI

Smart tourism and AI marketing platform for Luxor, Egypt — tourist portal (attractions,
itineraries, hotels, restaurants, bazaars, events, maps, AI guide), business portal
(registration, dashboard, offers, analytics, AI Marketing Studio) and an admin portal.

## Tech stack

- React 19 + TypeScript
- TanStack Start (SSR, file-based routing) + TanStack Router / Query
- Vite 8
- Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react
- Supabase (Postgres, Auth, RLS) via `@supabase/supabase-js`
- Vercel AI SDK against an OpenAI-compatible gateway

## Requirements

- Node.js 20 or newer
- npm 10+ (or bun/pnpm/yarn if you prefer)

## Local setup (VS Code)

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

Then open http://localhost:8080.

Fill `.env` with your own Supabase project values (or the values from the existing
project's `.env` if it was included in your export). Client-visible variables must be
prefixed with `VITE_`; server-only values (service role key, AI gateway key) must not be.

VS Code will suggest the recommended extensions from `.vscode/extensions.json`
(ESLint, Prettier, Tailwind IntelliSense) on first open.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Database

SQL migrations live in `supabase/migrations/`. To use a fresh Supabase project, run them
in order against your database (Supabase SQL editor or `supabase db push` with the CLI),
then set the matching URL/keys in `.env`. They create the `profiles`, `user_roles`,
`businesses`, `offers`, `attractions`, `events` and `business_visits` tables with RLS
policies, and seed real Luxor attractions and events.

## AI features

`Ask Luxor AI` (`src/routes/api/chat.ts`) and the AI Marketing Studio
(`src/routes/api/marketing.ts`) call an OpenAI-compatible endpoint configured in
`src/lib/ai-gateway.server.ts`, authenticated with `LOVABLE_API_KEY`. Without that key the
rest of the app runs normally and only the AI endpoints return an error. To use another
provider (OpenAI, OpenRouter, ...), change the `baseURL`/headers in that one file.

## Project structure

```
src/
  routes/           file-based routes (pages + /api server routes)
  components/site/  header, footer, directories
  components/business/  AI Marketing Studio
  components/ui/    shadcn/ui primitives
  lib/              auth, data helpers, server functions
  integrations/supabase/  generated client + types
supabase/migrations/  database schema and seed data
```
