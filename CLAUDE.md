# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Bun + Elysia API, PostgreSQL via Drizzle ORM (postgres-js driver), authentication via Better Auth (email/password + `admin` plugin) using the Drizzle adapter. The database is either a local Docker Postgres or hosted Supabase Postgres.

## Commands

All scripts are run from the repo root with `bun run <script>`. The suffix decides which env file (and therefore which database) is used — `:local` → `.env.local` (Docker), no suffix / `:supabase` → `.env` (Supabase). Always pick the one matching the intended database; the `:supabase` migrate/seed commands modify the hosted DB.

- `dev:local` / `dev` — start the API (watch mode, `bun --filter app dev`) on `http://localhost:3001`
- `db:local:up` / `db:local:down` — start/stop the Docker Postgres container
- `db:migrate:local` / `db:migrate:supabase` — apply migrations
- `db:seed:local` / `db:seed:supabase` — idempotent seed of departments and positions (CUID2 IDs)
- `db:studio:local` / `db:studio:supabase` — Drizzle Studio
- `db:create-admin:local --email … --password … --first-name … --last-name … --department "<name>" --position "<name>"` — create an admin account. Public sign-up is disabled (`disableSignUp`), so this is the only way to create the first admin; all other users are created by admins via `POST /api/v1/user` or `POST /api/v1/user/import` (.xlsx, department/position given by name).
- `name=<migration_name> bun run generate` — generate a migration from `packages/db/schema.ts` into `supabase/migrations/` (does not apply it)

There are no test or lint scripts configured. OpenAPI docs are served by `@elysia/openapi` (default path `/openapi`).

## Layout and architecture

The repo is a Bun workspace: `app/` is the HTTP layer (its own `package.json`, started via `--filter app`), and `packages/` holds the shared layers it imports via relative paths (`../../packages/...`). Path aliases `@db` and `@infra` are defined in both `tsconfig.json` files and are used inside `packages/`.

Request flow: **router → service → repository → Drizzle**.

- `app/src/index.ts` — composes the Elysia app: OpenAPI, CORS, mounts `auth.handler` (Better Auth's own routes), then groups API routes under `/api/v1`. Order in the group matters: routes `.use()`d **before** `requireAuth` are public (`signInRoute`); everything after is protected.
- `app/src/middleware/require-auth.ts` — Elysia plugin with `as: 'scoped'` hooks; derives `authSession` from request headers via `auth.api.getSession` and throws `Errors.Unauthorized` when absent.
- `app/src/routers/*` — Elysia instances with `prefix` and OpenAPI `tags`; validation schemas live in `app/src/requests/*` (TypeBox `t`). `QueryPagingValidator` provides `page/perPage/orderBy/orderDirection` defaults.
- `app/src/service-di.ts` — manual DI: instantiates repositories and services once and exports the singletons routers use. New services/repos are wired here.
- `packages/services/*` — business logic classes taking dependencies via constructor. Convention: wrap in try/catch, rethrow `Errors.ApiError`, convert anything else to `Errors.InternalServerError`.
- `packages/repositories/*` — Drizzle queries; map DB rows to domain entities via `mapToEntity` (e.g. DB `isActive` → entity `status`). Paged lists return `PagingResult<T>` built with `buildPagingResult`.
- `packages/domains/` — `entities/` (domain types, paging/ordering types), `dto/`, `errors/` (`ApiError` subclasses carrying HTTP status + title, exported as the `Errors` namespace), `infra/config` (env vars validated with `requireEnv`; throws at import time if missing).
- `packages/auth/auth.ts` — Better Auth config. Users are not created through Better Auth: `UserRepository.createManyWithCredentials` inserts the `user` row plus a `credential` `account` row (password hashed with `(await auth.$context).password.hash`, wired in `service-di.ts`) so they can sign in normally. User `additionalFields` (`firstName`, `lastName`, `departmentId`, `positionId`) must stay in sync with the `user` table in `packages/db/schema.ts`.
- `packages/db/schema.ts` — single Drizzle schema (Better Auth tables + `department`, `position` with relations). After changing it, run `generate` then the matching `db:migrate:*`.

## Gotchas

- Port (`3001`) and CORS origin are hardcoded in `app/src/index.ts`; `config.PORT` / `config.FRONTEND_URL` are not used there yet.
- `packages/db/index.ts` and `drizzle.config.ts` call `dotenv` with `.env`, but because the scripts pass `--env-file`, already-set variables win — so `:local` scripts still use `.env.local`.
- The root `index.ts` is an unused Bun template stub.
- `dev`/`dev:local` use `--elide-lines`, which fails outside a real terminal; run `bun --env-file ../.env.local src/index.ts` from `app/` instead. The port is hardcoded to 3001, so check nothing else is already listening (e.g. a dev server on Supabase) before testing against it.
