import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  RefreshCw,
  FileText,
  CheckCircle2,
  XCircle,
  Edit3,
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog, AuditAction } from '../../../shared/types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (actionFilter) params.action = actionFilter;
      if (search) params.recordId = search;

      const res = await api.getAuditLogs(params);
      setLogs(res.logs);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, search]);

  const actionsList: AuditAction[] = [
    'DOCUMENT_UPLOADED',
    'OCR_COMPLETED',
    'FIELDS_EXTRACTED',
    'VALIDATION_STARTED',
    'VALIDATION_PASSED',
    'VALIDATION_FAILED',
    'FIELD_CORRECTED',
    'RECORD_VERIFIED',
    'RECORD_REJECTED',
    'RECORD_APPROVED',
  ];

  const getActionBadge = (action: AuditAction) => {
    if (action.includes('PASSED') || action.includes('VERIFIED') || action.includes('APPROVED')) {
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {action}
        </span>
      );
    }
    if (action.includes('FAILED') || action.includes('REJECTED')) {
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3 h-3 mr-1" />
          {action}
        </span>
      );
    }
    if (action.includes('CORRECTED')) {
      return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
          <Edit3 className="w-3 h-3 mr-1" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
        <Clock className="w-3 h-3 mr-1" />
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
              Immutable Audit Ledger
            </span>
            <span className="text-xs text-slate-500">• Legal Chain of Custody</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Operations & Verification Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete cryptographic audit trail of all ingestion events, optical extractions, validation failures, and officer rectifications.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
          >
            <option value="">All Action Types ({actionsList.length})</option>
            {actionsList.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-300 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search Record ID (e.g. REC-MP)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-800 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-3">Log ID & Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Record</th>
                <th className="py-3 px-3">Actor / Officer</th>
                <th className="py-3 px-3">Operation Details</th>
                <th className="py-3 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 block">{log.logId}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-blue-700">
                      {log.recordId || log.documentId || 'System'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{log.performedBy.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{log.performedBy.role}</div>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <p className="text-slate-800">{log.details || log.reason}</p>
                      {log.fieldChanged && (
                        <div className="mt-1 p-1 bg-amber-50 border border-amber-200 rounded text-[11px] font-mono">
                          <span className="text-rose-600 line-through mr-1">"{String(log.oldValue)}"</span> →{' '}
                          <span className="text-emerald-700 font-bold">"{String(log.newValue)}"</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
