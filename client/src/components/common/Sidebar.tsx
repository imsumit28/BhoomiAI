import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  ShieldAlert,
  UserCheck2,
  MapPin,
  Sparkles,
  History,
  Terminal,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingCount = 5 }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, badge: null },
    { id: 'upload', label: t('documents'), icon: UploadCloud, badge: 'New' },
    { id: 'records', label: t('landRecords'), icon: FileSpreadsheet, badge: null },
    { id: 'validation', label: t('validation'), icon: ShieldAlert, badge: 'Core' },
    { id: 'verification', label: t('verificationQueue'), icon: UserCheck2, badge: pendingCount ? `${pendingCount}` : null, isUrgent: true },
    { id: 'gis', label: t('gisProgress'), icon: MapPin, badge: null },
    { id: 'learning', label: t('aiLearning'), icon: Sparkles, badge: 'AI Loop' },
    { id: 'audit', label: t('auditLogs'), icon: History, badge: null },
    { id: 'api', label: t('apiDocs'), icon: Terminal, badge: 'REST' },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 min-h-[calc(100vh-4rem)] flex flex-col justify-between border-r border-slate-200 shrink-0">
      <div className="p-4 space-y-6">
        {/* District Jurisdictional Context Header */}
        <div className="bg-[#F7F8F9] rounded-md p-3 border border-slate-200">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#046A38]">
            Office jurisdiction
          </div>
          <div className="text-xs font-bold text-[#17324D] mt-1">
            {user?.district || 'Sehore'} District • {user?.state || 'Madhya Pradesh'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Revenue Circle: Bhopal Division
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                  ? 'bg-[#EAF3EE] text-[#075B33] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#17324D]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#046A38]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.isUrgent
                        ? 'bg-[#FF671F] text-white'
                        : isActive
                        ? 'bg-[#046A38] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <div className="flex items-center justify-center space-x-2 text-[11px] text-[#046A38]">
          <span className="w-2 h-2 rounded-full bg-[#046A38]" />
          <span>OCR & Validation Engine v2.4</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Digital Land Records • SIH 2026
        </p>
      </div>
    </aside>
  );
};
