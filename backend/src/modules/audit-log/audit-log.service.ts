import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RECALCULATE = 'recalculate'
}

@Injectable()
export class AuditLogService {
  constructor(private readonly supabase: SupabaseService) {}

  async logEvent(data: {
    userId: string;
    entityType: string;
    entityId: string;
    action: AuditAction | string;
    payloadBefore?: any;
    payloadAfter?: any;
  }) {
    const { data: event, error } = await this.supabase.getClient()
      .from('audit_events')
      .insert({
        user_id: data.userId,
        entity_type: data.entityType,
        entity_id: data.entityId,
        action: data.action,
        payload_before: data.payloadBefore !== undefined ? data.payloadBefore : null,
        payload_after: data.payloadAfter !== undefined ? data.payloadAfter : null,
      })
      .select('*')
      .single();
      
    if (error) {
       console.error("Failed to log audit event:", error);
    }
    
    return event;
  }
}
