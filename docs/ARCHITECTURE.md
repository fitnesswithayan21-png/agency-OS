# AgencyOS Architecture

## System Overview
- Next.js 15 (Vercel): Server Components for reads, Server Actions for writes, middleware for session refresh + route guards.
- Supabase: PostgreSQL with Row Level Security (the security boundary), Auth (email/password), Storage (private files bucket), Realtime (chat/notifications), cron for scheduled automations.
- No custom REST backend: PostgREST + Server Actions, all governed by RLS.
- Automations live in the database as triggers (proposal->client, contract->project, milestone->invoice) and scheduled functions (overdue invoices, deadline alerts).

## Shells
- `/dashboard`: staff app (role-filtered sidebar nav).
- `/portal`: client portal.
- Three-layer auth: middleware (session) -> layout guards (requireStaff / requireClient / requireOwner) -> RLS (data security).

## API Structure
Server Actions per module (leads, clients, proposals, contracts, invoices, projects, team, messages, files), each in its module folder as `actions.ts`, with reads in `queries.ts`.
