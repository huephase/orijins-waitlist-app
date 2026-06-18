import type { GuestStatus } from '@prisma/client';

export type RowColorStatus =
  | 'default'
  | 'upcoming'
  | 'now'
  | 'overdue'
  | 'seated'
  | 'noshow'
  | 'cancelled';

export function getColorStatus(
  status: GuestStatus,
  scheduledSeatAt: Date,
  warningMinutes: number,
  now = new Date(),
): RowColorStatus {
  if (status === 'SEATED') return 'seated';
  if (status === 'NO_SHOW') return 'noshow';
  if (status === 'CANCELLED') return 'cancelled';

  const diffMs = scheduledSeatAt.getTime() - now.getTime();
  const warningMs = warningMinutes * 60 * 1000;
  if (Math.abs(diffMs) <= 30_000) return 'now';
  if (diffMs < 0) return 'overdue';
  if (diffMs <= warningMs) return 'upcoming';
  return 'default';
}
