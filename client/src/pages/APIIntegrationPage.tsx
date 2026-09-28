import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Key,
  Copy,
  Check,
  Send,
  Sparkles,
  Server,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const APIIntegrationPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/land-records/:id');
  const [copiedKey, setCopiedKey] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  const apiKey = 'bhoomi_setu_ai_live_sec_89f92a11b0c9e7829910d';

  const endpoints = [
    {
      method: 'POST',
      path: '/api/documents/upload',
      title: 'Upload Scanned Document',
      desc: 'Multipart upload of scanned PDF/JPG land deed. Triggers asynchronous Indic OCR & field extraction pipeline.',
      sampleRequest: `curl -X POST http://localhost:5000/api/documents/upload \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "file=@khasra_sample.pdf" \\
  -F "documentType=Khasra" \\
  -F "language=Hindi" \\
  -F "village=Rampur"`,
      sampleResponse: {
        message: 'Document uploaded successfully. Digitization and validation pipeline initiated.',
        documentId: 'DOC-MP-2026-001',
        status: 'ocr_processing',
        estimatedTimeMs: 1400,
      },
    },
    {
      method: 'GET',
      path: '/api/land-records/:id',
      title: 'Get Digital Land Record (RoR)',
      desc: 'Retrieves complete structured digital land record with confidence scores, bounding boxes, and validation badge.',
      sampleRequest: `curl -X GET http://localhost:5000/api/land-records/REC-MP-SEH-001 \\
  -H "Authorization: Bearer ${apiKey}"`,
      sampleResponse: {
        recordId: 'REC-MP-SEH-001',
        ownerName: { value: 'रमेश कुमार (Ramesh Kumar)', confidence: 0.96, source: 'OCR' },
        surveyNumber: { value: '124/3', confidence: 0.98, source: 'OCR' },
        area: { value: 2.45, unit: 'Acres', confidence: 0.93 },
        village: { value: 'Rampur', tehsil: 'Sehore', district: 'Sehore' },
        validationStatus: 'passed',
        verificationStatus: 'verified',
      },
    },
    {
      method: 'POST',
      path: '/api/land-records/:id/validate',
      title: 'Execute Rule-Based Validation Engine',
      desc: 'Runs the 10 deterministic land revenue integrity rules and cross-record title collision graph against target record.',
      sampleRequest: `curl -X POST http://localhost:5000/api/land-records/REC-MP-SEH-002/validate \\
  -H "Authorization: Bearer ${apiKey}"`,
      sampleResponse: {
        validationScore: 68,
        overallStatus: 'failed',
        criticalIssuesCount: 2,
        issues: [
          {
            ruleId: 'RULE_01_SURVEY_CONSISTENCY',
            ruleName: 'Survey Number Consistency',
            severity: 'critical',
            explanation: 'Survey No. 124/3 in Village Rampur is claimed by Dinesh Chandra, but previously registered under Ramesh Kumar.',
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/verification/tasks/:id/resolve',
      title: 'Resolve Human Verification Task',
      desc: 'Enables Revenue Officer to approve, reject, or commit field-level corrections with mandatory audit justification.',
      sampleRequest: `curl -X POST http://localhost:5000/api/verification/tasks/TASK-MP-2026-001/resolve \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "verify", "notes": "Approved against physical revenue register", "corrections": []}'`,
      sampleResponse: {
        message: 'Record verified and approved successfully.',
        status: 'verified',
        auditLogId: 'AUD-2026-9921',
      },
    },
    {
      method: 'GET',
      path: '/api/analytics/dashboard',
      title: 'Get Real-Time Analytics & KPIs',
      desc: 'Live aggregation of digitized volume, accuracy metrics, and district modernization progress.',
      sampleRequest: `curl -X GET http://localhost:5000/api/analytics/dashboard \\
  -H "Authorization: Bearer ${apiKey}"`,
      sampleResponse: {
        totalDocuments: 12480,
        processedDocuments: 9842,
        pendingVerification: 1726,
        averageAccuracy: 91.4,
      },
    },
  ];

  const current = endpoints.find((e) => `${e.method} ${e.path}` === selectedEndpoint) || endpoints[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunSandbox = () => {
    setLoadingTest(true);
    setTimeout(() => {
      setTestResponse(JSON.stringify(current.sampleResponse, null, 2));
      setLoadingTest(false);
    }, 450);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Government API Integration Hub
            </span>
            <span className="text-xs text-slate-500">• Section 16 Integration Readiness</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Bhoomi Setu AI REST API & Interoperability Gateway
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardized interfaces for seamless integration with Bhulekh, PM-KISAN, NLRMP, e-Dharti, and state revenue registries.
          </p>
        </div>

        {/* API Key Box */}
        <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 space-x-2 text-xs">
          <Key className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-mono text-slate-700 font-semibold">{apiKey}</span>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800"
            title="Copy API Key"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint List (4/12) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
            Available Core Endpoints
          </h3>
          <div className="space-y-1.5">
            {endpoints.map((ep) => {
              const key = `${ep.method} ${ep.path}`;
              const isSelected = selectedEndpoint === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedEndpoint(key);
                    setTestResponse(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        ep.method === 'GET'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ep.method === 'POST'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono truncate">{ep.path}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-normal line-clamp-1">{ep.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Endpoint Details & Live Sandbox (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {current.method}
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono">{current.path}</span>
              </div>
              <button
                onClick={handleRunSandbox}
                disabled={loadingTest}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loadingTest ? 'Executing...' : 'Run Live Sandbox Test'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">{current.desc}</p>

            {/* cURL Request */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Sample cURL Request
              </span>
              <pre className="bg-slate-900 text-amber-300 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                {current.sampleRequest}
              </pre>
            </div>

            {/* Response JSON */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Response Payload (JSON 200 OK)
              </span>
              <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800 max-h-64">
                {testResponse || JSON.stringify(current.sampleResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
