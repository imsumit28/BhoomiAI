import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  UserCheck,
  Layers,
  HelpCircle,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { ValidationResult, LandRecord } from '../../../shared/types';
import { ValidationBadge } from '../components/common/ValidationBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';

interface ValidationResultsPageProps {
  initialRecordId?: string;
  onNavigateToVerification: (taskId?: string) => void;
  onNavigateToRecord: (recordId: string) => void;
}

export const ValidationResultsPage: React.FC<ValidationResultsPageProps> = ({
  initialRecordId = 'REC-MP-SEH-002',
  onNavigateToVerification,
  onNavigateToRecord,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState(initialRecordId);
  const [validationData, setValidationData] = useState<{ result: ValidationResult; record: LandRecord } | null>(null);
  const [allRecords, setAllRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);

  useEffect(() => {
    async function loadAllRecords() {
      try {
        const res = await api.searchLandRecords({ limit: 50 });
        setAllRecords(res.records);
      } catch (err) {
        console.error('Error fetching records:', err);
      }
    }
    loadAllRecords();
  }, []);

  const loadValidation = async (recId: string) => {
    setLoading(true);
    try {
      const res = await api.getValidationResult(recId);
      setValidationData(res);
      setSelectedRecordId(recId);
    } catch (err) {
      console.error('Failed to load validation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRecordId) {
      loadValidation(selectedRecordId);
    }
  }, [selectedRecordId]);

  const handleRevalidate = async () => {
    if (!selectedRecordId) return;
    setRevalidating(true);
    try {
      const res = await api.validateRecord(selectedRecordId);
      if (validationData) {
        setValidationData({ ...validationData, result: res.result });
      }
    } catch (err) {
      console.error('Re-validation error:', err);
    } finally {
      setRevalidating(false);
    }
  };

  const result = validationData?.result;
  const record = validationData?.record;

  const criticalIssues = result?.issues.filter((i) => i.severity === 'critical') || [];
  const warningIssues = result?.issues.filter((i) => i.severity === 'warning') || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header & Record Selector */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
              Rule-Based Validation Engine
            </span>
            <span className="text-xs text-slate-500">• 10 Deterministic Rules</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Automated Land Record Integrity & Title Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cross-verifying historical deed claims, parcel subdivisions, administrative hierarchy, and legal chronological sequences.
          </p>
        </div>

        {/* Record Selector Dropdown & Re-run Action */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-300">
            <Search className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={selectedRecordId}
              onChange={(e) => loadValidation(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 px-2 py-1 focus:outline-none cursor-pointer"
            >
              {allRecords.map((r) => (
                <option key={r.recordId} value={r.recordId}>
                  {r.recordId} — {r.ownerName?.value} (Survey: {r.surveyNumber?.value}) [
                  {r.validationStatus?.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRevalidate}
            disabled={revalidating}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${revalidating ? 'animate-spin' : ''}`} />
            <span>Re-run Validation</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Evaluating 10 Land Revenue Validation Rules...</p>
        </div>
      ) : (
        <>
          {/* Validation Score Banner */}
          <div
            className={`rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${
              result?.overallStatus === 'passed'
                ? 'bg-gradient-to-r from-emerald-800 to-teal-950'
                : result?.overallStatus === 'warning'
                ? 'bg-gradient-to-r from-amber-700 to-orange-950'
                : 'bg-gradient-to-r from-rose-800 to-red-950'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Record ID: {record?.recordId}
                </span>
                <span className="text-xs text-slate-200 font-medium">
                  {record?.village?.value}, Tehsil {record?.tehsil?.value}, District {record?.district?.value}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold flex items-center space-x-2">
                {result?.overallStatus === 'passed' ? (
                  <>
                    <ShieldCheck className="w-7 h-7 text-emerald-300" />
                    <span>All Legal Land Validation Rules Passed</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-7 h-7 text-rose-300 animate-pulse" />
                    <span>
                      {result?.criticalIssuesCount} Critical Anomalies & {result?.warningIssuesCount} Warnings Detected
                    </span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-200 max-w-xl">
                Claimant: <strong>{record?.ownerName?.value}</strong> • Survey No: <strong>{record?.surveyNumber?.value}</strong> • Area: <strong>{record?.area?.value} {record?.areaUnit?.value || 'Acres'}</strong>
              </p>
            </div>

            {/* Score Gauges */}
            <div className="flex items-center space-x-6 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-black">{result?.validationScore}/100</div>
                <div className="text-[11px] font-semibold text-slate-200 uppercase mt-0.5">Validation Score</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-black text-amber-300">{result?.dataQualityScore}%</div>
                <div className="text-[11px] font-semibold text-slate-200 uppercase mt-0.5">Data Quality</div>
              </div>
            </div>
          </div>

          {/* Issue Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3): Critical & Warning Issues Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              {/* Critical Issues */}
              {criticalIssues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Critical Validation Violations ({criticalIssues.length})</span>
                  </h3>

                  {criticalIssues.map((issue) => (
                    <div
                      key={issue.ruleId}
                      className="bg-white rounded-xl p-5 border-2 border-rose-300 shadow-sm space-y-3 hover:border-rose-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          {issue.ruleName} ({issue.ruleId})
                        </span>
                        <span className="text-xs font-black text-rose-600 uppercase">CRITICAL</span>
                      </div>

                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {issue.explanation}
                      </p>

                      <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200/80 space-y-1 text-xs">
                        <div>
                          <strong className="text-slate-700">Detected Value:</strong>{' '}
                          <span className="font-mono text-rose-900 font-semibold">{String(issue.detectedValue)}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Expected Condition:</strong>{' '}
                          <span className="text-slate-800">{issue.expectedCondition}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                        <div className="text-slate-600">
                          <strong>Recommended Action:</strong> {issue.recommendedAction}
                        </div>
                        <button
                          onClick={() => onNavigateToVerification()}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow text-xs flex items-center space-x-1 shrink-0 ml-2"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Resolve in Queue</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning Issues */}
              {warningIssues.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Warnings & Uncertainty Guardrails ({warningIssues.length})</span>
                  </h3>

                  {warningIssues.map((issue) => (
                    <div
                      key={issue.ruleId}
                      className="bg-white rounded-xl p-5 border border-amber-300 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          {issue.ruleName}
                        </span>
                        <span className="text-xs font-bold text-amber-700 uppercase">WARNING</span>
                      </div>

                      <p className="text-sm font-medium text-slate-900 leading-snug">
                        {issue.explanation}
                      </p>

                      <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs space-y-1">
                        <div>
                          <strong className="text-slate-700">Detected Value:</strong>{' '}
                          <span className="font-mono text-amber-900 font-semibold">{String(issue.detectedValue)}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Expected:</strong>{' '}
                          <span className="text-slate-800">{issue.expectedCondition}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <strong>Recommended Action:</strong> {issue.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {criticalIssues.length === 0 && warningIssues.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">
                    No Validation Anomalies or Discrepancies Detected!
                  </h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    This land record meets all mandatory revenue criteria, parcel boundary sum tolerances, and chronological legal prerequisites.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column (1/3): Passed Rules Roster & Quick Actions */}
            <div className="space-y-6">
              {/* Passed Rules Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Passed Validation Checks ({result?.passedRulesCount || 0}/10)</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </h3>

                <div className="mt-3 space-y-2">
                  {(result?.passedRules || []).map((ruleName) => (
                    <div key={ruleName} className="flex items-center space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{ruleName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Record Title Analysis Box */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Cross-Record Title Graph</span>
                  <Layers className="w-4 h-4 text-blue-600" />
                </h3>
                <p className="text-xs text-slate-600">
                  Every digitized deed is cross-referenced against historical cadastral mutations in <strong>{record?.village?.value}</strong> to prevent double-registration scams.
                </p>

                {result?.crossRecordConflicts && result.crossRecordConflicts.length > 0 ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-rose-900 block">Conflict Detected:</span>
                    <span className="text-rose-800">{result.crossRecordConflicts[0].details}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    ✓ Title graph is clean with no overlapping claims for Survey {record?.surveyNumber?.value}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
