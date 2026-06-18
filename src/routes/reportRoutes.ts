import { Router } from 'express';
import { showReports } from '../controllers/reportController';
import { requireAuth } from '../middleware/authMiddleware';

export const reportRoutes = Router();

reportRoutes.get('/reports', requireAuth, showReports);
