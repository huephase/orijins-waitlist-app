const UAE_TIME_ZONE = 'Asia/Dubai';

export function formatUaeDateTime(date?: Date | string | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: UAE_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

export function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function endOfTodayUtc(): Date {
  const start = startOfTodayUtc();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function scheduledFromMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function scheduledFromUaeTime(hhmm: string): Date {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const now = new Date();
  const uaeParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: UAE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(uaeParts.find((part) => part.type === type)?.value);
  const utcMs = Date.UTC(get('year'), get('month') - 1, get('day'), hours - 4, minutes, 0);
  const scheduled = new Date(utcMs);
  if (scheduled.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 2 * 60 * 1000);
  }
  return scheduled;
}
