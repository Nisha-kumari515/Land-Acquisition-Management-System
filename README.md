# BHOOMISETU Backend

Phase 1 foundation for the BHOOMISETU Smart India Hackathon 2026 prototype.

BHOOMISETU is a modular Express.js monolith backed by PostgreSQL and PostGIS. This phase intentionally contains only the runtime foundation and database health check. Business modules will be added in later phases.

## Stack

- Node.js 22+
- JavaScript ES modules
- Express.js
- PostgreSQL 16 with PostGIS 3.4
- Prisma ORM
- Docker Compose

## Environment

Copy the example file and adjust values when needed:

```bash
cp .env.example .env
```

Variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | local Compose-compatible URL |
| `CORS_ORIGIN` | Allowed browser origin | `http://localhost:3000` |

Do not commit `.env` or real credentials.

## Run Locally

Start only PostgreSQL/PostGIS with Docker:

```bash
docker compose up -d db
```

Install dependencies, generate Prisma Client, and start the API:

```bash
npm install
npm run prisma:generate
npm start
```

The API is available at `http://localhost:3000`.

## Run Everything With Docker

```bash
docker compose up --build
```

The backend container waits for the database health check before starting.

## Health Check

`GET /api/health`

The route runs a PostgreSQL query and a PostGIS version query. A healthy response is:

```json
{
  "success": true,
  "message": "BHOOMISETU backend is running",
  "database": "connected",
  "postgis": "available"
}
```

## Prisma

The initial Prisma schema contains the PostgreSQL datasource and client generator only. Domain models and migrations belong to Phase 2.

```bash
DATABASE_URL="postgresql://bhoomisetu:bhoomisetu_dev@localhost:5433/bhoomisetu?schema=public" npm run prisma:validate
DATABASE_URL="postgresql://bhoomisetu:bhoomisetu_dev@localhost:5433/bhoomisetu?schema=public" npm run prisma:generate
```

## Project Layout

```text
src/
  app.js                 Express application
  server.js              HTTP server lifecycle
  config/
    env.js               Environment validation
    database.js          Prisma client and health queries
  middleware/
    error.middleware.js  Centralized error response
  routes/
    index.js             API route registration
    health.routes.js     Database/PostGIS health endpoint
prisma/
  schema.prisma          Initial Prisma configuration
docker-compose.yml       Backend and PostgreSQL/PostGIS services
Dockerfile               Backend image definition
```

All data in future demo seeds will be explicitly marked as synthetic prototype data and will not represent official government records.
