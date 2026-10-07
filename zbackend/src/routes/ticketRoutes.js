import { Router } from 'express';
import { createTicket, deleteTicket, listTickets, updateTicket } from '../controllers/ticketController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', requireAuth, listTickets);
router.post('/', requireAuth, requireRole('admin'), createTicket);
router.put('/:ticketId', requireAuth, requireRole('admin', 'technician'), updateTicket);
router.delete('/:ticketId', requireAuth, requireRole('admin'), deleteTicket);

export default router;
