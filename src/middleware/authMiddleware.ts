import type { RequestHandler } from 'express';
import type { UserRole } from '@prisma/client';

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }
  next();
};

export function requireRole(roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user) {
      res.redirect('/login');
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).render('errors/403.njk');
      return;
    }
    next();
  };
}
