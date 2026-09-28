import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { exportController } from '../controllers/exportController.js';

const router = Router();

router.get('/csv', requireAuth, exportController.exportWorkoutCSV);
router.get('/nutrition-csv', requireAuth, exportController.exportNutritionCSV);
router.get('/weight-csv', requireAuth, exportController.exportWeightCSV);

export default router;
