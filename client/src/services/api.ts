import {
  LandRecord,
  Document as IDocument,
  ValidationResult,
  VerificationTask,
  AuditLog,
  DashboardStats,
  MasterHierarchy,
} from '../../../shared/types';
import { demoEnabled, sampleAuditLogs, sampleDashboardStats, sampleLandRecords, sampleValidation, sampleVerificationTasks } from './demoData';

const API_BASE = '/api';
let dashboardSampleDataActive = false;

export const isDashboardSampleDataActive = () => dashboardSampleDataActive;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('bhoomi_setu_ai_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  async quickDemoLogin(role: string) {
    const res = await fetch(`${API_BASE}/auth/quick-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Quick login failed');
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Master Data & Samples
  async getMasterHierarchy(): Promise<{
    hierarchy: MasterHierarchy[];
    landClassifications: string[];
    ownershipTypes: string[];
    areaUnits: string[];
  }> {
    const res = await fetch(`${API_BASE}/master-data/hierarchy`);
    return res.json();
  },

  async getSampleDocuments(): Promise<{ samples: any[] }> {
    const res = await fetch(`${API_BASE}/master-data/samples`);
    return res.json();
  },

  // Documents & Pipeline
  async uploadDocument(formData: FormData) {
    const token = localStorage.getItem('bhoomi_setu_ai_token');
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    return res.json();
  },

  async getDocuments(params?: any): Promise<{ documents: IDocument[] }> {
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/documents?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getDocumentById(id: string): Promise<{
    document: IDocument;
    extractedRecord?: LandRecord;
    validation?: ValidationResult;
    verificationTask?: VerificationTask;
  }> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async triggerProcess(id: string, simulateNoise = false) {
    const res = await fetch(`${API_BASE}/documents/${id}/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ simulateNoise }),
    });
    return res.json();
  },

  // Land Records
  async searchLandRecords(params?: any): Promise<{
    records: LandRecord[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const getSampleRecords = () => {
      const query = String(params?.q || '').toLowerCase();
      const village = String(params?.village || '').toLowerCase();
      const filtered = sampleLandRecords.filter((record) =>
        (!query || [record.recordId, record.ownerName.value, record.surveyNumber.value, record.khataNumber.value]
          .some((value) => String(value).toLowerCase().includes(query))) &&
        (!village || record.village.value.toLowerCase().includes(village)) &&
        (!params?.validationStatus || record.validationStatus === params.validationStatus) &&
        (!params?.verificationStatus || record.verificationStatus === params.verificationStatus)
      );
      return { records: filtered, pagination: { total: filtered.length, page: 1, limit: Number(params?.limit || filtered.length), totalPages: filtered.length ? 1 : 0 } };
    };
    if (demoEnabled()) return getSampleRecords();
    const query = new URLSearchParams(params || {}).toString();
    try {
      const res = await fetch(`${API_BASE}/land-records/search?${query}`, { headers: getAuthHeaders() });
      if (!res.ok) return getSampleRecords();
      const data = await res.json();
      if (!Array.isArray(data?.records) || data.records.length === 0) return getSampleRecords();
      return data;
    } catch {
      return getSampleRecords();
    }
  },

  async getLandRecordById(id: string): Promise<{
    record: LandRecord;
    validation: ValidationResult;
    auditLogs: AuditLog[];
    siblingRecords: any[];
  }> {
    const getSampleRecord = () => {
      const record = sampleLandRecords.find((item) => item.recordId === id) || sampleLandRecords[0];
      return {
        record,
        validation: sampleValidation(record.recordId),
        auditLogs: sampleAuditLogs.filter((log) => log.recordId === record.recordId),
        siblingRecords: sampleLandRecords.filter((item) => item.recordId !== record.recordId),
      };
    };
    if (demoEnabled()) return getSampleRecord();
    try {
      const res = await fetch(`${API_BASE}/land-records/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) return getSampleRecord();
      const data = await res.json();
      return data?.record ? data : getSampleRecord();
    } catch {
      return getSampleRecord();
    }
  },

  async updateRecordField(id: string, field: string, newValue: any, reason?: string) {
    const res = await fetch(`${API_BASE}/land-records/${id}/field`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ field, newValue, reason }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
    return res.json();
  },

  // Validations
  async validateRecord(id: string): Promise<{ result: ValidationResult }> {
    if (demoEnabled()) return { result: sampleValidation(id) };
    const res = await fetch(`${API_BASE}/land-records/${id}/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getValidationResult(recordId: string): Promise<{ result: ValidationResult; record: LandRecord }> {
    if (demoEnabled()) {
      const record = sampleLandRecords.find((item) => item.recordId === recordId) || sampleLandRecords[0];
      return { result: sampleValidation(record.recordId), record };
    }
    const res = await fetch(`${API_BASE}/validations/${recordId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getValidationConflicts(): Promise<{ conflicts: any[] }> {
    const res = await fetch(`${API_BASE}/validations/conflicts`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Verification Tasks
  async getVerificationQueue(params?: any): Promise<{
    tasks: VerificationTask[];
    stats: { pending: number; inReview: number; verified: number; rejected: number; urgent: number };
  }> {
    const getSampleQueue = () => {
      const filtered = sampleVerificationTasks.filter((task) => {
        const text = `${task.ownerName} ${task.recordId} ${task.surveyNumber} ${task.village}`.toLowerCase();
        const categoryMatch = !params?.filterType || params.filterType === 'all' ||
          (params.filterType === 'critical' && task.priority === 'urgent') ||
          (params.filterType === 'low_confidence' && task.overallConfidence < 70) ||
          (params.filterType === 'conflict' && task.flagReasons.some((reason) => /conflict|ownership/i.test(reason))) ||
          (params.filterType === 'area_mismatch' && task.flagReasons.some((reason) => /area/i.test(reason))) ||
          (params.filterType === 'duplicate' && task.flagReasons.some((reason) => /duplicate/i.test(reason)));
        return categoryMatch && (!params?.priority || task.priority === params.priority) &&
          (!params?.search || text.includes(String(params.search).toLowerCase()));
      });
      return { tasks: filtered, stats: { pending: 1, inReview: 1, verified: 0, rejected: 0, urgent: 1 } };
    };
    if (demoEnabled()) return getSampleQueue();
    const query = new URLSearchParams(params || {}).toString();
    try {
      const res = await fetch(`${API_BASE}/verification/queue?${query}`, { headers: getAuthHeaders() });
      if (!res.ok) return getSampleQueue();
      const data = await res.json();
      if (!Array.isArray(data?.tasks) || data.tasks.length === 0) return getSampleQueue();
      return data;
    } catch {
      return getSampleQueue();
    }
  },

  async getVerificationTaskById(taskId: string): Promise<{
    task: VerificationTask;
    record: LandRecord;
    validation: ValidationResult;
    document?: IDocument;
  }> {
    const getSampleTask = () => {
      const task = sampleVerificationTasks.find((item) => item.taskId === taskId) || sampleVerificationTasks[0];
      const record = sampleLandRecords.find((item) => item.recordId === task.recordId) || sampleLandRecords[1];
      return { task, record, validation: sampleValidation(record.recordId) };
    };
    if (demoEnabled()) return getSampleTask();
    try {
      const res = await fetch(`${API_BASE}/verification/tasks/${taskId}`, { headers: getAuthHeaders() });
      if (!res.ok) return getSampleTask();
      const data = await res.json();
      return data?.task && data?.record ? data : getSampleTask();
    } catch {
      return getSampleTask();
    }
  },

  async completeVerification(taskId: string, payload: { action: 'verify' | 'reject'; notes?: string; corrections?: any[] }) {
    const res = await fetch(`${API_BASE}/verification/tasks/${taskId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Resolution failed');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params?: any): Promise<{
    logs: AuditLog[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    if (demoEnabled()) {
      const matching = sampleAuditLogs.filter((log) =>
        (!params?.action || log.action === params.action) &&
        (!params?.recordId || `${log.recordId || ''} ${log.documentId || ''}`.toLowerCase().includes(String(params.recordId).toLowerCase()))
      );
      return {
        logs: matching,
        pagination: { total: matching.length, page: Number(params?.page || 1), limit: matching.length, totalPages: 1 },
      };
    }
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/audit/logs?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Analytics & Learning Loop
  async getDashboardStats(): Promise<DashboardStats> {
    if (demoEnabled()) {
      dashboardSampleDataActive = true;
      return sampleDashboardStats;
    }
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getAuthHeaders() });
      if (!res.ok) {
        dashboardSampleDataActive = true;
        return sampleDashboardStats;
      }
      const data = await res.json();
      const hasDashboardData = typeof data?.totalDocuments === 'number' &&
        Array.isArray(data?.timelineData) && Array.isArray(data?.confidenceDistribution) &&
        Array.isArray(data?.errorCategoryDistribution) && Array.isArray(data?.stateWiseStats);
      dashboardSampleDataActive = !hasDashboardData;
      return hasDashboardData ? data : sampleDashboardStats;
    } catch {
      dashboardSampleDataActive = true;
      return sampleDashboardStats;
    }
  },

  async getLearningLoopMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/learning-loop`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
