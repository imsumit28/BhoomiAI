import {
  LandRecord,
  Document as IDocument,
  ValidationResult,
  VerificationTask,
  AuditLog,
  DashboardStats,
  MasterHierarchy,
} from '../../../shared/types';

const API_BASE = '/api';

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
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/land-records/search?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getLandRecordById(id: string): Promise<{
    record: LandRecord;
    validation: ValidationResult;
    auditLogs: AuditLog[];
    siblingRecords: any[];
  }> {
    const res = await fetch(`${API_BASE}/land-records/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
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
    const res = await fetch(`${API_BASE}/land-records/${id}/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getValidationResult(recordId: string): Promise<{ result: ValidationResult; record: LandRecord }> {
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
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/verification/queue?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getVerificationTaskById(taskId: string): Promise<{
    task: VerificationTask;
    record: LandRecord;
    validation: ValidationResult;
    document?: IDocument;
  }> {
    const res = await fetch(`${API_BASE}/verification/tasks/${taskId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
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
    const query = new URLSearchParams(params || {}).toString();
    const res = await fetch(`${API_BASE}/audit/logs?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Analytics & Learning Loop
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getLearningLoopMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/learning-loop`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
