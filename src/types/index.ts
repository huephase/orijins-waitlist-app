import type { UserRole } from '@prisma/client';

export interface AppConfig {
  app: {
    name: string;
    timezone_display: string;
    timezone_storage: string;
  };
  colors: Record<string, string>;
  waitlist: {
    warning_minutes_before: number;
    default_seating_mode: 'minutes' | 'specific';
    polling_interval_ms: number;
    max_party_size: number;
  };
  scheduler: {
    daily_report_cron: string;
    daily_report_time_utc: string;
  };
  og_meta: {
    title: string;
    description: string;
    image: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    google_fonts_url: string;
  };
}

export interface SessionUser {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
    seatingMode?: 'minutes' | 'specific';
  }
}

declare global {
  // Express augments request/response types through this namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      config: AppConfig;
      appName: string;
      currentYear: number;
      user?: SessionUser;
      csrfToken?: string;
      cssVariables: string;
      partySizeOptions: number[];
      timeHourOptions: number[];
      timeMinuteOptions: string[];
    }
  }
}
