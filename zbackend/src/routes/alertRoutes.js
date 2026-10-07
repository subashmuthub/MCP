import { Router } from 'express';
import { createAlert, deleteAlert, listAlerts, resolveAlert, updateAlert } from '../controllers/alertController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listAlerts);
router.post('/', requireAuth, requireRole('admin'), createAlert);
router.put('/:alertId', requireAuth, requireRole('admin', 'technician'), updateAlert);
router.patch('/:alertId/resolve', requireAuth, requireRole('admin', 'technician'), resolveAlert);
router.delete('/:alertId', requireAuth, requireRole('admin'), deleteAlert);

export default router;
