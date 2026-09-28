import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LandRecord } from '../models/LandRecord';
import { ValidationResultModel } from '../models/DocumentAndAudit';
import { AuditService } from '../services/audit/AuditService';
import { validationEngine } from '../services/validation/ValidationEngine';

export async function searchLandRecords(req: AuthRequest, res: Response) {
  try {
    const {
      q,
      owner,
      survey,
      khasra,
      khata,
      village,
      district,
      tehsil,
      validationStatus,
      verificationStatus,
      limit = 50,
      page = 1,
    } = req.query;

    const query: any = {};

    if (q) {
      query.$or = [
        { 'ownerName.value': { $regex: q, $options: 'i' } },
        { 'surveyNumber.value': { $regex: q, $options: 'i' } },
        { 'khasraNumber.value': { $regex: q, $options: 'i' } },
        { 'khataNumber.value': { $regex: q, $options: 'i' } },
        { 'village.value': { $regex: q, $options: 'i' } },
        { recordId: { $regex: q, $options: 'i' } },
      ];
    }

    if (owner) query['ownerName.value'] = { $regex: owner, $options: 'i' };
    if (survey) query['surveyNumber.value'] = { $regex: survey, $options: 'i' };
    if (khasra) query['khasraNumber.value'] = { $regex: khasra, $options: 'i' };
    if (khata) query['khataNumber.value'] = { $regex: khata, $options: 'i' };
    if (village) query['village.value'] = { $regex: village, $options: 'i' };
    if (district) query['district.value'] = { $regex: district, $options: 'i' };
    if (tehsil) query['tehsil.value'] = { $regex: tehsil, $options: 'i' };
    if (validationStatus) query.validationStatus = validationStatus;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const records = await LandRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await LandRecord.countDocuments(query);

    res.json({
      records,
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

export async function getLandRecordById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const record = await LandRecord.findOne({ recordId: id });
    if (!record) {
      return res.status(404).json({ error: 'Land record not found' });
    }

    const validation = await ValidationResultModel.findOne({ recordId: id });
    const auditLogs = await AuditService.getLogsForRecord(id);

    // Find related/sub-parcels in the same village
    const parentSurvey = record.surveyNumber?.value?.includes('/')
      ? record.surveyNumber.value.split('/')[0]
      : record.surveyNumber?.value;

    const siblingRecords = await LandRecord.find({
      'village.value': record.village?.value,
      'surveyNumber.value': { $regex: `^${parentSurvey}`, $options: 'i' },
      recordId: { $ne: record.recordId },
    }).select('recordId surveyNumber area ownerName verificationStatus');

    res.json({
      record,
      validation,
      auditLogs,
      siblingRecords,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateRecordField(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { field, newValue, reason } = req.body;

    const record = await LandRecord.findOne({ recordId: id });
    if (!record) {
      return res.status(404).json({ error: 'Land record not found' });
    }

    const fieldObj = (record as any)[field];
    if (!fieldObj) {
      return res.status(400).json({ error: `Field '${field}' is not a valid record property` });
    }

    const oldValue = fieldObj.value;
    fieldObj.originalValue = fieldObj.originalValue || oldValue;
    fieldObj.value = newValue;
    fieldObj.correctedValue = newValue;
    fieldObj.isVerified = true;
    fieldObj.source = 'HUMAN_VERIFIED';
    fieldObj.confidence = 1.0;
    fieldObj.verificationNotes = reason || 'Updated by officer in verification portal';
    fieldObj.verifiedBy = req.user?.name || 'Verification Officer';
    fieldObj.verifiedAt = new Date().toISOString();

    (record as any)[field] = fieldObj;

    // Re-run validation engine
    const existingRecords = await LandRecord.find({ _id: { $ne: record._id } }).lean();
    const validationResult = validationEngine.validateRecord(record.toObject() as any, {
      existingRecords: existingRecords as any,
    });

    record.validationStatus = validationResult.overallStatus;
    await record.save();

    await ValidationResultModel.findOneAndUpdate({ recordId: id }, validationResult, {
      upsert: true,
      new: true,
    });

    await AuditService.log({
      recordId: id,
      documentId: record.documentId,
      action: 'FIELD_CORRECTED',
      performedBy: {
        userId: req.user?.id || 'officer-id',
        name: req.user?.name || 'Verification Officer',
        role: req.user?.role || 'verification_officer',
        email: req.user?.email || 'officer@bhoomi.gov.in',
      },
      fieldChanged: field,
      oldValue,
      newValue,
      reason,
      details: `Field "${field}" updated from "${oldValue}" to "${newValue}". Reason: ${reason || 'Manual review'}`,
    });

    res.json({
      message: 'Field updated and validation recalculated successfully',
      record,
      validation: validationResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function exportRecords(req: AuthRequest, res: Response) {
  try {
    const { format = 'json' } = req.query;
    const records = await LandRecord.find().limit(500).lean();

    if (format === 'csv') {
      const headers = [
        'Record ID',
        'Owner Name',
        'Father/Spouse Name',
        'Survey Number',
        'Khasra Number',
        'Khata Number',
        'Area',
        'Area Unit',
        'Village',
        'Tehsil',
        'District',
        'State',
        'Land Classification',
        'Ownership Type',
        'Confidence Score',
        'Validation Status',
        'Verification Status',
      ];

      const rows = records.map((r: any) => [
        `"${r.recordId}"`,
        `"${r.ownerName?.value || ''}"`,
        `"${r.fatherOrSpouseName?.value || ''}"`,
        `"${r.surveyNumber?.value || ''}"`,
        `"${r.khasraNumber?.value || ''}"`,
        `"${r.khataNumber?.value || ''}"`,
        `"${r.area?.value || ''}"`,
        `"${r.areaUnit?.value || 'Acres'}"`,
        `"${r.village?.value || ''}"`,
        `"${r.tehsil?.value || ''}"`,
        `"${r.district?.value || ''}"`,
        `"${r.state?.value || ''}"`,
        `"${r.landClassification?.value || ''}"`,
        `"${r.ownershipType?.value || ''}"`,
        `"${r.confidenceScore || ''}"`,
        `"${r.validationStatus || ''}"`,
        `"${r.verificationStatus || ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="bhoomi_setu_ai_land_records_export.csv"');
      return res.send(csvContent);
    }

    res.json({ records });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
