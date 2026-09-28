import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { badgeController } from '../controllers/badgeController.js';

const router = Router();

router.get('/', requireAuth, badgeController.getBadges);

export default router;
