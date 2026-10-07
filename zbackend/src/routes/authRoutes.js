import { Router } from 'express';
import { login, logout, me, register, updateProfile } from '../controllers/authController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', optionalAuth, me);
router.put('/profile', requireAuth, updateProfile);

export default router;