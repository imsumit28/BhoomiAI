import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentType, DocumentLanguage, MasterHierarchy } from '../../../shared/types';
import { useLanguage } from '../context/LanguageContext';

interface UploadPageProps {
  onNavigateToProcessing: (documentId: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigateToProcessing }) => {
  const { language: currentLang } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>('Khasra');
  const [language, setLanguage] = useState<DocumentLanguage>(currentLang || 'Hindi');
  const [state, setState] = useState('Madhya Pradesh');
  const [district, setDistrict] = useState('Sehore');
  const [tehsil, setTehsil] = useState('Sehore');
  const [village, setVillage] = useState('Rampur');
  const [simulateNoise, setSimulateNoise] = useState(false);

  const [masterHierarchy, setMasterHierarchy] = useState<MasterHierarchy[]>([]);
  const [sampleDocs, setSampleDocs] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [hRes, sRes] = await Promise.all([api.getMasterHierarchy(), api.getSampleDocuments()]);
        setMasterHierarchy(hRes.hierarchy);
        setSampleDocs(sRes.samples);
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    }
    loadData();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: any) => {
    setDocumentType(sample.documentType);
    setLanguage(sample.language);
    setState(sample.state);
    setDistrict(sample.district);
    setTehsil(sample.tehsil);
    setVillage(sample.village);
    setSimulateNoise(sample.simulateNoise);

    const mockFile = new File(['mock content'], sample.title + '.pdf', { type: 'application/pdf' });
    setFile(mockFile);
  };

  const handleUploadAndProcess = async () => {
    setIsUploading(true);
    setUploadProgress(10);
    setActiveStep(1);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('documentType', documentType);
      formData.append('language', language);
      formData.append('state', state);
      formData.append('district', district);
      formData.append('tehsil', tehsil);
      formData.append('village', village);
      formData.append('simulateNoise', String(simulateNoise));

      const res = await api.uploadDocument(formData);
      setUploadResult(res.document);

      setTimeout(() => {
        setUploadProgress(35);
        setActiveStep(2);
      }, 400);

      setTimeout(() => {
        setUploadProgress(65);
        setActiveStep(3);
      }, 900);

      setTimeout(() => {
        setUploadProgress(85);
        setActiveStep(4);
      }, 1400);

      setTimeout(() => {
        setUploadProgress(100);
        setActiveStep(5);
        setIsUploading(false);
      }, 1900);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
      setIsUploading(false);
    }
  };

  const currentDistricts = masterHierarchy.find((s) => s.state === state)?.districts || [];
  const currentTehsils = currentDistricts.find((d) => d.name === district)?.tehsils || [];
  const currentVillages = currentTehsils.find((t) => t.name === tehsil)?.villages || ['Rampur', 'Bilkisganj', 'Shyampur'];

  const pipelineSteps = [
    { title: 'Document Received', desc: 'Secure hash & metadata verification' },
    { title: 'Image Preprocessing', desc: 'Binarization, deskewing & noise removal' },
    { title: 'Deep Indic OCR', desc: 'Character recognition & bounding box mapping' },
    { title: 'Entity Extraction', desc: 'Structured field extraction & confidence scoring' },
    { title: 'Validation Engine', desc: 'Rule execution & cross-record title check' },
    { title: 'Human Verification', desc: 'HITL Queue routing for uncertainty/anomalies' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Land Document Ingestion & Optical Digitization</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload legacy scanned revenue records (Khasra, Jamabandi, RoR, Mutation deeds) for automated digitization and rule-based validation.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              1-Click Pre-loaded SIH Demo Scenarios
            </h2>
          </div>
          <span className="text-[11px] text-blue-200">Select any test case to test end-to-end pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sampleDocs.slice(0, 4).map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="bg-slate-800/80 hover:bg-slate-700 p-3 rounded-lg border border-slate-700 text-left transition-all hover:border-amber-400 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">
                    {sample.documentType}
                  </span>
                  {sample.hasConflict && (
                    <span className="text-[9px] bg-rose-900/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-700">
                      Anomalous
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-1 line-clamp-1">{sample.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sample.description}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
                <span>Select & Fill Meta</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : file
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            {file ? (
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  File Selected Ready for Digitization
                </div>
                <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • Ready for OCR</p>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Drag & Drop scanned land record document here
                </h3>
                <p className="text-xs text-slate-500">
                  Supports PDF, JPG, JPEG, PNG, TIFF files (Max 25MB)
                </p>
                <div className="pt-2">
                  <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center shadow-sm">
                    <span>Browse Local Files</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.tiff"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Jurisdictional Metadata & Document Classification</span>
              <span className="text-xs text-slate-400 font-normal">Revenue Master Verification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Type (प्रकार)</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Khasra">Khasra (खसरा - अधिकार अभिलेख)</option>
                  <option value="Khatauni">Khatauni (खतौनी - जमाबंदी)</option>
                  <option value="Jamabandi">Jamabandi (जमाबंदी पंजी)</option>
                  <option value="RoR">Record of Rights (RoR)</option>
                  <option value="Mutation Record">Mutation Record (नामांतरण आदेश)</option>
                  <option value="Sale/Registration Record">Sale / Conveyance Deed (बैनामा)</option>
                  <option value="Cadastral Map">Cadastral Map (भू-नक्शा)</option>
                  <option value="Other">Other Revenue Record</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Language (भाषा)</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as DocumentLanguage)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Hindi">Hindi (हिन्दी - देवनागरी)</option>
                  <option value="English">English</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State (राज्य)</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {masterHierarchy.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">District (जिला)</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {currentDistricts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                  {currentDistricts.length === 0 && <option value="Sehore">Sehore</option>}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tehsil (तहसील)</label>
                <select
                  value={tehsil}
                  onChange={(e) => setTehsil(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {currentTehsils.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                  {currentTehsils.length === 0 && <option value="Sehore">Sehore</option>}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Village (ग्राम)</label>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {currentVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <input
                type="checkbox"
                id="noiseCheck"
                checked={simulateNoise}
                onChange={(e) => setSimulateNoise(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="noiseCheck" className="text-xs text-slate-700 cursor-pointer">
                <strong>Simulate Degraded / Low-Confidence Scan:</strong> Injects realistic historical handwriting smudges to demonstrate uncertainty guardrail (&lt; 70%).
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                disabled={isUploading}
                onClick={handleUploadAndProcess}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Pipeline ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Initiate Digitization & Validation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>BhoomiAI Pipeline Stages</span>
              {isUploading && (
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold animate-pulse">
                  Executing Stage {activeStep}/6
                </span>
              )}
            </h3>

            <div className="mt-4 space-y-4">
              {pipelineSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = activeStep > stepNum || activeStep === 6;
                const isCurrent = activeStep === stepNum && isUploading;

                return (
                  <div key={step.title} className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                          : 'bg-slate-100 text-slate-500 border border-slate-300'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isDone ? 'text-emerald-800' : isCurrent ? 'text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {uploadResult && activeStep >= 5 && (
              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                  Pipeline Complete! Document has been digitized and verified against 10 validation rules.
                </div>
                <button
                  onClick={() => onNavigateToProcessing(uploadResult.documentId)}
                  className="mt-3 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow flex items-center justify-center space-x-1.5"
                >
                  <span>Open Interactive Document & Field Inspector</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center space-x-1 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>SIH Core Evaluation Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              In BhoomiAI, <strong>Extraction is only stage 4 of 6</strong>. The validation engine (Stage 5) actively queries the existing database to catch title collisions, parent parcel area inflations, and chronological anomalies before approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
