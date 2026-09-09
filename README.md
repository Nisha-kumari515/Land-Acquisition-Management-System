# BHOOMISETU

One Parcel. One Digital Story. One National Acquisition View.

This repository is organized as a small monorepo:

```text
backend/   Express.js, Prisma, PostgreSQL/PostGIS API
frontend/  Future React client application
```

## Backend

Phase 1 is implemented in [`backend/`](backend/). It includes the Express server, Prisma configuration, PostgreSQL/PostGIS Docker setup, and the database-backed health endpoint.

Start it from the backend directory:

```bash
cd backend
cp .env.example .env
npm install
docker compose up --build
```

The API health check is available at `http://localhost:3000/api/health`.

See [`backend/README.md`](backend/README.md) for backend-specific setup details.

## Frontend

The [`frontend/`](frontend/) directory is reserved for the React client. Frontend implementation will begin after the backend data model and APIs are established.

All current demo data and future seed data are synthetic prototype data, not official government records.