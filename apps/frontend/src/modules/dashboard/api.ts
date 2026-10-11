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
  keywords?: string[];
  relatedLinks: ServiceLink[];
  guideVideos: ServiceLink[];
}

export interface Recommendation {
  service: GovernmentService;
  intent: string;
  summary: string;
  explanation: string;
  confidence: number;
  matchedSignals: string[];
}

export interface EquivalentServiceSuggestion {
  service: GovernmentService;
  origin: 'central' | 'other-state';
  reason: string;
  score: number;
}

export interface SearchResponse {
  query: {
    state: string;
    text: string;
    category: string;
  };
  counts: {
    results: number;
    recommendations: number;
    equivalents: number;
  };
  recommendations: Recommendation[];
  equivalents: EquivalentServiceSuggestion[];
  results: GovernmentService[];
}

export interface StatesResponse {
  states: string[];
}

export interface CategoriesResponse {
  categories: Array<{
    name: string;
    count: number;
  }>;
}

export interface StatePortalsResponse {
  portals: GovernmentService[];
}

export interface CatalogueSummary {
  totalServices: number;
  totalStates: number;
  totalCategories: number;
}

export interface StateCatalogueResponse {
  state: string;
  totalServices: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
  services: GovernmentService[];
}

export interface CategoryDirectoryEntry {
  name: string;
  central: GovernmentService[];
  states: Array<{
    state: string;
    services: GovernmentService[];
  }>;
}

export interface CategoryDirectoryResponse {
  categories: CategoryDirectoryEntry[];
}

export interface LiveCatalogueSnapshot {
  generatedAt: string;
  uptimeSeconds: number;
  summary: CatalogueSummary;
  topStates: Array<{
    state: string;
    count: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
}

type LiveStreamHandlers = {
  onOpen?: () => void;
  onMessage: (snapshot: LiveCatalogueSnapshot) => void;
  onError?: (error: unknown) => void;
};

const backendBase = (import.meta.env?.VITE_BACKEND_URL ?? '').trim();
const CACHE_PREFIX = 'bureaufree-cache-v1';
const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_RETRIES = 2;

type CachedValue<T> = {
  savedAt: number;
  data: T;
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const joinRelativeBase = (base: string, path: string) => {
  if (!base) {
    return path;
  }

  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;

  if (!trimmedBase) {
    return normalisedPath;
  }

  if (normalisedPath.startsWith(trimmedBase)) {
    return normalisedPath;
  }

  const baseSuffixMatch = trimmedBase.match(/^https?:\/\/[^/]+(.*)$/i);
  const baseSuffix = baseSuffixMatch?.[1] ?? '';
  if (baseSuffix && normalisedPath.startsWith(baseSuffix)) {
    return `${trimmedBase}${normalisedPath.slice(baseSuffix.length)}`;
  }

  return `${trimmedBase}${normalisedPath}`;
};

const withBaseUrl = (path: string) => {
  if (!path) {
    return path;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  if (!backendBase) {
    return normalisedPath;
  }

  const base = backendBase.endsWith('/') ? backendBase : `${backendBase}/`;

  if (isAbsoluteUrl(base)) {
    try {
      // Use URL to avoid duplicating path segments when the base already contains them.
      return new URL(normalisedPath, base).toString();
    } catch (error: unknown) {
      console.warn('Failed to construct backend URL, falling back to string join.', error);
      return joinRelativeBase(base, normalisedPath);
    }
  }

  return joinRelativeBase(base, normalisedPath);
};

const parseJson = async <T>(response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readCached = <T>(cacheKey: string, maxAgeMs: number): T | null => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}:${cacheKey}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedValue<T>;
    if (!parsed || typeof parsed.savedAt !== 'number') {
      return null;
    }

    if (Date.now() - parsed.savedAt > maxAgeMs) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const writeCached = <T>(cacheKey: string, data: T) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    const payload: CachedValue<T> = {
      savedAt: Date.now(),
      data
    };

    window.localStorage.setItem(`${CACHE_PREFIX}:${cacheKey}`, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or serialization errors and continue with in-memory data.
  }
};

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const url = withBaseUrl(path);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      });

      return await parseJson<T>(response);
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error('Request failed.');

      if (attempt === MAX_RETRIES) {
        break;
      }

      await wait(250 * (attempt + 1));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error('Request failed.');
};

const fetchWithFallbackCache = async <T>(cacheKey: string, request: () => Promise<T>): Promise<T> => {
  try {
    const payload = await request();
    writeCached(cacheKey, payload);
    return payload;
  } catch (error: unknown) {
    const cached = readCached<T>(cacheKey, CACHE_TTL_MS * 12);
    if (cached) {
      return cached;
    }

    throw error;
  }
};

export const fetchStates = async (): Promise<StatesResponse> => {
  return fetchWithFallbackCache('states', () => fetchJson<StatesResponse>('/api/services/states'));
};

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  return fetchWithFallbackCache('categories', () => fetchJson<CategoriesResponse>('/api/services/categories'));
};

export const fetchStatePortals = async (): Promise<StatePortalsResponse> => {
  return fetchWithFallbackCache('state-portals', () => fetchJson<StatePortalsResponse>('/api/services/state-portals'));
};

export const fetchCatalogueSummary = async (): Promise<CatalogueSummary> => {
  return fetchWithFallbackCache('summary', () => fetchJson<CatalogueSummary>('/api/services/summary'));
};

export const fetchLiveSnapshot = async (): Promise<LiveCatalogueSnapshot> => {
  return fetchWithFallbackCache('live-snapshot', () => fetchJson<LiveCatalogueSnapshot>('/api/services/live-snapshot'));
};

export const fetchStateCatalogue = async (state: string): Promise<StateCatalogueResponse> => {
  const params = new URLSearchParams();
  if (state.trim()) {
    params.set('state', state.trim());
  }

  const query = params.toString();
  const cacheSuffix = state.trim().toLowerCase().replace(/\s+/g, '-') || 'all';
  return fetchWithFallbackCache(
    `state-catalogue:${cacheSuffix}`,
    () => fetchJson<StateCatalogueResponse>(query ? `/api/services/state-catalogue?${query}` : '/api/services/state-catalogue')
  );
};

export const fetchCategoryDirectory = async (): Promise<CategoryDirectoryResponse> => {
  return fetchWithFallbackCache('category-directory', () => fetchJson<CategoryDirectoryResponse>('/api/services/category-directory'));
};

export const createLiveCatalogueStream = ({ onOpen, onMessage, onError }: LiveStreamHandlers) => {
  const source = new EventSource(withBaseUrl('/api/services/live'));

  source.onopen = () => {
    onOpen?.();
  };

  source.onmessage = (event) => {
    try {
      const snapshot = JSON.parse(event.data) as LiveCatalogueSnapshot;
      onMessage(snapshot);
    } catch (error: unknown) {
      onError?.(error);
    }
  };

  source.onerror = (event) => {
    onError?.(event);
  };

  return () => {
    source.close();
  };
};

export const searchServices = async (payload: {
  state?: string;
  query?: string;
  category?: string;
}): Promise<SearchResponse> => {
  return fetchJson<SearchResponse>('/api/services/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
};
