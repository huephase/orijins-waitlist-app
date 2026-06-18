export function sanitizeString(value: unknown, maxLength = 255): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export function sanitizeMultiline(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\r\n/g, '\n').slice(0, maxLength);
}

export function sanitizeEmail(value: unknown): string {
  return sanitizeString(value, 254).toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
