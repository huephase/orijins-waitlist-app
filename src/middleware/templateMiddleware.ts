import type { RequestHandler } from 'express';
import { buildCssVariables, loadConfig } from '../config/loadConfig';

const config = loadConfig();
const cssVariables = buildCssVariables(config);
const partySizeOptions = Array.from({ length: config.waitlist.max_party_size }, (_, index) => index + 1);
const phonePrefixOptions = config.phone_prefixes;
const timeHourOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const timeMinuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

export const templateMiddleware: RequestHandler = (req, res, next) => {
  res.locals.config = config;
  res.locals.appName = config.app.name;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.user = req.session.user;
  res.locals.cssVariables = cssVariables;
  res.locals.partySizeOptions = partySizeOptions;
  res.locals.phonePrefixOptions = phonePrefixOptions;
  res.locals.timeHourOptions = timeHourOptions;
  res.locals.timeMinuteOptions = timeMinuteOptions;
  next();
};
