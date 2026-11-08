# OKR Backend

An API backend built with [Bun](https://bun.sh/), [Elysia](https://elysiajs.com/), PostgreSQL, and [Drizzle ORM](https://orm.drizzle.team/). The project can use a local PostgreSQL database in Docker or the hosted Supabase PostgreSQL database.

## Requirements

- Bun
- Docker Desktop (only needed for the local database)
- A Supabase project (only needed when connecting to the hosted database)

## Install

Clone the repository, move into the project directory, and install dependencies:

```bash
git clone <repository-url>
cd OKR-backend
bun install
```

## Run with a local database

This is the recommended setup for development. It uses a PostgreSQL container and does not connect to Supabase.

1. Create the local environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Start PostgreSQL:

   ```bash
   bun run db:local:up
   ```

3. Apply the migrations to the local database:

   ```bash
   bun run db:migrate:local
   ```

4. Seed the initial departments and positions:

   ```bash
   bun run db:seed:local
   ```

   The seed uses CUID2 IDs and can be run again safely; it skips departments and positions that already exist.

5. Start the API using `.env.local`:

   ```bash
   bun run dev:local
   ```

The API listens on `http://localhost:3001`. The local database connection is configured in `.env.local`; the example uses `localhost:5432`.

To stop the database container and keep its data:

```bash
bun run db:local:down
```

To remove the container and permanently delete its local database volume:

```bash
docker compose down -v
```

## Connect to Supabase

Copy `.env.example` to `.env` and fill in the Supabase PostgreSQL connection string and a private Better Auth secret:

```bash
cp .env.example .env
```

Then choose an explicit Supabase command:

```bash
bun run dev
bun run db:migrate:supabase
bun run db:seed:supabase
bun run db:studio:supabase
```

These commands use `DATABASE_URL` from `.env`. The migration and seed commands change the Supabase database, so use them only when you intend to apply the checked-in migrations and initial data there.

## Database and migration scripts

| Script | What it does |
| --- | --- |
| `bun run db:local:up` | Starts the local PostgreSQL container. |
| `bun run db:local:down` | Stops the local container; keeps its data volume. |
| `bun run db:migrate:local` | Applies migrations to the database in `.env.local`. |
| `bun run db:migrate:supabase` | Applies migrations to the database in `.env` (Supabase). |
| `bun run db:seed:local` | Inserts initial departments and positions into the database in `.env.local`. |
| `bun run db:seed:supabase` | Inserts initial departments and positions into the database in `.env` (Supabase). |
| `bun run db:studio:local` | Opens Drizzle Studio connected to the local database. |
| `bun run db:studio:supabase` | Opens Drizzle Studio connected to Supabase. |
| `bun run dev:local` | Starts the API with `.env.local`. |
| `bun run dev` | Starts the API with `.env`. |
| `name=add_example bun run generate` | Generates a migration from the Drizzle schema; it does not apply it to a database. |

Generated migration files are stored in `supabase/migrations/`. To apply one, run the matching `db:migrate:*` command.
Run the matching `db:seed:*` command after migrating to insert the initial departments and positions. The seed is safe to rerun and generates IDs with CUID2.

## Environment files

- `.env.local` is for the local Docker database. Start from `.env.local.example`.
- `.env` is for Supabase. Start from `.env.example` and provide your own credentials.
- Do not commit either environment file. They are ignored by Git.

Always use the command whose name matches the database you intend to use: `:local` uses `.env.local`, while `:supabase` uses `.env`.
