import { Injectable } from '@nestjs/common';
import {
  GovernmentService,
  getServiceById,
  categoryStats,
  categoryDirectory,
  governmentServices,
  searchServices,
  states,
  listPrimaryStatePortals
} from '../../data/government-services';

export interface LiveCatalogueSnapshot {
  generatedAt: string;
  uptimeSeconds: number;
  summary: {
    totalServices: number;
    totalStates: number;
    totalCategories: number;
  };
  topStates: Array<{ state: string; count: number }>;
  topCategories: Array<{ name: string; count: number }>;
}

export interface EquivalentServiceSuggestion {
  service: GovernmentService;
  origin: 'central' | 'other-state';
  reason: string;
  score: number;
}

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const tokenise = (value: string) =>
  normalise(value)
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean);

const isCentralService = (service: GovernmentService) => service.state.toLowerCase().includes('india (central)');

const hasCategoryMatch = (service: GovernmentService, category: string) =>
  service.categories.some((label) => label.toLowerCase() === category.toLowerCase());

const buildSearchableText = (service: GovernmentService) =>
  normalise(
    [
      service.name,
      service.description,
      service.categories.join(' '),
      service.department ?? '',
      (service.keywords ?? []).join(' ')
    ].join(' ')
  );

@Injectable()
export class GovernmentServicesService {
  listStates() {
    return states;
  }

  listAll(): GovernmentService[] {
    return governmentServices;
  }

  findById(serviceId: string) {
    return getServiceById(serviceId);
  }

  listCategories() {
    return categoryStats;
  }

  listStatePortals() {
    return listPrimaryStatePortals();
  }

  getLiveSnapshot(): LiveCatalogueSnapshot {
    const stateServiceCount = new Map<string, number>();

    for (const service of governmentServices) {
      if (service.state.toLowerCase().includes('india (central)')) {
        continue;
      }

      stateServiceCount.set(service.state, (stateServiceCount.get(service.state) ?? 0) + 1);
    }

    const topStates = Array.from(stateServiceCount.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((left, right) => right.count - left.count || left.state.localeCompare(right.state))
      .slice(0, 6);

    const topCategories = [...categoryStats]
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
      .slice(0, 6);

    return {
      generatedAt: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      summary: this.getCatalogueSummary(),
      topStates,
      topCategories
    };
  }

  getCatalogueSummary() {
    return {
      totalServices: governmentServices.length,
      totalStates: states.length,
      totalCategories: categoryStats.length
    };
  }

  listCategoryDirectory() {
    return categoryDirectory;
  }

  listStateCatalogue(stateName: string): {
    state: string;
    totalServices: number;
    categories: Array<{ name: string; count: number }>;
    services: GovernmentService[];
  } {
    const requested = stateName.trim();
    if (!requested) {
      return {
        state: '',
        totalServices: 0,
        categories: [],
        services: []
      };
    }

    const matchedState = states.find((state) => state.toLowerCase() === requested.toLowerCase()) ?? requested;
    const servicesForState = governmentServices
      .filter((service) => service.state.toLowerCase() === matchedState.toLowerCase())
      .sort((left, right) => left.name.localeCompare(right.name));

    const categoryTally = new Map<string, number>();
    for (const service of servicesForState) {
      for (const category of service.categories) {
        const key = category.trim();
        if (!key) {
          continue;
        }

        categoryTally.set(key, (categoryTally.get(key) ?? 0) + 1);
      }
    }

    const categories = Array.from(categoryTally.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => left.name.localeCompare(right.name));

    return {
      state: matchedState,
      totalServices: servicesForState.length,
      categories,
      services: servicesForState
    };
  }

  search(state: string | null, query: string, category: string | null): GovernmentService[] {
    return searchServices(state, query, category);
  }

  findEquivalentServices(params: {
    state: string | null;
    query: string;
    category: string | null;
    existingServiceIds: string[];
    limit?: number;
  }): EquivalentServiceSuggestion[] {
    const selectedState = params.state?.trim();
    if (!selectedState) {
      return [];
    }

    const selectedStateLower = selectedState.toLowerCase();
    const selectedCategory = params.category?.trim() ?? '';
    const tokens = tokenise(params.query ?? '');
    const existingIds = new Set(params.existingServiceIds);
    const limit = params.limit ?? 6;

    const scored = governmentServices
      .filter((service) => {
        if (existingIds.has(service.id)) {
          return false;
        }

        if (service.state.toLowerCase() === selectedStateLower) {
          return false;
        }

        return true;
      })
      .map((service) => {
        const searchableText = buildSearchableText(service);
        const matchedTokens = tokens.filter((token) => searchableText.includes(token));
        const tokenCoverage = tokens.length > 0 ? matchedTokens.length / tokens.length : 0;
        const categoryMatch = selectedCategory ? hasCategoryMatch(service, selectedCategory) : false;
        const centralBoost = isCentralService(service) ? 0.22 : 0;
        const guideBoost = service.guideVideos.length > 0 ? 0.04 : 0;
        const supportBoost = service.relatedLinks.length > 0 ? 0.03 : 0;
        const categoryBoost = categoryMatch ? 0.3 : 0;
        const score = Number((tokenCoverage + centralBoost + guideBoost + supportBoost + categoryBoost).toFixed(3));

        if (tokens.length > 0 && matchedTokens.length === 0 && !categoryMatch) {
          return null;
        }

        const reasonParts: string[] = [];
        if (matchedTokens.length > 0) {
          reasonParts.push(`Keyword overlap: ${matchedTokens.slice(0, 3).join(', ')}`);
        }

        if (categoryMatch) {
          reasonParts.push(`Category match: ${selectedCategory}`);
        }

        if (isCentralService(service)) {
          reasonParts.push('Available nationally via central platform');
        } else {
          reasonParts.push(`Similar service available in ${service.state}`);
        }

        return {
          service,
          origin: isCentralService(service) ? 'central' : 'other-state',
          reason: reasonParts.join(' | '),
          score
        } satisfies EquivalentServiceSuggestion;
      })
      .filter((entry): entry is EquivalentServiceSuggestion => entry !== null)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (left.origin !== right.origin) {
          return left.origin === 'central' ? -1 : 1;
        }

        return left.service.name.localeCompare(right.service.name);
      });

    return scored.slice(0, limit);
  }
}
