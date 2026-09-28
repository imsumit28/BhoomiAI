import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldAlert,
  UserCheck,
  History,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface DemoScenarioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string, contextId?: string) => void;
}

export const DemoScenarioGuideModal: React.FC<DemoScenarioGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: '01',
      title: 'Upload Scanned Land Record (Aged Hindi Deed)',
      tag: 'Step 1: Document Ingestion',
      desc: 'Officer uploads a historical scanned revenue deed (Khasra No. 124/3 from Rampur Village, Sehore). The system accepts PDF/JPG and initiates the automated optical pipeline.',
      targetTab: 'upload',
      contextId: undefined,
      actionText: 'Go to Upload Page',
      highlight: 'Notice the pre-loaded sample scenarios for 1-click test data injection.',
    },
    {
      stepNumber: '02',
      title: 'Optical Ingestion & Deep Indic OCR Processing',
      tag: 'Step 2: Optical Extraction',
      desc: 'The hybrid Indic OCR engine recognizes characters in Devanagari script, generates bounding boxes with coordinates, and tags confidence metrics for every individual token.',
      targetTab: 'processing',
      contextId: 'DOC-MP-2026-001',
      actionText: 'Open Optical Inspector',
      highlight: 'Click any extracted field on the right to focus the bounding box on the original scan.',
    },
    {
      stepNumber: '03',
      title: 'Confidence Scoring & Uncertainty Guardrail (< 70%)',
      tag: 'Step 3: Confidence Awareness',
      desc: 'Fields with OCR confidence < 70% (due to faded ink or degraded handwriting) are automatically highlighted with visual uncertainty warnings and routed for human verification.',
      targetTab: 'processing',
      contextId: 'DOC-MP-2026-007',
      actionText: 'Inspect Noisy OCR Record',
      highlight: 'Notice how low-confidence fields alert the system before committing erroneous data.',
    },
    {
      stepNumber: '04',
      title: '10-Rule Validation Engine & Cross-Record Title Graph',
      tag: 'Step 4: Rule Engine Execution',
      desc: 'THE CORE DIFFERENTIATOR: Bhoomi Setu AI validates against 10 legal revenue rules. It detects that Survey 124/3 has a conflicting claim by "Dinesh Chandra" while registered under "Ramesh Kumar".',
      targetTab: 'validation',
      contextId: 'REC-MP-SEH-002',
      actionText: 'View Validation Diagnostics',
      highlight: 'Critical title collision and sub-parcel area excess (> parent 5.00 Acres) are caught.',
    },
    {
      stepNumber: '05',
      title: 'Human-in-the-Loop (HITL) Rectification Queue',
      tag: 'Step 5: Officer Verification',
      desc: 'The Revenue Officer inspects the flagged parcel, compares the OCR raw string against physical patwari registers, corrects the field, and enters regulatory notes.',
      targetTab: 'verification',
      contextId: undefined,
      actionText: 'Open Verification Queue',
      highlight: 'Officer can edit "Ramesh Kurnar" → "Ramesh Kumar" and approve the digital record.',
    },
    {
      stepNumber: '06',
      title: 'Cryptographic Audit Trail & Dashboard Velocity',
      tag: 'Step 6: Auditability & Analytics',
      desc: 'Every change is permanently logged with before/after diffs, timestamp, and officer ID. The verified record is committed to the digital registry and live dashboard KPIs update.',
      targetTab: 'audit',
      contextId: undefined,
      actionText: 'View Audit Logs & Dashboard',
      highlight: 'Zero data tampering — complete legal chain of custody for SIH judges.',
    },
  ];

  const current = steps[currentStep];

  const handleExecuteStep = () => {
    onNavigateTab(current.targetTab, current.contextId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-gov-navy to-blue-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                SIH 2026 Interactive Guided Demo Tour (3 Minutes)
              </h2>
              <p className="text-xs text-blue-200">
                End-to-End Workflow: Ingestion → OCR → Validation → HITL → Audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5">
          {/* Step Badge & Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {current.tag}
              </span>
              <span className="text-slate-500 font-mono">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Main Details */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">{current.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{current.desc}</p>
          </div>

          {/* Judges Key Evaluation Highlight Box */}
          <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold text-amber-950 block">💡 Hackathon Demo Cue:</span>
            <p className="text-[11px] leading-relaxed text-amber-900/90">{current.highlight}</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExecuteStep}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5 transition-colors"
            >
              <span>{current.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => {
                  handleExecuteStep();
                  setCurrentStep((s) => s + 1);
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <span>Next Step →</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow"
              >
                Finish Demo Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
