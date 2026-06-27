# Hatsu

A game-tracking app. Search games from [IGDB](https://www.igdb.com/), add them to your
library, and track each one's status (Now Playing, Completed, Backlog, Dropped) and a 1–10 rating.

- **Backend** — ASP.NET Core Web API (.NET 8), EF Core + PostgreSQL, JWT auth, IGDB via Refit, Serilog.
- **Frontend** — React + Vite + TypeScript (Bun), with light/dark mode.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/)
- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (for PostgreSQL) — or a local Postgres instance
- A Twitch application for IGDB API access ([dev.twitch.tv](https://dev.twitch.tv/console/apps))

## Setup

### 1. Database

```bash
docker compose up -d
```

Starts PostgreSQL on `localhost:5432` (matches the default connection string).

### 2. Configuration

In `appsettings.json`, replace the placeholders:

- `Jwt:Key` — any random secret, at least 32 characters.
- `Igdb:ClientId` / `Igdb:ClientSecret` — your Twitch app's Client ID and Secret.

> Keep real secrets out of source control (e.g. use user-secrets or environment variables).

### 3. Backend

```bash
dotnet ef database update   # apply migrations
dotnet run                  # http://localhost:5246
```

### 4. Frontend

```bash
cd frontend
bun install
bun run dev                 # http://localhost:5173
```

The dev server proxies `/api` to the backend, so just open <http://localhost:5173>,
register an account, and start tracking.

## Project structure

```
.                 ASP.NET Core API
├── Controllers/      Auth, Games, Entries endpoints
├── Services/         business logic
├── Repositories/     EF Core data access
├── Models/           entities
├── Integrations/     IGDB (Refit) clients
├── Migrations/       EF Core migrations
└── frontend/         React + Vite app
```
