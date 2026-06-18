import session from 'express-session';
import pgSession from 'connect-pg-simple';
import pg from 'pg';

const PgSession = pgSession(session);

export function createSessionMiddleware() {
  const maxAge = Number(process.env.SESSION_MAX_AGE_MS ?? 86_400_000);
  const isProduction = process.env.NODE_ENV === 'production';

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return session({
    name: 'wl_session',
    secret: process.env.SESSION_SECRET ?? 'dev-only-replace-me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: new PgSession({
      pool,
      tableName: 'Session',
      pruneSessionInterval: 60 * 15,
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge,
    },
  });
}
