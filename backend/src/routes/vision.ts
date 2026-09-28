import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { visionController } from '../controllers/visionController.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────────────────────────────────────────

const analyzeSchema = z.object({
  imageBase64: z.string().min(100, 'Image data is required'),
  mimeType: z
    .enum(['image/jpeg', 'image/png', 'image/webp'] as const)
    .default('image/jpeg'),
});

const estimateTextSchema = z.object({
  description: z.string().min(2, 'Please describe what you ate'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

router.post('/analyze', requireAuth, validate(analyzeSchema), visionController.analyzeImage);
router.post('/estimate-text', requireAuth, validate(estimateTextSchema), visionController.estimateText);
router.get('/barcode/:code', requireAuth, visionController.lookupBarcode);

export default router;
router.get('/search-food', requireAuth, visionController.searchFoodProxy);
