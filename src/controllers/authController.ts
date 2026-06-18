import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { verifyLogin } from '../services/authService';

export const showLogin: RequestHandler = (req, res) => {
  if (req.session.user) {
    res.redirect('/');
    return;
  }
  res.render('pages/login.njk');
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).render('pages/login.njk', { errors: errors.array() });
      return;
    }

    const user = await verifyLogin(req.body.email, req.body.password);
    if (!user) {
      res.status(401).render('pages/login.njk', { errors: [{ msg: 'Invalid email or password.' }] });
      return;
    }

    req.session.regenerate((error) => {
      if (error) {
        next(error);
        return;
      }
      req.session.user = user;
      res.redirect('/');
    });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }
    res.clearCookie('wl_session');
    res.redirect('/login');
  });
};
