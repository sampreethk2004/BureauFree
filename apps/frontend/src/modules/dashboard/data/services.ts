export interface GovernmentService {
  id: string;
  name: string;
  state: string;
  url: string;
  description: string;
  categories: string[];
  department?: string;
  keywords: string[];
}

const normalise = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

export const governmentServices: GovernmentService[] = [
  {
    id: 'ap-meeseva',
    name: 'MeeSeva Citizen Services',
    state: 'Andhra Pradesh',
    url: 'https://ap.meeseva.gov.in/DeptPortal/UserInterface/LoginForm.aspx',
    description: 'Single window for certificates, utility services, and citizen requests across Andhra Pradesh.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of Andhra Pradesh',
    keywords: ['certificate', 'income', 'meeseva', 'ap']
  },
  {
    id: 'ap-rtgs',
    name: 'YSR Pension Kanuka',
    state: 'Andhra Pradesh',
    url: 'https://sspensions.ap.gov.in/SSP/HomeIndex',
    description: 'Check eligibility and application status for social security pension schemes.',
    categories: ['Welfare', 'Social Security'],
    department: 'Department of Rural Development',
    keywords: ['pension', 'welfare', 'ssp', 'ysr']
  },
  {
    id: 'ap-transport',
    name: 'AP Transport Citizen Services',
    state: 'Andhra Pradesh',
    url: 'https://aptransport.org/',
    description: 'Apply for driving licences, vehicle registrations, and transport-related services.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving', 'licence', 'vehicle', 'transport']
  },
  {
    id: 'ts-meeseva',
    name: 'TS MeeSeva Portal',
    state: 'Telangana',
    url: 'https://ts.meeseva.telangana.gov.in/meeseva/home.htm',
    description: 'Unified Telangana portal for citizen certificates, utility services, and registrations.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of Telangana',
    keywords: ['meeseva', 'ts', 'telangana', 'certificate']
  },
  {
    id: 'ts-dharani',
    name: 'Dharani Land Records',
    state: 'Telangana',
    url: 'https://dharani.telangana.gov.in/',
    description: 'Access integrated land records and conduct property-related transactions.',
    categories: ['Land Records'],
    department: 'Revenue Department',
    keywords: ['land', 'property', 'mutation', 'records']
  },
  {
    id: 'ts-epass',
    name: 'Telangana ePass Scholarships',
    state: 'Telangana',
    url: 'https://telanganaepass.cgg.gov.in/',
    description: 'Apply for post-matric and pre-matric scholarships offered by Telangana.',
    categories: ['Education', 'Scholarships'],
    department: 'Department of Social Welfare',
    keywords: ['scholarship', 'epass', 'education', 'fees']
  },
  {
    id: 'mh-aaple-sarkar',
    name: 'Aaple Sarkar',
    state: 'Maharashtra',
    url: 'https://aaplesarkar.mahaonline.gov.in/en/Login/Login',
    description: 'Single sign-on gateway to Maharashtra citizen services and applications.',
    categories: ['Citizen Services'],
    department: 'Government of Maharashtra',
    keywords: ['aaple', 'sarkar', 'mahaonline', 'maharashtra']
  },
  {
    id: 'mh-scholarships',
    name: 'MAHADBT Scholarships',
    state: 'Maharashtra',
    url: 'https://mahadbt.maharashtra.gov.in/',
    description: 'Direct benefit transfer portal for Maharashtra scholarships and schemes.',
    categories: ['Education', 'Welfare'],
    department: 'Department of Higher Education',
    keywords: ['scholarship', 'dbt', 'mahadbt']
  },
  {
    id: 'mh-rera',
    name: 'MahaRERA',
    state: 'Maharashtra',
    url: 'https://maharerait.mahaonline.gov.in/',
    description: 'Real Estate Regulatory Authority portal for project registrations and complaints.',
    categories: ['Housing', 'Regulatory'],
    department: 'Maharashtra Real Estate Regulatory Authority',
    keywords: ['housing', 'real estate', 'rera']
  },
  {
    id: 'ka-seva-sindhu',
    name: 'Seva Sindhu',
    state: 'Karnataka',
    url: 'https://sevasindhu.karnataka.gov.in/Sevasindhu/English',
    description: 'Statewide portal for government-to-citizen services and scheme applications.',
    categories: ['Citizen Services'],
    department: 'Government of Karnataka',
    keywords: ['seva', 'sindhu', 'karnataka', 'certificate']
  },
  {
    id: 'ka-karnataka-one',
    name: 'Karnataka One',
    state: 'Karnataka',
    url: 'https://www.karnatakaone.gov.in/',
    description: 'Online payments and service requests for utilities, tax, and municipal services.',
    categories: ['Utilities', 'Municipal Services'],
    department: 'E-Governance Department',
    keywords: ['utility', 'payment', 'karnataka', 'municipal']
  },
  {
    id: 'ka-rto',
    name: 'Karnataka Transport Services',
    state: 'Karnataka',
    url: 'https://transport.karnataka.gov.in/page/home/english',
    description: 'Driving licence, vehicle registration, and permit services for Karnataka residents.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving', 'licence', 'vehicle', 'permit']
  },
  {
    id: 'tn-esevai',
    name: 'TN eSevai',
    state: 'Tamil Nadu',
    url: 'https://www.tnesevai.tn.gov.in/',
    description: 'Apply for certificates, licences, and citizen services offered by Tamil Nadu.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Tamil Nadu e-Governance Agency',
    keywords: ['esevai', 'tnega', 'certificate']
  },
  {
    id: 'tn-tnsc',
    name: 'TNeGA Service Portal',
    state: 'Tamil Nadu',
    url: 'https://www.tnega.tn.gov.in/',
    description: 'Digital governance programmes, service status, and guided pathways for Tamil Nadu.',
    categories: ['Citizen Services'],
    department: 'Tamil Nadu e-Governance Agency',
    keywords: ['services', 'digital', 'guidance', 'tn']
  },
  {
    id: 'tn-tnpds',
    name: 'Smart Ration Card (TNPDS)',
    state: 'Tamil Nadu',
    url: 'https://www.tnpds.gov.in/',
    description: 'Manage ration cards, add beneficiaries, and check entitlement details.',
    categories: ['Food & Civil Supplies'],
    department: 'Department of Food and Consumer Protection',
    keywords: ['ration', 'pds', 'food', 'card']
  },
  {
    id: 'up-edistrict',
    name: 'eDistrict Uttar Pradesh',
    state: 'Uttar Pradesh',
    url: 'https://edistrict.up.gov.in/edistrictup/',
    description: 'Access caste, income, birth certificates and other district-level services online.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of Uttar Pradesh',
    keywords: ['edistrict', 'certificate', 'up']
  },
  {
    id: 'up-scholarship',
    name: 'UP Scholarship & Fee Reimbursement',
    state: 'Uttar Pradesh',
    url: 'https://scholarship.up.gov.in/',
    description: 'Apply for pre-matric and post-matric scholarship schemes in Uttar Pradesh.',
    categories: ['Education', 'Scholarships'],
    department: 'Social Welfare Department',
    keywords: ['scholarship', 'education', 'fee', 'reimbursement']
  },
  {
    id: 'up-nivesh-mitra',
    name: 'Nivesh Mitra',
    state: 'Uttar Pradesh',
    url: 'https://niveshmitra.up.nic.in/',
    description: 'Single window clearances for investors and business-related approvals.',
    categories: ['Business', 'Compliance'],
    department: 'Department of Industries',
    keywords: ['business', 'licence', 'investment', 'clearance']
  },
  {
    id: 'dl-edistrict',
    name: 'e-District Delhi',
    state: 'Delhi',
    url: 'https://edistrict.delhigovt.nic.in/',
    description: 'Apply for certificates, licences, and welfare schemes provided by Delhi Government.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of NCT of Delhi',
    keywords: ['delhi', 'certificate', 'edistrict']
  },
  {
    id: 'dl-transport',
    name: 'Delhi Transport Services',
    state: 'Delhi',
    url: 'https://transport.delhi.gov.in/',
    description: 'Online services for driving licences, vehicle registration, and permits in Delhi.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving', 'vehicle', 'permit', 'transport']
  },
  {
    id: 'dl-epass',
    name: 'Delhi e-Ration Card',
    state: 'Delhi',
    url: 'https://nfs.delhi.gov.in/',
    description: 'Manage and track ration card services under the Public Distribution System.',
    categories: ['Food & Civil Supplies'],
    department: 'Department of Food, Supplies and Consumer Affairs',
    keywords: ['ration', 'pds', 'food', 'card']
  },
  {
    id: 'gj-digital',
    name: 'Digital Gujarat',
    state: 'Gujarat',
    url: 'https://www.digitalgujarat.gov.in/',
    description: 'Unified portal for certificates, scholarships, and citizen services in Gujarat.',
    categories: ['Citizen Services', 'Education'],
    department: 'Government of Gujarat',
    keywords: ['digital', 'gujarat', 'certificate', 'scholarship']
  },
  {
    id: 'gj-garvi',
    name: 'Garvi Gujarat',
    state: 'Gujarat',
    url: 'https://garvigujarat.in/',
    description: 'Property registration, stamp duty calculation, and e-payment services.',
    categories: ['Land Records', 'Property'],
    department: 'Revenue Department',
    keywords: ['property', 'registration', 'land']
  },
  {
    id: 'gj-ikhedut',
    name: 'iKhedut Farmer Portal',
    state: 'Gujarat',
    url: 'https://ikhedut.gujarat.gov.in/',
    description: 'Apply for agricultural subsidies, equipment assistance, and farmer schemes.',
    categories: ['Agriculture', 'Welfare'],
    department: 'Agriculture, Farmers Welfare and Co-operation Department',
    keywords: ['farmer', 'agriculture', 'subsidy']
  },
  {
    id: 'kl-edistrict',
    name: 'eDistrict Kerala',
    state: 'Kerala',
    url: 'https://edistrict.kerala.gov.in/',
    description: 'Citizen services for certificates, revenue services, and welfare schemes in Kerala.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of Kerala',
    keywords: ['kerala', 'certificate', 'revenue']
  },
  {
    id: 'kl-akshaya',
    name: 'Akshaya eCentre',
    state: 'Kerala',
    url: 'https://akshaya.kerala.gov.in/',
    description: 'Locate Akshaya centres and access digital literacy and service assistance.',
    categories: ['Citizen Services', 'Digital Literacy'],
    department: 'Kerala State IT Mission',
    keywords: ['akshaya', 'centre', 'assistance']
  },
  {
    id: 'kl-housing',
    name: 'Kerala Housing Board Online',
    state: 'Kerala',
    url: 'https://kshb.kerala.gov.in/',
    description: 'Track housing schemes, applications, and beneficiary services in Kerala.',
    categories: ['Housing', 'Welfare'],
    department: 'Kerala State Housing Board',
    keywords: ['housing', 'scheme', 'application']
  },
  {
    id: 'wb-banglarbhumi',
    name: 'Banglarbhumi',
    state: 'West Bengal',
    url: 'https://banglarbhumi.gov.in/',
    description: 'Land records, plot information, and property mutation services for West Bengal.',
    categories: ['Land Records'],
    department: 'Land and Land Reforms Department',
    keywords: ['land', 'records', 'west bengal']
  },
  {
    id: 'wb-edistrict',
    name: 'eDistrict West Bengal',
    state: 'West Bengal',
    url: 'https://edistrict.wb.gov.in/PACE/login.do',
    description: 'Online certificates, licences, and social welfare services across West Bengal.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of West Bengal',
    keywords: ['certificate', 'service', 'wb']
  },
  {
    id: 'wb-krishak',
    name: 'Krishak Bandhu',
    state: 'West Bengal',
    url: 'https://krishakbandhu.net/',
    description: 'Financial assistance and insurance benefits for farmers in West Bengal.',
    categories: ['Agriculture', 'Welfare'],
    department: 'Department of Agriculture',
    keywords: ['farmer', 'assistance', 'agriculture']
  },
  {
    id: 'rj-raj-sso',
    name: 'Rajasthan Single Sign-On (RajSSO)',
    state: 'Rajasthan',
    url: 'https://sso.rajasthan.gov.in/',
    description: 'Unified login for e-Mitra, employment, land records, and government schemes.',
    categories: ['Citizen Services'],
    department: 'Department of Information Technology and Communication',
    keywords: ['sso', 'emitra', 'rajasthan']
  },
  {
    id: 'rj-apna-khata',
    name: 'Apna Khata Rajasthan',
    state: 'Rajasthan',
    url: 'https://apnakhata.raj.nic.in/',
    description: 'Check land records, mutation status, and Jamabandi copies online.',
    categories: ['Land Records'],
    department: 'Board of Revenue',
    keywords: ['land', 'jamabandi', 'records']
  },
  {
    id: 'rj-jan-soochna',
    name: 'Jan Soochna Portal',
    state: 'Rajasthan',
    url: 'https://jansoochna.rajasthan.gov.in/',
    description: 'Transparent access to welfare schemes, beneficiaries, and department datasets.',
    categories: ['Transparency', 'Welfare'],
    department: 'Department of Information Technology and Communication',
    keywords: ['scheme', 'beneficiary', 'rajasthan']
  },
  {
    id: 'mp-edistrict',
    name: 'MP eDistrict',
    state: 'Madhya Pradesh',
    url: 'https://www.mpedistrict.gov.in/',
    description: 'Online access to MP citizen services including certificates and revenue records.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of Madhya Pradesh',
    keywords: ['mp', 'certificate', 'edistrict']
  },
  {
    id: 'mp-mponline',
    name: 'MPOnline',
    state: 'Madhya Pradesh',
    url: 'https://www.mponline.gov.in/portal/',
    description: 'e-Governance services spanning education, utilities, and recruitment in MP.',
    categories: ['Citizen Services', 'Education'],
    department: 'Government of Madhya Pradesh',
    keywords: ['mponline', 'education', 'services']
  },
  {
    id: 'mp-samagra',
    name: 'Samagra Portal',
    state: 'Madhya Pradesh',
    url: 'https://samagra.gov.in/',
    description: 'Family ID, welfare scheme eligibility, and beneficiary payments tracking.',
    categories: ['Welfare', 'Social Security'],
    department: 'Social Justice and Disabled Welfare Department',
    keywords: ['samagra', 'welfare', 'family id']
  }
];

export const states = Array.from(new Set(governmentServices.map((service) => service.state))).sort(
  (left, right) => left.localeCompare(right)
);

export const searchServices = (state: string | null, query: string) => {
  const normalisedState = state?.trim();
  const normalisedQuery = query ? normalise(query) : '';

  return governmentServices
    .filter((service) => {
      const matchesState = !normalisedState || service.state === normalisedState;
      if (!matchesState) {
        return false;
      }

      if (!normalisedQuery) {
        return true;
      }

      const searchableText = normalise(
        [
          service.name,
          service.description,
          service.categories.join(' '),
          service.department ?? '',
          service.keywords.join(' ')
        ].join(' ')
      );

      return normalisedQuery
        .split(' ')
        .filter(Boolean)
        .every((token) => searchableText.includes(token));
    })
    .sort((left, right) => left.name.localeCompare(right.name));
};
