import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import type { UserRole } from '@prisma/client';
import { createUser, listUsers, updateUser } from '../services/adminService';

export const showAdmin: RequestHandler = async (_req, res, next) => {
  try {
    res.render('pages/admin.njk', { users: await listUsers() });
  } catch (error) {
    next(error);
  }
};

export const addUser: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).render('pages/admin.njk', { users: await listUsers(), errors: errors.array() });
      return;
    }
    await createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role as UserRole,
      actorId: req.session.user!.userId,
    });
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};

export const editUser: RequestHandler = async (req, res, next) => {
  try {
    await updateUser(String(req.params.id), {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role as UserRole,
      password: req.body.password || undefined,
      isActive: req.body.isActive === 'on',
      actorId: req.session.user!.userId,
    });
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};
