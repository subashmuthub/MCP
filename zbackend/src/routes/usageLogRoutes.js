import { Router } from 'express';
import { createUsageLog, deleteUsageLog, listUsageLogs, updateUsageLog } from '../controllers/usageLogController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listUsageLogs);
router.post('/', requireAuth, requireRole('admin', 'technician'), createUsageLog);
router.put('/:logId', requireAuth, requireRole('admin', 'technician'), updateUsageLog);
router.delete('/:logId', requireAuth, requireRole('admin'), deleteUsageLog);

export default router;
