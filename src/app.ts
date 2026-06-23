import path from 'node:path';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import csrf from 'csurf';
import nunjucks from 'nunjucks';
import { authRoutes } from './routes/authRoutes';
import { guestRoutes } from './routes/guestRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { reportRoutes } from './routes/reportRoutes';
import { createSessionMiddleware } from './middleware/sessionMiddleware';
import { templateMiddleware } from './middleware/templateMiddleware';

export function createApp() {
  const app = express();
  const csrfProtection = csrf();

  nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV !== 'production',
  });

  app.set('view engine', 'njk');
  app.set('views', path.join(__dirname, 'views'));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.resolve(process.cwd(), 'public')));
  app.use(createSessionMiddleware());
  app.use(csrfProtection);
  app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
  app.use(templateMiddleware);

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use(authRoutes);
  app.use(guestRoutes);
  app.use(adminRoutes);
  app.use(reportRoutes);

  app.use((_req, res) => res.status(404).render('errors/404.njk'));

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    console.error(error);
    if (error.code === 'EBADCSRFTOKEN') {
      res.status(403).render('errors/403.njk', { message: 'Your session expired. Please retry the action.' });
      return;
    }
    res.status(500).render('errors/500.njk');
  };
  app.use(errorHandler);

  return app;
}
