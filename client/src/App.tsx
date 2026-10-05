import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AIProcessingPage } from './pages/AIProcessingPage';
import { LandRecordsPage } from './pages/LandRecordsPage';
import { RecordDetailPage } from './pages/RecordDetailPage';
import { ValidationResultsPage } from './pages/ValidationResultsPage';
import { VerificationQueuePage } from './pages/VerificationQueuePage';
import { GISDistrictProgressPage } from './pages/GISDistrictProgressPage';
import { AILearningLoopPage } from './pages/AILearningLoopPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { APIIntegrationPage } from './pages/APIIntegrationPage';
import { DemoScenarioGuideModal } from './components/demo/DemoScenarioGuideModal';
import { readRouteFromLocation, routeUrl } from './services/routes';
import { demoEnabled } from './services/demoData';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(() => readRouteFromLocation().tab);
  const [activeDocumentId, setActiveDocumentId] = useState<string>('DOC-MP-2026-001');
  const [activeRecordId, setActiveRecordId] = useState<string>('REC-MP-SEH-001');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const syncRoute = () => {
      const route = readRouteFromLocation();
      setActiveTab(route.tab);
      if (route.documentId) setActiveDocumentId(route.documentId);
      if (route.recordId) setActiveRecordId(route.recordId);
    };
    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const handleNavigate = (tab: string, contextId?: string) => {
    if (tab === 'processing' && contextId) {
      setActiveDocumentId(contextId);
    } else if ((tab === 'detail' || tab === 'validation') && contextId) {
      setActiveRecordId(contextId);
    }
    setActiveTab(tab);
    window.history.pushState({}, '', routeUrl(tab, contextId || (tab === 'detail' || tab === 'validation' ? activeRecordId : tab === 'processing' ? activeDocumentId : undefined)));
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans">
      {demoEnabled() && <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-[11px] font-semibold text-amber-900">Frontend sample mode · demo data is local to this browser and is not saved to the server</div>}
      {/* Top Header */}
      <Header onStartDemoTour={() => setIsDemoModalOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-full">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={handleNavigate} pendingCount={4} />

        {/* Dynamic Main Content Canvas */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onStartDemoTour={() => setIsDemoModalOpen(true)}
            />
          )}

          {activeTab === 'upload' && (
            <UploadPage
              onNavigateToProcessing={(docId) => handleNavigate('processing', docId)}
            />
          )}

          {activeTab === 'processing' && (
            <AIProcessingPage
              documentId={activeDocumentId}
              onNavigateToValidation={(recId) => handleNavigate('validation', recId)}
              onNavigateToVerification={() => handleNavigate('verification')}
            />
          )}

          {activeTab === 'records' && (
            <LandRecordsPage
              onSelectRecord={(recId) => handleNavigate('detail', recId)}
            />
          )}

          {activeTab === 'detail' && (
            <RecordDetailPage
              recordId={activeRecordId}
              onBack={() => handleNavigate('records')}
              onNavigateToDocument={(docId) => handleNavigate('processing', docId)}
              onNavigateToValidation={(recId) => handleNavigate('validation', recId)}
            />
          )}

          {activeTab === 'validation' && (
            <ValidationResultsPage
              initialRecordId={activeRecordId}
              onNavigateToVerification={() => handleNavigate('verification')}
              onNavigateToRecord={(recId) => handleNavigate('detail', recId)}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationQueuePage
              onNavigateToDocument={(docId) => handleNavigate('processing', docId)}
            />
          )}

          {activeTab === 'gis' && <GISDistrictProgressPage />}

          {activeTab === 'learning' && <AILearningLoopPage />}

          {activeTab === 'audit' && <AuditLogsPage />}

          {activeTab === 'api' && <APIIntegrationPage />}
        </main>
      </div>

      {/* Guided 3-Minute Demo Scenario Tour Modal */}
      <DemoScenarioGuideModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onNavigateTab={handleNavigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
