import { body } from 'express-validator';
import { loadConfig } from '../config/loadConfig';
import { sanitizeEmail, sanitizeMultiline, sanitizeString } from '../utils/sanitize';

const config = loadConfig();

export const loginValidators = [
  body('email').customSanitizer(sanitizeEmail).isEmail().withMessage('Enter a valid email.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
];

export const guestValidators = [
  body('name')
    .customSanitizer((value) => sanitizeString(value, 100))
    .isLength({ min: 1, max: 100 })
    .withMessage('Guest name is required.'),
  body('partySize')
    .toInt()
    .isInt({ min: 1, max: config.waitlist.max_party_size })
    .withMessage(`Party size must be between 1 and ${config.waitlist.max_party_size}.`),
  body('phonePrefix').optional({ values: 'falsy' }).isIn(config.phone_prefixes),
  body('phoneNumber').optional({ values: 'falsy' }).customSanitizer((value) => sanitizeString(value, 30)),
  body('email').optional({ values: 'falsy' }).customSanitizer(sanitizeEmail).isEmail(),
  body('tableNumber').optional({ values: 'falsy' }).customSanitizer((value) => sanitizeString(value, 30)),
  body('specialNotes').optional({ values: 'falsy' }).customSanitizer((value) => sanitizeMultiline(value)),
  body('seatingMode').isIn(['minutes', 'specific']),
  body('minutesFromNow').optional({ values: 'falsy' }).toInt().isInt({ min: 0, max: 1440 }),
  body('scheduledTime').optional({ values: 'falsy' }).matches(/^\d{2}:\d{2}$/),
];

export const userValidators = [
  body('name').customSanitizer((value) => sanitizeString(value, 100)).isLength({ min: 1 }),
  body('email').customSanitizer(sanitizeEmail).isEmail(),
  body('role').isIn(['SUPER_ADMIN', 'HOST', 'VIEWER']),
  body('password').optional({ values: 'falsy' }).isLength({ min: 8 }),
];
