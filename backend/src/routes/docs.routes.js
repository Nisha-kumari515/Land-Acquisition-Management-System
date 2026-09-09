import { Router } from 'express';
import * as docsController from '../controllers/docs.controller.js';

const router = Router();

router.get('/', docsController.getDocs);

export default router;
