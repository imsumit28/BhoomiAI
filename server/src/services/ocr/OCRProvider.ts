import { BoundingBox, DocumentLanguage } from '../../../../shared/types';

export interface OCRBoundingBoxResult {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface OCRResult {
  rawText: string;
  confidence: number;
  detectedLanguage: DocumentLanguage;
  detectedScript: string;
  blocks: OCRBoundingBoxResult[];
  lines: string[];
  providerName: string;
  executionTimeMs: number;
}

export interface OCRProvider {
  name: string;
  extractText(
    documentPath: string,
    language?: DocumentLanguage,
    options?: { simulateNoise?: boolean }
  ): Promise<OCRResult>;
}

export class MockOCRProvider implements OCRProvider {
  name = 'BhoomiAI Hybrid Indic-OCR (Demo Provider)';

  async extractText(
    documentPath: string,
    language: DocumentLanguage = 'Hindi',
    options?: { simulateNoise?: boolean }
  ): Promise<OCRResult> {
    const isNoisy = options?.simulateNoise || documentPath.includes('noisy') || documentPath.includes('conflict');
    const startTime = Date.now();

    // Standard high-resolution or simulated noisy OCR blocks
    const blocks: OCRBoundingBoxResult[] = [
      {
        text: 'प्रारूप खसरा (अधिकार अभिलेख) - मध्य प्रदेश शासन',
        confidence: 0.98,
        boundingBox: { x: 22, y: 5, width: 56, height: 4, page: 1 },
      },
      {
        text: 'ग्राम: रामपुर',
        confidence: isNoisy ? 0.88 : 0.96,
        boundingBox: { x: 10, y: 14, width: 22, height: 3.5, page: 1 },
      },
      {
        text: 'तहसील: सीहोर',
        confidence: 0.95,
        boundingBox: { x: 40, y: 14, width: 20, height: 3.5, page: 1 },
      },
      {
        text: 'जिला: सीहोर',
        confidence: 0.97,
        boundingBox: { x: 70, y: 14, width: 20, height: 3.5, page: 1 },
      },
      {
        text: isNoisy ? 'भूमि स्वामी: रमेश कु मार' : 'भूमि स्वामी: रमेश कुमार',
        confidence: isNoisy ? 0.58 : 0.96,
        boundingBox: { x: 10, y: 22, width: 38, height: 4, page: 1 },
      },
      {
        text: 'पिता का नाम: सुरेश कुमार',
        confidence: 0.94,
        boundingBox: { x: 55, y: 22, width: 35, height: 4, page: 1 },
      },
      {
        text: isNoisy ? 'खसरा नं.: 124/8 (कटा फटा)' : 'खसरा नं.: 124/3',
        confidence: isNoisy ? 0.65 : 0.98,
        boundingBox: { x: 10, y: 30, width: 28, height: 4, page: 1 },
      },
      {
        text: 'खाता संख्या: 458',
        confidence: 0.92,
        boundingBox: { x: 55, y: 30, width: 25, height: 4, page: 1 },
      },
      {
        text: isNoisy ? 'क्षेत्रफल: 2.4S एकड़' : 'क्षेत्रफल: 2.45 एकड़',
        confidence: isNoisy ? 0.62 : 0.93,
        boundingBox: { x: 10, y: 38, width: 28, height: 4, page: 1 },
      },
      {
        text: 'भूमि का प्रकार: कृषि (दो फसली)',
        confidence: 0.95,
        boundingBox: { x: 55, y: 38, width: 35, height: 4, page: 1 },
      },
      {
        text: 'स्वामित्व: एकल कृषक',
        confidence: 0.91,
        boundingBox: { x: 10, y: 46, width: 30, height: 4, page: 1 },
      },
      {
        text: 'पंजीकरण संख्या: REG-2022-8921',
        confidence: 0.89,
        boundingBox: { x: 55, y: 46, width: 38, height: 4, page: 1 },
      },
      {
        text: isNoisy ? 'नामांतरण आदेश: M-2021-448' : 'नामांतरण आदेश: M-2023-1102',
        confidence: isNoisy ? 0.68 : 0.94,
        boundingBox: { x: 10, y: 54, width: 35, height: 4, page: 1 },
      },
      {
        text: 'दिनांक: 14/03/2023',
        confidence: 0.92,
        boundingBox: { x: 55, y: 54, width: 25, height: 4, page: 1 },
      },
    ];

    const lines = blocks.map((b) => b.text);
    const rawText = lines.join('\n');
    const avgConfidence = blocks.reduce((acc, b) => acc + b.confidence, 0) / blocks.length;

    return {
      rawText,
      confidence: Number(avgConfidence.toFixed(2)),
      detectedLanguage: language,
      detectedScript: language === 'Hindi' ? 'Devanagari (देवनागरी)' : 'Latin',
      blocks,
      lines,
      providerName: this.name,
      executionTimeMs: Date.now() - startTime + 320,
    };
  }
}

export class TesseractOCRProvider implements OCRProvider {
  name = 'TesseractIndic Engine v5.3';
  async extractText(documentPath: string, language: DocumentLanguage = 'Hindi'): Promise<OCRResult> {
    const mock = new MockOCRProvider();
    return mock.extractText(documentPath, language);
  }
}

export class CloudVisionOCRProvider implements OCRProvider {
  name = 'Bhoomi Bhashini / Cloud Indic OCR';
  async extractText(documentPath: string, language: DocumentLanguage = 'Hindi'): Promise<OCRResult> {
    const mock = new MockOCRProvider();
    return mock.extractText(documentPath, language);
  }
}
