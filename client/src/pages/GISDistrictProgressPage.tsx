import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Sparkles,
} from 'lucide-react';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';

export const GISDistrictProgressPage: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Sehore');
  const [selectedParcel, setSelectedParcel] = useState<any | null>({
    surveyNumber: '124/3',
    owner: 'रमेश कुमार (Ramesh Kumar)',
    area: '2.45 Acres',
    village: 'Rampur',
    classification: 'Agricultural',
    status: 'Passed (वैध)',
    coordinates: '23.2045° N, 77.0862° E',
  });

  const districtsData = [
    {
      name: 'Sehore',
      state: 'Madhya Pradesh',
      tehsils: 4,
      villages: 840,
      totalParcels: 41200,
      digitized: 38400,
      validated: 35100,
      pending: 2400,
      accuracy: 94.2,
      activeTehsils: [
        { name: 'Sehore', digitized: '94%', parcels: 14200 },
        { name: 'Ichhawar', digitized: '89%', parcels: 11400 },
        { name: 'Ashta', digitized: '91%', parcels: 15600 },
      ],
    },
    {
      name: 'Bhopal',
      state: 'Madhya Pradesh',
      tehsils: 2,
      villages: 512,
      totalParcels: 34800,
      digitized: 32100,
      validated: 29800,
      pending: 1800,
      accuracy: 95.1,
      activeTehsils: [
        { name: 'Huzur', digitized: '96%', parcels: 21800 },
        { name: 'Berasia', digitized: '92%', parcels: 13000 },
      ],
    },
    {
      name: 'Vidisha',
      state: 'Madhya Pradesh',
      tehsils: 5,
      villages: 720,
      totalParcels: 28900,
      digitized: 25400,
      validated: 22900,
      pending: 2100,
      accuracy: 92.8,
      activeTehsils: [
        { name: 'Vidisha', digitized: '93%', parcels: 16200 },
        { name: 'Ganj Basoda', digitized: '88%', parcels: 12700 },
      ],
    },
    {
      name: 'Indore',
      state: 'Madhya Pradesh',
      tehsils: 3,
      villages: 640,
      totalParcels: 52100,
      digitized: 49800,
      validated: 47200,
      pending: 1900,
      accuracy: 96.5,
      activeTehsils: [
        { name: 'Indore', digitized: '98%', parcels: 34200 },
        { name: 'Mhow', digitized: '94%', parcels: 17900 },
      ],
    },
    {
      name: 'Pune',
      state: 'Maharashtra',
      tehsils: 4,
      villages: 690,
      totalParcels: 39400,
      digitized: 36200,
      validated: 33400,
      pending: 2200,
      accuracy: 93.7,
      activeTehsils: [
        { name: 'Haveli', digitized: '95%', parcels: 22100 },
        { name: 'Khed', digitized: '91%', parcels: 17300 },
      ],
    },
  ];

  const currentDist = districtsData.find((d) => d.name === selectedDistrict) || districtsData[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              GIS Cadastral Layer & Jurisdictional Progress
            </span>
            <span className="text-xs text-slate-500">• Section 13 Feature</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            District Modernization Index & Cadastral Overlay
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing district digitization percentages, parcel boundary validation status, and sub-parcel maps.
          </p>
        </div>

        {/* District Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Select District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
          >
            {districtsData.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Metrics Row for Selected District */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase">District Parcels</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {currentDist.totalParcels.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">{currentDist.villages} revenue villages</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase">Digitized & Scanned</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {currentDist.digitized.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {Math.round((currentDist.digitized / currentDist.totalParcels) * 100)}% coverage
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase">Legally Validated</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {currentDist.validated.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">10/10 rules verified</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase">District OCR Accuracy</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{currentDist.accuracy}%</div>
          <ConfidenceBadge score={currentDist.accuracy} size="sm" />
        </div>
      </div>

      {/* Interactive Cadastral Map Visualizer + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): SVG Cadastral Map Simulator */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-5 border border-slate-700 shadow-lg text-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Cadastral Revenue Map Layer (ग्राम रामपुर - हल्का क्र. १२)
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
                <span>Passed (124/3)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm inline-block" />
                <span>Disputed (88/2)</span>
              </span>
            </div>
          </div>

          {/* SVG Cadastral Plot Grid */}
          <div className="relative bg-slate-950 rounded-xl p-6 flex items-center justify-center border border-slate-800 min-h-[380px] overflow-hidden">
            <svg viewBox="0 0 600 360" className="w-full h-auto max-w-lg select-none">
              {/* Plot 124/3 (Clean) */}
              <polygon
                points="120,60 280,70 270,180 110,160"
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10B981"
                strokeWidth="2.5"
                className="cursor-pointer hover:fill-emerald-500/40 transition-colors"
                onClick={() =>
                  setSelectedParcel({
                    surveyNumber: '124/3',
                    owner: 'रमेश कुमार (Ramesh Kumar)',
                    area: '2.45 Acres',
                    village: 'Rampur',
                    classification: 'Agricultural (दो फसली)',
                    status: 'Passed (वैध)',
                    coordinates: '23.2045° N, 77.0862° E',
                  })
                }
              />
              <text x="180" y="125" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                खसरा 124/3 (2.45 Ac)
              </text>

              {/* Parent Parcel 88 */}
              <polygon
                points="300,70 480,80 470,220 290,190"
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="cursor-pointer hover:fill-blue-500/30"
                onClick={() =>
                  setSelectedParcel({
                    surveyNumber: '88 (मूल किता)',
                    owner: 'गोपाल दास (Gopal Das)',
                    area: '5.00 Acres',
                    village: 'Rampur',
                    classification: 'Agricultural',
                    status: 'Parent Parcel Active',
                    coordinates: '23.2110° N, 77.0915° E',
                  })
                }
              />
              <text x="360" y="110" fill="#93C5FD" fontSize="11" fontWeight="bold">
                मूल किता 88 (5.00 Ac)
              </text>

              {/* Sub-parcel 88/1 */}
              <polygon
                points="300,70 390,75 385,195 290,190"
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10B981"
                strokeWidth="2"
                className="cursor-pointer hover:fill-emerald-500/40"
                onClick={() =>
                  setSelectedParcel({
                    surveyNumber: '88/1',
                    owner: 'सुनील दास (Sunil Das)',
                    area: '3.20 Acres',
                    village: 'Rampur',
                    classification: 'Agricultural',
                    status: 'Passed',
                    coordinates: '23.2112° N, 77.0917° E',
                  })
                }
              />
              <text x="315" y="150" fill="#FFFFFF" fontSize="10">
                88/1 (3.2 Ac)
              </text>

              {/* Sub-parcel 88/2 (Area excess conflict!) */}
              <polygon
                points="390,75 480,80 470,220 385,195"
                fill="rgba(239, 68, 68, 0.3)"
                stroke="#EF4444"
                strokeWidth="2.5"
                className="cursor-pointer hover:fill-rose-500/50 animate-pulse"
                onClick={() =>
                  setSelectedParcel({
                    surveyNumber: '88/2 (Area Excess!)',
                    owner: 'मुकेश दास (Mukesh Das)',
                    area: '2.80 Acres',
                    village: 'Rampur',
                    classification: 'Agricultural',
                    status: 'FLAGGED: Area Exceeds Parent (3.2+2.8 > 5.0)',
                    coordinates: '23.2114° N, 77.0919° E',
                  })
                }
              />
              <text x="405" y="150" fill="#FCA5A5" fontSize="10" fontWeight="bold">
                88/2 (2.8 Ac ⚠️)
              </text>

              {/* Road & Water Body Overlay */}
              <path d="M 50,300 Q 300,280 550,310" stroke="#F59E0B" strokeWidth="12" fill="none" opacity="0.6" />
              <text x="240" y="325" fill="#FCD34D" fontSize="10">
                सीहोर-भोपाल मुख्य मार्ग
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Click on any cadastral parcel polygon above to inspect title ownership and boundary consistency.
          </p>
        </div>

        {/* Right Column (1/3): Parcel Details Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Selected Parcel Cadastral Record</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </h3>

            {selectedParcel ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
                  <span className="text-[10px] text-blue-600 font-bold uppercase">Survey Number</span>
                  <div className="text-base font-bold text-blue-950 font-mono">
                    {selectedParcel.surveyNumber}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Claimant Owner:</span>
                    <strong className="text-slate-900 font-indic">{selectedParcel.owner}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Calculated Area:</span>
                    <strong className="text-emerald-700">{selectedParcel.area}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Revenue Village:</span>
                    <span className="text-slate-800 font-semibold">{selectedParcel.village}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">GIS Coordinates:</span>
                    <span className="font-mono text-slate-700 text-[11px]">{selectedParcel.coordinates}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1">Status:</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        selectedParcel.status.includes('FLAGGED')
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {selectedParcel.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a parcel on the map to inspect.</p>
            )}
          </div>

          {/* Tehsil Progress Breakdown */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              {currentDist.name} Tehsil-wise Digitization
            </h3>
            <div className="space-y-3 text-xs">
              {currentDist.activeTehsils.map((t) => (
                <div key={t.name} className="space-y-1">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{t.name}</span>
                    <span className="font-bold text-slate-900">{t.digitized}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: t.digitized }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
