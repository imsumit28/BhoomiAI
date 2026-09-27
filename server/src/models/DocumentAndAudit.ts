import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { Document as IDocument, ValidationResult as IValidationResult, VerificationTask as IVerificationTask, AuditLog as IAuditLog } from '../../../shared/types';

export interface IDocModel extends Omit<IDocument, '_id'>, MongooseDoc {}

const DocumentSchema = new Schema<IDocModel>(
  {
    documentId: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    documentType: {
      type: String,
      enum: ['Khasra', 'Khatauni', 'Jamabandi', 'RoR', 'Mutation Record', 'Sale/Registration Record', 'Cadastral Map', 'Other'],
      default: 'Khasra',
    },
    language: {
      type: String,
      enum: ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali'],
      default: 'Hindi',
    },
    state: { type: String, default: 'Madhya Pradesh' },
    district: { type: String, default: 'Sehore' },
    tehsil: { type: String, default: 'Sehore' },
    village: { type: String, default: 'Rampur' },
    status: {
      type: String,
      enum: ['uploaded', 'preprocessing', 'ocr_processing', 'extracting', 'validating', 'verification_pending', 'verified', 'rejected', 'completed'],
      default: 'uploaded',
    },
    ocrConfidence: { type: Number, default: 0 },
    ocrText: { type: String },
    detectedLanguage: { type: String, default: 'Hindi (Devanagari)' },
    detectedScript: { type: String, default: 'Devanagari' },
    extractedRecordId: { type: String },
    previewUrl: { type: String },
    uploadedBy: { type: String, default: 'Officer R. Sharma' },
  },
  { timestamps: true, language_override: 'none' }
);

export const DocumentModel = mongoose.model<IDocModel>('Document', DocumentSchema);

// Validation Result Schema
const ValidationResultSchema = new Schema(
  {
    validationId: { type: String, required: true, unique: true, index: true },
    recordId: { type: String, required: true, index: true },
    documentId: { type: String },
    validationScore: { type: Number, default: 0 },
    overallStatus: {
      type: String,
      enum: ['passed', 'warning', 'failed', 'needs_review'],
      default: 'needs_review',
    },
    criticalIssuesCount: { type: Number, default: 0 },
    warningIssuesCount: { type: Number, default: 0 },
    passedRulesCount: { type: Number, default: 0 },
    issues: [
      {
        ruleId: String,
        ruleName: String,
        severity: { type: String, enum: ['critical', 'warning', 'info'] },
        field: String,
        detectedValue: Schema.Types.Mixed,
        expectedCondition: String,
        explanation: String,
        recommendedAction: String,
        relatedRecordIds: [String],
      },
    ],
    passedRules: [String],
    crossRecordConflicts: [
      {
        conflictType: String,
        details: String,
        conflictingRecordId: String,
        conflictingOwner: String,
        conflictingArea: Number,
      },
    ],
    dataQualityScore: { type: Number, default: 75 },
    executedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const ValidationResultModel = mongoose.model('ValidationResult', ValidationResultSchema);

// Verification Task Schema
const VerificationTaskSchema = new Schema(
  {
    taskId: { type: String, required: true, unique: true, index: true },
    recordId: { type: String, required: true, index: true },
    documentId: { type: String },
    village: { type: String, required: true },
    tehsil: { type: String, required: true },
    district: { type: String, required: true },
    ownerName: { type: String, required: true },
    surveyNumber: { type: String, required: true },
    issueCount: { type: Number, default: 0 },
    overallConfidence: { type: Number, default: 0 },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium',
    },
    assignedOfficer: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'verified', 'rejected', 'auto_approved'],
      default: 'pending',
    },
    flagReasons: [String],
    resolvedAt: String,
    resolvedBy: String,
    resolutionNotes: String,
  },
  { timestamps: true }
);

export const VerificationTaskModel = mongoose.model('VerificationTask', VerificationTaskSchema);

// Audit Log Schema
const AuditLogSchema = new Schema(
  {
    logId: { type: String, required: true, unique: true, index: true },
    recordId: { type: String, index: true },
    documentId: { type: String, index: true },
    action: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      email: { type: String, required: true },
    },
    fieldChanged: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    reason: String,
    details: String,
    ipAddress: { type: String, default: '10.24.118.52' },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);
