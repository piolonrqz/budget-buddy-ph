import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(data: {
    userId: string;
    entityType: string;
    entityId: string;
    action: AuditAction;
    payloadBefore?: any;
    payloadAfter?: any;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        userId: data.userId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        payloadBefore: data.payloadBefore !== undefined ? data.payloadBefore : null,
        payloadAfter: data.payloadAfter !== undefined ? data.payloadAfter : null,
      },
    });
  }
}
