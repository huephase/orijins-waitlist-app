import { prisma } from './prisma';

export async function writeAuditLog(params: {
  action: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'DELETE';
  entity: 'Guest' | 'User';
  entityId: string;
  actorId?: string;
  metadata?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      actorId: params.actorId,
      metadata: params.metadata === undefined ? undefined : JSON.parse(JSON.stringify(params.metadata)),
    },
  });
}
