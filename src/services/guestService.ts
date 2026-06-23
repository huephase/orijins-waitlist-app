import type { GuestStatus, Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { writeAuditLog } from './auditService';
import { scheduledFromMinutes, scheduledFromUaeTime } from '../utils/dateUtils';
import { sanitizeEmail, sanitizeMultiline, sanitizeString } from '../utils/sanitize';

export interface GuestFormInput {
  name: string;
  partySize: number;
  phonePrefix?: string;
  phoneNumber?: string;
  email?: string;
  tableNumber?: string;
  specialNotes?: string;
  seatingMode: 'minutes' | 'specific';
  minutesFromNow?: number;
  scheduledTime?: string;
}

function scheduledSeatAtFromInput(input: GuestFormInput): Date {
  if (input.seatingMode === 'specific' && input.scheduledTime) {
    return scheduledFromUaeTime(input.scheduledTime);
  }
  return scheduledFromMinutes(Number(input.minutesFromNow ?? 0));
}

function normalizeGuestData(input: GuestFormInput) {
  const phonePrefix = input.phonePrefix ? sanitizeString(input.phonePrefix, 3) : '';
  const phoneNumber = input.phoneNumber ? sanitizeString(input.phoneNumber, 30) : '';
  return {
    name: sanitizeString(input.name, 100),
    partySize: Number(input.partySize),
    phoneNumber: phonePrefix || phoneNumber ? `${phonePrefix}${phoneNumber}` : null,
    email: input.email ? sanitizeEmail(input.email) : null,
    tableNumber: input.tableNumber ? sanitizeString(input.tableNumber, 30) : null,
    specialNotes: input.specialNotes ? sanitizeMultiline(input.specialNotes, 500) : null,
    scheduledSeatAt: scheduledSeatAtFromInput(input),
  };
}

export async function listGuests() {
  return prisma.guest.findMany({
    orderBy: [{ status: 'asc' }, { scheduledSeatAt: 'asc' }],
    include: { addedBy: true, updatedBy: true },
  });
}

export async function getGuest(id: string) {
  return prisma.guest.findUnique({ where: { id } });
}

export async function createGuest(input: GuestFormInput, actorId: string) {
  const guest = await prisma.guest.create({
    data: {
      ...normalizeGuestData(input),
      addedById: actorId,
    },
  });
  await writeAuditLog({ action: 'CREATE', entity: 'Guest', entityId: guest.id, actorId, metadata: guest });
  return guest;
}

export async function updateGuest(id: string, input: GuestFormInput, actorId: string) {
  const before = await prisma.guest.findUniqueOrThrow({ where: { id } });
  if (before.status !== 'WAITING') {
    throw new Error('Only waiting guests can be edited.');
  }

  const after = await prisma.guest.update({
    where: { id },
    data: {
      ...normalizeGuestData(input),
      updatedById: actorId,
    },
  });
  await writeAuditLog({
    action: 'UPDATE',
    entity: 'Guest',
    entityId: id,
    actorId,
    metadata: { before, after },
  });
  return after;
}

export async function changeGuestStatus(id: string, status: GuestStatus, actorId: string) {
  const before = await prisma.guest.findUniqueOrThrow({ where: { id } });
  const now = new Date();
  const data: Prisma.GuestUpdateInput = {
    status,
    updatedBy: { connect: { id: actorId } },
  };

  if (status === 'SEATED') data.seatedAt = now;
  if (status === 'NO_SHOW' || status === 'CANCELLED') data.resolvedAt = now;

  const after = await prisma.guest.update({ where: { id }, data });
  await writeAuditLog({
    action: 'STATUS_CHANGE',
    entity: 'Guest',
    entityId: id,
    actorId,
    metadata: { before, after },
  });
  return after;
}
