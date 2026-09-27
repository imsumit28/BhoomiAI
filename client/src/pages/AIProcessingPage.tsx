import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Edit3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { Document as IDocument, LandRecord, ValidationResult } from '../../../shared/types';
import { DocumentViewer, ViewerFieldItem } from '../components/viewer/DocumentViewer';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { ValidationBadge } from '../components/common/ValidationBadge';

interface AIProcessingPageProps {
  documentId?: string;
  onNavigateToValidation: (recordId: string) => void;
  onNavigateToVerification: (taskId?: string) => void;
}

export const AIProcessingPage: React.FC<AIProcessingPageProps> = ({
  documentId = 'DOC-MP-2026-001',
  onNavigateToValidation,
  onNavigateToVerification,
}) => {
  const [doc, setDoc] = useState<IDocument | null>(null);
  const [record, setRecord] = useState<LandRecord | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('ownerName');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'split' | 'document' | 'ocr'>('split');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getDocumentById(documentId);
        setDoc(res.document);
        setRecord(res.extractedRecord || null);
        setValidation(res.validation || null);
      } catch (err) {
        console.error('Failed to load document details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-700">Loading Optical Inspection & OCR Pipeline...</p>
      </div>
    );
  }

  // Build viewer fields array
  const viewerFields: ViewerFieldItem[] = record
    ? [
        {
          id: 'ownerName',
          label: 'Owner Name (भूमि स्वामी)',
          value: record.ownerName?.value,
          confidence: record.ownerName?.confidence || 0.95,
          boundingBox: record.ownerName?.boundingBox || { x: 10, y: 22, width: 38, height: 4, page: 1 },
          rawOcrText: record.ownerName?.rawOcrText,
          isLowConfidence: (record.ownerName?.confidence || 1) < 0.7,
        },
        {
          id: 'fatherOrSpouseName',
          label: 'Father/Spouse Name (पिता/पति)',
          value: record.fatherOrSpouseName?.value,
          confidence: record.fatherOrSpouseName?.confidence || 0.94,
          boundingBox: record.fatherOrSpouseName?.boundingBox || { x: 55, y: 22, width: 35, height: 4, page: 1 },
          rawOcrText: record.fatherOrSpouseName?.rawOcrText,
        },
        {
          id: 'surveyNumber',
          label: 'Survey / Khasra No (खसरा नं.)',
          value: record.surveyNumber?.value,
          confidence: record.surveyNumber?.confidence || 0.98,
          boundingBox: record.surveyNumber?.boundingBox || { x: 10, y: 30, width: 28, height: 4, page: 1 },
          rawOcrText: record.surveyNumber?.rawOcrText,
        },
        {
          id: 'khataNumber',
          label: 'Khata Number (खाता संख्या)',
          value: record.khataNumber?.value,
          confidence: record.khataNumber?.confidence || 0.92,
          boundingBox: record.khataNumber?.boundingBox || { x: 55, y: 30, width: 25, height: 4, page: 1 },
          rawOcrText: record.khataNumber?.rawOcrText,
        },
        {
          id: 'area',
          label: 'Area (क्षेत्रफल)',
          value: `${record.area?.value} ${record.areaUnit?.value || 'Acres'}`,
          confidence: record.area?.confidence || 0.93,
          boundingBox: record.area?.boundingBox || { x: 10, y: 38, width: 28, height: 4, page: 1 },
          rawOcrText: record.area?.rawOcrText,
        },
        {
          id: 'landClassification',
          label: 'Land Classification (वर्गीकरण)',
          value: record.landClassification?.value,
          confidence: record.landClassification?.confidence || 0.95,
          boundingBox: { x: 55, y: 38, width: 35, height: 4, page: 1 },
          rawOcrText: record.landClassification?.rawOcrText,
        },
        {
          id: 'mutationNumber',
          label: 'Mutation Order No (नामांतरण)',
          value: record.mutationNumber?.value || 'M-2023-1102',
          confidence: record.mutationNumber?.confidence || 0.94,
          boundingBox: record.mutationNumber?.boundingBox || { x: 10, y: 54, width: 35, height: 4, page: 1 },
          rawOcrText: record.mutationNumber?.rawOcrText,
        },
        {
          id: 'registrationNumber',
          label: 'Registration Deed No (पंजीकरण)',
          value: record.registrationNumber?.value || 'REG-2022-8921',
          confidence: record.registrationNumber?.confidence || 0.89,
          boundingBox: record.registrationNumber?.boundingBox || { x: 55, y: 46, width: 38, height: 4, page: 1 },
          rawOcrText: record.registrationNumber?.rawOcrText,
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Documents</span>
            <span>/</span>
            <span className="font-mono text-slate-700 font-bold">{doc?.documentId || documentId}</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">{doc?.documentType || 'Khasra'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-3">
            <span>{doc?.originalName || 'scanned_land_record.pdf'}</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              Lang: {doc?.language || 'Hindi'}
            </span>
          </h1>
        </div>

        {/* Global Record Status & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {validation && (
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Validation Engine:</span>
              <ValidationBadge status={validation.overallStatus} />
              <span className="text-xs font-bold text-slate-800">({validation.validationScore}/100)</span>
            </div>
          )}

          {record && (
            <button
              onClick={() => onNavigateToValidation(record.recordId)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow flex items-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Full Validation Rules Report</span>
            </button>
          )}

          <button
            onClick={() => onNavigateToVerification()}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow flex items-center space-x-1.5 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Open in Verification Queue</span>
          </button>
        </div>
      </div>

      {/* 3-Column Inspection Workspace: Left (Document View with Bounding Boxes), Center (OCR Stream), Right (Extracted Structured Fields) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5/12): Interactive Document Viewer */}
        <div className="lg:col-span-6 flex flex-col">
          <DocumentViewer
            fields={viewerFields}
            selectedFieldId={selectedFieldId}
            onSelectField={(id) => setSelectedFieldId(id)}
            documentTitle={doc?.originalName}
          />
        </div>

        {/* Center/Right Column (6/12): Field Inspector & OCR Stream */}
        <div className="lg:col-span-6 space-y-6">
          {/* Extracted Structured Fields Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Extracted Structured Land Record Fields
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Click any field to highlight bounding box</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {viewerFields.map((field) => {
                const isSelected = selectedFieldId === field.id;
                const isLowConf = field.confidence < 0.7;

                return (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`p-3 transition-colors cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-4 border-blue-600'
                        : isLowConf
                        ? 'bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-amber-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-600">{field.label}</span>
                        {isLowConf && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                            Review Required
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-950 font-sans">
                        {String(field.value)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Raw OCR: "{field.rawOcrText || field.value}"
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <ConfidenceBadge score={field.confidence} size="sm" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFieldId(field.id);
                        }}
                        className={`p-1.5 rounded text-xs ${
                          isSelected ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="Focus bounding box"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw OCR Text & Script Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Raw OCR Output Stream (Indic Engine)
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="text-slate-500">Detected Script:</span>
                <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                  {doc?.detectedScript || 'Devanagari (देवनागरी)'}
                </span>
              </div>
            </div>

            <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed max-h-48 border border-slate-800">
              {doc?.ocrText ||
                `प्रारूप खसरा (अधिकार अभिलेख) - मध्य प्रदेश शासन
ग्राम: रामपुर | तहसील: सीहोर | जिला: सीहोर
खसरा नं.: 124/3 | खाता संख्या: 458
भूमि स्वामी: रमेश कुमार | पिता: सुरेश कुमार
क्षेत्रफल: 2.45 एकड़ | भूमि वर्गीकरण: कृषि (दो फसली)
पंजीकरण संख्या: REG-2022-8921 | नामांतरण आदेश: M-2023-1102`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
