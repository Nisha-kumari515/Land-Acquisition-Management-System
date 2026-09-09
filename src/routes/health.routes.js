import { Router } from 'express';
import { checkDatabaseHealth } from '../config/database.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    const health = await checkDatabaseHealth();

    response.json({
      success: true,
      message: 'BHOOMISETU backend is running',
      ...health
    });
  } catch (error) {
    next(error);
  }
});

export default router;
