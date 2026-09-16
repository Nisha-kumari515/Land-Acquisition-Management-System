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

## Phase 7 Rehabilitation & Resettlement

- `GET /api/rr/families` lists families with optional `projectParcelId`, `status`, and `eligible` filters.
- `GET /api/rr/families/:id` returns one family with its entitlements and parcel context.
- `POST /api/rr/families` creates a family using `projectParcelId`, `familyReference`, and `membersCount`.
- `PATCH /api/rr/families/:id` updates eligibility, status, member count, and `resettlementProgress` from 0 to 100.
- `POST /api/rr/families/:familyId/entitlements` creates an entitlement.
- `PATCH /api/rr/entitlements/:id` updates an entitlement amount or status.

Family writes synchronize the project-parcel `rrStatus`. Entitlement amounts cannot be negative.

## Phase 8 Explainable Risk Engine

- `GET /api/risks` lists persisted risk alerts, with optional filters for `projectId`, `projectParcelId`, and `level`.
- `GET /api/risks/projects/:projectId` returns the project-level risk summary and per-parcel evaluation with score, level, reasons, and recommended action.
- `POST /api/risks/evaluate` evaluates a parcel using `{ "projectParcelId": "..." }`.
- `POST /api/risks/project-parcels/:projectParcelId/evaluate` evaluates a single project-parcel relationship via URL parameter.

The deterministic risk model uses explainable business rules:

- compensation pending for more than 60 days → HIGH contribution
- multiple ownership records → MEDIUM contribution
- acquisition milestone overdue beyond 90 days → HIGH contribution
- pending RR or objection review → MEDIUM/HIGH contribution
- reasons are returned as plain strings and are stored in the `RiskAlert.reasons` JSON field

Risk scores are normalized to 0-100, mapped to `LOW`, `MEDIUM`, or `HIGH`, and saved back to the parcel’s `riskLevel` field and the `RiskAlert` table.

## Phase 9 Dashboard APIs

- `GET /api/dashboard/overview` returns high-level portfolio metrics: total projects, active projects, parcel counts, pending compensation/RR, and high-risk alert totals.
- `GET /api/dashboard/projects` returns a project summary with parcel counts, stage mix, and risk distribution across project parcels.

These endpoints are designed for executive monitoring and provide a lightweight, deterministic operational snapshot without requiring a separate analytics service.

## Phase 10 Assam Integration Architecture

- `GET /api/integrations` lists registered external data sources.
- `GET /api/integrations/:id` returns one integration with its recent sync history.
- `POST /api/integrations` creates a source registration using `name` and optional `description`.
- `GET /api/integrations/:id/sync-logs` lists recent sync events for a configured source.
- `POST /api/integrations/:id/sync` records a sync execution event and captures the source snapshot metadata.

The design is intentionally simple and explainable: integration metadata sits in `DataSource`, synchronization execution sits in `SyncLog`, and the application remains decoupled from vendor-specific connectors until a later phase introduces edge adapters or webhooks.

## Phase 11 Authentication & RBAC

- `POST /api/auth/login` authenticates a seeded demo user and returns a JWT.
- `GET /api/auth/me` returns the currently authenticated user profile using the bearer token.
- `requireAuth` validates the JWT on protected routes.
- `requireRole(...)` enforces role-based access checks for future admin/field/finance workflows.

The seeded demo credentials are:

- `admin@bhoomisetu.demo` / `demo-admin-password`
- `kamrup.officer@bhoomisetu.demo` / `demo-officer-password`
- `field.assam@bhoomisetu.demo` / `demo-field-password`

This is a lightweight, prototype-level auth layer built for the hackathon flow and is not a production-grade identity provider.

## Phase 12 Audit Middleware

- `GET /api/audit` lists audit entries, with optional `entity`, `userId`, and `limit` filters.
- `GET /api/audit/:entity/:entityId` fetches the log trail for a given entity record.
- Request-level actions are automatically logged by middleware for API calls, including method, path, status, elapsed time, and request payload metadata.
- Audit events are stored in the `AuditLog` table so the application remains traceable for key workflow actions.

This phase provides transparent operational traceability without introducing a separate event bus or analytics pipeline.

## Phase 13 Automated Tests & API Documentation

- `npm run test:api` runs a lightweight smoke test suite that validates health, login, and docs endpoints.
- `GET /api/docs` exposes a machine-readable endpoint catalog for the implemented BHOOMISETU API surface.
- The smoke tests launch the backend on a temporary port, run a few real requests, and assert expected responses.

This phase gives the prototype a reliable verification path while keeping the implementation lightweight and easy to extend.

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
