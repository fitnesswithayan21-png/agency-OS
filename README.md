# AgencyOS

A production-ready Agency Operating System: run a modern agency from lead acquisition to project delivery.

## Tech Stack
- **Frontend:** Next.js 15 (App Router) - TypeScript - Tailwind CSS - Shadcn UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deployment:** Vercel

## Roles
| Role | Access |
|---|---|
| owner | Everything: team, finances, analytics, settings |
| manager | Projects, clients, team tasks, finance |
| member | Assigned projects, tasks, deliverables |
| client | Portal: status, files, approvals, invoices, messages |

## Local Setup
1. Create a project at https://supabase.com.
2. Run `supabase/migrations/00001_init.sql` then `00002_profile_protection.sql` in the SQL Editor (or `supabase db push` with the CLI).
3. Enable **Email** provider: Authentication > Providers > Email.
4. `cp .env.example .env.local` and fill in your Supabase URL + keys.
5. `npm install`
6. `npm run dev` -> http://localhost:3000

> The **first user to sign up becomes the Agency Owner**. Later signups default to `member`; roles are managed in the Admin panel.

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier |

## Deploy to Vercel
1. Import the repo into Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.
3. Add the Vercel domain in Supabase > Authentication > URL Configuration.

## Scheduled Jobs (Supabase Cron, daily)
- `select mark_overdue_invoices();`
- `select notify_upcoming_deadlines();`

## Docs
- `docs/ARCHITECTURE.md` - `docs/DATABASE.md` - `docs/ROADMAP.md`
