import React, { useState, useEffect } from 'react';
import {
  UserCheck2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  FileText,
  User,
  Save,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { VerificationTask, LandRecord, ValidationResult } from '../../../shared/types';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { VerificationBadge } from '../components/common/ValidationBadge';
import { useAuth } from '../context/AuthContext';

interface VerificationQueuePageProps {
  onNavigateToDocument: (docId: string) => void;
}

export const VerificationQueuePage: React.FC<VerificationQueuePageProps> = ({ onNavigateToDocument }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [stats, setStats] = useState<any>({ pending: 0, inReview: 0, verified: 0, rejected: 0, urgent: 0 });
  const [filterType, setFilterType] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Task Workspace Modal
  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null);
  const [taskDetails, setTaskDetails] = useState<{
    task: VerificationTask;
    record: LandRecord;
    validation: ValidationResult;
    document?: any;
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Field Correction Form inside modal
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [officerNotes, setOfficerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType !== 'all') params.filterType = filterType;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getVerificationQueue(params);
      setTasks(res.tasks);
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [filterType, priorityFilter, searchQuery]);

  const openTaskModal = async (task: VerificationTask) => {
    setSelectedTask(task);
    setLoadingDetails(true);
    setCorrections({});
    setOfficerNotes('');
    try {
      const details = await api.getVerificationTaskById(task.taskId);
      setTaskDetails(details);
      // Prepopulate editable fields
      if (details.record) {
        setCorrections({
          ownerName: String(details.record.ownerName?.value || ''),
          fatherOrSpouseName: String(details.record.fatherOrSpouseName?.value || ''),
          surveyNumber: String(details.record.surveyNumber?.value || ''),
          khasraNumber: String(details.record.khasraNumber?.value || ''),
          area: String(details.record.area?.value || ''),
          mutationNumber: String(details.record.mutationNumber?.value || ''),
        });
      }
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResolveTask = async (action: 'verify' | 'reject') => {
    if (!selectedTask || !taskDetails) return;
    setSubmitting(true);
    try {
      const formattedCorrections = Object.entries(corrections)
        .filter(([key, val]) => {
          const original = String((taskDetails.record as any)[key]?.value || '');
          return val !== original;
        })
        .map(([field, value]) => ({
          field,
          value,
          reason: officerNotes || 'Human-in-the-loop manual rectification',
        }));

      await api.completeVerification(selectedTask.taskId, {
        action,
        notes: officerNotes || (action === 'verify' ? 'Approved by officer' : 'Rejected due to deed mismatch'),
        corrections: formattedCorrections,
      });

      setSelectedTask(null);
      setTaskDetails(null);
      await loadQueue();
    } catch (err: any) {
      alert('Failed to resolve task: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Human-in-the-Loop (HITL) Queue
            </span>
            <span className="text-xs text-slate-500">• Section 10 Compliance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Revenue Officer Verification & Rectification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reviewing AI uncertainties (&lt; 70%), cross-record title disputes, and area inflation flags before official state ledger commit.
          </p>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500">Urgent:</span>{' '}
            <strong className="text-rose-700 font-bold">{stats.urgent}</strong>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500">Pending:</span>{' '}
            <strong className="text-amber-700 font-bold">{stats.pending}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500">Verified:</span>{' '}
            <strong className="text-emerald-700 font-bold">{stats.verified}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-500 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Category:
          </span>
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'critical', label: 'Urgent / Critical' },
            { id: 'low_confidence', label: 'Low Confidence (<70%)' },
            { id: 'conflict', label: 'Title Conflicts' },
            { id: 'area_mismatch', label: 'Sub-parcel Area Excess' },
            { id: 'duplicate', label: 'Duplicates' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === f.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-300 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search by owner, survey, record..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Verification Queue Cards Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Clock className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Verification Queue Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All flagged land records for this filter category have been verified and audited.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isUrgent = task.priority === 'urgent';
            return (
              <div
                key={task.taskId}
                className={`bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                  isUrgent ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">{task.recordId}</span>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isUrgent ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <VerificationBadge status={task.status} />
                    </div>
                  </div>

                  {/* Owner & Survey Details */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{task.ownerName}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Survey: <strong>{task.surveyNumber}</strong> • {task.village}, {task.district}
                    </p>
                  </div>

                  {/* Flag Reasons */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-700 block">Flag Reasons:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-700 font-medium">
                      {task.flagReasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="line-clamp-2">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Bottom Meta & Open Button */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400">AI Confidence:</span>
                    <ConfidenceBadge score={task.overallConfidence} size="sm" />
                  </div>

                  <button
                    onClick={() => openTaskModal(task)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Verify & Correct</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Human Verification & Rectification Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800 z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Task Workspace: {selectedTask.taskId}
                  </span>
                  <span className="text-xs bg-rose-600 text-white px-2 py-0.2 rounded font-bold">
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-lg font-bold mt-0.5">
                  Visual Field Inspection & Human Correction Protocol
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setTaskDetails(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-12 text-center space-y-2">
                <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs text-slate-600">Loading deed artifacts & OCR overlays...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Anomalies Alert Box */}
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Triggered Validation Anomalies</span>
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-rose-800 font-medium">
                    {selectedTask.flagReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Side-by-Side OCR vs Extracted vs Officer Rectification Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Editable Field Comparison Matrix
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Every edit will generate an immutable audit log entry.
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Field Name</th>
                          <th className="py-2.5 px-3">OCR Extracted Value</th>
                          <th className="py-2.5 px-3">Confidence</th>
                          <th className="py-2.5 px-3">Officer Corrected Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { key: 'ownerName', label: 'Owner Name (भूमि स्वामी)', original: taskDetails?.record.ownerName },
                          { key: 'fatherOrSpouseName', label: 'Father/Spouse Name', original: taskDetails?.record.fatherOrSpouseName },
                          { key: 'surveyNumber', label: 'Survey / Khasra No.', original: taskDetails?.record.surveyNumber },
                          { key: 'area', label: 'Area (Acres)', original: taskDetails?.record.area },
                          { key: 'mutationNumber', label: 'Mutation Order No.', original: taskDetails?.record.mutationNumber },
                        ].map((item) => {
                          const origVal = item.original?.value || '';
                          const isModified = corrections[item.key] && corrections[item.key] !== String(origVal);

                          return (
                            <tr key={item.key} className={isModified ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{item.label}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-700 bg-slate-50">
                                {String(origVal)}
                              </td>
                              <td className="py-2.5 px-3">
                                <ConfidenceBadge score={item.original?.confidence || 0.9} size="sm" />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={corrections[item.key] || ''}
                                  onChange={(e) =>
                                    setCorrections({ ...corrections, [item.key]: e.target.value })
                                  }
                                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none ${
                                    isModified
                                      ? 'border-amber-500 bg-amber-50 text-slate-900 ring-1 ring-amber-300'
                                      : 'border-slate-300 bg-white text-slate-800 focus:border-blue-500'
                                  }`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Officer Reason / Decision Notes */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-800 block flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Officer Verification Remarks & Regulatory Justification:</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter reason for correction or approval remarks (e.g. 'Verified with legacy Patwari revenue seal on page 2')..."
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5" />
                    <span>Logged Officer: {user?.name}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      disabled={submitting}
                      onClick={() => handleResolveTask('reject')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Record</span>
                    </button>

                    <button
                      disabled={submitting}
                      onClick={() => handleResolveTask('verify')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Verify Record</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
