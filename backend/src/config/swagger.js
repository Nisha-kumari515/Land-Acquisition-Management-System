import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BHOOMISETU API',
    version: '1.0.0',
    description: 'API documentation for the BHOOMISETU Land Acquisition Management System. Provides endpoints for project management, cadastral GIS operations, compensation mapping, and risk analysis.'
  },
  servers: [{ url: 'http://localhost:3000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': { post: { tags: ['Auth'], summary: 'Login' } },
    '/auth/me': { get: { tags: ['Auth'], summary: 'Get current user' } },
    '/projects': { 
      get: { tags: ['Projects'], summary: 'List projects' },
      post: { tags: ['Projects'], summary: 'Create project' } 
    },
    '/projects/{id}': { 
      get: { tags: ['Projects'], summary: 'Get project' },
      patch: { tags: ['Projects'], summary: 'Update project' },
      delete: { tags: ['Projects'], summary: 'Delete project' }
    },
    '/projects/{id}/analyze-impact': { post: { tags: ['GIS'], summary: 'Analyze spatial impact' } },
    '/parcels': { get: { tags: ['Parcels'], summary: 'List parcels' } },
    '/parcels/{id}': { get: { tags: ['Parcels'], summary: 'Get parcel details' } },
    '/map/parcels': { get: { tags: ['Map'], summary: 'Get vector tiles for parcels' } },
    '/risks/evaluate': { post: { tags: ['Risk Engine'], summary: 'Evaluate land risk' } },
    '/rr/families': { get: { tags: ['Rehabilitation'], summary: 'List affected families' } },
    '/compensation/awards': { get: { tags: ['Compensation'], summary: 'List compensation awards' } },
    '/documents': { post: { tags: ['Documents'], summary: 'Upload document' } },
    '/field-verifications': { get: { tags: ['Field Verification'], summary: 'List field tasks' } },
    '/integrations/assam/sync': { post: { tags: ['Integrations'], summary: 'Sync Assam data' } },
    '/dashboard/national': { get: { tags: ['Dashboards'], summary: 'National metrics' } }
  }
};
