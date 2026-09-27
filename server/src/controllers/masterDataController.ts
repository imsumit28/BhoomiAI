import { Request, Response } from 'express';
import { MASTER_HIERARCHY, VALID_LAND_CLASSIFICATIONS, VALID_OWNERSHIP_TYPES, AREA_UNITS } from '../../../shared/masterData';

export function getMasterHierarchy(_req: Request, res: Response) {
  res.json({
    hierarchy: MASTER_HIERARCHY,
    landClassifications: VALID_LAND_CLASSIFICATIONS,
    ownershipTypes: VALID_OWNERSHIP_TYPES,
    areaUnits: AREA_UNITS,
  });
}

export function getSampleDocuments(_req: Request, res: Response) {
  const samples = [
    {
      id: 'sample-khasra-hindi-clean',
      title: 'मध्य प्रदेश खसरा अधिकार अभिलेख (Clean Record)',
      documentType: 'Khasra',
      language: 'Hindi',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      tehsil: 'Sehore',
      village: 'Rampur',
      description: 'Standard legacy Hindi land record with high clarity and complete field structure.',
      hasConflict: false,
      simulateNoise: false,
      thumbnail: 'khasra_clean.png',
    },
    {
      id: 'sample-khasra-hindi-noisy',
      title: 'जीर्ण/कटा-फटा हस्तलिखित खसरा (Degraded / Noisy OCR)',
      documentType: 'Khasra',
      language: 'Hindi',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      tehsil: 'Sehore',
      village: 'Rampur',
      description: 'Aged handwritten record with smudges triggering low-confidence guardrail (<70%) and OCR spelling errors.',
      hasConflict: true,
      simulateNoise: true,
      thumbnail: 'khasra_noisy.png',
    },
    {
      id: 'sample-jamabandi-conflict',
      title: 'जमाबंदी नामांतरण पंजी (Ownership Conflict Case)',
      documentType: 'Jamabandi',
      language: 'Hindi',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      tehsil: 'Sehore',
      village: 'Rampur',
      description: 'Historical register deed with conflicting title claim against existing active survey record.',
      hasConflict: true,
      simulateNoise: false,
      thumbnail: 'jamabandi.png',
    },
    {
      id: 'sample-subparcel-mismatch',
      title: 'बटांकन नक्शा व रकबा (Sub-parcel Area Excess Case)',
      documentType: 'RoR',
      language: 'Hindi',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      tehsil: 'Sehore',
      village: 'Rampur',
      description: 'Sub-divided parcel partition deed where sum of sub-parcels exceeds parent survey area.',
      hasConflict: true,
      simulateNoise: false,
      thumbnail: 'ror_area.png',
    },
    {
      id: 'sample-sale-deed-english',
      title: 'Registered Conveyance Deed (English)',
      documentType: 'Sale/Registration Record',
      language: 'English',
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      tehsil: 'Huzur',
      village: 'Kolar',
      description: 'Bilingual legal title deed with registration number and stamp duty valuation.',
      hasConflict: false,
      simulateNoise: false,
      thumbnail: 'sale_deed.png',
    },
  ];

  res.json({ samples });
}
