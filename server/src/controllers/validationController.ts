import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ValidationResultModel } from '../models/DocumentAndAudit';
import { LandRecord } from '../models/LandRecord';
import { validationEngine } from '../services/validation/ValidationEngine';
import { AuditService } from '../services/audit/AuditService';

export async function validateRecordManually(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const record = await LandRecord.findOne({ recordId: id });
    if (!record) {
      return res.status(404).json({ error: 'Land record not found' });
    }

    const existingRecords = await LandRecord.find({ _id: { $ne: record._id } }).lean();
    const result = validationEngine.validateRecord(record.toObject() as any, {
      existingRecords: existingRecords as any,
    });

    record.validationStatus = result.overallStatus;
    await record.save();

    await ValidationResultModel.findOneAndUpdate({ recordId: id }, result, {
      upsert: true,
      new: true,
    });

    await AuditService.log({
      recordId: id,
      documentId: record.documentId,
      action: 'VALIDATION_STARTED',
      performedBy: {
        userId: req.user?.id || 'officer-id',
        name: req.user?.name || 'Revenue Officer',
        role: req.user?.role || 'verification_officer',
        email: req.user?.email || 'officer@bhoomi.gov.in',
      },
      details: `Manual re-validation triggered. Result: ${result.overallStatus.toUpperCase()} (Score: ${result.validationScore}/100)`,
    });

    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getValidationResult(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const result = await ValidationResultModel.findOne({ recordId: id });
    if (!result) {
      return res.status(404).json({ error: 'Validation result not found for this record' });
    }

    const record = await LandRecord.findOne({ recordId: id });
    res.json({ result, record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function listValidationResults(req: AuthRequest, res: Response) {
  try {
    const { status, minScore, maxScore } = req.query;
    const query: any = {};

    if (status) query.overallStatus = status;
    if (minScore || maxScore) {
      query.validationScore = {};
      if (minScore) query.validationScore.$gte = Number(minScore);
      if (maxScore) query.validationScore.$lte = Number(maxScore);
    }

    const results = await ValidationResultModel.find(query).sort({ executedAt: -1 }).limit(100);
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCrossRecordConflicts(req: AuthRequest, res: Response) {
  try {
    const allResults = await ValidationResultModel.find({
      'crossRecordConflicts.0': { $exists: true },
    }).lean();

    const conflicts = allResults.flatMap((r) =>
      r.crossRecordConflicts.map((c) => ({
        ...c,
        sourceRecordId: r.recordId,
        validationScore: r.validationScore,
      }))
    );

    res.json({ conflicts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
