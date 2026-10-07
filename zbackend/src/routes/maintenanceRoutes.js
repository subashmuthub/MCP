import { Router } from 'express';
import { createMaintenanceRecord, deleteMaintenanceRecord, listMaintenanceRecords, updateMaintenanceRecord } from '../controllers/maintenanceController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listMaintenanceRecords);
router.post('/', requireAuth, requireRole('admin', 'technician'), createMaintenanceRecord);
router.put('/:recordId', requireAuth, requireRole('admin', 'technician'), updateMaintenanceRecord);
router.delete('/:recordId', requireAuth, requireRole('admin'), deleteMaintenanceRecord);

export default router;