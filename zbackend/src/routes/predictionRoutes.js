import { Router } from 'express';
import { predictRisk, listPredictions, predictionStatus } from '../controllers/predictionController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listPredictions);
router.get('/status', requireAuth, predictionStatus);
router.post('/:equipmentId/predict', requireAuth, requireRole('admin', 'technician'), predictRisk);

export default router;
