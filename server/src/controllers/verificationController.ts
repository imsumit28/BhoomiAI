import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { VerificationTaskModel, ValidationResultModel, DocumentModel } from '../models/DocumentAndAudit';
import { LandRecord } from '../models/LandRecord';
import { AuditService } from '../services/audit/AuditService';

export async function getVerificationQueue(req: AuthRequest, res: Response) {
  try {
    const { status, priority, filterType, village, district, search } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['pending', 'in_review'] };
    }

    if (priority) query.priority = priority;
    if (village) query.village = village;
    if (district) query.district = district;

    if (search) {
      query.$or = [
        { recordId: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { surveyNumber: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
      ];
    }

    if (filterType === 'critical') {
      query.priority = 'urgent';
    } else if (filterType === 'low_confidence') {
      query.overallConfidence = { $lt: 70 };
    } else if (filterType === 'conflict') {
      query.flagReasons = { $regex: 'conflict|collision|inconsistency', $options: 'i' };
    } else if (filterType === 'duplicate') {
      query.flagReasons = { $regex: 'duplicate', $options: 'i' };
    } else if (filterType === 'area_mismatch') {
      query.flagReasons = { $regex: 'area|exceeds', $options: 'i' };
    }

    const tasks = await VerificationTaskModel.find(query).sort({
      priority: 1,
      createdAt: -1,
    });

    const stats = {
      pending: await VerificationTaskModel.countDocuments({ status: 'pending' }),
      inReview: await VerificationTaskModel.countDocuments({ status: 'in_review' }),
      verified: await VerificationTaskModel.countDocuments({ status: 'verified' }),
      rejected: await VerificationTaskModel.countDocuments({ status: 'rejected' }),
      urgent: await VerificationTaskModel.countDocuments({ status: 'pending', priority: 'urgent' }),
    };

    res.json({ tasks, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVerificationTaskById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const task = await VerificationTaskModel.findOne({ taskId: id });
    if (!task) {
      return res.status(404).json({ error: 'Verification task not found' });
    }

    const record = await LandRecord.findOne({ recordId: task.recordId });
    const validation = await ValidationResultModel.findOne({ recordId: task.recordId });
    const document = task.documentId ? await DocumentModel.findOne({ documentId: task.documentId }) : null;

    res.json({ task, record, validation, document });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function completeVerification(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action, notes, corrections } = req.body; // action: 'verify' | 'reject'

    const task = await VerificationTaskModel.findOne({ taskId: id });
    if (!task) {
      return res.status(404).json({ error: 'Verification task not found' });
    }

    const record = await LandRecord.findOne({ recordId: task.recordId });
    if (!record) {
      return res.status(404).json({ error: 'Associated land record not found' });
    }

    // Apply any field corrections
    if (corrections && Array.isArray(corrections)) {
      for (const item of corrections) {
        const { field, value, reason } = item;
        const currentField = (record as any)[field];
        if (currentField) {
          const oldVal = currentField.value;
          currentField.originalValue = currentField.originalValue || oldVal;
          currentField.value = value;
          currentField.correctedValue = value;
          currentField.isVerified = true;
          currentField.source = 'HUMAN_VERIFIED';
          currentField.confidence = 1.0;
          currentField.verifiedBy = req.user?.name || 'Officer';
          currentField.verifiedAt = new Date().toISOString();
          (record as any)[field] = currentField;

          await AuditService.log({
            recordId: record.recordId,
            documentId: record.documentId,
            action: 'FIELD_CORRECTED',
            performedBy: {
              userId: req.user?.id || 'officer',
              name: req.user?.name || 'Verification Officer',
              role: req.user?.role || 'verification_officer',
              email: req.user?.email || 'officer@bhoomi.gov.in',
            },
            fieldChanged: field,
            oldValue: oldVal,
            newValue: value,
            reason: reason || notes,
            details: `Field "${field}" corrected during manual verification.`,
          });
        }
      }
    }

    if (action === 'reject') {
      task.status = 'rejected';
      task.resolvedAt = new Date().toISOString();
      task.resolvedBy = req.user?.name || 'Officer';
      task.resolutionNotes = notes || 'Rejected due to validation anomalies';

      record.verificationStatus = 'rejected';
      record.validationStatus = 'failed';

      await AuditService.log({
        recordId: record.recordId,
        documentId: record.documentId,
        action: 'RECORD_REJECTED',
        performedBy: {
          userId: req.user?.id || 'officer',
          name: req.user?.name || 'Verification Officer',
          role: req.user?.role || 'verification_officer',
          email: req.user?.email || 'officer@bhoomi.gov.in',
        },
        reason: notes,
        details: `Land Record ${record.recordId} rejected by verification officer.`,
      });
    } else {
      task.status = 'verified';
      task.resolvedAt = new Date().toISOString();
      task.resolvedBy = req.user?.name || 'Officer';
      task.resolutionNotes = notes || 'Approved after human verification';

      record.verificationStatus = 'verified';
      record.validationStatus = 'passed';

      await AuditService.log({
        recordId: record.recordId,
        documentId: record.documentId,
        action: 'RECORD_VERIFIED',
        performedBy: {
          userId: req.user?.id || 'officer',
          name: req.user?.name || 'Verification Officer',
          role: req.user?.role || 'verification_officer',
          email: req.user?.email || 'officer@bhoomi.gov.in',
        },
        reason: notes,
        details: `Land Record ${record.recordId} successfully verified and approved into state land registry.`,
      });
    }

    await task.save();
    await record.save();

    res.json({
      message: `Record ${action === 'reject' ? 'rejected' : 'verified and approved'} successfully.`,
      task,
      record,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
