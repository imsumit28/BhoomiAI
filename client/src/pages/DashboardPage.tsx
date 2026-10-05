import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  AlertTriangle,
  UploadCloud,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats } from '../../../shared/types';
import { ValidationBadge, VerificationBadge } from '../components/common/ValidationBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { useLanguage } from '../context/LanguageContext';
import { PrototypeShowcaseSection } from '../components/dashboard/PrototypeShowcaseSection';

interface DashboardPageProps {
  onNavigate: (tab: string, contextId?: string) => void;
  onStartDemoTour: () => void;
}

const COLORS = ['#046A38', '#FF671F', '#D32828', '#17324D', '#A9A8A8'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onStartDemoTour }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard heading */}
      <div className="bg-white border border-slate-200 rounded-md px-5 py-5 md:px-7 md:py-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-wide text-[#046A38] mb-1.5">Department of Land Resources</p>
            <h1 className="text-2xl sm:text-[28px] leading-tight font-bold tracking-tight text-[#17324D]">
              Bhoomi Setu AI — Intelligent Land Record Digitization & Validation
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mt-2 leading-6">
              Automating legacy land records ingestion with deep Indic OCR, multi-rule validation engine, and human-in-the-loop audit verification.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onStartDemoTour}
              className="px-4 py-2 bg-white border border-[#FF671F] text-[#B84912] hover:bg-orange-50 text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>3-Min Live Demo</span>
            </button>

            <button
              onClick={() => onNavigate('upload')}
                className="px-4 py-2 bg-[#046A38] hover:bg-[#03552D] text-white text-xs font-semibold rounded-md shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={loadStats}
              className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-md transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <PrototypeShowcaseSection onNavigate={onNavigate} />

      {/* Top KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Scans</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats?.totalDocuments?.toLocaleString() || '12,480'}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +8.4% this week
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">AI Processed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats?.processedDocuments?.toLocaleString() || '9,842'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">78.8% automated</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Validated & Passed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {stats?.validatedRecords?.toLocaleString() || '8,930'}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Legally sound</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Verification Queue</span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {stats?.pendingVerification || '1,726'}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">HITL review pending</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Rejected / Flagged</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">
            {stats?.rejectedRecords?.toLocaleString() || '912'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Disputed deeds</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">AI Accuracy</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2">
            {stats?.averageAccuracy || '91.4'}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">+4.8% after training</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Processing Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Digitization & Verification Velocity</h2>
              <p className="text-xs text-slate-500">Daily throughput of processed and verified land parcels</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Last 7 Days
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.timelineData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="processed" name="AI Ingested" stroke="#3B82F6" fillOpacity={1} fill="url(#colorProcessed)" />
                <Area type="monotone" dataKey="verified" name="Legally Verified" stroke="#10B981" fillOpacity={1} fill="url(#colorVerified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: AI Confidence Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Extraction Confidence Distribution</h2>
              <p className="text-xs text-slate-500">Confidence score brackets across digitized records</p>
            </div>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.confidenceDistribution || []}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(stats?.confidenceDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1.5 text-xs">
            {(stats?.confidenceDistribution || []).map((item, idx) => (
              <div key={item.range} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{item.range}</span>
                </div>
                <span className="font-bold text-slate-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Error Category Breakdown & District Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Categories Bar Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Validation Engine: Detected Issue Categories</h2>
              <p className="text-xs text-slate-500">Top anomalies flagged across 10 validation rules</p>
            </div>
            <button
              onClick={() => onNavigate('validation')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              View Rules <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.errorCategoryDistribution || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" name="Violations" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Digitization Progress Table */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">District Digitization & Accuracy Index</h2>
              <p className="text-xs text-slate-500">Madhya Pradesh Land Records Modernization</p>
            </div>
            <button
              onClick={() => onNavigate('gis')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              GIS Map <MapPin className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Total Parcels</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.stateWiseStats || []).map((row) => {
                  const pct = Math.round((row.validated / row.total) * 100);
                  return (
                    <tr key={row.district} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {row.district}
                        <span className="block text-[10px] text-slate-400 font-normal">{row.state}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{row.total.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-semibold text-slate-800">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <ConfidenceBadge score={row.accuracy} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Digitized Records with Statuses */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Land Record Digitizations</h2>
            <p className="text-xs text-slate-500">Live feed of scanned records, confidence scores, and rule verification</p>
          </div>
          <button
            onClick={() => onNavigate('records')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
          >
            All Records <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Owner Name</th>
                <th className="py-2.5 px-3">Survey / Khasra</th>
                <th className="py-2.5 px-3">Area</th>
                <th className="py-2.5 px-3">Village / District</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Validation Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats?.recentRecords || []).map((record) => (
                <tr key={record.recordId} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">
                    {record.recordId}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {record.ownerName?.value}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800">
                    {record.surveyNumber?.value}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {record.area?.value} {record.areaUnit?.value || 'Acres'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {record.village?.value}, {record.district?.value}
                  </td>
                  <td className="py-2.5 px-3">
                    <ConfidenceBadge score={record.confidenceScore} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">
                    <ValidationBadge status={record.validationStatus} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('detail', record.recordId)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
