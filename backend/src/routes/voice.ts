import { Router } from "express";
import { voiceController } from "../controllers/voiceController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/speak", requireAuth, voiceController.speak);
router.post("/stop", requireAuth, voiceController.stop);

export default router;
