import { AuditLog, DashboardStats, LandRecord, ValidationResult, VerificationTask } from '../../../shared/types';

const field = <T,>(value: T) => ({ value, confidence: 0.96, source: 'HUMAN_VERIFIED' as const, isVerified: true });

export const sampleLandRecords: LandRecord[] = [
  {
    recordId: 'REC-MP-SEH-001', documentId: 'DOC-MP-2026-001',
    ownerName: field('Ramesh Kumar'), fatherOrSpouseName: field('Suresh Kumar'),
    surveyNumber: field('124/3'), khasraNumber: field('124/3'), khataNumber: field('KH-0881'),
    area: field(2.45), areaUnit: field('Acres'), village: field('Rampur'), tehsil: field('Sehore'),
    district: field('Sehore'), state: field('Madhya Pradesh'), landClassification: field('Agricultural (कृषि)'),
    ownershipType: field('Single Owner (एकल)'), language: 'Hindi', confidenceScore: 96,
    validationStatus: 'passed', verificationStatus: 'verified',
    gisCoordinates: { lat: 23.2045, lng: 77.0862 }, createdAt: '2026-09-18T10:30:00.000Z', updatedAt: '2026-09-20T08:15:00.000Z',
  },
  {
    recordId: 'REC-MP-SEH-002', documentId: 'DOC-MP-2026-014',
    ownerName: field('Sunita Bai'), fatherOrSpouseName: field('Mohan Lal'),
    surveyNumber: field('87/2'), khasraNumber: field('87/2'), khataNumber: field('KH-1024'),
    area: field(1.8), areaUnit: field('Acres'), village: field('Bilkisganj'), tehsil: field('Sehore'),
    district: field('Sehore'), state: field('Madhya Pradesh'), landClassification: field('Agricultural (कृषि)'),
    ownershipType: field('Joint Ownership (संयुक्त)'), language: 'Hindi', confidenceScore: 72,
    validationStatus: 'warning', verificationStatus: 'pending',
    gisCoordinates: { lat: 23.1841, lng: 77.1328 }, createdAt: '2026-09-24T09:00:00.000Z', updatedAt: '2026-09-24T09:00:00.000Z',
  },
  {
    recordId: 'REC-MP-SEH-003', documentId: 'DOC-MP-2026-022',
    ownerName: field('Arjun Singh'), fatherOrSpouseName: field('Hariram Singh'),
    surveyNumber: field('211/1'), khasraNumber: field('211/1'), khataNumber: field('KH-1190'),
    area: field(3.2), areaUnit: field('Acres'), village: field('Barkheda'), tehsil: field('Ichhawar'),
    district: field('Sehore'), state: field('Madhya Pradesh'), landClassification: field('Agricultural (कृषि)'),
    ownershipType: field('Single Owner (एकल)'), language: 'Hindi', confidenceScore: 61,
    validationStatus: 'needs_review', verificationStatus: 'in_review',
    gisCoordinates: { lat: 23.0218, lng: 77.0083 }, createdAt: '2026-09-29T13:20:00.000Z', updatedAt: '2026-10-01T11:45:00.000Z',
  },
];

export const sampleVerificationTasks: VerificationTask[] = [
  {
    taskId: 'TASK-MP-SEH-002', recordId: sampleLandRecords[1].recordId, documentId: sampleLandRecords[1].documentId,
    village: sampleLandRecords[1].village.value, tehsil: sampleLandRecords[1].tehsil.value,
    district: sampleLandRecords[1].district.value, ownerName: sampleLandRecords[1].ownerName.value,
    surveyNumber: sampleLandRecords[1].surveyNumber.value, issueCount: 1, overallConfidence: 72,
    priority: 'medium', assignedOfficer: 'Manoj Patel', status: 'pending',
    flagReasons: ['Joint ownership requires a second owner confirmation'],
    createdAt: '2026-09-24T09:00:00.000Z', updatedAt: '2026-09-24T09:00:00.000Z',
  },
  {
    taskId: 'TASK-MP-SEH-003', recordId: sampleLandRecords[2].recordId, documentId: sampleLandRecords[2].documentId,
    village: sampleLandRecords[2].village.value, tehsil: sampleLandRecords[2].tehsil.value,
    district: sampleLandRecords[2].district.value, ownerName: sampleLandRecords[2].ownerName.value,
    surveyNumber: sampleLandRecords[2].surveyNumber.value, issueCount: 2, overallConfidence: 61,
    priority: 'urgent', assignedOfficer: 'Manoj Patel', status: 'in_review',
    flagReasons: ['OCR confidence is below 70%', 'Mutation date needs officer confirmation'],
    createdAt: '2026-09-29T13:20:00.000Z', updatedAt: '2026-10-01T11:45:00.000Z',
  },
];

export const sampleAuditLogs: AuditLog[] = [
  {
    logId: 'AUD-DEMO-1004', recordId: sampleLandRecords[2].recordId, documentId: sampleLandRecords[2].documentId,
    action: 'VALIDATION_FAILED', performedBy: { userId: 'system-demo', name: 'Validation Engine', role: 'admin', email: 'system@bhoomi.gov.in' },
    details: 'Low OCR confidence and mutation details flagged for officer review.', ipAddress: '192.0.2.14', timestamp: '2026-10-01T11:45:00.000Z',
  },
  {
    logId: 'AUD-DEMO-1003', recordId: sampleLandRecords[1].recordId, documentId: sampleLandRecords[1].documentId,
    action: 'VALIDATION_PASSED', performedBy: { userId: 'system-demo', name: 'Validation Engine', role: 'admin', email: 'system@bhoomi.gov.in' },
    details: 'Nine required validation checks passed; ownership confirmation retained for compliance review.', ipAddress: '192.0.2.14', timestamp: '2026-09-24T09:12:00.000Z',
  },
  {
    logId: 'AUD-DEMO-1002', recordId: sampleLandRecords[0].recordId, documentId: sampleLandRecords[0].documentId,
    action: 'RECORD_VERIFIED', performedBy: { userId: 'officer-demo', name: 'Manoj Patel', role: 'verification_officer', email: 'manoj.patel@bhoomi.gov.in' },
    details: 'Officer confirmed the owner and survey details against the source Khasra.', ipAddress: '192.0.2.21', timestamp: '2026-09-20T08:15:00.000Z',
  },
  {
    logId: 'AUD-DEMO-1001', recordId: sampleLandRecords[0].recordId, documentId: sampleLandRecords[0].documentId,
    action: 'DOCUMENT_UPLOADED', performedBy: { userId: 'officer-demo', name: 'Priya Sharma', role: 'district_officer', email: 'priya.sharma@bhoomi.gov.in' },
    details: 'Sample Khasra document added to the digitization workflow.', ipAddress: '192.0.2.21', timestamp: '2026-09-18T10:30:00.000Z',
  },
];

export const sampleDashboardStats: DashboardStats = {
  totalDocuments: 248, processedDocuments: 196, pendingVerification: 17, validatedRecords: 168,
  rejectedRecords: 11, averageAccuracy: 91.4, recentRecords: sampleLandRecords, recentAudits: sampleAuditLogs,
  stateWiseStats: [
    { state: 'Madhya Pradesh', district: 'Sehore', total: 248, processed: 196, validated: 168, pending: 17, accuracy: 91.4 },
    { state: 'Madhya Pradesh', district: 'Bhopal', total: 312, processed: 274, validated: 251, pending: 14, accuracy: 94.8 },
    { state: 'Madhya Pradesh', district: 'Raisen', total: 184, processed: 142, validated: 121, pending: 12, accuracy: 89.7 },
  ],
  confidenceDistribution: [
    { range: '90–100%', count: 118, percentage: 60 }, { range: '70–89%', count: 55, percentage: 28 },
    { range: 'Below 70%', count: 23, percentage: 12 },
  ],
  errorCategoryDistribution: [
    { category: 'Name mismatch', count: 8 }, { category: 'Area variance', count: 5 },
    { category: 'Missing fields', count: 4 }, { category: 'Date inconsistency', count: 3 },
  ],
  timelineData: [
    { date: 'Sep 29', processed: 21, verified: 16, flagged: 3 }, { date: 'Sep 30', processed: 27, verified: 20, flagged: 4 },
    { date: 'Oct 1', processed: 24, verified: 19, flagged: 2 }, { date: 'Oct 2', processed: 32, verified: 25, flagged: 5 },
    { date: 'Oct 3', processed: 29, verified: 23, flagged: 3 }, { date: 'Oct 4', processed: 35, verified: 28, flagged: 4 },
    { date: 'Oct 5', processed: 28, verified: 22, flagged: 3 },
  ],
};

export function sampleValidation(recordId: string): ValidationResult {
  const record = sampleLandRecords.find((item) => item.recordId === recordId) || sampleLandRecords[0];
  const hasWarning = record.validationStatus !== 'passed';
  return {
    validationId: `VAL-${record.recordId}`, recordId: record.recordId, documentId: record.documentId,
    validationScore: record.confidenceScore, overallStatus: record.validationStatus,
    criticalIssuesCount: 0, warningIssuesCount: hasWarning ? 1 : 0, passedRulesCount: hasWarning ? 9 : 10,
    issues: hasWarning ? [{
      ruleId: 'OWN-02', ruleName: 'Ownership confirmation', severity: 'warning', field: 'ownerName',
      detectedValue: record.ownerName.value, expectedCondition: 'All recorded owners should be confirmed',
      explanation: 'The source entry needs manual confirmation before the record is finalized.',
      recommendedAction: 'Review the source document and confirm the owner details.',
    }] : [],
    passedRules: ['Required fields present', 'Jurisdiction match', 'Area within expected range'],
    crossRecordConflicts: [], dataQualityScore: record.confidenceScore, executedAt: record.updatedAt,
  };
}

export const demoEnabled = () => new URLSearchParams(window.location.search).get('demo') === '1';
