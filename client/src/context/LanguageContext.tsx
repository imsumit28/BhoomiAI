import React, { createContext, useContext, useState } from 'react';
import { DocumentLanguage } from '../../../shared/types';

interface LanguageContextType {
  language: DocumentLanguage;
  setLanguage: (lang: DocumentLanguage) => void;
  t: (key: string) => string;
  detectedScript: string;
}

const translations: Record<DocumentLanguage, Record<string, string>> = {
  English: {
    appTitle: 'Bhoomi Setu AI',
    appSubtitle: 'Intelligent Land Record Digitization & Validation Platform',
    dashboard: 'Dashboard',
    documents: 'Document Upload & Pipeline',
    landRecords: 'Land Records Directory',
    validation: 'Validation Engine & Rules',
    verificationQueue: 'Verification Queue (HITL)',
    gisProgress: 'GIS & District Progress',
    aiLearning: 'AI Learning Loop',
    auditLogs: 'Audit Trail & Compliance',
    apiDocs: 'API Integration Hub',
    systemRole: 'Role',
    switchRole: 'Switch Demo Role',
    totalDocuments: 'Total Documents',
    validatedRecords: 'Validated Records',
    pendingVerification: 'Pending Verification',
    averageAccuracy: 'AI Accuracy',
    uploadBtn: 'Upload New Record',
    quickDemoScenario: '⚡ Interactive Demo Tour',
  },
  Hindi: {
    appTitle: 'भूमि सेतु एआई (Bhoomi Setu AI)',
    appSubtitle: 'बुद्धिमान भू-अभिलेख डिजिटलीकरण एवं सत्यापन मंच',
    dashboard: 'डैशबोर्ड (Dashboard)',
    documents: 'दस्तावेज़ अपलोड व प्रसंस्करण',
    landRecords: 'भू-अभिलेख नामावली (Land Records)',
    validation: 'नियम आधारित सत्यापन इंजन (Validation)',
    verificationQueue: 'सत्यापन कार्य पंक्ति (HITL Queue)',
    gisProgress: 'भौगोलिक एवं जिला प्रगति (GIS)',
    aiLearning: 'एआई शिक्षण चक्र (AI Learning Loop)',
    auditLogs: 'अंकेक्षण व पारदर्शिता (Audit Trail)',
    apiDocs: 'एपीआई एकीकरण हब (API Hub)',
    systemRole: 'प्रयोक्ता भूमिका',
    switchRole: 'भूमिका बदलें',
    totalDocuments: 'कुल डिजिटाइज़ दस्तावेज़',
    validatedRecords: 'सत्यापित अभिलेख',
    pendingVerification: 'मानव सत्यापन प्रतीक्षारत',
    averageAccuracy: 'औसत निष्कर्षण सटीकता',
    uploadBtn: 'नया दस्तावेज़ अपलोड करें',
    quickDemoScenario: '⚡ 3-मिनट लाइव डेमो टूर',
  },
  Marathi: {
    appTitle: 'भूमी सेतु एआय (Bhoomi Setu AI)',
    appSubtitle: 'जमीन महसूल अभिलेख डिजिटलायझेशन आणि पडताळणी प्रणाली',
    dashboard: 'डॅशबोर्ड',
    documents: 'कागदपत्रे अपलोड आणि प्रक्रिया',
    landRecords: 'जमीन नोंदी (7/12 व फेरफार)',
    validation: 'पडताळणी नियम इंजिन',
    verificationQueue: 'अधिकारी पडताळणी रांग',
    gisProgress: 'जिल्हावार प्रगती व जीआयएस',
    aiLearning: 'एआय सुधारणा सायकल',
    auditLogs: 'ऑडिट लॉग आणि ट्रेल',
    apiDocs: 'एपीआय इंटिग्रेशन',
    systemRole: 'भूमिका',
    switchRole: 'भूमिका बदला',
    totalDocuments: 'एकूण कागदपत्रे',
    validatedRecords: 'प्रमाणित नोंदी',
    pendingVerification: 'पडताळणी प्रलंबित',
    averageAccuracy: 'एआय अचूकता',
    uploadBtn: 'नवीन दस्तऐवज जोडा',
    quickDemoScenario: '⚡ थेट डेमो टूअर',
  },
  Tamil: {
    appTitle: 'பூமி சேது AI (Bhoomi Setu AI)',
    appSubtitle: 'நில ஆவண டிஜிட்டல்மயமாக்கல் மற்றும் சரிபார்ப்பு தளம்',
    dashboard: 'டாஷ்போர்டு',
    documents: 'ஆவணப் பதிவேற்றம்',
    landRecords: 'பட்டா / சிட்டா பதிவுகள்',
    validation: 'சரிபார்ப்பு விதி இயந்திரம்',
    verificationQueue: 'அதிகாரி சரிபார்ப்பு வரிசை',
    gisProgress: 'மாவட்ட வாரியான முன்னேற்றம்',
    aiLearning: 'AI கற்றல் வளையம்',
    auditLogs: 'தணிக்கை பதிவு',
    apiDocs: 'API ஒருங்கிணைப்பு',
    systemRole: 'பங்கு',
    switchRole: 'பங்கு மாற்றம்',
    totalDocuments: 'மொத்த ஆவணங்கள்',
    validatedRecords: 'சரிபார்க்கப்பட்ட பதிவுகள்',
    pendingVerification: 'சரிபார்ப்பு நிலுவை',
    averageAccuracy: 'AI துல்லியம்',
    uploadBtn: 'ஆவணத்தைப் பதிவேற்றுக',
    quickDemoScenario: '⚡ நேரலை டெமோ',
  },
  Telugu: {
    appTitle: 'భూమి సేతు AI (Bhoomi Setu AI)',
    appSubtitle: 'భూ రికార్డుల డిజిటలైజేషన్ మరియు ధృవీకరణ వేదిక',
    dashboard: 'డాష్‌బోర్డ్',
    documents: 'పత్రాల అప్‌లోడ్',
    landRecords: 'పట్టాదారు పాస్‌బుక్ / రికార్డులు',
    validation: 'నియమ ధృవీకరణ ఇంజిన్',
    verificationQueue: 'అధికారి ధృవీకరణ క్యూ',
    gisProgress: 'జిల్లాల పురోగతి & GIS',
    aiLearning: 'AI లెర్నింగ్ లూప్',
    auditLogs: 'ఆడిట్ లాగ్స్',
    apiDocs: 'API హబ్',
    systemRole: 'పాత్ర',
    switchRole: 'పాత్ర మార్చండి',
    totalDocuments: 'మొత్తం పత్రాలు',
    validatedRecords: 'ధృవీకరించిన రికార్డులు',
    pendingVerification: 'ధృవీకరణ పెండింగ్‌లో ఉంది',
    averageAccuracy: 'AI ఖచ్చితత్వం',
    uploadBtn: 'పత్రం అప్‌లోడ్ చేయండి',
    quickDemoScenario: '⚡ లైవ్ డెమో టూర్',
  },
  Bengali: {
    appTitle: 'ভূমি সেতু AI (Bhoomi Setu AI)',
    appSubtitle: 'স্মার্ট খতিয়ান ও জমি রেকর্ড যাচাইকরণ প্ল্যাটফর্ম',
    dashboard: 'ড্যাশবোর্ড',
    documents: 'নথি আপলোড ও প্রক্রিয়াকরণ',
    landRecords: 'খতিয়ান ও পর্চা রেকর্ড',
    validation: 'যাচাইকরণ নিয়ম ইঞ্জিন',
    verificationQueue: 'মানব যাচাইকরণ কিউ',
    gisProgress: 'জেলা ভিত্তিক অগ্রগতি ও জিআইএস',
    aiLearning: 'এআই লার্নিং লুপ',
    auditLogs: 'অডিট লগ ও ট্রেইল',
    apiDocs: 'এপিআই ইন্টিগ্রেশন',
    systemRole: 'ভূমিকা',
    switchRole: 'ভূমিকা পরিবর্তন',
    totalDocuments: 'মোট নথি',
    validatedRecords: 'যাচাইকৃত রেকর্ড',
    pendingVerification: 'যাচাইকরণ অপেক্ষারত',
    averageAccuracy: 'এআই নির্ভুলতা',
    uploadBtn: 'নতুন নথি আপলোড করুন',
    quickDemoScenario: '⚡ লাইভ ডেমো ট্যুর',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<DocumentLanguage>('Hindi');

  const t = (key: string) => {
    return translations[language]?.[key] || translations['English']?.[key] || key;
  };

  const detectedScript =
    language === 'Hindi' || language === 'Marathi'
      ? 'Devanagari (देवनागरी)'
      : language === 'Tamil'
      ? 'Tamil Script'
      : language === 'Telugu'
      ? 'Telugu Script'
      : language === 'Bengali'
      ? 'Bengali-Assamese Script'
      : 'Latin / English';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, detectedScript }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
