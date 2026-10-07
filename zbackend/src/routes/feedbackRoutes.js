import { Router } from 'express';
import { createFeedback, deleteFeedback, listFeedback } from '../controllers/feedbackController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listFeedback);
router.post('/', requireAuth, createFeedback);
router.delete('/:feedbackId', requireAuth, requireRole('admin'), deleteFeedback);

export default router;
