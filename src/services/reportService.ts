import { GuestStatus } from '@prisma/client';
import { prisma } from './prisma';
import { endOfTodayUtc, startOfTodayUtc } from '../utils/dateUtils';

export async function getReportData(start = startOfTodayUtc(), end = endOfTodayUtc()) {
  const guests = await prisma.guest.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: 'desc' },
  });
  const seated = guests.filter((guest) => guest.status === GuestStatus.SEATED);
  const waitedMs = seated
    .filter((guest) => guest.seatedAt)
    .map((guest) => guest.seatedAt!.getTime() - guest.waitlistAt.getTime());

  return {
    guests,
    totals: {
      total: guests.length,
      seated: seated.length,
      noShows: guests.filter((guest) => guest.status === GuestStatus.NO_SHOW).length,
      cancellations: guests.filter((guest) => guest.status === GuestStatus.CANCELLED).length,
      averageWaitMinutes: waitedMs.length
        ? Math.round(waitedMs.reduce((sum, value) => sum + value, 0) / waitedMs.length / 60_000)
        : 0,
    },
    auditLogs: await prisma.auditLog.findMany({
      where: { createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  };
}
