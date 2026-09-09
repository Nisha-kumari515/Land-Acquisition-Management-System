# BHOOMISETU Backend

Phase 2 database foundation for the BHOOMISETU Smart India Hackathon 2026 prototype.

BHOOMISETU is a modular Express.js monolith backed by PostgreSQL and PostGIS. The backend now includes the initial parcel-centric relational schema and synthetic demo seed data.

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
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://bhoomisetu:bhoomisetu_dev@localhost:5433/bhoomisetu?schema=public` |
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
npm run prisma:migrate -- --name init
npm run prisma:seed
npm start
```

The API is available at `http://localhost:3000`.

## Phase 3 APIs

Parcel endpoints:

- `GET /api/parcels?page=1&pageSize=20` lists parcels with optional `stateId`, `districtId`, `village`, and `ulpin` filters.
- `GET /api/parcels/:id` returns one parcel with its geography and owners.
- `POST /api/parcels` creates a parcel. Required fields: `stateId`, `districtId`, `village`, `area`, `sourceSystem`, and `sourceId`.
- `PATCH /api/parcels/:id` updates parcel metadata.
- `DELETE /api/parcels/:id` deletes a parcel that is not referenced by an acquisition project.

Project endpoints:

- `GET /api/projects?page=1&pageSize=20` lists projects with optional `stateId`, `districtId`, `status`, and `search` filters.
- `GET /api/projects/:id` returns one project with geography, creator, and affected-parcel count.
- `POST /api/projects` creates a project. Required fields: `code`, `name`, `department`, `stateId`, and `createdById`.
- `PATCH /api/projects/:id` updates project metadata.
- `DELETE /api/projects/:id` deletes a project and its project-parcel links.

GIS impact analysis:

- `POST /api/projects/:projectId/impact-analysis` accepts `{ "srid": 32646, "geometry": { ...GeoJSON Polygon or MultiPolygon... } }`.
- The endpoint validates the geometry and SRID, stores the project geometry, finds intersecting parcels with PostGIS, calculates affected area and percentage, and upserts project-parcel impact metrics.
- The current synthetic Assam seed data uses projected SRID `32646`; this is a prototype source CRS, not a national CRS assumption.

Example impact request using the seeded Assam geometry:

```bash
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/impact-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "srid": 32646,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[599800,2799700],[601600,2799700],[601600,2801200],[599800,2801200],[599800,2799700]]]
    }
  }'
```

## Phase 5 Acquisition Workflow

Acquisition stages advance in order: `PROPOSAL`, `SCRUTINY`, `SURVEY`, `NOTIFICATION`, `AWARD`, `COMPENSATION`, `POSSESSION`, `RR`, `COMPLETED`.

- `GET /api/acquisition/:parcelId` returns all acquisition cases for a parcel, including stage history, award, and compensation records.
- `PATCH /api/acquisition/:id/stage` changes one acquisition case stage. The request requires `newStage`, `changedById`, and an optional `remarks`.

Example:

```bash
curl -X PATCH http://localhost:3000/api/acquisition/CASE_ID/stage \
  -H "Content-Type: application/json" \
  -d '{"newStage":"NOTIFICATION","changedById":"USER_ID","remarks":"Survey completed and notification prepared."}'
```

Invalid or skipped stages return `409 INVALID_STAGE_TRANSITION`. Every valid transition updates the case, its project-parcel stage, and creates an immutable history record.

## Phase 6 Compensation

- `GET /api/compensation/:acquisitionCaseId` returns the compensation record for an acquisition case.
- `POST /api/compensation/:acquisitionCaseId` creates a record with `assessedAmount`, optional `approvedAmount`, `paidAmount`, `status`, and dates.
- `PATCH /api/compensation/:acquisitionCaseId` updates compensation amounts, status, and dates.

Supported statuses are `PENDING`, `ASSESSED`, `APPROVED`, `PARTIALLY_PAID`, `PAID`, and `ON_HOLD`. Amounts cannot be negative, paid amount cannot exceed the approved or assessed amount, and the project-parcel compensation status is synchronized on every write.

All successful responses use `{ success: true, data, message }`. Validation, duplicate, and missing-resource failures use a structured `{ success: false, error }` response. Authentication and RBAC will be added in a later phase; `createdById` is explicit until then.

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

## Database Credentials

The Compose development database uses these local-only credentials:

| Setting | Value |
| --- | --- |
| Host | `localhost` |
| Port | `5433` |
| Database | `bhoomisetu` |
| Username | `bhoomisetu` |
| Password | `bhoomisetu_dev` |

The backend container uses the internal database hostname `db` and port `5432`. These credentials are synthetic development values and must be replaced for any shared or production environment.

## Prisma

The Prisma schema contains states, districts, users and roles, projects, parcels, ownership, acquisition workflow, compensation, R&R, documents, risks, field verification, integrations, synchronization, and audit logging.

```bash
DATABASE_URL="postgresql://bhoomisetu:bhoomisetu_dev@localhost:5433/bhoomisetu?schema=public" npm run prisma:validate
DATABASE_URL="postgresql://bhoomisetu:bhoomisetu_dev@localhost:5433/bhoomisetu?schema=public" npm run prisma:generate
DATABASE_URL="postgresql://bhoomisetu:bhoomisetu_dev@localhost:5433/bhoomisetu?schema=public" npm run prisma:seed
```

To recreate the database and seed synthetic demo data:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
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
  schema.prisma          Canonical Phase 2 relational schema
  seed.js                Synthetic demo data loader
  migrations/             Versioned database migrations
docker-compose.yml       Backend and PostgreSQL/PostGIS services
Dockerfile               Backend image definition
```

All data in future demo seeds will be explicitly marked as synthetic prototype data and will not represent official government records.
