import { MasterHierarchy, LandClassification, OwnershipType } from './types';

export const MASTER_HIERARCHY: MasterHierarchy[] = [
  {
    state: 'Madhya Pradesh',
    districts: [
      {
        name: 'Sehore',
        tehsils: [
          {
            name: 'Sehore',
            villages: ['Rampur', 'Bilkisganj', 'Shyampur', 'Mandi', 'Doraha'],
          },
          {
            name: 'Ichhawar',
            villages: ['Brijisnagar', 'Diwadia', 'Dhaba', 'Kothri'],
          },
          {
            name: 'Ashta',
            villages: ['Pagara', 'Khamkhera', 'Kothri', 'Gourkhedi'],
          },
        ],
      },
      {
        name: 'Bhopal',
        tehsils: [
          {
            name: 'Huzur',
            villages: ['Bairagarh', 'Kolar', 'Ratibad', 'Bhadbhada', 'Misrod'],
          },
          {
            name: 'Berasia',
            villages: ['Lalariya', 'Gunga', 'Nazirabad', 'Dhamarra'],
          },
        ],
      },
      {
        name: 'Vidisha',
        tehsils: [
          {
            name: 'Vidisha',
            villages: ['Gulabganj', 'Rangai', 'Ahmedpur', 'Dharampuri'],
          },
          {
            name: 'Ganj Basoda',
            villages: ['Tyonda', 'Bareth', 'Udaypur', 'Nateran'],
          },
        ],
      },
      {
        name: 'Indore',
        tehsils: [
          {
            name: 'Indore',
            villages: ['Rau', 'Kanadiya', 'Palda', 'Lasudia', 'Sanwer'],
          },
          {
            name: 'Mhow (Dr. Ambedkar Nagar)',
            villages: ['Hasalpur', 'Dongargaon', 'Patalpani', 'Kodariya'],
          },
        ],
      },
    ],
  },
  {
    state: 'Maharashtra',
    districts: [
      {
        name: 'Pune',
        tehsils: [
          {
            name: 'Haveli',
            villages: ['Hadapsar', 'Wagholi', 'Uruli Kanchan', 'Manjri'],
          },
          {
            name: 'Khed',
            villages: ['Chakan', 'Alandi', 'Rajgurunagar', 'Koregaon'],
          },
        ],
      },
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      {
        name: 'Lucknow',
        tehsils: [
          {
            name: 'Bakshi Ka Talab',
            villages: ['Kathwara', 'Bhaisamau', 'Kamalpur', 'Asthi'],
          },
          {
            name: 'Sarojini Nagar',
            villages: ['Banthra', 'Piparsand', 'Amousi', 'Ain'],
          },
        ],
      },
    ],
  },
];

export const VALID_LAND_CLASSIFICATIONS: LandClassification[] = [
  'Agricultural (कृषि)',
  'Residential (आवासीय)',
  'Commercial (व्यावसायिक)',
  'Industrial (औद्योगिक)',
  'Forest (वन भूमि)',
  'Government / Grazing (शासकीय/चरनोई)',
  'Water Body (जलाशय)',
  'Barren (बंजर)',
];

export const VALID_OWNERSHIP_TYPES: OwnershipType[] = [
  'Single Owner (एकल)',
  'Joint Ownership (संयुक्त)',
  'Government Leased (पट्टा)',
  'Trust / Institutional (संस्थागत)',
];

export const AREA_UNITS = ['Acres', 'Hectares', 'Bigha', 'Sq. Meters'];
