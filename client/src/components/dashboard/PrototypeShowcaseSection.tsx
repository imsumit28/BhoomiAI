import React from 'react';
import { ArrowRight, ExternalLink, ImageIcon } from 'lucide-react';

interface PrototypeShowcaseSectionProps {
  onNavigate: (tab: string, contextId?: string) => void;
}

const panels = [
  {
    id: 'extraction',
    title: 'Document Upload & AI Extraction',
    flow: 'Upload → OCR → Structured Land Record',
    caption: 'scanned doc · extracted fields · confidence indicators',
    tab: 'processing',
    screenshot: '/prototype-screenshots/01-document-upload-ai-extraction.png',
    openUrl: '/?tab=processing&doc=DOC-MP-2026-001',
  },
  {
    id: 'verification',
    title: 'Officer Verification Dashboard',
    flow: 'Review Low-Confidence Fields → Correct → Approve',
    caption: 'document | fields · confidence · approve / reject',
    tab: 'verification',
    screenshot: '/prototype-screenshots/02-officer-verification-dashboard.png',
    openUrl: '/?tab=verification&review=1',
  },
  {
    id: 'gis',
    title: 'Validation & GIS Dashboard',
    flow: 'Validate → Map → Audit',
    caption: 'parcel map · validation status · duplicate alerts · audit info',
    tab: 'gis',
    screenshot: '/prototype-screenshots/03-validation-gis-dashboard.png',
    openUrl: '/?tab=gis',
  },
] as const;

export const PrototypeShowcaseSection: React.FC<PrototypeShowcaseSectionProps> = ({ onNavigate }) => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#17324D]">Core workflow screens</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Live pages in this app — click a panel to open the full screen, or use the captures below in your pitch deck.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {panels.map((panel) => (
          <article
            key={panel.id}
            className="bg-[#1a2332] rounded-xl border border-slate-700/80 overflow-hidden shadow-lg flex flex-col"
          >
            <div className="relative aspect-[4/3] bg-slate-900 group">
              <img
                src={panel.screenshot}
                alt={panel.title}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-400">
                <ImageIcon className="w-8 h-8 mb-2 opacity-60" />
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Screenshot generating
                </p>
                <p className="text-xs mt-1">Run from repo root: npm run capture-screenshots</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(panel.tab)}
                className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-end justify-center pb-3 opacity-0 hover:opacity-100 focus:opacity-100"
              >
                <span className="px-3 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-md flex items-center gap-1 shadow">
                  Open live page <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-2">
              <h3 className="text-sm font-bold text-white leading-snug">{panel.title}</h3>
              <p className="text-[11px] text-emerald-400/90 font-medium">{panel.flow}</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">{panel.caption}</p>
              <a
                href={panel.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-2 text-[11px] font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1"
              >
                Deep link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
