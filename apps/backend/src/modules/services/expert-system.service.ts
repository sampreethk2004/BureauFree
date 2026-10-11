import { Injectable } from '@nestjs/common';
import { EngineResult, runEngine } from '@bureaufree/rules-engine';
import { states } from '../../data/government-services';
import { serviceRuleBundle } from '../../data/service-rule-bundle';

export interface Recommendation {
  serviceId: string;
  intent: string;
  summary: string;
  ruleId: string;
  priority: number;
  explanation: string;
  confidence: number;
  matchedSignals: string[];
}

type IntentKey = keyof typeof keywordSets;

const keywordSets = {
  general: ['certificate', 'birth', 'income', 'caste', 'portal', 'service', 'seva', 'meeseva'],
  transport: ['driving', 'licence', 'license', 'transport', 'vehicle', 'rto', 'permit', 'dl'],
  welfare: ['pension', 'welfare', 'kanuka', 'benefit', 'social', 'security'],
  scholarship: ['scholarship', 'student', 'tuition', 'fee', 'education', 'stipend'],
  ration: ['ration', 'pds', 'food', 'rice', 'card', 'fair', 'supply'],
  land: ['land', 'property', 'mutation', 'records', 'patta', 'khata', 'jamabandi', 'dharani'],
  business: ['business', 'industry', 'invest', 'investment', 'licence', 'license', 'approval', 'startup', 'msme'],
  agriculture: ['farmer', 'agriculture', 'crop', 'ikhedut', 'kisan', 'seed'],
  utilities: ['utility', 'bill', 'payment', 'electricity', 'water', 'tax', 'municipal', 'property'],
  housing: ['housing', 'rera', 'apartment', 'flat', 'construction'],
  digital: ['digital', 'centre', 'center', 'akshaya', 'support', 'helpdesk', 'facilitation'],
  education: ['education', 'admission', 'exam', 'recruitment', 'college', 'university']
} as const;

const applySynonymStandardisation = (value: string) =>
  value
    .replace(/\blicen[cs]es\b/g, 'licenses')
    .replace(/\blicen[cs]e\b/g, 'license');

const normalise = (value: string) =>
  applySynonymStandardisation(value.toLowerCase()).replace(/[^a-z0-9]+/g, ' ').trim();

const resolveState = (state: string) =>
  states.find((knownState) => knownState.toLowerCase() === state.toLowerCase()) ?? state;

const tokenise = (value: string) => {
  if (!value) {
    return [] as string[];
  }

  return normalise(value)
    .split(' ')
    .filter(Boolean);
};

const includesAny = (haystack: Set<string>, needles: readonly string[]) =>
  needles.some((needle) => haystack.has(needle));

const containsPhrase = (text: string, phrase: string) => text.includes(phrase);

const intentKeywordMap: Record<string, readonly string[]> = {
  general: keywordSets.general,
  transport: keywordSets.transport,
  welfare: keywordSets.welfare,
  scholarship: keywordSets.scholarship,
  ration: keywordSets.ration,
  land: keywordSets.land,
  business: keywordSets.business,
  agriculture: keywordSets.agriculture,
  utilities: keywordSets.utilities,
  housing: keywordSets.housing,
  digital: keywordSets.digital,
  education: keywordSets.education
};

const matchedSignalsForIntent = (intent: string, query: string) => {
  const keywords = intentKeywordMap[intent as IntentKey] ?? [];
  const normalisedQuery = normalise(query);

  return Array.from(
    new Set(
      keywords
        .filter((keyword) => normalisedQuery.includes(normalise(keyword)))
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    )
  ).slice(0, 5);
};

const confidenceScore = (priority: number, matchedSignalsCount: number, queryTokenCount: number, intent: string) => {
  let score = 0.48;

  score += Math.min(priority, 10) * 0.028;
  score += Math.min(matchedSignalsCount, 4) * 0.07;

  if (queryTokenCount > 0) {
    score += 0.06;
  } else {
    score -= 0.06;
  }

  if (intent === 'general' && queryTokenCount > 0) {
    score -= 0.04;
  }

  const bounded = Math.min(0.99, Math.max(0.35, score));
  return Number(bounded.toFixed(2));
};

const buildFacts = (state: string, query: string) => {
  const tokens = tokenise(query);
  const tokenSet = new Set(tokens);
  const normalisedQuery = normalise(query);

  const needsTransport = includesAny(tokenSet, keywordSets.transport);
  const needsWelfare = includesAny(tokenSet, keywordSets.welfare);
  const needsScholarship = includesAny(tokenSet, keywordSets.scholarship);
  const needsRation = includesAny(tokenSet, keywordSets.ration);
  const needsLandRecords = includesAny(tokenSet, keywordSets.land);
  const needsBusiness = includesAny(tokenSet, keywordSets.business);
  const needsAgriculture = includesAny(tokenSet, keywordSets.agriculture);
  const needsUtilityServices = includesAny(tokenSet, keywordSets.utilities);
  const needsHousing = includesAny(tokenSet, keywordSets.housing);
  const needsDigitalSupport = includesAny(tokenSet, keywordSets.digital);
  const needsEducationSupport = includesAny(tokenSet, keywordSets.education);

  const generalKeywordsMatched = includesAny(tokenSet, keywordSets.general);
  const queryIsEmpty = tokens.length === 0;
  const mentionsCertificatePhrase = containsPhrase(normalisedQuery, 'income certificate') || containsPhrase(normalisedQuery, 'birth certificate');

  const isGeneralQuery = queryIsEmpty || generalKeywordsMatched || mentionsCertificatePhrase;

  return {
    state,
    isGeneralQuery,
    needsTransport,
    needsWelfare,
    needsScholarship,
    needsRation,
    needsLandRecords,
    needsBusiness,
    needsAgriculture,
    needsUtilityServices,
    needsHousing,
    needsDigitalSupport,
    needsEducationSupport
  } satisfies Record<string, unknown>;
};

type EngineEvent = EngineResult['events'][number];

const mapEventsToRecommendations = (
  events: EngineResult['events'],
  explanationByRuleId: Map<string, string>,
  query: string,
  queryTokenCount: number
): Array<Recommendation | null> => {
  return events.map((event: EngineEvent) => {
    const params = (event.params ?? {}) as Record<string, unknown>;
    const serviceId = typeof params.serviceId === 'string' ? params.serviceId : '';
    const intent = typeof params.intent === 'string' ? params.intent : '';
    const summary = typeof params.summary === 'string' ? params.summary : '';
    const priority = typeof params.priority === 'number' ? params.priority : Number(params.priority ?? 0);
    const ruleId = typeof event.type === 'string' ? event.type : String(event.type ?? '');

    if (!serviceId || !intent) {
      return null;
    }

    const matchedSignals = matchedSignalsForIntent(intent, query);
    const confidence = confidenceScore(priority, matchedSignals.length, queryTokenCount, intent);

    return {
      serviceId,
      intent,
      summary,
      priority,
      ruleId,
      explanation: explanationByRuleId.get(ruleId) ?? summary,
      confidence,
      matchedSignals
    } satisfies Recommendation;
  });
};

@Injectable()
export class ExpertSystemService {
  async evaluate(state: string | null, query: string): Promise<Recommendation[]> {
    const trimmedState = state?.trim();
    if (!trimmedState) {
      return [];
    }

    const queryTokenCount = tokenise(query).length;

    const facts = buildFacts(resolveState(trimmedState), query);
    const { events, explanations } = await runEngine(serviceRuleBundle, facts);

    const explanationByRuleId = new Map<string, string>();
    for (const explanation of explanations) {
      explanationByRuleId.set(explanation.ruleId, explanation.description);
    }

    const recommendations = mapEventsToRecommendations(events, explanationByRuleId, query, queryTokenCount)
      .filter((recommendation: Recommendation | null): recommendation is Recommendation => recommendation !== null)
      .sort((left: Recommendation, right: Recommendation) => right.priority - left.priority);

    const uniqueByService = new Map<string, Recommendation>();
    for (const recommendation of recommendations) {
      if (!uniqueByService.has(recommendation.serviceId)) {
        uniqueByService.set(recommendation.serviceId, recommendation);
      }
    }

    return Array.from(uniqueByService.values());
  }
}
