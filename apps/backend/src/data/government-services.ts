export interface ServiceLink {
  label: string;
  url: string;
}

export interface GovernmentService {
  id: string;
  name: string;
  state: string;
  url: string;
  description: string;
  categories: string[];
  department?: string;
  keywords: string[];
  relatedLinks: ServiceLink[];
  guideVideos: ServiceLink[];
}

const applySynonymStandardisation = (value: string) =>
  value
    .replace(/\blicen[cs]es\b/g, 'licenses')
    .replace(/\blicen[cs]e\b/g, 'license');

const normalise = (value: string) =>
  applySynonymStandardisation(value.toLowerCase()).replace(/\s+/g, ' ').trim();

const isCentralService = (service: GovernmentService) => service.state.toLowerCase().includes('india (central)');

const portalPriority = (service: GovernmentService) => {
  const searchableText = normalise(
    [service.name, service.description, service.department ?? '', (service.keywords ?? []).join(' ')].join(' ')
  );

  let score = 0;

  if (searchableText.includes('state portal')) {
    score += 100;
  }

  if (searchableText.includes('service portal')) {
    score += 90;
  }

  if (searchableText.includes('administration portal')) {
    score += 80;
  }

  if (searchableText.includes('portal')) {
    score += 60;
  }

  if (searchableText.includes('edistrict') || searchableText.includes('e district')) {
    score += 40;
  }

  if (searchableText.includes('meeseva') || searchableText.includes('saral') || searchableText.includes('online services')) {
    score += 25;
  }

  if (service.relatedLinks.length > 0) {
    score += 5;
  }

  return score;
};

const pickPrimaryPortal = (services: GovernmentService[]) =>
  [...services].sort((left, right) => portalPriority(right) - portalPriority(left) || left.name.localeCompare(right.name))[0];

const youtubeGuide = (query: string, label?: string): ServiceLink => ({
  label: label ?? `How to apply (${query})`,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
});

type GovernmentServiceSeed = Omit<GovernmentService, 'relatedLinks' | 'guideVideos'> & {
  relatedLinks?: ServiceLink[];
  guideVideos?: ServiceLink[];
};

const baseGovernmentServices: GovernmentServiceSeed[] = [
  {
    id: 'arunachal-eservices',
    name: 'Arunachal eServices',
    state: 'Arunachal Pradesh',
    url: 'https://eservice.arunachal.gov.in/',
    description: 'State portal for certificates, utilities, and citizen-centric applications in Arunachal Pradesh.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Department of Information Technology & Communication',
    keywords: ['arunachal', 'eservice', 'certificate', 'citizen']
  },
  {
    id: 'arunachal-state-portal',
    name: 'Arunachal Pradesh State Portal',
    state: 'Arunachal Pradesh',
    url: 'https://www.arunachalpradesh.gov.in/',
    description: 'Official Arunachal Pradesh government portal with department directory, citizen charters, and contact points.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Arunachal Pradesh',
    keywords: ['arunachal pradesh government', 'state portal', 'departments', 'citizen charter']
  },
  {
    id: 'assam-edistrict',
    name: 'Assam eDistrict',
    state: 'Assam',
    url: 'https://edistrict.assam.gov.in/',
    description: 'Apply for certificates, land records, and public services delivered by the Government of Assam.',
    categories: ['Citizen Services', 'Land Records'],
    department: 'Government of Assam',
    keywords: ['assam', 'edistrict', 'certificate', 'land records']
  },
  {
    id: 'assam-state-portal',
    name: 'Assam State Portal',
    state: 'Assam',
    url: 'https://assam.gov.in/',
    description: 'Official Government of Assam portal consolidating departments, schemes, and citizen resources by category.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Assam',
    keywords: ['assam government', 'departments', 'schemes', 'citizen portal']
  },
  {
    id: 'bihar-serviceonline',
    name: 'Bihar ServicePlus',
    state: 'Bihar',
    url: 'https://serviceonline.bihar.gov.in/',
    description: 'Right to public services portal for Bihar residents covering certificates and welfare schemes.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'General Administration Department',
    keywords: ['bihar', 'rtps', 'service plus', 'certificate']
  },
  {
    id: 'bihar-state-portal',
    name: 'Bihar State Portal',
    state: 'Bihar',
    url: 'https://state.bihar.gov.in/',
    description: 'Official Bihar government gateway listing departments, tenders, schemes, and citizen charters.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Bihar',
    keywords: ['bihar government', 'departments', 'tenders', 'schemes']
  },
  {
    id: 'chhattisgarh-edistrict',
    name: 'CG eDistrict',
    state: 'Chhattisgarh',
    url: 'https://edistrict.cgstate.gov.in/',
    description: 'Online issuance of certificates, revenue services, and citizen-centric applications across Chhattisgarh.',
    categories: ['Citizen Services', 'Revenue'],
    department: 'Government of Chhattisgarh',
    keywords: ['chhattisgarh', 'edistrict', 'certificate', 'revenue']
  },
  {
    id: 'chhattisgarh-state-portal',
    name: 'Chhattisgarh State Portal',
    state: 'Chhattisgarh',
    url: 'https://www.cgstate.gov.in/',
    description: 'Chhattisgarh government portal providing department access, policies, and citizen information in one place.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Chhattisgarh',
    keywords: ['chhattisgarh government', 'departments', 'policies', 'citizen portal']
  },
  {
    id: 'goa-online',
    name: 'Goa Online Services',
    state: 'Goa',
    url: 'https://goaonline.gov.in/',
    description: 'Single window portal for Goa government services, licences, and registrations.',
    categories: ['Citizen Services', 'Licences'],
    department: 'Department of Information Technology, Goa',
    keywords: ['goa', 'licence', 'services', 'portal']
  },
  {
    id: 'goa-state-portal',
    name: 'Goa State Portal',
    state: 'Goa',
    url: 'https://www.goa.gov.in/',
    description: 'Government of Goa website featuring department listings, public notices, and tourism guidance.',
    categories: ['Information', 'Citizen Services'],
    department: 'Government of Goa',
    keywords: ['goa government', 'departments', 'public notice', 'tourism information']
  },
  {
    id: 'haryana-saral',
    name: 'Antyodaya Saral Haryana',
    state: 'Haryana',
    url: 'https://saralharyana.gov.in/',
    description: 'Unified platform for citizen services, certificates, and welfare schemes in Haryana.',
    categories: ['Citizen Services', 'Welfare'],
    department: 'Citizen Resources Information Department',
    keywords: ['haryana', 'saral', 'services', 'schemes']
  },
  {
    id: 'haryana-state-portal',
    name: 'Haryana State Portal',
    state: 'Haryana',
    url: 'https://haryana.gov.in/',
    description: 'Official Haryana government portal with department profiles, initiatives, and online service links.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Haryana',
    keywords: ['haryana government', 'departments', 'initiatives', 'state portal']
  },
  {
    id: 'himachal-edistrict',
    name: 'eDistrict Himachal Pradesh',
    state: 'Himachal Pradesh',
    url: 'https://edistrict.hp.gov.in/',
    description: 'Apply for Himachal Pradesh certificates, revenue services, and social welfare benefits online.',
    categories: ['Citizen Services', 'Revenue'],
    department: 'Government of Himachal Pradesh',
    keywords: ['himachal', 'edistrict', 'certificate', 'revenue']
  },
  {
    id: 'himachal-state-portal',
    name: 'Himachal Pradesh State Portal',
    state: 'Himachal Pradesh',
    url: 'https://himachal.nic.in/',
    description: 'State government homepage consolidating Himachal departments, schemes, and citizen resources.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Himachal Pradesh',
    keywords: ['himachal government', 'departments', 'schemes', 'citizen resources']
  },
  {
    id: 'jharkhand-jharsewa',
    name: 'Jharsewa Citizen Services',
    state: 'Jharkhand',
    url: 'https://jharsewa.jharkhand.gov.in/',
    description: 'Public service delivery portal for Jharkhand including certificates, licences, and welfare schemes.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Department of Information Technology & e-Governance',
    keywords: ['jharkhand', 'jharsewa', 'certificate', 'services']
  },
  {
    id: 'jharkhand-state-portal',
    name: 'Jharkhand State Portal',
    state: 'Jharkhand',
    url: 'https://www.jharkhand.gov.in/',
    description: 'Jharkhand government portal organising departments, initiatives, tenders, and contact services.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Jharkhand',
    keywords: ['jharkhand government', 'departments', 'initiatives', 'contact']
  },
  {
    id: 'manipur-eservice',
    name: 'Manipur e-Services',
    state: 'Manipur',
    url: 'https://www.eservice.manipur.gov.in/',
    description: 'Digital interface for public services, passes, and certificate applications in Manipur.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Department of Information Technology, Manipur',
    keywords: ['manipur', 'eservice', 'certificate', 'digital']
  },
  {
    id: 'manipur-state-portal',
    name: 'Manipur State Portal',
    state: 'Manipur',
    url: 'https://manipur.gov.in/',
    description: 'Official Government of Manipur website providing department updates, notifications, and citizen resources.',
    categories: ['Information', 'Citizen Services'],
    department: 'Government of Manipur',
    keywords: ['manipur government', 'departments', 'notifications', 'citizen portal']
  },
  {
    id: 'meghalaya-portal',
    name: 'Meghalaya State Portal',
    state: 'Meghalaya',
    url: 'https://meghalaya.gov.in/',
    description: 'Gateway to citizen services, schemes, and departmental resources offered by Meghalaya Government.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Meghalaya',
    keywords: ['meghalaya', 'services', 'portal', 'schemes']
  },
  {
    id: 'mizoram-edistrict',
    name: 'Mizoram eDistrict',
    state: 'Mizoram',
    url: 'https://edistrict.mizoram.gov.in/',
    description: 'Online access to certificates, permits, and welfare programmes in Mizoram.',
    categories: ['Citizen Services', 'Welfare'],
    department: 'Government of Mizoram',
    keywords: ['mizoram', 'edistrict', 'certificate', 'welfare']
  },
  {
    id: 'mizoram-state-portal',
    name: 'Mizoram State Portal',
    state: 'Mizoram',
    url: 'https://mizoram.gov.in/',
    description: 'Government of Mizoram portal covering departments, news releases, and programme updates.',
    categories: ['Information', 'Citizen Services'],
    department: 'Government of Mizoram',
    keywords: ['mizoram government', 'departments', 'news', 'programmes']
  },
  {
    id: 'nagaland-edistrict',
    name: 'Nagaland eDistrict',
    state: 'Nagaland',
    url: 'https://edistrict.nagaland.gov.in/',
    description: 'Delivery of certificates, permits, and public services through the Nagaland eDistrict portal.',
    categories: ['Citizen Services', 'Licences'],
    department: 'Government of Nagaland',
    keywords: ['nagaland', 'edistrict', 'certificate', 'permit']
  },
  {
    id: 'nagaland-state-portal',
    name: 'Nagaland State Portal',
    state: 'Nagaland',
    url: 'https://nagaland.gov.in/',
    description: 'Nagaland government website aggregating departments, policies, and citizen announcements.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Nagaland',
    keywords: ['nagaland government', 'departments', 'policies', 'announcements']
  },
  {
    id: 'odisha-odishaone',
    name: 'Odisha One',
    state: 'Odisha',
    url: 'https://www.odishaone.gov.in/',
    description: 'Comprehensive portal for Odisha government services, payments, and scheme enrolments.',
    categories: ['Citizen Services', 'Utilities'],
    department: 'Electronics & IT Department, Odisha',
    keywords: ['odisha', 'odisha one', 'payments', 'services']
  },
  {
    id: 'odisha-state-portal',
    name: 'Odisha State Portal',
    state: 'Odisha',
    url: 'https://www.odisha.gov.in/',
    description: 'Official Government of Odisha portal featuring departments, policies, tenders, and citizen assistance.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Odisha',
    keywords: ['odisha government', 'departments', 'tenders', 'policies']
  },
  {
    id: 'punjab-esewa',
    name: 'Punjab eSewa',
    state: 'Punjab',
    url: 'https://esewa.punjab.gov.in/',
    description: 'Punjab government service delivery portal for certificates, licences, and scheme benefits.',
    categories: ['Citizen Services', 'Licences'],
    department: 'Punjab State e-Governance Society',
    keywords: ['punjab', 'esewa', 'certificate', 'licence']
  },
  {
    id: 'punjab-state-portal',
    name: 'Punjab State Portal',
    state: 'Punjab',
    url: 'https://punjab.gov.in/',
    description: 'Government of Punjab website presenting department pages, schemes, and contact services.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Punjab',
    keywords: ['punjab government', 'departments', 'schemes', 'contact']
  },
  {
    id: 'punjab-transport',
    name: 'Punjab Transport Citizen Services',
    state: 'Punjab',
    url: 'https://transport.punjab.gov.in/',
    description: 'Punjab Transport Department portal for learner licences, driving licence renewals, and vehicle services.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving license', 'learner licence', 'vehicle registration', 'punjab transport'],
    relatedLinks: [
      { label: 'Driving licence online portal', url: 'https://dlic.punjab.gov.in/' },
      { label: 'Learner licence application', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
      { label: 'Vehicle tax payment', url: 'https://vahan.parivahan.gov.in/vahanservice/' }
    ],
    guideVideos: [
      youtubeGuide('Punjab driving licence apply online'),
      youtubeGuide('Punjab learner licence tutorial')
    ]
  },
  {
    id: 'sikkim-services',
    name: 'Sikkim Service Portal',
    state: 'Sikkim',
    url: 'https://sikkimservices.gov.in/',
    description: 'Unified Sikkim portal delivering citizen certificates, grievances, and departmental services.',
    categories: ['Citizen Services', 'Grievances'],
    department: 'Department of Information Technology, Sikkim',
    keywords: ['sikkim', 'services', 'certificate', 'grievance']
  },
  {
    id: 'sikkim-state-portal',
    name: 'Sikkim State Portal',
    state: 'Sikkim',
    url: 'https://sikkim.gov.in/',
    description: 'Official Sikkim government site with department contacts, tourism info, and policy updates.',
    categories: ['Information', 'Citizen Services'],
    department: 'Government of Sikkim',
    keywords: ['sikkim government', 'departments', 'tourism info', 'policies']
  },
  {
    id: 'tripura-edistrict',
    name: 'Tripura eDistrict',
    state: 'Tripura',
    url: 'https://edistrict.tripura.gov.in/',
    description: 'Apply for certificates, licences, and citizen services across Tripura through the eDistrict portal.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Government of Tripura',
    keywords: ['tripura', 'edistrict', 'certificate', 'licence']
  },
  {
    id: 'tripura-state-portal',
    name: 'Tripura State Portal',
    state: 'Tripura',
    url: 'https://tripura.gov.in/',
    description: 'Tripura government portal centralising departments, announcements, and electronic services.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Tripura',
    keywords: ['tripura government', 'departments', 'announcements', 'state portal']
  },
  {
    id: 'uttarakhand-edistrict',
    name: 'Uttarakhand eDistrict',
    state: 'Uttarakhand',
    url: 'https://edistrict.uk.gov.in/',
    description: 'Online services for Uttarakhand residents including certificates, licences, and welfare schemes.',
    categories: ['Citizen Services', 'Welfare'],
    department: 'Government of Uttarakhand',
    keywords: ['uttarakhand', 'edistrict', 'certificate', 'welfare']
  },
  {
    id: 'uttarakhand-state-portal',
    name: 'Uttarakhand State Portal',
    state: 'Uttarakhand',
    url: 'https://uk.gov.in/',
    description: 'Official Uttarakhand government portal featuring departments, citizen charters, and policy updates.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Uttarakhand',
    keywords: ['uttarakhand government', 'departments', 'citizen charter', 'policies']
  },
  {
    id: 'andaman-edistrict',
    name: 'Andaman eDistrict',
    state: 'Andaman and Nicobar Islands',
    url: 'https://edistrict.andaman.gov.in/',
    description: 'Centralised citizen service portal for Andaman and Nicobar Islands.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Andaman & Nicobar Administration',
    keywords: ['andaman', 'nicobar', 'edistrict', 'certificate']
  },
  {
    id: 'andaman-state-portal',
    name: 'Andaman and Nicobar Administration Portal',
    state: 'Andaman and Nicobar Islands',
    url: 'https://www.andaman.gov.in/',
    description: 'Official Andaman & Nicobar Administration website with department links, tenders, and citizen updates.',
    categories: ['Citizen Services', 'Information'],
    department: 'Andaman & Nicobar Administration',
    keywords: ['andaman and nicobar', 'administration', 'departments', 'tenders']
  },
  {
    id: 'chandigarh-esampark',
    name: 'Chandigarh eSampark',
    state: 'Chandigarh',
    url: 'https://sampark.chd.nic.in/',
    description: 'eSampark centres and online services for residents of Chandigarh.',
    categories: ['Citizen Services', 'Utilities'],
    department: 'Department of Information Technology, Chandigarh',
    keywords: ['chandigarh', 'sampark', 'services', 'utilities']
  },
  {
    id: 'chandigarh-state-portal',
    name: 'Chandigarh Administration Portal',
    state: 'Chandigarh',
    url: 'https://www.chandigarh.gov.in/',
    description: 'Chandigarh Administration site covering departments, public notices, and resident resources.',
    categories: ['Citizen Services', 'Information'],
    department: 'Chandigarh Administration',
    keywords: ['chandigarh administration', 'departments', 'public notices', 'resident resources']
  },
  {
    id: 'dnhdd-services',
    name: 'DNHDD Online Services',
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    url: 'https://services.dnhddgov.in/',
    description: 'Integrated citizen service delivery for the union territory of Dadra & Nagar Haveli and Daman & Diu.',
    categories: ['Citizen Services', 'Utilities'],
    department: 'Administration of Dadra & Nagar Haveli and Daman & Diu',
    keywords: ['dnhdd', 'daman', 'dadra', 'services']
  },
  {
    id: 'dnhdd-state-portal',
    name: 'DNHDD Administration Portal',
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    url: 'https://dnh.gov.in/',
    description: 'Official union territory administration portal consolidating departments, circulars, and citizen assistance.',
    categories: ['Citizen Services', 'Information'],
    department: 'Administration of Dadra & Nagar Haveli and Daman & Diu',
    keywords: ['dnhdd administration', 'departments', 'circulars', 'citizen assistance'],
    relatedLinks: [
      { label: 'Daman & Diu information', url: 'https://www.daman.nic.in/' }
    ]
  },
  {
    id: 'jk-eservices',
    name: 'J&K eServices',
    state: 'Jammu and Kashmir',
    url: 'https://jk.gov.in/jkeservices',
    description: 'Single window access to applications, certificates, and departmental services in Jammu & Kashmir.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Information Technology Department, J&K',
    keywords: ['jammu kashmir', 'eservices', 'certificate', 'portal']
  },
  {
    id: 'jk-state-portal',
    name: 'Jammu & Kashmir State Portal',
    state: 'Jammu and Kashmir',
    url: 'https://www.jk.gov.in/',
    description: 'Official portal of Jammu & Kashmir offering department links, initiatives, and citizen assistance.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Jammu & Kashmir',
    keywords: ['jammu and kashmir government', 'departments', 'initiatives', 'citizen assistance']
  },
  {
    id: 'ladakh-portal',
    name: 'Ladakh State Portal',
    state: 'Ladakh',
    url: 'https://ladakh.nic.in/',
    description: 'Official portal for Ladakh administration hosting citizen services and public information.',
    categories: ['Citizen Services', 'Information'],
    department: 'Union Territory of Ladakh',
    keywords: ['ladakh', 'portal', 'services', 'information']
  },
  {
    id: 'lakshadweep-edistrict',
    name: 'Lakshadweep eDistrict',
    state: 'Lakshadweep',
    url: 'https://edistrict.lakshadweep.gov.in/',
    description: 'Citizen-centric service delivery portal for the Union Territory of Lakshadweep.',
    categories: ['Citizen Services', 'Certificates'],
    department: 'Lakshadweep Administration',
    keywords: ['lakshadweep', 'edistrict', 'citizen services']
  },
  {
    id: 'lakshadweep-state-portal',
    name: 'Lakshadweep Administration Portal',
    state: 'Lakshadweep',
    url: 'https://lakshadweep.gov.in/',
    description: 'Lakshadweep Administration website providing department links, notices, and island-specific updates.',
    categories: ['Citizen Services', 'Information'],
    department: 'Lakshadweep Administration',
    keywords: ['lakshadweep administration', 'departments', 'notices', 'island updates']
  },
  {
    id: 'puducherry-edistrict',
    name: 'Puducherry eDistrict',
    state: 'Puducherry',
    url: 'https://edistrict.py.gov.in/',
    description: 'Online services for certificates, licences, and welfare schemes in Puducherry.',
    categories: ['Citizen Services', 'Welfare'],
    department: 'Department of Revenue & Disaster Management, Puducherry',
    keywords: ['puducherry', 'edistrict', 'certificate', 'welfare']
  },
  {
    id: 'puducherry-state-portal',
    name: 'Puducherry State Portal',
    state: 'Puducherry',
    url: 'https://www.py.gov.in/',
    description: 'Government of Puducherry portal listing departments, schemes, and citizen-centric announcements.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Puducherry',
    keywords: ['puducherry government', 'departments', 'schemes', 'announcements']
  },
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
    id: 'ap-state-portal',
    name: 'Andhra Pradesh State Portal',
    state: 'Andhra Pradesh',
    url: 'https://www.ap.gov.in/',
    description: 'Official AP government portal presenting department dashboards, welfare schemes, and district updates.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Andhra Pradesh',
    keywords: ['andhra pradesh government', 'departments', 'dashboard', 'welfare schemes']
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
    keywords: ['driving', 'license', 'licence', 'vehicle', 'transport', 'learner licence'],
    relatedLinks: [
      { label: 'Learner licence slot booking', url: 'https://aptransport.in/LLR/llrMain.do' },
      { label: 'Driving licence test slots', url: 'https://aptransport.in/LicenseTestSlots.do' },
      { label: 'Check vehicle services', url: 'https://aptransport.in/MvcVehicleData.do' }
    ],
    guideVideos: [
      youtubeGuide('Andhra Pradesh driving licence apply online'),
      youtubeGuide('AP transport learner licence slot booking tutorial')
    ]
  },
  {
    id: 'ap-aarogyasri',
    name: 'YSR Aarogyasri Health Scheme',
    state: 'Andhra Pradesh',
    url: 'https://ysraarogyasri.ap.gov.in/',
    description: 'Cashless medical treatment coverage for low-income families under the flagship YSR Aarogyasri programme.',
    categories: ['Health', 'Insurance'],
    department: 'Dr. YSR Aarogyasri Health Care Trust',
    keywords: ['aarogyasri', 'health insurance', 'cashless treatment', 'ap health'],
    relatedLinks: [
      { label: 'Hospital network search', url: 'https://ysraarogyasri.ap.gov.in/web/guest/empanelled-hospitals' },
      { label: 'Check claim status', url: 'https://ysraarogyasri.ap.gov.in/web/guest/claim-status' },
      { label: 'Download scheme guidelines', url: 'https://ysraarogyasri.ap.gov.in/web/guest/scheme-details' }
    ],
    guideVideos: [
      youtubeGuide('YSR Aarogyasri online card download', 'YSR Aarogyasri card download tutorial'),
      youtubeGuide('YSR Aarogyasri hospital search walkthrough')
    ]
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
    id: 'ts-state-portal',
    name: 'Telangana State Portal',
    state: 'Telangana',
    url: 'https://www.telangana.gov.in/',
    description: 'Official Telangana government site providing department access, policies, and public dashboards.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Telangana',
    keywords: ['telangana government', 'departments', 'policies', 'dashboards']
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
    id: 'ts-transport',
    name: 'Telangana RTA Citizen Services',
    state: 'Telangana',
    url: 'https://transport.telangana.gov.in/',
    description: 'Road Transport Authority portal for driving licence applications, learner licence tests, and vehicle services in Telangana.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving license', 'licence', 'learner licence', 'vehicle registration', 'rta'],
    relatedLinks: [
      { label: 'Learner licence services', url: 'https://llrtransport.telangana.gov.in/tgllr/' },
      { label: 'Driving test slot booking', url: 'https://tgtransport.net/tgcfstonline/' },
      { label: 'Vehicle services (Vahan)', url: 'https://vahan.parivahan.gov.in/vahanservice/' }
    ],
    guideVideos: [
      youtubeGuide('Telangana driving licence apply online'),
      youtubeGuide('Telangana RTA slot booking tutorial')
    ]
  },
  {
    id: 'ts-wehub',
    name: 'WE Hub Women Entrepreneurship Platform',
    state: 'Telangana',
    url: 'https://www.wehub.telangana.gov.in/',
    description: 'Incubation, funding, and mentoring support for women-led startups and innovators in Telangana.',
    categories: ['Women Empowerment', 'Entrepreneurship'],
    department: 'Department of Information Technology, Electronics & Communications',
    keywords: ['we hub', 'women entrepreneurs', 'startup support', 'telangana innovation'],
    relatedLinks: [
      { label: 'Apply for incubation', url: 'https://www.wehub.telangana.gov.in/apply' },
      { label: 'Programs and initiatives', url: 'https://www.wehub.telangana.gov.in/programs' },
      { label: 'Mentor network', url: 'https://www.wehub.telangana.gov.in/mentors' }
    ],
    guideVideos: [
      youtubeGuide('WE Hub Telangana programs overview'),
      youtubeGuide('How to apply for WE Hub incubation')
    ]
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
    id: 'mh-state-portal',
    name: 'Maharashtra State Portal',
    state: 'Maharashtra',
    url: 'https://www.maharashtra.gov.in/',
    description: 'Government of Maharashtra homepage highlighting departments, initiatives, and district information.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Maharashtra',
    keywords: ['maharashtra government', 'departments', 'initiatives', 'district information']
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
    id: 'mh-transport',
    name: 'Maharashtra Transport Citizen Services',
    state: 'Maharashtra',
    url: 'https://transport.maharashtra.gov.in/1035/Home',
    description: 'Book learner and driving licence slots, manage permits, and access vehicle services in Maharashtra.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving license', 'learner licence', 'vehicle registration', 'maharashtra transport'],
    relatedLinks: [
      { label: 'Driving licence services', url: 'https://transport.maharashtra.gov.in/1035/Home' },
      { label: 'Learner licence slots', url: 'https://transport.maharashtra.gov.in/1035/Home' },
      { label: 'Vehicle tax payment', url: 'https://vahan.mahaonline.gov.in/' }
    ],
    guideVideos: [
      youtubeGuide('Maharashtra driving licence apply online'),
      youtubeGuide('Maharashtra learner licence slot booking')
    ]
  },
  {
    id: 'mh-mahalabharthi',
    name: 'Mahalabharthi Scheme Finder',
    state: 'Maharashtra',
    url: 'https://mahalabharthi.in/',
    description: 'Discover state welfare schemes for women, students, farmers, and labourers with personalised eligibility matching.',
    categories: ['Welfare', 'Women Empowerment'],
    department: 'Directorate of Information Technology, Maharashtra',
    keywords: ['mahalabharthi', 'scheme finder', 'women welfare', 'maharashtra schemes'],
    relatedLinks: [
      { label: 'Register and login', url: 'https://mahalabharthi.in/mahiti/login' },
      { label: 'Browse all schemes', url: 'https://mahalabharthi.in/mahiti/list-of-schemes' },
      { label: 'Scheme helpline', url: 'https://mahalabharthi.in/mahiti/contact-us' }
    ],
    guideVideos: [
      youtubeGuide('How to use Mahalabharthi portal'),
      youtubeGuide('Mahalabharthi scheme eligibility tutorial')
    ]
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
    id: 'ka-state-portal',
    name: 'Karnataka State Portal',
    state: 'Karnataka',
    url: 'https://www.karnataka.gov.in/',
    description: 'Government of Karnataka portal offering department directories, programmes, and quick citizen links.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Karnataka',
    keywords: ['karnataka government', 'departments', 'programmes', 'citizen links']
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
    keywords: ['driving', 'license', 'licence', 'vehicle', 'permit', 'learner licence'],
    relatedLinks: [
      { label: 'Apply for learner licence', url: 'https://transport.karnataka.gov.in/page/forms/learner-licence/en' },
      { label: 'Driving licence slot booking', url: 'https://transport.karnataka.gov.in/page/forms/driving-licence/en' },
      { label: 'Vehicle tax and fee payment', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/statevalidation/homepage.xhtml' }
    ],
    guideVideos: [
      youtubeGuide('Karnataka driving licence apply online'),
      youtubeGuide('Karnataka transport vehicle registration tutorial')
    ]
  },
  {
    id: 'ka-tourism',
    name: 'Karnataka Tourism Portal',
    state: 'Karnataka',
    url: 'https://www.karnatakatourism.org/',
    description: 'Plan trips, book state tourism packages, and explore heritage circuits across Karnataka.',
    categories: ['Tourism', 'Travel'],
    department: 'Department of Tourism, Karnataka',
    keywords: ['karnataka tourism', 'heritage', 'travel packages', 'bookings'],
    relatedLinks: [
      { label: 'Book a tour', url: 'https://www.karnatakatourism.org/tour-packages/' },
      { label: 'Hotel and stay options', url: 'https://www.karnatakatourism.org/accommodation/' },
      { label: 'Travel advisory', url: 'https://www.karnatakatourism.org/travel-advisory/' }
    ],
    guideVideos: [
      youtubeGuide('Top places to visit in Karnataka tourism'),
      youtubeGuide('Karnataka heritage tour planning')
    ]
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
    id: 'tn-state-portal',
    name: 'Tamil Nadu State Portal',
    state: 'Tamil Nadu',
    url: 'https://www.tn.gov.in/',
    description: 'Official Tamil Nadu government site consolidating departments, announcements, and scheme details.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Tamil Nadu',
    keywords: ['tamil nadu government', 'departments', 'announcements', 'schemes']
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
    id: 'tn-transport',
    name: 'Tamil Nadu Transport e-Services',
    state: 'Tamil Nadu',
    url: 'https://tnsta.gov.in/transport/',
    description: 'Apply for learner and driving licences, renewals, and vehicle permits through the Tamil Nadu transport portal.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving license', 'licence', 'vehicle registration', 'tnsta', 'transport'],
    relatedLinks: [
      { label: 'Learner licence application', url: 'https://tnsta.gov.in/transport/english/learner-licence' },
      { label: 'Driving licence services', url: 'https://tnsta.gov.in/transport/english/driving-licence' },
      { label: 'Permit services', url: 'https://tnsta.gov.in/transport/english/permits' }
    ],
    guideVideos: [
      youtubeGuide('Tamil Nadu driving licence online application'),
      youtubeGuide('TN transport learner licence tutorial')
    ]
  },
  {
    id: 'tn-skill',
    name: 'Tamil Nadu Skill Development Corporation',
    state: 'Tamil Nadu',
    url: 'https://www.tnskill.tn.gov.in/',
    description: 'Skill development programs, employment camps, and certification support for youth in Tamil Nadu.',
    categories: ['Employment', 'Skilling'],
    department: 'Tamil Nadu Skill Development Corporation',
    keywords: ['tnskill', 'skill training', 'placement camps', 'tamil nadu jobs'],
    relatedLinks: [
      { label: 'Register as candidate', url: 'https://www.tnskill.tn.gov.in/' },
      { label: 'Upcoming job fairs', url: 'https://www.tnskill.tn.gov.in/' },
      { label: 'Training partners', url: 'https://www.tnskill.tn.gov.in/' }
    ],
    guideVideos: [
      youtubeGuide('How to register on TNSkill portal'),
      youtubeGuide('Tamil Nadu skill training application process')
    ]
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
    id: 'up-state-portal',
    name: 'Uttar Pradesh State Portal',
    state: 'Uttar Pradesh',
    url: 'https://up.gov.in/',
    description: 'Government of Uttar Pradesh official site for departments, schemes, and public information.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Uttar Pradesh',
    keywords: ['uttar pradesh government', 'departments', 'schemes', 'public information']
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
    id: 'up-transport',
    name: 'UP Parivahan Citizen Services',
    state: 'Uttar Pradesh',
    url: 'https://uptransport.upsdc.gov.in/',
    description: 'Road Transport Department portal for Uttar Pradesh covering learner licences, driving licences, and vehicle permits.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving license', 'learner licence', 'vehicle registration', 'up transport'],
    relatedLinks: [
      { label: 'Learner licence application', url: 'https://uptransport.upsdc.gov.in/' },
      { label: 'Driving licence services', url: 'https://uptransport.upsdc.gov.in/' },
      { label: 'Vehicle related services', url: 'https://vahan.parivahan.gov.in/vahanservice/' }
    ],
    guideVideos: [
      youtubeGuide('Uttar Pradesh driving licence apply online'),
      youtubeGuide('UP transport learner licence tutorial')
    ]
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
    id: 'dl-state-portal',
    name: 'Delhi Government Portal',
    state: 'Delhi',
    url: 'https://delhi.gov.in/',
    description: 'Government of NCT of Delhi website aggregating departments, public notices, and emergency contacts.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of NCT of Delhi',
    keywords: ['delhi government', 'departments', 'public notices', 'emergency contacts']
  },
  {
    id: 'dl-transport',
    name: 'Delhi Transport Services',
    state: 'Delhi',
    url: 'https://transport.delhi.gov.in/',
    description: 'Online services for driving licences, vehicle registration, and permits in Delhi.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving', 'license', 'licence', 'vehicle', 'permit', 'transport'],
    relatedLinks: [
      { label: 'Driving licence services', url: 'https://transport.delhi.gov.in/' },
      { label: 'Learner licence test slots', url: 'https://dleap.delhi.gov.in/' },
      { label: 'Vehicle registration services', url: 'https://vahan.parivahan.gov.in/vahanservice/vahan/ui/statevalidation/homepage.xhtml' }
    ],
    guideVideos: [
      youtubeGuide('Delhi driving licence apply online'),
      youtubeGuide('How to book learner licence test in Delhi')
    ]
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
    id: 'gj-state-portal',
    name: 'Gujarat State Portal',
    state: 'Gujarat',
    url: 'https://gujaratindia.gov.in/',
    description: 'Official Government of Gujarat website with department overviews, initiatives, and publications.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Gujarat',
    keywords: ['gujarat government', 'departments', 'initiatives', 'publications']
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
    id: 'gj-transport',
    name: 'Gujarat Transport Services',
    state: 'Gujarat',
    url: 'https://cot.gujarat.gov.in/',
    description: 'Commissioner of Transport portal for Gujarat providing driving licence, permits, and vehicle-related services.',
    categories: ['Transport'],
    department: 'Commissioner of Transport, Gujarat',
    keywords: ['driving license', 'learner licence', 'vehicle registration', 'gujarat transport'],
    relatedLinks: [
      { label: 'Online RTO services', url: 'https://cot.gujarat.gov.in/' },
      { label: 'Driving licence appointment', url: 'https://rtogujarat.gov.in/driving-licence' },
      { label: 'Pay vehicle tax', url: 'https://vahan.parivahan.gov.in/vahanservice/' }
    ],
    guideVideos: [
      youtubeGuide('Gujarat driving licence online process'),
      youtubeGuide('Gujarat RTO appointment tutorial')
    ]
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
    id: 'kl-state-portal',
    name: 'Kerala State Portal',
    state: 'Kerala',
    url: 'https://kerala.gov.in/',
    description: 'Government of Kerala portal presenting departments, initiatives, and citizen handbooks.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Kerala',
    keywords: ['kerala government', 'departments', 'initiatives', 'citizen handbook']
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
    id: 'kl-transport',
    name: 'Kerala Motor Vehicles Department',
    state: 'Kerala',
    url: 'https://mvd.kerala.gov.in/',
    description: 'Kerala MVD portal for learner licence, driving licence, vehicle tax, and transport enforcement services.',
    categories: ['Transport'],
    department: 'Motor Vehicles Department',
    keywords: ['driving license', 'learner licence', 'vehicle tax', 'kerala mvd'],
    relatedLinks: [
      { label: 'Learner licence online', url: 'https://mvd.kerala.gov.in/' },
      { label: 'Driving licence services', url: 'https://mvd.kerala.gov.in/' },
      { label: 'Smart vehicle tax payment', url: 'https://tax.mvd.kerala.gov.in/' }
    ],
    guideVideos: [
      youtubeGuide('Kerala driving licence online application'),
      youtubeGuide('Kerala learner licence tutorial')
    ]
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
    id: 'wb-state-portal',
    name: 'West Bengal State Portal',
    state: 'West Bengal',
    url: 'https://wb.gov.in/',
    description: 'Government of West Bengal website highlighting departments, initiatives, and citizen communication.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of West Bengal',
    keywords: ['west bengal government', 'departments', 'initiatives', 'citizen communication']
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
    id: 'wb-transport',
    name: 'West Bengal Transport Services',
    state: 'West Bengal',
    url: 'https://transport.wb.gov.in/',
    description: 'Transport Department portal for West Bengal offering learner licence booking, driving licence renewals, and permits.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving license', 'learner licence', 'vehicle registration', 'west bengal transport'],
    relatedLinks: [
      { label: 'Learner licence services', url: 'https://transport.wb.gov.in/services/learner-licence/' },
      { label: 'Driving licence services', url: 'https://transport.wb.gov.in/services/driving-licence/' },
      { label: 'Permit and vehicle services', url: 'https://transport.wb.gov.in/services/permits/' }
    ],
    guideVideos: [
      youtubeGuide('West Bengal driving licence apply online'),
      youtubeGuide('West Bengal learner licence slot booking')
    ]
  },
  {
    id: 'wb-swasthya-sathi',
    name: 'Swasthya Sathi Health Insurance',
    state: 'West Bengal',
    url: 'https://swasthyasathi.gov.in/',
    description: 'Family health insurance scheme of West Bengal offering cashless treatment and smart card benefits.',
    categories: ['Health', 'Insurance'],
    department: 'Department of Health & Family Welfare',
    keywords: ['swasthya sathi', 'health insurance', 'smart card', 'cashless treatment'],
    relatedLinks: [
      { label: 'Check hospital list', url: 'https://swasthyasathi.gov.in/' },
      { label: 'Track application status', url: 'https://swasthyasathi.gov.in/' },
      { label: 'Download enrolment form', url: 'https://swasthyasathi.gov.in/' }
    ],
    guideVideos: [
      youtubeGuide('Swasthya Sathi online registration guide'),
      youtubeGuide('How to check Swasthya Sathi hospital list')
    ]
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
    id: 'rj-state-portal',
    name: 'Rajasthan State Portal',
    state: 'Rajasthan',
    url: 'https://www.rajasthan.gov.in/',
    description: 'Government of Rajasthan portal featuring departments, flagship programmes, and contact directories.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Rajasthan',
    keywords: ['rajasthan government', 'departments', 'flagship programmes', 'contact directory']
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
    id: 'rj-transport',
    name: 'Rajasthan Transport Services',
    state: 'Rajasthan',
    url: 'https://transport.rajasthan.gov.in/',
    description: 'Rajasthan Transport Department portal for learner licences, driving licence renewals, and permits.',
    categories: ['Transport'],
    department: 'Transport Department',
    keywords: ['driving license', 'learner licence', 'vehicle registration', 'rajasthan transport'],
    relatedLinks: [
      { label: 'Driving licence services', url: 'https://transport.rajasthan.gov.in/content/transport-portals/en/transport-department-home/driving-licence.html' },
      { label: 'Learner licence online test', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
      { label: 'Vehicle services (Vahan)', url: 'https://vahan.parivahan.gov.in/vahanservice/' }
    ],
    guideVideos: [
      youtubeGuide('Rajasthan driving licence apply online'),
      youtubeGuide('Rajasthan learner licence slot booking')
    ]
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
    id: 'mp-state-portal',
    name: 'Madhya Pradesh State Portal',
    state: 'Madhya Pradesh',
    url: 'https://www.mp.gov.in/',
    description: 'Official Madhya Pradesh government site consolidating departments, announcements, and district updates.',
    categories: ['Citizen Services', 'Information'],
    department: 'Government of Madhya Pradesh',
    keywords: ['madhya pradesh government', 'departments', 'announcements', 'district updates']
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

const centralGovernmentServices: GovernmentServiceSeed[] = [
  {
    id: 'india-national-portal',
    name: 'National Portal of India',
    state: 'India (Central)',
    url: 'https://www.india.gov.in/',
    description: 'Primary portal for Government of India providing encyclopedic access to departments, schemes, and citizen resources.',
    categories: ['Citizen Services', 'Information'],
    department: 'National Informatics Centre',
    keywords: ['india portal', 'departments directory', 'schemes overview', 'central government information'],
    relatedLinks: [
      { label: 'National Portal services directory', url: 'https://services.india.gov.in/' }
    ]
  },
  {
    id: 'india-service-directory',
    name: 'National Government Services Directory',
    state: 'India (Central)',
    url: 'https://services.india.gov.in/',
    description: 'Search central and state services by life event, department, and category with deep links to application portals.',
    categories: ['Citizen Services', 'Information'],
    department: 'National Informatics Centre',
    keywords: ['services india', 'service finder', 'government directory', 'apply online'],
    relatedLinks: [
      { label: 'Browse services by life event', url: 'https://services.india.gov.in/service/search?kw=&ln=en&se=Life+Event' },
      { label: 'Department wise services', url: 'https://services.india.gov.in/service/listing' }
    ]
  },
  {
    id: 'india-umang',
    name: 'UMANG Unified Services',
    state: 'India (Central)',
    url: 'https://web.umang.gov.in/landing',
    description: 'Single mobile app and web gateway for hundreds of central and state e-governance services.',
    categories: ['Citizen Services', 'Mobile Services'],
    department: 'Ministry of Electronics and Information Technology',
    keywords: ['umang', 'unified', 'services', 'central'],
    relatedLinks: [
      { label: 'UMANG mobile app (Google Play)', url: 'https://play.google.com/store/apps/details?id=in.gov.umang.negd.g2c' },
      { label: 'UMANG service catalogue', url: 'https://web.umang.gov.in/landing/services' }
    ],
    guideVideos: [
      youtubeGuide('UMANG app registration tutorial', 'UMANG registration walkthrough'),
      youtubeGuide('How to use UMANG government services')
    ]
  },
  {
    id: 'india-digilocker',
    name: 'DigiLocker Digital Documents',
    state: 'India (Central)',
    url: 'https://www.digilocker.gov.in/',
    description: 'Secure cloud storage of official documents and certificates powered by Government of India.',
    categories: ['Digital Services', 'Identity'],
    department: 'Ministry of Electronics and Information Technology',
    keywords: ['digilocker', 'documents', 'storage', 'identity'],
    relatedLinks: [
      { label: 'DigiLocker help centre', url: 'https://support.digitallocker.gov.in/' },
      { label: 'DigiLocker on UMANG', url: 'https://web.umang.gov.in/landing/service-internal/digilocker' }
    ]
  },
  {
    id: 'india-mygov',
    name: 'MyGov Citizen Engagement',
    state: 'India (Central)',
    url: 'https://www.mygov.in/',
    description: 'Participatory governance platform hosting discussions, tasks, and idea submissions for central initiatives.',
    categories: ['Citizen Services', 'Engagement'],
    department: 'Ministry of Electronics and Information Technology',
    keywords: ['mygov', 'citizen engagement', 'discussions', 'participatory governance'],
    relatedLinks: [
      { label: 'Latest tasks and campaigns', url: 'https://www.mygov.in/campaigns/' },
      { label: 'Discussion forums', url: 'https://www.mygov.in/groups/' }
    ]
  },
  {
    id: 'india-passport-seva',
    name: 'Passport Seva',
    state: 'India (Central)',
    url: 'https://www.passportindia.gov.in/',
    description: 'Apply for new passports, renewals, appointments, and track status with Passport Seva portal.',
    categories: ['Citizen Services', 'Travel'],
    department: 'Ministry of External Affairs',
    keywords: ['passport', 'seva', 'application', 'appointment'],
    relatedLinks: [
      { label: 'Passport Seva app (Android)', url: 'https://play.google.com/store/search?q=passport%20seva&c=apps' },
      { label: 'Passport Seva customer care', url: 'https://portal1.passportindia.gov.in/AppOnlineProject/online/secure/faqPassportSeva' }
    ]
  },
  {
    id: 'india-nsp',
    name: 'National Scholarship Portal',
    state: 'India (Central)',
    url: 'https://scholarships.gov.in/',
    description: 'Centralised scholarship discovery, eligibility, and application management for students.',
    categories: ['Education', 'Scholarships'],
    department: 'Ministry of Electronics and Information Technology',
    keywords: ['scholarship', 'nsp', 'education', 'student'],
    relatedLinks: [
      { label: 'NSP service desk', url: 'https://scholarships.gov.in/fresh/FAQ' }
    ]
  },
  {
    id: 'india-epfo',
    name: 'EPFO Member Services',
    state: 'India (Central)',
    url: 'https://www.epfindia.gov.in/',
    description: 'Provident fund balance, claims, KYC, and pension services for employees.',
    categories: ['Labour', 'Social Security'],
    department: 'Employees Provident Fund Organisation',
    keywords: ['epfo', 'pf', 'provident', 'pension'],
    relatedLinks: [
      { label: 'EPFO unified member portal', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/' },
      { label: 'EPFO Umang page', url: 'https://web.umang.gov.in/landing/service/epfo' }
    ]
  },
  {
    id: 'india-income-tax',
    name: 'Income Tax e-Filing',
    state: 'India (Central)',
    url: 'https://www.incometax.gov.in/',
    description: 'File income tax returns, manage PAN, track refunds, and view compliance notices online.',
    categories: ['Finance', 'Compliance'],
    department: 'Central Board of Direct Taxes',
    keywords: ['income tax', 'efiling', 'itr', 'pan', 'pan card', 'pan application'],
    relatedLinks: [
      { label: 'AIS income tax portal', url: 'https://insight.itr.gov.in/' },
      { label: 'PAN services (NSDL)', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' },
      { label: 'Apply PAN via UTIITSL', url: 'https://www.pan.utiitsl.com/' }
    ],
    guideVideos: [
      youtubeGuide('PAN card application online step by step', 'PAN card application walkthrough'),
      youtubeGuide('Income Tax e filing portal tutorial')
    ]
  },
  {
    id: 'india-parivahan',
    name: 'Parivahan Sewa Transport Services',
    state: 'India (Central)',
    url: 'https://parivahan.gov.in/parivahan/',
    description: 'National transport portal for driving licence applications, learner licence, vehicle registration, and permit services across India.',
    categories: ['Transport', 'Citizen Services'],
    department: 'Ministry of Road Transport and Highways',
    keywords: ['parivahan', 'driving license', 'learner license', 'vehicle registration', 'sarathi', 'transport services'],
    relatedLinks: [
      { label: 'Driving licence services (Sarathi)', url: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do' },
      { label: 'Vehicle registration (Vahan)', url: 'https://vahan.parivahan.gov.in/vahanservice/' },
      { label: 'Driving licence application status', url: 'https://parivahan.gov.in/parivahan/' }
    ],
    guideVideos: [
      youtubeGuide('Parivahan driving licence apply online', 'Driving licence application tutorial'),
      youtubeGuide('Parivahan vehicle registration guide')
    ]
  },
  {
    id: 'india-nvsp',
    name: 'National Voter Service Portal',
    state: 'India (Central)',
    url: 'https://www.nvsp.in/',
    description: 'Register as a new voter, update electoral details, and download digital voter information online.',
    categories: ['Identity', 'Elections'],
    department: 'Election Commission of India',
    keywords: ['nvsp', 'voter id', 'electoral roll', 'form 6'],
    relatedLinks: [
      { label: 'Track application status', url: 'https://www.nvsp.in/Forms/FormsTrackStatus' },
      { label: 'Download e-EPIC', url: 'https://www.nvsp.in/Account/Login' },
      { label: 'Know your polling booth', url: 'https://electoralsearch.eci.gov.in/' }
    ],
    guideVideos: [
      youtubeGuide('How to register voter ID on NVSP'),
      youtubeGuide('Download e-EPIC digital voter card')
    ]
  },
  {
    id: 'india-pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    state: 'India (Central)',
    url: 'https://pmkisan.gov.in/',
    description: 'Direct income support scheme for small and marginal farmers with beneficiary status tracking and registration.',
    categories: ['Agriculture', 'Welfare'],
    department: 'Ministry of Agriculture & Farmers Welfare',
    keywords: ['pm kisan', 'farmer income support', 'beneficiary status', 'kisan registration'],
    relatedLinks: [
      { label: 'Beneficiary status', url: 'https://pmkisan.gov.in/BeneficiaryStatus.aspx' },
      { label: 'New farmer registration', url: 'https://pmkisan.gov.in/RegistrationForm.aspx' },
      { label: 'eKYC update', url: 'https://pmkisan.gov.in/aadharekyc.aspx' }
    ],
    guideVideos: [
      youtubeGuide('PM Kisan online registration guide'),
      youtubeGuide('Check PM Kisan beneficiary status online')
    ]
  },
  {
    id: 'india-startup-india',
    name: 'Startup India Hub',
    state: 'India (Central)',
    url: 'https://www.startupindia.gov.in/',
    description: 'Access startup recognition, funding schemes, learning courses, and innovation challenges across India.',
    categories: ['Business', 'Entrepreneurship'],
    department: 'Department for Promotion of Industry and Internal Trade',
    keywords: ['startup india', 'dipp recognition', 'incubation', 'funding'],
    relatedLinks: [
      { label: 'Apply for startup recognition', url: 'https://www.startupindia.gov.in/' },
      { label: 'Explore government schemes', url: 'https://www.startupindia.gov.in/content/sih/en/government-schemes.html' },
      { label: 'Learning and courses', url: 'https://www.startupindia.gov.in/' }
    ],
    guideVideos: [
      youtubeGuide('Startup India registration tutorial'),
      youtubeGuide('How to find schemes on Startup India portal')
    ]
  },
  {
    id: 'india-ncs',
    name: 'National Career Service Portal',
    state: 'India (Central)',
    url: 'https://www.ncs.gov.in/',
    description: 'Job matching, career counselling, and skill training resources backed by the Ministry of Labour.',
    categories: ['Employment', 'Skilling'],
    department: 'Ministry of Labour & Employment',
    keywords: ['national career service', 'job search', 'career counselling', 'ncs portal'],
    relatedLinks: [
      { label: 'Job seeker registration', url: 'https://www.ncs.gov.in/job-seeker' },
      { label: 'Career guidance', url: 'https://www.ncs.gov.in/content-repository/' },
      { label: 'Skill training providers', url: 'https://www.ncs.gov.in/skill-provider' }
    ],
    guideVideos: [
      youtubeGuide('Register on National Career Service portal'),
      youtubeGuide('Use NCS portal for job search')
    ]
  },
  {
    id: 'india-eshram',
    name: 'e-Shram Portal',
    state: 'India (Central)',
    url: 'https://eshram.gov.in/',
    description: 'National database and social security services for unorganised workers with UAN card generation.',
    categories: ['Labour', 'Social Security'],
    department: 'Ministry of Labour & Employment',
    keywords: ['e-shram', 'uan card', 'unorganised workers', 'social security'],
    relatedLinks: [
      { label: 'Self registration', url: 'https://register.eshram.gov.in/' },
      { label: 'Update e-Shram profile', url: 'https://eshram.gov.in/' },
      { label: 'Locate CSC enrolment centre', url: 'https://eshram.gov.in/' }
    ],
    guideVideos: [
      youtubeGuide('e-Shram card self registration walkthrough'),
      youtubeGuide('Update e-Shram profile online')
    ]
  },
  {
    id: 'india-cowin',
    name: 'CoWIN Vaccination Platform',
    state: 'India (Central)',
    url: 'https://www.cowin.gov.in/',
    description: 'Register, book, and download vaccination certificates for COVID-19 and other campaigns.',
    categories: ['Health', 'Vaccination'],
    department: 'Ministry of Health and Family Welfare',
    keywords: ['cowin', 'vaccination', 'certificate', 'health'],
    relatedLinks: [
      { label: 'Aarogya Setu app', url: 'https://www.aarogyasetu.gov.in/' },
      { label: 'CoWIN help desk', url: 'https://www.cowin.gov.in/faq' }
    ]
  },
  {
    id: 'india-aadhaar',
    name: 'UIDAI Aadhaar Services',
    state: 'India (Central)',
    url: 'https://uidai.gov.in/',
    description: 'Update Aadhaar details, download Aadhaar, and access Aadhaar related services online.',
    categories: ['Identity', 'Citizen Services'],
    department: 'Unique Identification Authority of India',
    keywords: ['aadhaar', 'uidai', 'update', 'download'],
    relatedLinks: [
      { label: 'MyAadhaar portal', url: 'https://myaadhaar.uidai.gov.in/' },
      { label: 'Book Aadhaar appointment', url: 'https://appointments.uidai.gov.in/bookappointment.aspx' }
    ]
  },
  {
    id: 'india-gst',
    name: 'GST Services',
    state: 'India (Central)',
    url: 'https://www.gst.gov.in/',
    description: 'Goods and Services Tax registration, return filing, e-way bills, and compliance support.',
    categories: ['Finance', 'Compliance'],
    department: 'GST Network',
    keywords: ['gst', 'tax', 'returns', 'eway bill'],
    relatedLinks: [
      { label: 'GST helpdesk', url: 'https://selfservice.gstsystem.in/' },
      { label: 'GST e-invoice portal', url: 'https://einvoice.gst.gov.in/' }
    ]
  }
];

const withDefaultGuides = (services: GovernmentServiceSeed[]): GovernmentService[] =>
  services.map((service) => {
    const defaultGuides: ServiceLink[] = [
      youtubeGuide(`${service.name} application tutorial`)
    ];

    if (!service.state.toLowerCase().includes('india')) {
      defaultGuides.push(youtubeGuide(`${service.state} ${service.name} apply online`));
    }

    const guides = service.guideVideos && service.guideVideos.length > 0 ? service.guideVideos : defaultGuides;

    return {
      ...service,
      relatedLinks: service.relatedLinks ?? [],
      guideVideos: guides
    };
  });

export const governmentServices: GovernmentService[] = withDefaultGuides([
  ...baseGovernmentServices,
  ...centralGovernmentServices
]);

const serviceById = new Map(governmentServices.map((service) => [service.id, service] as const));

const serviceSearchIndex = governmentServices.map((service) => ({
  service,
  searchableText: normalise(
    [
      service.name,
      service.description,
      service.categories.join(' '),
      service.department ?? '',
      (service.keywords ?? []).join(' '),
      service.relatedLinks.map((link) => `${link.label} ${link.url}`).join(' '),
      service.guideVideos.map((video) => `${video.label} ${video.url}`).join(' ')
    ].join(' ')
  )
}));

export const getServiceById = (serviceId: string) => serviceById.get(serviceId) ?? null;

export const listPrimaryStatePortals = () => {
  const statesToServices = new Map<string, GovernmentService[]>();

  for (const service of governmentServices) {
    if (isCentralService(service)) {
      continue;
    }

    const servicesForState = statesToServices.get(service.state) ?? [];
    servicesForState.push(service);
    statesToServices.set(service.state, servicesForState);
  }

  return Array.from(statesToServices.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, services]) => pickPrimaryPortal(services));
};

export const states = Array.from(new Set(governmentServices.map((service) => service.state))).sort((left, right) =>
  left.localeCompare(right)
);

export interface CategoryStat {
  name: string;
  count: number;
}

const categoryCountMap = new Map<string, number>();
for (const service of governmentServices) {
  for (const label of service.categories) {
    const key = label.trim();
    if (!key) {
      continue;
    }

    categoryCountMap.set(key, (categoryCountMap.get(key) ?? 0) + 1);
  }
}

export const categories = Array.from(categoryCountMap.keys()).sort((left, right) => left.localeCompare(right));

export const categoryStats: CategoryStat[] = categories.map((name) => ({
  name,
  count: categoryCountMap.get(name) ?? 0
}));

export interface CategoryDirectoryEntry {
  name: string;
  central: GovernmentService[];
  states: Array<{
    state: string;
    services: GovernmentService[];
  }>;
}

type CategoryDirectoryAccumulator = {
  central: Map<string, GovernmentService>;
  states: Map<string, Map<string, GovernmentService>>;
};

const categoryDirectoryAccumulator = new Map<string, CategoryDirectoryAccumulator>();

for (const service of governmentServices) {
  for (const rawCategory of service.categories) {
    const category = rawCategory.trim();
    if (!category) {
      continue;
    }

    let bucket = categoryDirectoryAccumulator.get(category);
    if (!bucket) {
      bucket = {
        central: new Map<string, GovernmentService>(),
        states: new Map<string, Map<string, GovernmentService>>()
      };
      categoryDirectoryAccumulator.set(category, bucket);
    }

    const isCentral = isCentralService(service);

    if (isCentral) {
      bucket.central.set(service.id, service);
      continue;
    }

    const stateGroupKey = service.state;
    let stateMap = bucket.states.get(stateGroupKey);
    if (!stateMap) {
      stateMap = new Map<string, GovernmentService>();
      bucket.states.set(stateGroupKey, stateMap);
    }

    stateMap.set(service.id, service);
  }
}

export const categoryDirectory: CategoryDirectoryEntry[] = Array.from(categoryDirectoryAccumulator.entries())
  .map(([name, bucket]) => ({
    name,
    central: Array.from(bucket.central.values()).sort((left, right) => left.name.localeCompare(right.name)),
    states: Array.from(bucket.states.entries())
      .map(([state, services]) => ({
        state,
        services: Array.from(services.values()).sort((left, right) => left.name.localeCompare(right.name))
      }))
      .sort((left, right) => left.state.localeCompare(right.state))
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

export const searchServices = (state: string | null, query: string, category?: string | null) => {
  const normalisedState = state?.trim();
  const comparableState = normalisedState?.toLowerCase();
  const normalisedQuery = query ? normalise(query) : '';
  const normalisedCategory = category?.trim().toLowerCase() ?? '';
  const tokens = normalisedQuery
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean);

  return serviceSearchIndex
    .filter(({ service }) => {
      if (comparableState && service.state.toLowerCase() !== comparableState) {
        return false;
      }

      if (normalisedCategory) {
        const hasCategory = service.categories.some(
          (label) => label.toLowerCase() === normalisedCategory
        );

        if (!hasCategory) {
          return false;
        }
      }

      return true;
    })
    .filter(({ searchableText }) => {
      if (tokens.length === 0) {
        return true;
      }

      return tokens.every((token) => searchableText.includes(token));
    })
    .map(({ service }) => service)
    .sort((left, right) => left.name.localeCompare(right.name));
};
