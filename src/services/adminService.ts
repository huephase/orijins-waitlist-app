import bcrypt from 'bcrypt';
import type { UserRole } from '@prisma/client';
import { prisma } from './prisma';
import { writeAuditLog } from './auditService';
import { sanitizeEmail, sanitizeString } from '../utils/sanitize';

export async function listUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  actorId: string;
}) {
  const user = await prisma.user.create({
    data: {
      name: sanitizeString(input.name, 100),
      email: sanitizeEmail(input.email),
      role: input.role,
      passwordHash: await bcrypt.hash(input.password, 12),
    },
  });
  await writeAuditLog({ action: 'CREATE', entity: 'User', entityId: user.id, actorId: input.actorId });
  return user;
}

export async function updateUser(
  id: string,
  input: { name: string; email: string; role: UserRole; password?: string; isActive?: boolean; actorId: string },
) {
  const before = await prisma.user.findUniqueOrThrow({ where: { id } });
  const after = await prisma.user.update({
    where: { id },
    data: {
      name: sanitizeString(input.name, 100),
      email: sanitizeEmail(input.email),
      role: input.role,
      isActive: input.isActive ?? true,
      ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 12) } : {}),
    },
  });
  await writeAuditLog({
    action: 'UPDATE',
    entity: 'User',
    entityId: id,
    actorId: input.actorId,
    metadata: { before, after },
  });
  return after;
}
