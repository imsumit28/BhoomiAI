import mongoose, { Schema, Document } from 'mongoose';
import { LandRecord as ILandRecord } from '../../../shared/types';

export interface ILandRecordDocument extends Omit<ILandRecord, '_id'>, Document {}

const BoundingBoxSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    page: { type: Number, default: 1 },
  },
  { _id: false }
);

function createExtractedFieldSchema(type: any) {
  return new Schema(
    {
      value: { type: type, required: false },
      confidence: { type: Number, default: 0.9, min: 0, max: 1 },
      source: {
        type: String,
        enum: ['OCR', 'AI_EXTRACTION', 'RULE_DERIVED', 'HUMAN_VERIFIED'],
        default: 'OCR',
      },
      boundingBox: { type: BoundingBoxSchema, required: false },
      isVerified: { type: Boolean, default: false },
      originalValue: { type: Schema.Types.Mixed, required: false },
      correctedValue: { type: Schema.Types.Mixed, required: false },
      rawOcrText: { type: String, required: false },
      verificationNotes: { type: String, required: false },
      verifiedBy: { type: String, required: false },
      verifiedAt: { type: String, required: false },
    },
    { _id: false }
  );
}

const LandRecordSchema = new Schema<ILandRecordDocument>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    documentId: { type: String, index: true },
    ownerName: createExtractedFieldSchema(String),
    fatherOrSpouseName: createExtractedFieldSchema(String),
    surveyNumber: createExtractedFieldSchema(String),
    khasraNumber: createExtractedFieldSchema(String),
    khataNumber: createExtractedFieldSchema(String),
    plotNumber: createExtractedFieldSchema(String),
    area: createExtractedFieldSchema(Number),
    areaUnit: createExtractedFieldSchema(String),
    village: createExtractedFieldSchema(String),
    tehsil: createExtractedFieldSchema(String),
    district: createExtractedFieldSchema(String),
    state: createExtractedFieldSchema(String),
    landClassification: createExtractedFieldSchema(String),
    ownershipType: createExtractedFieldSchema(String),
    mutationNumber: createExtractedFieldSchema(String),
    registrationNumber: createExtractedFieldSchema(String),
    registrationDate: createExtractedFieldSchema(String),
    mutationDate: createExtractedFieldSchema(String),
    parentSurveyNumber: { type: String },
    sourceDocumentUrl: { type: String },
    language: {
      type: String,
      enum: ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali'],
      default: 'Hindi',
    },
    confidenceScore: { type: Number, default: 85 },
    validationStatus: {
      type: String,
      enum: ['passed', 'warning', 'failed', 'needs_review'],
      default: 'needs_review',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'in_review', 'verified', 'rejected', 'auto_approved'],
      default: 'pending',
    },
    gisCoordinates: {
      lat: { type: Number, default: 23.2000 },
      lng: { type: Number, default: 77.0850 },
      polygon: { type: [[Number]], default: [] },
    },
  },
  { timestamps: true, language_override: 'none' }
);

LandRecordSchema.index({ 'village.value': 1, 'surveyNumber.value': 1, 'khasraNumber.value': 1 });
LandRecordSchema.index(
  { 'ownerName.value': 'text', 'surveyNumber.value': 'text' },
  { default_language: 'none', language_override: 'none' }
);

export const LandRecord = mongoose.model<ILandRecordDocument>('LandRecord', LandRecordSchema);
