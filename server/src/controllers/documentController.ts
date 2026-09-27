import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DocumentModel, VerificationTaskModel, ValidationResultModel } from '../models/DocumentAndAudit';
import { LandRecord } from '../models/LandRecord';
import { MockOCRProvider } from '../services/ocr/OCRProvider';
import { MockExtractionProvider } from '../services/extraction/ExtractionProvider';
import { validationEngine } from '../services/validation/ValidationEngine';
import { AuditService } from '../services/audit/AuditService';

const ocrProvider = new MockOCRProvider();
const extractionProvider = new MockExtractionProvider();

export async function uploadDocument(req: AuthRequest, res: Response) {
  try {
    const file = req.file;
    const {
      documentType = 'Khasra',
      language = 'Hindi',
      state = 'Madhya Pradesh',
      district = 'Sehore',
      tehsil = 'Sehore',
      village = 'Rampur',
      simulateNoise = 'false',
    } = req.body;

    const documentId = `DOC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const originalName = file ? file.originalname : req.body.sampleName || 'scanned_khasra_legacy_record.jpg';
    const fileUrl = file ? `/uploads/${file.filename}` : '/samples/khasra_sample.png';
    const fileSize = file ? file.size : 2048500;
    const fileType = file ? file.mimetype : 'image/jpeg';

    const newDoc = await DocumentModel.create({
      documentId,
      originalName,
      fileUrl,
      fileType,
      fileSize,
      documentType,
      language,
      state,
      district,
      tehsil,
      village,
      status: 'uploaded',
      ocrConfidence: 0,
      uploadedBy: req.user?.name || 'Officer R. Sharma',
    });

    await AuditService.log({
      documentId,
      action: 'DOCUMENT_UPLOADED',
      performedBy: {
        userId: req.user?.id || 'demo-user',
        name: req.user?.name || 'Revenue Officer',
        role: req.user?.role || 'verification_officer',
        email: req.user?.email || 'officer@bhoomi.gov.in',
      },
      details: `Document "${originalName}" (${documentType}) uploaded for Village: ${village}, Tehsil: ${tehsil}.`,
    });

    // Automatically trigger processing pipeline
    setTimeout(async () => {
      try {
        await processDocumentPipeline(documentId, simulateNoise === 'true' || simulateNoise === true, req.user);
      } catch (err) {
        console.error('Error during auto-pipeline run:', err);
      }
    }, 300);

    res.status(201).json({
      message: 'Document uploaded successfully. Digitization and validation pipeline initiated.',
      document: newDoc,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function processDocumentPipeline(documentId: string, simulateNoise = false, user?: any) {
  const doc = await DocumentModel.findOne({ documentId });
  if (!doc) return;

  // 1. Preprocessing
  doc.status = 'preprocessing';
  await doc.save();

  // 2. OCR Processing
  doc.status = 'ocr_processing';
  await doc.save();

  const ocrResult = await ocrProvider.extractText(doc.originalName, doc.language, { simulateNoise });
  doc.ocrText = ocrResult.rawText;
  doc.ocrConfidence = Math.round(ocrResult.confidence * 100);
  doc.detectedLanguage = ocrResult.detectedLanguage;
  doc.detectedScript = ocrResult.detectedScript;

  await AuditService.log({
    documentId,
    action: 'OCR_COMPLETED',
    performedBy: {
      userId: user?.id || 'sys-ai',
      name: user?.name || 'BhoomiAI OCR Engine',
      role: 'admin',
      email: 'ai-engine@bhoomi.gov.in',
    },
    details: `OCR completed. Extracted ${ocrResult.lines.length} lines. Average confidence: ${doc.ocrConfidence}%.`,
  });

  // 3. Field Extraction
  doc.status = 'extracting';
  await doc.save();

  const extracted = await extractionProvider.extractLandRecord(ocrResult, doc.language);
  const recordId = `REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const newLandRecord = await LandRecord.create({
    recordId,
    documentId,
    ownerName: extracted.ownerName,
    fatherOrSpouseName: extracted.fatherOrSpouseName,
    surveyNumber: extracted.surveyNumber,
    khasraNumber: extracted.khasraNumber,
    khataNumber: extracted.khataNumber,
    plotNumber: extracted.plotNumber,
    area: extracted.area,
    areaUnit: extracted.areaUnit,
    village: { ...extracted.village, value: doc.village || extracted.village.value },
    tehsil: { ...extracted.tehsil, value: doc.tehsil || extracted.tehsil.value },
    district: { ...extracted.district, value: doc.district || extracted.district.value },
    state: { ...extracted.state, value: doc.state || extracted.state.value },
    landClassification: extracted.landClassification,
    ownershipType: extracted.ownershipType,
    mutationNumber: extracted.mutationNumber,
    registrationNumber: extracted.registrationNumber,
    registrationDate: extracted.registrationDate,
    mutationDate: extracted.mutationDate,
    sourceDocumentUrl: doc.fileUrl,
    language: doc.language,
    confidenceScore: extracted.overallConfidence,
    validationStatus: 'needs_review',
    verificationStatus: 'pending',
  });

  doc.extractedRecordId = recordId;

  await AuditService.log({
    recordId,
    documentId,
    action: 'FIELDS_EXTRACTED',
    performedBy: {
      userId: user?.id || 'sys-ai',
      name: user?.name || 'BhoomiAI Entity Extractor',
      role: 'admin',
      email: 'ai-engine@bhoomi.gov.in',
    },
    details: `Extracted record fields for Owner: ${extracted.ownerName.value}, Survey: ${extracted.surveyNumber.value}, Area: ${extracted.area.value}.`,
  });

  // 4. Validation Engine
  doc.status = 'validating';
  await doc.save();

  const existingRecords = await LandRecord.find({ _id: { $ne: newLandRecord._id } }).lean();
  const validationResult = validationEngine.validateRecord(newLandRecord.toObject() as any, {
    existingRecords: existingRecords as any,
  });

  await ValidationResultModel.create(validationResult);

  newLandRecord.validationStatus = validationResult.overallStatus;
  await newLandRecord.save();

  await AuditService.log({
    recordId,
    documentId,
    action: validationResult.criticalIssuesCount > 0 ? 'VALIDATION_FAILED' : 'VALIDATION_PASSED',
    performedBy: {
      userId: user?.id || 'sys-validator',
      name: user?.name || 'Rule-Based Validation Engine',
      role: 'admin',
      email: 'rules@bhoomi.gov.in',
    },
    details: `Validation executed: Score ${validationResult.validationScore}/100. ${validationResult.criticalIssuesCount} Critical, ${validationResult.warningIssuesCount} Warnings.`,
  });

  // 5. Verification Task Creation if issues or low confidence
  if (validationResult.criticalIssuesCount > 0 || validationResult.warningIssuesCount > 0 || extracted.overallConfidence < 75) {
    const flagReasons: string[] = [];
    validationResult.issues.forEach((i) => flagReasons.push(i.explanation));
    if (extracted.overallConfidence < 75) {
      flagReasons.push(`Overall confidence score (${extracted.overallConfidence}%) is below automation threshold.`);
    }

    const priority = validationResult.criticalIssuesCount > 0 ? 'urgent' : 'medium';

    await VerificationTaskModel.create({
      taskId: `TASK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      recordId,
      documentId,
      village: newLandRecord.village.value,
      tehsil: newLandRecord.tehsil.value,
      district: newLandRecord.district.value,
      ownerName: newLandRecord.ownerName.value,
      surveyNumber: newLandRecord.surveyNumber.value,
      issueCount: validationResult.issues.length,
      overallConfidence: extracted.overallConfidence,
      priority,
      status: 'pending',
      flagReasons,
    });

    doc.status = 'verification_pending';
    newLandRecord.verificationStatus = 'pending';
  } else {
    doc.status = 'completed';
    newLandRecord.verificationStatus = 'auto_approved';
  }

  await doc.save();
  await newLandRecord.save();
}

export async function getDocumentById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findOne({ documentId: id });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let extractedRecord = null;
    let validation = null;
    let verificationTask = null;

    if (doc.extractedRecordId) {
      extractedRecord = await LandRecord.findOne({ recordId: doc.extractedRecordId });
      validation = await ValidationResultModel.findOne({ recordId: doc.extractedRecordId });
      verificationTask = await VerificationTaskModel.findOne({ recordId: doc.extractedRecordId });
    }

    res.json({
      document: doc,
      extractedRecord,
      validation,
      verificationTask,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function listDocuments(req: AuthRequest, res: Response) {
  try {
    const { status, language, documentType, search } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (language) query.language = language;
    if (documentType) query.documentType = documentType;
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { documentId: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await DocumentModel.find(query).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function triggerPipeline(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { simulateNoise } = req.body;
    await processDocumentPipeline(id, simulateNoise, req.user);
    res.json({ message: 'Pipeline processed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
