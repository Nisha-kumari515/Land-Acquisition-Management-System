import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: 
 *                 type: string
 *               password: 
 *                 type: string
 *     responses:
 *       200: 
 *         description: JWT Token returned
 */
router.post('/login', validateBody(['email', 'password']), authController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: 
 *         description: User profile
 */
router.get('/me', requireAuth, authController.me);

export default router;
