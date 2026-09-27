export type UserRole = 'admin' | 'district_officer' | 'verification_officer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  district?: string;
  state?: string;
  avatar?: string;
  createdAt: string;
}

export type DocumentType =
  | 'Khasra'
  | 'Khatauni'
  | 'Jamabandi'
  | 'RoR'
  | 'Mutation Record'
  | 'Sale/Registration Record'
  | 'Cadastral Map'
  | 'Other';

export type DocumentLanguage =
  | 'Hindi'
  | 'English'
  | 'Marathi'
  | 'Tamil'
  | 'Telugu'
  | 'Bengali';

export type DocumentStatus =
  | 'uploaded'
  | 'preprocessing'
  | 'ocr_processing'
  | 'extracting'
  | 'validating'
  | 'verification_pending'
  | 'verified'
  | 'rejected'
  | 'completed';

export interface BoundingBox {
  x: number; // percentage (0-100) or pixel
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface ExtractedField<T = string | number> {
  value: T;
  confidence: number; // 0 - 1.0 or 0 - 100
  source: 'OCR' | 'AI_EXTRACTION' | 'RULE_DERIVED' | 'HUMAN_VERIFIED';
  boundingBox?: BoundingBox;
  isVerified: boolean;
  originalValue?: T;
  correctedValue?: T;
  rawOcrText?: string;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export type LandClassification =
  | 'Agricultural (कृषि)'
  | 'Residential (आवासीय)'
  | 'Commercial (व्यावसायिक)'
  | 'Industrial (औद्योगिक)'
  | 'Forest (वन भूमि)'
  | 'Government / Grazing (शासकीय/चरनोई)'
  | 'Water Body (जलाशय)'
  | 'Barren (बंजर)';

export type OwnershipType =
  | 'Single Owner (एकल)'
  | 'Joint Ownership (संयुक्त)'
  | 'Government Leased (पट्टा)'
  | 'Trust / Institutional (संस्थागत)';

export type ValidationStatus = 'passed' | 'warning' | 'failed' | 'needs_review';
export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected' | 'auto_approved';

export interface LandRecord {
  _id?: string;
  recordId: string;
  documentId?: string;
  ownerName: ExtractedField<string>;
  fatherOrSpouseName: ExtractedField<string>;
  surveyNumber: ExtractedField<string>;
  khasraNumber: ExtractedField<string>;
  khataNumber: ExtractedField<string>;
  plotNumber?: ExtractedField<string>;
  area: ExtractedField<number>;
  areaUnit: ExtractedField<string>; // Acres, Hectares, Bigha, SqFt
  village: ExtractedField<string>;
  tehsil: ExtractedField<string>;
  district: ExtractedField<string>;
  state: ExtractedField<string>;
  landClassification: ExtractedField<LandClassification>;
  ownershipType: ExtractedField<OwnershipType>;
  mutationNumber?: ExtractedField<string>;
  registrationNumber?: ExtractedField<string>;
  registrationDate?: ExtractedField<string>;
  mutationDate?: ExtractedField<string>;
  parentSurveyNumber?: string;
  sourceDocumentUrl?: string;
  language: DocumentLanguage;
  confidenceScore: number; // Overall composite confidence (0-100)
  validationStatus: ValidationStatus;
  verificationStatus: VerificationStatus;
  gisCoordinates?: {
    lat: number;
    lng: number;
    polygon?: [number, number][];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id?: string;
  documentId: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  language: DocumentLanguage;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  status: DocumentStatus;
  ocrConfidence: number;
  ocrText?: string;
  detectedLanguage?: string;
  detectedScript?: string;
  extractedRecordId?: string;
  previewUrl?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface ValidationIssue {
  ruleId: string;
  ruleName: string;
  severity: IssueSeverity;
  field?: string;
  detectedValue?: string | number | null;
  expectedCondition?: string;
  explanation: string;
  recommendedAction: string;
  relatedRecordIds?: string[];
}

export interface ValidationResult {
  _id?: string;
  validationId: string;
  recordId: string;
  documentId?: string;
  validationScore: number; // 0 - 100
  overallStatus: ValidationStatus;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  passedRulesCount: number;
  issues: ValidationIssue[];
  passedRules: string[];
  crossRecordConflicts: {
    conflictType: string;
    details: string;
    conflictingRecordId: string;
    conflictingOwner?: string;
    conflictingArea?: number;
  }[];
  dataQualityScore: number;
  executedAt: string;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface VerificationTask {
  _id?: string;
  taskId: string;
  recordId: string;
  documentId?: string;
  village: string;
  tehsil: string;
  district: string;
  ownerName: string;
  surveyNumber: string;
  issueCount: number;
  overallConfidence: number;
  priority: TaskPriority;
  assignedOfficer?: string;
  status: VerificationStatus;
  flagReasons: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export type AuditAction =
  | 'DOCUMENT_UPLOADED'
  | 'PREPROCESSING_COMPLETED'
  | 'OCR_COMPLETED'
  | 'FIELDS_EXTRACTED'
  | 'VALIDATION_STARTED'
  | 'VALIDATION_PASSED'
  | 'VALIDATION_FAILED'
  | 'FIELD_CORRECTED'
  | 'RECORD_VERIFIED'
  | 'RECORD_REJECTED'
  | 'RECORD_APPROVED'
  | 'EXPORT_GENERATED';

export interface AuditLog {
  _id?: string;
  logId: string;
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
  oldValue?: string | number | null;
  newValue?: string | number | null;
  reason?: string;
  details?: string;
  ipAddress: string;
  timestamp: string;
}

export interface MasterHierarchy {
  state: string;
  districts: {
    name: string;
    tehsils: {
      name: string;
      villages: string[];
    }[];
  }[];
}

export interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  pendingVerification: number;
  validatedRecords: number;
  rejectedRecords: number;
  averageAccuracy: number;
  recentRecords: LandRecord[];
  recentAudits: AuditLog[];
  stateWiseStats: {
    state: string;
    district: string;
    total: number;
    processed: number;
    validated: number;
    pending: number;
    accuracy: number;
  }[];
  confidenceDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  errorCategoryDistribution: {
    category: string;
    count: number;
  }[];
  timelineData: {
    date: string;
    processed: number;
    verified: number;
    flagged: number;
  }[];
}
