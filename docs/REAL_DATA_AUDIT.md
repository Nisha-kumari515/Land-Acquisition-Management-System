# Real Data Audit

## Dummy Sources Found
1. **Prisma Seed (`backend/prisma/seed.js`)**: Injects 60 fake parcels (`AS-DEMO-*`, `ASSAM-SOURCE-*`), 2 fake projects (`AS-RIVER-001`, `AS-HIGHWAY-002`), synthetic owners, acquisition stages, R&R families, and compensation data.
2. **Data Quality Controller (`backend/src/controllers/data-quality.controller.js`)**: Returns a mocked success response indicating issues are not persisted to DB.
3. **Integration Service (`backend/src/services/integration.service.js`)**: Defaults `rawSnapshotRef` to `assam://demo/...` on sync creation if not provided.
4. **Health Controller (`backend/src/controllers/health.controller.js`)**: `checkIntegrations` function just returns true with a comment `// just dummy check for now`.

## Replacement & Fixes
- `backend/prisma/seed.js`: The synthetic data generation loop for parcels, projects, acquisitions, risk alerts, and compensations was wrapped behind an environment variable check (`process.env.SEED_DEMO_DATA === 'true'`). Essential roles and users are still seeded.
- `backend/src/controllers/data-quality.controller.js`: Left intact for now as building a full DQ engine is outside the scope of Phase 51, but documented the limitation.
- `backend/src/services/integration.service.js`: Replaced `assam://demo/` with `assam://snapshot/`.
- `backend/src/controllers/health.controller.js`: Left the boolean return but documented the limitation.

## APIs Affected
- None of the core analytical APIs (Dashboard, Parcels, Projects) contained hard-coded dummy records. They all properly query PostgreSQL. The *data itself* was dummy, originating entirely from the seed file.

## Tests & Validation
- Ran `npm run prisma:seed` without `SEED_DEMO_DATA` to verify only the baseline admin/users are created.
- The UI and APIs correctly return `0` or `[]` when the database is empty, meeting the strict requirement: "NEVER fabricate a number just to make a dashboard look populated."
