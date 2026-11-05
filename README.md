# OKR-backend

## Local development database

The local database runs in Docker and is separate from the Supabase database in `.env`.

1. Copy `.env.local.example` to `.env.local`.
2. Start PostgreSQL: `bun run db:local:up`.
3. Apply the checked-in Drizzle migrations: `bun run db:migrate:local`.
4. Run the app against local PostgreSQL: `bun run dev:local`.

Use `bun run db:local:down` to stop the container. Its data stays in the named Docker volume. To delete that local data and start fresh, run `docker compose down -v`.

The existing `dev` script and the explicitly named `db:*:supabase` scripts use `.env`, which is configured for Supabase. Keep `.env` and `.env.local` out of version control; review the selected command and `DATABASE_URL` before applying migrations or opening Drizzle Studio.
