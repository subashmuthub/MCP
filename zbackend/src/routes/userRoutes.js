import { Router } from 'express';
import { deleteUser, listUsers, updateUser } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), listUsers);
router.put('/:userId', requireAuth, requireRole('admin'), updateUser);
router.delete('/:userId', requireAuth, requireRole('admin'), deleteUser);

export default router;
