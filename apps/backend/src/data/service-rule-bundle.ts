import { RuleBundle } from '@bureaufree/rules-engine';

const baseMetadata = {
  referenceUrl: 'https://www.digitalindia.gov.in/services',
  collectedAt: '2025-01-01T00:00:00.000Z',
  jurisdiction: 'India',
  reviewer: 'Digital Seva Programme Team'
};

type IntentKey =
  | 'general'
  | 'transport'
  | 'welfare'
  | 'scholarship'
  | 'ration'
  | 'land'
  | 'business'
  | 'agriculture'
  | 'utilities'
  | 'housing'
  | 'digital'
  | 'education';

type IntentFact =
  | 'isGeneralQuery'
  | 'needsTransport'
  | 'needsWelfare'
  | 'needsScholarship'
  | 'needsRation'
  | 'needsLandRecords'
  | 'needsBusiness'
  | 'needsAgriculture'
  | 'needsUtilityServices'
  | 'needsHousing'
  | 'needsDigitalSupport'
  | 'needsEducationSupport';

const intentFactMap: Record<IntentKey, IntentFact> = {
  general: 'isGeneralQuery',
  transport: 'needsTransport',
  welfare: 'needsWelfare',
  scholarship: 'needsScholarship',
  ration: 'needsRation',
  land: 'needsLandRecords',
  business: 'needsBusiness',
  agriculture: 'needsAgriculture',
  utilities: 'needsUtilityServices',
  housing: 'needsHousing',
  digital: 'needsDigitalSupport',
  education: 'needsEducationSupport'
};

interface IntentRuleDefinition {
  intent: IntentKey;
  serviceId: string;
  summary: string;
}

const stateIntentIndex: Record<string, IntentRuleDefinition[]> = {
  'Andhra Pradesh': [
    {
      intent: 'general',
      serviceId: 'ap-meeseva',
      summary: 'General citizen certificates and MeeSeva services in Andhra Pradesh.'
    },
    {
      intent: 'transport',
      serviceId: 'ap-transport',
      summary: 'Driving licence and vehicle services handled by AP Transport.'
    },
    {
      intent: 'welfare',
      serviceId: 'ap-rtgs',
      summary: 'Social security pension schemes through YSR Pension Kanuka.'
    }
  ],
  Telangana: [
    {
      intent: 'general',
      serviceId: 'ts-meeseva',
      summary: 'Certificates and citizen applications via Telangana MeeSeva.'
    },
    {
      intent: 'land',
      serviceId: 'ts-dharani',
      summary: 'Property mutation and land record services through Dharani.'
    },
    {
      intent: 'scholarship',
      serviceId: 'ts-epass',
      summary: 'Scholarships and fee reimbursement via Telangana ePass.'
    }
  ],
  Maharashtra: [
    {
      intent: 'general',
      serviceId: 'mh-aaple-sarkar',
      summary: 'Unified citizen access through the Aaple Sarkar portal.'
    },
    {
      intent: 'scholarship',
      serviceId: 'mh-scholarships',
      summary: 'Education scholarships and DBT benefits via MahaDBT.'
    },
    {
      intent: 'housing',
      serviceId: 'mh-rera',
      summary: 'Real estate registrations and grievance handling under MahaRERA.'
    }
  ],
  Karnataka: [
    {
      intent: 'general',
      serviceId: 'ka-seva-sindhu',
      summary: 'Citizen service gateway through Seva Sindhu.'
    },
    {
      intent: 'utilities',
      serviceId: 'ka-karnataka-one',
      summary: 'Utility bill payments and municipal services via Karnataka One.'
    },
    {
      intent: 'transport',
      serviceId: 'ka-rto',
      summary: 'Driving licence and vehicle services from Karnataka Transport.'
    }
  ],
  'Tamil Nadu': [
    {
      intent: 'general',
      serviceId: 'tn-esevai',
      summary: 'Certificates and licences delivered through TN eSevai.'
    },
    {
      intent: 'digital',
      serviceId: 'tn-tnsc',
      summary: 'Digital service navigation and status checks via TNeGA.'
    },
    {
      intent: 'ration',
      serviceId: 'tn-tnpds',
      summary: 'Smart ration card management using TNPDS.'
    }
  ],
  'Uttar Pradesh': [
    {
      intent: 'general',
      serviceId: 'up-edistrict',
      summary: 'District-level certificates and services in Uttar Pradesh.'
    },
    {
      intent: 'scholarship',
      serviceId: 'up-scholarship',
      summary: 'Scholarships and fee reimbursement via UP Scholarship portal.'
    },
    {
      intent: 'business',
      serviceId: 'up-nivesh-mitra',
      summary: 'Investor approvals and licences using Nivesh Mitra.'
    }
  ],
  Delhi: [
    {
      intent: 'general',
      serviceId: 'dl-edistrict',
      summary: 'Certificates, licences, and social schemes on Delhi e-District.'
    },
    {
      intent: 'transport',
      serviceId: 'dl-transport',
      summary: 'Driving licence and vehicle services offered by Delhi Transport.'
    },
    {
      intent: 'ration',
      serviceId: 'dl-epass',
      summary: 'Ration card benefits through Delhi e-Ration card portal.'
    }
  ],
  Gujarat: [
    {
      intent: 'general',
      serviceId: 'gj-digital',
      summary: 'Citizen certificates and scholarships via Digital Gujarat.'
    },
    {
      intent: 'land',
      serviceId: 'gj-garvi',
      summary: 'Property registration and land record services on Garvi Gujarat.'
    },
    {
      intent: 'agriculture',
      serviceId: 'gj-ikhedut',
      summary: 'Farmer subsidies and schemes through iKhedut.'
    }
  ],
  Kerala: [
    {
      intent: 'general',
      serviceId: 'kl-edistrict',
      summary: 'Certificates and revenue services via eDistrict Kerala.'
    },
    {
      intent: 'digital',
      serviceId: 'kl-akshaya',
      summary: 'Digital assistance and service centres using Akshaya.'
    },
    {
      intent: 'housing',
      serviceId: 'kl-housing',
      summary: 'Housing scheme updates through Kerala Housing Board.'
    }
  ],
  'West Bengal': [
    {
      intent: 'general',
      serviceId: 'wb-edistrict',
      summary: 'Certificates and welfare services on eDistrict West Bengal.'
    },
    {
      intent: 'land',
      serviceId: 'wb-banglarbhumi',
      summary: 'Land record lookup using Banglarbhumi portal.'
    },
    {
      intent: 'agriculture',
      serviceId: 'wb-krishak',
      summary: 'Farmer assistance under the Krishak Bandhu scheme.'
    }
  ],
  Rajasthan: [
    {
      intent: 'general',
      serviceId: 'rj-raj-sso',
      summary: 'Single sign-on for Rajasthan citizen services via RajSSO.'
    },
    {
      intent: 'land',
      serviceId: 'rj-apna-khata',
      summary: 'Land records and Jamabandi copies through Apna Khata.'
    },
    {
      intent: 'welfare',
      serviceId: 'rj-jan-soochna',
      summary: 'Scheme transparency and beneficiary data at Jan Soochna.'
    }
  ],
  'Madhya Pradesh': [
    {
      intent: 'general',
      serviceId: 'mp-edistrict',
      summary: 'Citizen certificates and revenue services through MP eDistrict.'
    },
    {
      intent: 'education',
      serviceId: 'mp-mponline',
      summary: 'Education, recruitment, and utility services on MPOnline.'
    },
    {
      intent: 'welfare',
      serviceId: 'mp-samagra',
      summary: 'Family ID and welfare benefit tracking via Samagra.'
    }
  ]
};

const stateToSlug = (state: string) => state.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const rules = Object.entries(stateIntentIndex).flatMap(([state, intentDefinitions]) => {
  return intentDefinitions.map((definition) => {
    const fact = intentFactMap[definition.intent];
    const ruleId = `service-${stateToSlug(state)}-${definition.intent}`;
    const priority = definition.intent === 'general' ? 1 : 10;

    return {
      id: ruleId,
      description: `Recommend ${definition.serviceId} when citizens in ${state} need ${definition.intent} services.`,
      priority,
      conditions: {
        all: [
          {
            fact: 'state',
            operator: 'equal',
            value: state
          },
          {
            fact,
            operator: 'equal',
            value: true
          }
        ]
      },
      event: {
        type: ruleId,
        params: {
          serviceId: definition.serviceId,
          intent: definition.intent,
          summary: definition.summary,
          priority
        }
      },
      metadata: baseMetadata,
      effectiveFrom: '2025-01-01T00:00:00.000Z'
    };
  });
});

export const serviceRuleBundle: RuleBundle = {
  serviceId: 'state-service-navigation',
  version: 1,
  publishedAt: '2025-01-01T00:00:00.000Z',
  rules
};
