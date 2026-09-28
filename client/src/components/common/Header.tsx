import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { DocumentLanguage, UserRole } from '../../../../shared/types';
import {
  Globe,
  UserCheck,
  Server,
  Activity,
  LogOut,
  Landmark,
} from 'lucide-react';

interface HeaderProps {
  onStartDemoTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartDemoTour }) => {
  const { user, quickSwitchRole, logout } = useAuth();
  const { language, setLanguage, t, detectedScript } = useLanguage();

  const languages: DocumentLanguage[] = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali'];

  const roles: { role: UserRole; label: string }[] = [
    { role: 'admin', label: 'Admin (District Magistrate)' },
    { role: 'district_officer', label: 'District Collector' },
    { role: 'verification_officer', label: 'Verification Officer' },
    { role: 'viewer', label: 'Public Viewer' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* National Tricolor Top Stripe */}
      <div className="tricolor-bar" />

      <div className="hidden sm:flex h-7 items-center justify-between bg-[#17324D] px-6 text-[10px] tracking-wide text-white/90">
        <span>भारत सरकार <span className="mx-1 text-white/40">|</span> Government of India</span>
        <span>Digital India • Secure • Accessible • Inclusive</span>
      </div>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Emblem & App Branding */}
          <div className="flex items-center space-x-3">
            <div className="relative w-11 h-11 rounded-full bg-[#F7F8F9] flex items-center justify-center text-[#17324D] border border-slate-200">
              <Landmark className="w-6 h-6" strokeWidth={1.8} />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-[#FF671F]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-[#17324D] tracking-tight flex items-center">
                  Bhoomi Setu <span className="text-[#046A38]">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Department of Land Resources <span className="text-slate-300">|</span> Government of India
              </p>
            </div>
          </div>

          {/* Right: Quick Demo Tour, Language Selector, Role Switcher, User Menu */}
          <div className="flex items-center space-x-3">
            {/* 3-Minute Live Demo Tour Button */}
            <button
              onClick={onStartDemoTour}
              className="hidden md:inline-flex items-center px-3 py-1.5 bg-[#FF671F] text-white text-xs font-semibold rounded-md shadow-sm hover:bg-[#E85D18] transition-colors"
            >
              {t('quickDemoScenario')}
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as DocumentLanguage)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'Hindi'
                      ? 'हिन्दी (Hindi)'
                      : lang === 'Marathi'
                      ? 'मराठी (Marathi)'
                      : lang === 'Tamil'
                      ? 'தமிழ் (Tamil)'
                      : lang === 'Telugu'
                      ? 'తెలుగు (Telugu)'
                      : lang === 'Bengali'
                      ? 'বাংলা (Bengali)'
                      : 'English'}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
              <UserCheck className="w-3.5 h-3.5 text-[#046A38] mr-1.5" />
              <select
                value={user?.role || 'admin'}
                onChange={(e) => quickSwitchRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.role} value={r.role}>
                    Role: {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile Pill */}
            <div className="hidden lg:flex items-center pl-2 border-l border-slate-200 space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                  {user?.name || 'Officer'}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {user?.role?.replace('_', ' ') || 'Admin'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
