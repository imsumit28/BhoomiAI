import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers, AlertTriangle } from 'lucide-react';
import { BoundingBox } from '../../../../shared/types';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

export interface ViewerFieldItem {
  id: string;
  label: string;
  value: any;
  confidence: number;
  boundingBox?: BoundingBox;
  rawOcrText?: string;
  isLowConfidence?: boolean;
}

interface DocumentViewerProps {
  fields: ViewerFieldItem[];
  selectedFieldId?: string | null;
  onSelectField?: (id: string) => void;
  documentTitle?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fields,
  selectedFieldId,
  onSelectField,
  documentTitle = 'मध्य प्रदेश शासन - प्रारूप खसरा (अधिकार अभिलेख)',
}) => {
  const [zoom, setZoom] = useState(1);
  const [showBoxes, setShowBoxes] = useState(true);
  const [highlightOnlyLowConf, setHighlightOnlyLowConf] = useState(false);

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-white">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1" />
            Interactive Document Optical Viewer
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">| {documentTitle}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2 py-1 rounded flex items-center space-x-1 border transition-colors ${
              showBoxes ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
            }`}
            title="Toggle Bounding Boxes"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Boxes</span>
          </button>

          <button
            onClick={() => setHighlightOnlyLowConf(!highlightOnlyLowConf)}
            className={`px-2 py-1 rounded flex items-center space-x-1 border transition-colors ${
              highlightOnlyLowConf
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300'
            }`}
            title="Highlight Low Confidence Only"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">&lt; 70%</span>
          </button>

          <div className="flex items-center bg-slate-700 rounded border border-slate-600 px-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
              className="p-1 hover:text-amber-400 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-slate-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              className="p-1 hover:text-amber-400 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:text-amber-400 text-slate-300 ml-1 border-l border-slate-600 pl-1.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Canvas Viewport */}
      <div className="relative flex-1 overflow-auto bg-slate-950 p-6 flex justify-center items-start min-h-[480px]">
        <div
          className="relative transition-transform duration-200 origin-top shadow-2xl bg-[#FFFDF5] border border-amber-200/80 rounded-sm"
          style={{
            width: '680px',
            minHeight: '880px',
            transform: `scale(${zoom})`,
            backgroundImage: `radial-gradient(#d6cbb7 0.75px, transparent 0.75px), radial-gradient(#d6cbb7 0.75px, #FFFDF5 0.75px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
          }}
        >
          {/* Official Government Watermark & Seal Simulation */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-5 select-none">
            <div className="text-8xl font-black text-slate-900 transform -rotate-45">
              GOVERNMENT OF MADHYA PRADESH
            </div>
            <div className="text-6xl font-bold text-slate-900 mt-8 transform -rotate-45">
              REVENUE ARCHIVE
            </div>
          </div>

          {/* Official Document Header Stamp */}
          <div className="p-8 border-b-2 border-amber-900/30 text-center relative">
            <div className="absolute top-4 right-6 border-2 border-rose-800 rounded-full w-20 h-20 flex flex-col items-center justify-center rotate-12 opacity-80 text-rose-800 select-none">
              <span className="text-[8px] font-bold">राजस्व विभाग</span>
              <span className="text-[10px] font-black">सीहोर</span>
              <span className="text-[7px]">सत्यापित प्रति</span>
            </div>

            <div className="text-xs font-bold tracking-widest text-slate-700 uppercase">
              मध्य प्रदेश शासन • राजस्व एवं भूमि सुधार विभाग
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1 font-serif">
              प्रारूप खसरा (अधिकार अभिलेख) / Jamabandi RoR
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              तहसील: सीहोर • जिला: सीहोर • ग्राम: रामपुर • खसरा चकबंदी वर्ष: 2024-2025
            </p>
          </div>

          {/* Document Content Grid mimicking vintage revenue register */}
          <div className="p-8 space-y-5 text-sm text-slate-900 font-serif">
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-amber-900/20">
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">1. ग्राम (Village):</span>
                <span className="text-sm font-semibold text-slate-900">रामपुर (Rampur)</span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">2. तहसील (Tehsil):</span>
                <span className="text-sm font-semibold text-slate-900">सीहोर (Sehore)</span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">3. जिला (District):</span>
                <span className="text-sm font-semibold text-slate-900">सीहोर (Sehore)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-amber-900/20">
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">4. भूमि स्वामी का नाम (Owner Name):</span>
                <span className="text-base font-bold text-slate-950 font-indic">
                  {fields.find((f) => f.id === 'ownerName')?.value || 'रमेश कुमार (Ramesh Kumar)'}
                </span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">5. पिता / पति का नाम (Father/Spouse):</span>
                <span className="text-base font-semibold text-slate-900 font-indic">
                  {fields.find((f) => f.id === 'fatherOrSpouseName')?.value || 'सुरेश कुमार (Suresh Kumar)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-amber-900/20">
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">6. खसरा / सर्वे संख्या:</span>
                <span className="text-base font-bold text-slate-950 font-mono">
                  {fields.find((f) => f.id === 'surveyNumber')?.value || '124/3'}
                </span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">7. खाता संख्या:</span>
                <span className="text-sm font-semibold text-slate-900 font-mono">
                  {fields.find((f) => f.id === 'khataNumber')?.value || '458'}
                </span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">8. कुल क्षेत्रफल (Area):</span>
                <span className="text-base font-bold text-blue-900">
                  {fields.find((f) => f.id === 'area')?.value || '2.45'} एकड़ (Acres)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-amber-900/20">
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">9. भूमि का प्रकार / वर्गीकरण:</span>
                <span className="text-sm font-semibold text-slate-900">
                  {fields.find((f) => f.id === 'landClassification')?.value || 'कृषि (Agricultural)'}
                </span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">10. स्वामित्व प्रकार:</span>
                <span className="text-sm font-semibold text-slate-900">
                  {fields.find((f) => f.id === 'ownershipType')?.value || 'एकल कृषक (Single)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-amber-900/20">
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">11. पंजीकरण विलेख क्रमांक:</span>
                <span className="text-xs font-mono font-semibold text-slate-800">
                  {fields.find((f) => f.id === 'registrationNumber')?.value || 'REG-2022-8921'}
                </span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded border border-amber-200">
                <span className="text-xs font-bold text-slate-600 block">12. नामांतरण पंजी क्रमांक व आदेश:</span>
                <span className="text-xs font-mono font-semibold text-slate-800">
                  {fields.find((f) => f.id === 'mutationNumber')?.value || 'M-2023-1102'}
                </span>
              </div>
            </div>

            {/* Official Patwari Signatures & Seal */}
            <div className="pt-6 flex justify-between items-end text-xs text-slate-600">
              <div className="text-center">
                <div className="font-serif italic text-slate-800">पटवारी हल्का क्र. १२</div>
                <div className="border-t border-slate-400 mt-8 pt-1 font-semibold">हस्ताक्षर पटवारी / लेखपाल</div>
              </div>
              <div className="text-center">
                <div className="font-serif italic text-slate-800">तहसीलदार कार्यालय, सीहोर</div>
                <div className="border-t border-slate-400 mt-8 pt-1 font-semibold">प्रमाणीकरण अधिकारी (SDM/Tehsildar)</div>
              </div>
            </div>
          </div>

          {/* Interactive Bounding Boxes Overlay */}
          {showBoxes && (
            <div className="absolute inset-0 pointer-events-none">
              {fields.map((field) => {
                if (!field.boundingBox) return null;
                const isSelected = selectedFieldId === field.id;
                const isLowConf = field.confidence < 0.7;

                if (highlightOnlyLowConf && !isLowConf) return null;

                const box = field.boundingBox;

                return (
                  <div
                    key={field.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectField?.(field.id);
                    }}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`pointer-events-auto bounding-box-overlay ${
                      isSelected ? 'active' : ''
                    } ${isLowConf ? 'low-confidence' : ''}`}
                  >
                    {/* Tooltip Tag */}
                    <div
                      className={`absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-rose-600 text-white ring-2 ring-rose-300 z-30'
                          : isLowConf
                          ? 'bg-amber-600 text-white z-20'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <span>{field.label}</span>
                      <span>•</span>
                      <span>{Math.round(field.confidence <= 1 ? field.confidence * 100 : field.confidence)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Inspection Drawer when a field is selected */}
      {selectedField && (
        <div className="p-3 bg-slate-800 border-t border-slate-700 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-amber-400">{selectedField.label}:</span>
            <span className="bg-slate-900 px-2 py-1 rounded font-mono text-emerald-400 font-semibold border border-slate-700">
              {String(selectedField.value)}
            </span>
            <ConfidenceBadge score={selectedField.confidence} size="sm" />
          </div>

          <div className="flex items-center space-x-4 text-slate-300 text-[11px]">
            <span>
              <strong>Raw OCR:</strong> "{selectedField.rawOcrText || selectedField.value}"
            </span>
            {selectedField.boundingBox && (
              <span className="font-mono text-slate-400">
                Box: [{selectedField.boundingBox.x}%, {selectedField.boundingBox.y}%, {selectedField.boundingBox.width}
                % x {selectedField.boundingBox.height}%]
              </span>
            )}
            <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
              Source: OCR Block
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
