import { Router } from 'express';
import * as citizenController from '../controllers/citizen.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Citizen routes require authentication as a CITIZEN role
router.use(requireAuth);
router.use(requireRole('CITIZEN'));

// Get acquisition status of a specific parcel (by ULPIN or DAG)
router.get('/parcel/:identifier/status', citizenController.getCitizenParcelStatus);

export default router;
