import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuditLogModel } from '../models/DocumentAndAudit';

export async function listAuditLogs(req: AuthRequest, res: Response) {
  try {
    const { action, recordId, documentId, userId, limit = 100, page = 1 } = req.query;
    const query: any = {};

    if (action) query.action = action;
    if (recordId) query.recordId = recordId;
    if (documentId) query.documentId = documentId;
    if (userId) query['performedBy.userId'] = userId;

    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AuditLogModel.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AuditLogModel.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
