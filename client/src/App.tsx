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

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeDocumentId, setActiveDocumentId] = useState<string>('DOC-MP-2026-001');
  const [activeRecordId, setActiveRecordId] = useState<string>('REC-MP-SEH-001');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
      const docId = params.get('doc');
      if (docId) setActiveDocumentId(docId);
      const recId = params.get('record');
      if (recId) setActiveRecordId(recId);
    }
  }, []);

  const handleNavigate = (tab: string, contextId?: string) => {
    if (tab === 'processing' && contextId) {
      setActiveDocumentId(contextId);
    } else if ((tab === 'detail' || tab === 'validation') && contextId) {
      setActiveRecordId(contextId);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans">
      {/* Top Header */}
      <Header onStartDemoTour={() => setIsDemoModalOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-full">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={4} />

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
