import { Router } from 'express';
import { addGuest, editGuest, setGuestStatus, showAddGuest, showEditGuest, showWaitlist, waitlistJson } from '../controllers/guestController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { guestValidators } from '../middleware/sanitizeMiddleware';

export const guestRoutes = Router();

guestRoutes.get('/', requireAuth, showWaitlist);
guestRoutes.get('/api/waitlist', requireAuth, waitlistJson);
guestRoutes.get('/guests/new', requireAuth, requireRole(['SUPER_ADMIN', 'HOST']), showAddGuest);
guestRoutes.post('/guests', requireAuth, requireRole(['SUPER_ADMIN', 'HOST']), guestValidators, addGuest);
guestRoutes.get('/guests/:id/edit', requireAuth, requireRole(['SUPER_ADMIN', 'HOST']), showEditGuest);
guestRoutes.post('/guests/:id', requireAuth, requireRole(['SUPER_ADMIN', 'HOST']), guestValidators, editGuest);
guestRoutes.post('/guests/:id/status/:status', requireAuth, requireRole(['SUPER_ADMIN', 'HOST']), setGuestStatus);
