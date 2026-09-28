import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { insightController } from '../controllers/insightController.js';

const router = Router();

router.get('/', requireAuth, insightController.getInsight);

export default router;
