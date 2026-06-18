import { Router } from 'express';
import { addUser, editUser, showAdmin } from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { userValidators } from '../middleware/sanitizeMiddleware';

export const adminRoutes = Router();

adminRoutes.get('/admin', requireAuth, requireRole(['SUPER_ADMIN']), showAdmin);
adminRoutes.post('/admin/users', requireAuth, requireRole(['SUPER_ADMIN']), userValidators, addUser);
adminRoutes.post('/admin/users/:id', requireAuth, requireRole(['SUPER_ADMIN']), userValidators, editUser);
