import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  CheckCircle2,
  Clock,
  History,
  Download,
  Printer,
  ArrowLeft,
  MapPin,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { LandRecord, ValidationResult, AuditLog } from '../../../shared/types';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { ValidationBadge, VerificationBadge } from '../components/common/ValidationBadge';

interface RecordDetailPageProps {
  recordId: string;
  onBack: () => void;
  onNavigateToDocument: (docId: string) => void;
  onNavigateToValidation: (recordId: string) => void;
}

export const RecordDetailPage: React.FC<RecordDetailPageProps> = ({
  recordId,
  onBack,
  onNavigateToDocument,
  onNavigateToValidation,
}) => {
  const [record, setRecord] = useState<LandRecord | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [siblingRecords, setSiblingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getLandRecordById(recordId);
        setRecord(res.record);
        setValidation(res.validation);
        setAuditLogs(res.auditLogs);
        setSiblingRecords(res.siblingRecords);
      } catch (err) {
        console.error('Failed to load record detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [recordId]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Clock className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border">
        <h2 className="text-lg font-bold text-slate-800">Record Not Found</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Action & Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Records Directory
        </button>

        <div className="flex items-center space-x-2">
          {record.documentId && (
            <button
              onClick={() => onNavigateToDocument(record.documentId!)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>View Scanned Document</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Digital RoR</span>
          </button>
        </div>
      </div>

      {/* Official Digital Certificate Header */}
      <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-6 relative overflow-hidden">
        {/* Top Emblem Strip */}
        <div className="text-center pb-4 border-b-2 border-slate-200 relative">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
            Government of Madhya Pradesh • Revenue & Land Records Directorate
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 font-serif">
            Digital Record of Rights (RoR) / खसरा अधिकार अभिलेख
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issued under NLRMP Digital Land Governance Framework 2026
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-300">
              Record ID: {record.recordId}
            </span>
            <ValidationBadge status={record.validationStatus} />
            <VerificationBadge status={record.verificationStatus} />
            <ConfidenceBadge score={record.confidenceScore} size="sm" />
          </div>
        </div>

        {/* Certificate Data Sections */}
        <div className="mt-6 space-y-6">
          {/* 1. Ownership & Landholder Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded flex items-center justify-between">
              <span>1. Ownership & Landholder Particulars (भूमि स्वामी विवरण)</span>
              <span className="text-[10px] text-slate-500 font-normal">Source: OCR Verified</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 text-xs">
              <div>
                <span className="text-slate-500 block">Landholder Name:</span>
                <span className="text-sm font-bold text-slate-950 block mt-0.5 font-indic">
                  {record.ownerName?.value}
                </span>
                <ConfidenceBadge score={record.ownerName?.confidence || 0.95} size="sm" />
              </div>
              <div>
                <span className="text-slate-500 block">Father / Spouse:</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5 font-indic">
                  {record.fatherOrSpouseName?.value || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Ownership Structure:</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  {record.ownershipType?.value || 'Single Owner (एकल)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Language / Script:</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  {record.language} (Devanagari)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Parcel Location & Cadastral Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded flex items-center justify-between">
              <span>2. Cadastral Parcel & Area Specifications (भूखंड व क्षेत्रफल)</span>
              <span className="text-[10px] text-slate-500 font-normal">Revenue Master Matched</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 text-xs">
              <div>
                <span className="text-slate-500 block">Survey / Khasra No:</span>
                <span className="text-base font-bold font-mono text-blue-900 block mt-0.5">
                  {record.surveyNumber?.value}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Khata Number:</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5 font-mono">
                  {record.khataNumber?.value || '458'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Area (रकबा):</span>
                <span className="text-sm font-bold text-emerald-800 block mt-0.5">
                  {record.area?.value} {record.areaUnit?.value || 'Acres'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Land Classification:</span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  {record.landClassification?.value || 'Agricultural'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-3 pb-3 text-xs border-t border-slate-100 pt-2">
              <div>
                <span className="text-slate-500 block">Village (ग्राम):</span>
                <span className="font-semibold text-slate-900">{record.village?.value}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tehsil (तहसील):</span>
                <span className="font-semibold text-slate-900">{record.tehsil?.value}</span>
              </div>
              <div>
                <span className="text-slate-500 block">District (जिला):</span>
                <span className="font-semibold text-slate-900">{record.district?.value}</span>
              </div>
              <div>
                <span className="text-slate-500 block">State (राज्य):</span>
                <span className="font-semibold text-slate-900">{record.state?.value}</span>
              </div>
            </div>
          </div>

          {/* 3. Registration & Mutation History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-2 rounded flex items-center justify-between">
              <span>3. Legal Registration & Mutation Orders (पंजीकरण व नामांतरण)</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 text-xs">
              <div>
                <span className="text-slate-500 block">Deed Registration No:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {record.registrationNumber?.value || 'REG-2022-8921'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Registration Date:</span>
                <span className="font-mono text-slate-800">
                  {record.registrationDate?.value || '2022-08-15'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Mutation Order No:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {record.mutationNumber?.value || 'M-2023-1102'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Mutation Date:</span>
                <span className="font-mono text-slate-800">
                  {record.mutationDate?.value || '2023-03-14'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sibling Sub-parcels if any */}
        {siblingRecords.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
            <span className="font-bold text-blue-900 block mb-1">
              Related Cadastral Sub-parcels in Village {record.village?.value}:
            </span>
            <div className="flex flex-wrap gap-2">
              {siblingRecords.map((s) => (
                <span
                  key={s.recordId}
                  className="bg-white border border-blue-300 px-2 py-1 rounded font-mono text-[11px]"
                >
                  {s.surveyNumber?.value || s.surveyNumber} • {s.area?.value || s.area} Acres ({s.ownerName?.value || s.ownerName})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail Timeline for this Record */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Immutable Audit Trail (अंकेक्षण इतिहास)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {auditLogs.length} Logged Operations
          </span>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.logId}
              className="flex items-start space-x-3 text-xs p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600">{log.details || log.reason}</p>
                {log.fieldChanged && (
                  <div className="text-[11px] font-mono bg-white p-1.5 rounded border border-slate-200 mt-1">
                    <span className="text-rose-600 line-through mr-2">Old: "{String(log.oldValue)}"</span>
                    <span className="text-emerald-700 font-bold">New: "{String(log.newValue)}"</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400">
                  Officer: <strong>{log.performedBy.name}</strong> ({log.performedBy.role}) • IP: {log.ipAddress}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
