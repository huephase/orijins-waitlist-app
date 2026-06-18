import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, showLogin } from '../controllers/authController';
import { loginValidators } from '../middleware/sanitizeMiddleware';

export const authRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

authRoutes.get('/login', showLogin);
authRoutes.post('/login', loginLimiter, loginValidators, login);
authRoutes.post('/logout', logout);
authRoutes.get('/auth/google', (_req, res) => res.status(404).render('errors/404.njk'));
