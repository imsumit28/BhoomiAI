import { AuditLogModel } from '../../models/DocumentAndAudit';
import { AuditAction, AuditLog, UserRole } from '../../../../shared/types';

export interface RecordAuditParams {
  recordId?: string;
  documentId?: string;
  action: AuditAction;
  performedBy: {
    userId: string;
    name: string;
    role: UserRole;
    email: string;
  };
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  details?: string;
  ipAddress?: string;
}

export class AuditService {
  public static async log(params: RecordAuditParams): Promise<AuditLog> {
    const logId = `AUD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const entry = await AuditLogModel.create({
      logId,
      recordId: params.recordId,
      documentId: params.documentId,
      action: params.action,
      performedBy: params.performedBy,
      fieldChanged: params.fieldChanged,
      oldValue: params.oldValue,
      newValue: params.newValue,
      reason: params.reason,
      details: params.details,
      ipAddress: params.ipAddress || '10.24.118.52',
      timestamp: new Date().toISOString(),
    });

    return entry.toObject();
  }

  public static async getLogsForRecord(recordId: string): Promise<AuditLog[]> {
    const logs = await AuditLogModel.find({ recordId }).sort({ timestamp: -1 }).lean();
    return logs as unknown as AuditLog[];
  }

  public static async getRecentLogs(limit = 50): Promise<AuditLog[]> {
    const logs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(limit).lean();
    return logs as unknown as AuditLog[];
  }
}
