import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { LandRecord } from '../../../shared/types';
import { ValidationBadge, VerificationBadge } from '../components/common/ValidationBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';

interface LandRecordsPageProps {
  onSelectRecord: (recordId: string) => void;
}

export const LandRecordsPage: React.FC<LandRecordsPageProps> = ({ onSelectRecord }) => {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search parameters
  const [q, setQ] = useState('');
  const [village, setVillage] = useState('');
  const [validationStatus, setValidationStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (q) params.q = q;
      if (village) params.village = village;
      if (validationStatus) params.validationStatus = validationStatus;
      if (verificationStatus) params.verificationStatus = verificationStatus;

      const res = await api.searchLandRecords(params);
      setRecords(res.records);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error('Failed to search records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchRecords, 200);
    return () => clearTimeout(delay);
  }, [q, village, validationStatus, verificationStatus]);

  const handleExportCSV = () => {
    window.open('/api/land-records/export?format=csv', '_blank');
  };

  const handleExportJSON = () => {
    window.open('/api/land-records/export?format=json', '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Digitized Land Registry
            </span>
            <span className="text-xs text-slate-500">• {total} Total Digital Parcels</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Search Digital Land Records & Titles (अधिकार अभिलेख)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Query by owner name in Devanagari/English, Survey/Khasra number, Khata ledger, or revenue village.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Main Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Owner (e.g. Ramesh, रमेश), Survey (124/3), Record ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Validation Status Filter */}
          <div>
            <select
              value={validationStatus}
              onChange={(e) => setValidationStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
            >
              <option value="">All Validation Statuses</option>
              <option value="passed">Passed (वैध)</option>
              <option value="warning">Warning (सतर्कता)</option>
              <option value="failed">Failed / Conflict (त्रुटिपूर्ण)</option>
              <option value="needs_review">Needs Review</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
            >
              <option value="">All Verification Statuses</option>
              <option value="pending">Pending Officer Action</option>
              <option value="verified">Verified (सत्यापित)</option>
              <option value="rejected">Rejected (अस्वीकृत)</option>
              <option value="auto_approved">Auto Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-3">Record ID</th>
                <th className="py-3 px-3">Owner (भूमि स्वामी)</th>
                <th className="py-3 px-3">Survey / Khasra</th>
                <th className="py-3 px-3">Area</th>
                <th className="py-3 px-3">Village / District</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">AI Confidence</th>
                <th className="py-3 px-3">Validation</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Searching records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No land records match your search criteria.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.recordId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {rec.recordId}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {rec.ownerName?.value}
                      {rec.fatherOrSpouseName?.value && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          s/o {rec.fatherOrSpouseName.value}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {rec.surveyNumber?.value || rec.khasraNumber?.value}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {rec.area?.value} {rec.areaUnit?.value || 'Acres'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {rec.village?.value}, {rec.district?.value}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {rec.landClassification?.value || 'Agricultural'}
                    </td>
                    <td className="py-3 px-3">
                      <ConfidenceBadge score={rec.confidenceScore} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <ValidationBadge status={rec.validationStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <VerificationBadge status={rec.verificationStatus} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectRecord(rec.recordId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold rounded transition-colors inline-flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
