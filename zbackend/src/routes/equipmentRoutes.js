import { Router } from 'express';
import { deleteEquipment, getEquipment, listEquipment, createEquipment, updateEquipment, importEquipment } from '../controllers/equipmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listEquipment);
router.get('/:equipmentId', requireAuth, getEquipment);
router.post('/', requireAuth, requireRole('admin'), createEquipment);
router.post('/import', requireAuth, requireRole('admin'), importEquipment);
router.put('/:equipmentId', requireAuth, requireRole('admin', 'technician'), updateEquipment);
router.delete('/:equipmentId', requireAuth, requireRole('admin'), deleteEquipment);

export default router;
