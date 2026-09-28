import { ExtractedField, LandClassification, OwnershipType, DocumentLanguage } from '../../../../shared/types';
import { OCRResult } from '../ocr/OCRProvider';

export interface ExtractionResult {
  ownerName: ExtractedField<string>;
  fatherOrSpouseName: ExtractedField<string>;
  surveyNumber: ExtractedField<string>;
  khasraNumber: ExtractedField<string>;
  khataNumber: ExtractedField<string>;
  plotNumber: ExtractedField<string>;
  area: ExtractedField<number>;
  areaUnit: ExtractedField<string>;
  village: ExtractedField<string>;
  tehsil: ExtractedField<string>;
  district: ExtractedField<string>;
  state: ExtractedField<string>;
  landClassification: ExtractedField<LandClassification>;
  ownershipType: ExtractedField<OwnershipType>;
  mutationNumber: ExtractedField<string>;
  registrationNumber: ExtractedField<string>;
  registrationDate: ExtractedField<string>;
  mutationDate: ExtractedField<string>;
  overallConfidence: number;
  providerName: string;
}

export interface ExtractionProvider {
  name: string;
  extractLandRecord(ocrResult: OCRResult, language?: DocumentLanguage): Promise<ExtractionResult>;
}

export class MockExtractionProvider implements ExtractionProvider {
  name = 'Bhoomi Setu AI Neural Indic Entity Extractor v2.4 (Demo Provider)';

  async extractLandRecord(ocrResult: OCRResult, _language: DocumentLanguage = 'Hindi'): Promise<ExtractionResult> {
    const raw = ocrResult.rawText;
    const isNoisy = raw.includes('रमेश कु मार') || raw.includes('2.4S') || raw.includes('कटा फटा');

    // Find bounding boxes for each specific field from OCR blocks
    const getBox = (keyword: string) => {
      const match = ocrResult.blocks.find((b) => b.text.includes(keyword));
      return match ? match.boundingBox : undefined;
    };

    const ownerBox = getBox('भूमि स्वामी') || { x: 10, y: 22, width: 38, height: 4, page: 1 };
    const fatherBox = getBox('पिता का नाम') || { x: 55, y: 22, width: 35, height: 4, page: 1 };
    const surveyBox = getBox('खसरा नं') || { x: 10, y: 30, width: 28, height: 4, page: 1 };
    const khataBox = getBox('खाता') || { x: 55, y: 30, width: 25, height: 4, page: 1 };
    const areaBox = getBox('क्षेत्रफल') || { x: 10, y: 38, width: 28, height: 4, page: 1 };
    const villageBox = getBox('ग्राम') || { x: 10, y: 14, width: 22, height: 3.5, page: 1 };
    const tehsilBox = getBox('तहसील') || { x: 40, y: 14, width: 20, height: 3.5, page: 1 };
    const districtBox = getBox('जिला') || { x: 70, y: 14, width: 20, height: 3.5, page: 1 };
    const mutationBox = getBox('नामांतरण') || { x: 10, y: 54, width: 35, height: 4, page: 1 };
    const regBox = getBox('पंजीकरण') || { x: 55, y: 46, width: 38, height: 4, page: 1 };

    const ownerName: ExtractedField<string> = {
      value: isNoisy ? 'रमेश कु मार' : 'रमेश कुमार (Ramesh Kumar)',
      confidence: isNoisy ? 0.58 : 0.96,
      source: 'OCR',
      boundingBox: ownerBox,
      isVerified: false,
      rawOcrText: isNoisy ? 'भूमि स्वामी: रमेश कु मार' : 'भूमि स्वामी: रमेश कुमार',
      originalValue: isNoisy ? 'रमेश कु मार' : 'रमेश कुमार',
    };

    const fatherOrSpouseName: ExtractedField<string> = {
      value: 'सुरेश कुमार (Suresh Kumar)',
      confidence: 0.94,
      source: 'OCR',
      boundingBox: fatherBox,
      isVerified: false,
      rawOcrText: 'पिता का नाम: सुरेश कुमार',
      originalValue: 'सुरेश कुमार',
    };

    const surveyNumber: ExtractedField<string> = {
      value: isNoisy ? '124/8' : '124/3',
      confidence: isNoisy ? 0.65 : 0.98,
      source: 'OCR',
      boundingBox: surveyBox,
      isVerified: false,
      rawOcrText: isNoisy ? 'खसरा नं.: 124/8 (कटा फटा)' : 'खसरा नं.: 124/3',
      originalValue: isNoisy ? '124/8' : '124/3',
    };

    const khasraNumber: ExtractedField<string> = {
      value: isNoisy ? '124/8' : '124/3',
      confidence: isNoisy ? 0.65 : 0.98,
      source: 'OCR',
      boundingBox: surveyBox,
      isVerified: false,
      rawOcrText: isNoisy ? 'खसरा नं.: 124/8' : 'खसरा नं.: 124/3',
      originalValue: isNoisy ? '124/8' : '124/3',
    };

    const khataNumber: ExtractedField<string> = {
      value: '458',
      confidence: 0.92,
      source: 'OCR',
      boundingBox: khataBox,
      isVerified: false,
      rawOcrText: 'खाता संख्या: 458',
      originalValue: '458',
    };

    const plotNumber: ExtractedField<string> = {
      value: 'P-124',
      confidence: 0.90,
      source: 'RULE_DERIVED',
      isVerified: false,
      rawOcrText: 'P-124',
    };

    const area: ExtractedField<number> = {
      value: isNoisy ? 2.45 : 2.45,
      confidence: isNoisy ? 0.62 : 0.93,
      source: 'OCR',
      boundingBox: areaBox,
      isVerified: false,
      rawOcrText: isNoisy ? 'क्षेत्रफल: 2.4S एकड़' : 'क्षेत्रफल: 2.45 एकड़',
      originalValue: 2.45,
    };

    const areaUnit: ExtractedField<string> = {
      value: 'Acres',
      confidence: 0.95,
      source: 'OCR',
      isVerified: false,
      rawOcrText: 'एकड़',
    };

    const village: ExtractedField<string> = {
      value: 'Rampur',
      confidence: 0.96,
      source: 'OCR',
      boundingBox: villageBox,
      isVerified: false,
      rawOcrText: 'ग्राम: रामपुर',
    };

    const tehsil: ExtractedField<string> = {
      value: 'Sehore',
      confidence: 0.95,
      source: 'OCR',
      boundingBox: tehsilBox,
      isVerified: false,
      rawOcrText: 'तहसील: सीहोर',
    };

    const district: ExtractedField<string> = {
      value: 'Sehore',
      confidence: 0.97,
      source: 'OCR',
      boundingBox: districtBox,
      isVerified: false,
      rawOcrText: 'जिला: सीहोर',
    };

    const state: ExtractedField<string> = {
      value: 'Madhya Pradesh',
      confidence: 0.99,
      source: 'RULE_DERIVED',
      isVerified: false,
      rawOcrText: 'मध्य प्रदेश शासन',
    };

    const landClassification: ExtractedField<LandClassification> = {
      value: 'Agricultural (कृषि)',
      confidence: 0.95,
      source: 'OCR',
      isVerified: false,
      rawOcrText: 'भूमि का प्रकार: कृषि (दो फसली)',
    };

    const ownershipType: ExtractedField<OwnershipType> = {
      value: 'Single Owner (एकल)',
      confidence: 0.91,
      source: 'OCR',
      isVerified: false,
      rawOcrText: 'स्वामित्व: एकल कृषक',
    };

    const mutationNumber: ExtractedField<string> = {
      value: isNoisy ? 'M-2021-448' : 'M-2023-1102',
      confidence: isNoisy ? 0.61 : 0.94,
      source: 'OCR',
      boundingBox: mutationBox,
      isVerified: false,
      rawOcrText: isNoisy ? 'नामांतरण आदेश: M-2021-448' : 'नामांतरण आदेश: M-2023-1102',
    };

    const registrationNumber: ExtractedField<string> = {
      value: 'REG-2022-8921',
      confidence: 0.89,
      source: 'OCR',
      boundingBox: regBox,
      isVerified: false,
      rawOcrText: 'पंजीकरण संख्या: REG-2022-8921',
    };

    const registrationDate: ExtractedField<string> = {
      value: '2022-08-15',
      confidence: 0.92,
      source: 'OCR',
      isVerified: false,
      rawOcrText: 'दिनांक: 15/08/2022',
    };

    const mutationDate: ExtractedField<string> = {
      // In noisy/conflict mode, mutation date (2021-03-10) is before registration date (2022-08-15) to trigger Rule 4!
      value: isNoisy ? '2021-03-10' : '2023-03-14',
      confidence: 0.90,
      source: 'OCR',
      isVerified: false,
      rawOcrText: isNoisy ? 'दिनांक: 10/03/2021' : 'दिनांक: 14/03/2023',
    };

    const fieldScores = [
      ownerName.confidence,
      fatherOrSpouseName.confidence,
      surveyNumber.confidence,
      khasraNumber.confidence,
      khataNumber.confidence,
      area.confidence,
      village.confidence,
      tehsil.confidence,
      district.confidence,
      mutationNumber.confidence,
      registrationNumber.confidence,
    ];
    const overallConfidence = Math.round((fieldScores.reduce((a, b) => a + b, 0) / fieldScores.length) * 100);

    return {
      ownerName,
      fatherOrSpouseName,
      surveyNumber,
      khasraNumber,
      khataNumber,
      plotNumber,
      area,
      areaUnit,
      village,
      tehsil,
      district,
      state,
      landClassification,
      ownershipType,
      mutationNumber,
      registrationNumber,
      registrationDate,
      mutationDate,
      overallConfidence,
      providerName: this.name,
    };
  }
}
