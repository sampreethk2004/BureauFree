import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ServiceCard } from './components/ServiceCard';
import {
  createLiveCatalogueStream,
  fetchCategories,
  fetchStates,
  fetchStatePortals,
  fetchCatalogueSummary,
  fetchLiveSnapshot,
  fetchStateCatalogue,
  fetchCategoryDirectory,
  searchServices,
  GovernmentService,
  SearchResponse,
  CatalogueSummary,
  LiveCatalogueSnapshot,
  StateCatalogueResponse,
  CategoryDirectoryEntry
} from './api';

const quickSearches = [
  'income certificate',
  'driving licence renewal',
  'scholarship status',
  'ration card update',
  'land records',
  'pension application'
];

const heroHighlights: Array<{ icon: string; text: string }> = [
  { icon: '🧭', text: 'Browse curated portals for every Indian state and union territory.' },
  { icon: '⚡', text: 'Get explainable expert-system recommendations with confidence scores.' },
  { icon: '🎥', text: 'Open help videos alongside official application links.' }
];

const centralQuickLinks: Array<{ label: string; description: string; href: string }> = [
  {
    label: 'UMANG unified services',
    description: 'One-stop access to 20+ central ministries and citizen services.',
    href: 'https://web.umang.gov.in/landing'
  },
  {
    label: 'DigiLocker documents',
    description: 'Securely store Aadhaar, driving licence, and education certificates.',
    href: 'https://www.digilocker.gov.in/'
  },
  {
    label: 'Passport Seva',
    description: 'Book appointments, renew passports, and track application status.',
    href: 'https://www.passportindia.gov.in/'
  }
];

const navLinks: Array<{ label: string; href: string }> = [
  { label: 'Search', href: '#search' },
  { label: 'Portals', href: '#state-portals' },
  { label: 'States', href: '#state-directory' },
  { label: 'Categories', href: '#category-directory' },
  { label: 'Insights', href: '#insights' }
];

const helpfulTips: Array<{ icon: string; title: string; description: string }> = [
  {
    icon: '🔍',
    title: 'Search with intent',
    description: 'Combine what you need ("driving licence") with the document or state to refine results.'
  },
  {
    icon: '🎯',
    title: 'Filter by state or category',
    description: 'Switch states or category chips to only see portals relevant to your need.'
  },
  {
    icon: '🎥',
    title: 'Learn step-by-step',
    description: 'Each service includes YouTube explainers so you can prepare before visiting the portal.'
  }
];

const formatUptime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

export const DashboardPage = () => {
  const [knownStates, setKnownStates] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [statesError, setStatesError] = useState('');

  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['results']>([]);
  const [recommendations, setRecommendations] = useState<SearchResponse['recommendations']>([]);
  const [equivalents, setEquivalents] = useState<SearchResponse['equivalents']>([]);
  const [searchCounts, setSearchCounts] = useState<SearchResponse['counts'] | null>(null);
  const [catalogueSummary, setCatalogueSummary] = useState<CatalogueSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [liveSnapshot, setLiveSnapshot] = useState<LiveCatalogueSnapshot | null>(null);
  const [liveMode, setLiveMode] = useState<'connecting' | 'live' | 'polling'>('connecting');
  const [liveError, setLiveError] = useState('');
  const [statePortals, setStatePortals] = useState<GovernmentService[]>([]);
  const [statePortalsLoading, setStatePortalsLoading] = useState(true);
  const [statePortalsError, setStatePortalsError] = useState('');
  const [stateCatalogue, setStateCatalogue] = useState<StateCatalogueResponse | null>(null);
  const [stateCatalogueLoading, setStateCatalogueLoading] = useState(false);
  const [stateCatalogueError, setStateCatalogueError] = useState('');
  const [showStateDirectory, setShowStateDirectory] = useState(false);
  const [activeCatalogueCategory, setActiveCatalogueCategory] = useState('');
  const [categoryDirectory, setCategoryDirectory] = useState<CategoryDirectoryEntry[]>([]);
  const [categoryDirectoryLoading, setCategoryDirectoryLoading] = useState(true);
  const [categoryDirectoryError, setCategoryDirectoryError] = useState('');
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState('');
  const [selectedDirectoryState, setSelectedDirectoryState] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [availableCategories, setAvailableCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoadingStates(true);
        const response = await fetchStates();
        setKnownStates(response.states);
        setStatesError('');
      } catch (error) {
        console.error('Failed to load states', error);
        setStatesError('Could not load states. Refresh to try again.');
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetchCategories();
        setAvailableCategories(response.categories);
        setCategoriesError('');
      } catch (error) {
        console.error('Failed to load categories', error);
        setCategoriesError('Categories are unavailable right now. Search still works without them.');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetchCatalogueSummary();
        setCatalogueSummary(response);
        setSummaryError('');
      } catch (error) {
        console.error('Failed to load catalogue summary', error);
        setSummaryError('Catalogue insights are unavailable right now.');
      }
    };

    loadSummary();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let disposeStream = () => {};

    const startRealtime = async () => {
      try {
        const snapshot = await fetchLiveSnapshot();
        if (cancelled) {
          return;
        }

        setLiveSnapshot(snapshot);
        setCatalogueSummary(snapshot.summary);
        setSummaryError('');
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load initial live snapshot', error);
          setLiveError('Live snapshot unavailable. Falling back to resilient mode.');
        }
      }

      if (cancelled) {
        return;
      }

      disposeStream = createLiveCatalogueStream({
        onOpen: () => {
          if (cancelled) {
            return;
          }

          setLiveMode('live');
          setLiveError('');
        },
        onMessage: (snapshot) => {
          if (cancelled) {
            return;
          }

          setLiveSnapshot(snapshot);
          setCatalogueSummary(snapshot.summary);
        },
        onError: (error) => {
          if (cancelled) {
            return;
          }

          console.error('Live stream error', error);
          setLiveMode('polling');
          setLiveError('Realtime stream reconnecting. Continuing with fallback updates.');
        }
      });
    };

    void startRealtime();

    return () => {
      cancelled = true;
      disposeStream();
    };
  }, []);

  useEffect(() => {
    if (liveMode === 'live') {
      return;
    }

    let cancelled = false;

    const refreshSnapshot = async () => {
      try {
        const snapshot = await fetchLiveSnapshot();
        if (cancelled) {
          return;
        }

        setLiveSnapshot(snapshot);
        setCatalogueSummary(snapshot.summary);
      } catch (error) {
        if (!cancelled) {
          console.error('Fallback snapshot refresh failed', error);
        }
      }
    };

    void refreshSnapshot();
    const pollId = window.setInterval(() => {
      void refreshSnapshot();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
    };
  }, [liveMode]);

  useEffect(() => {
    const loadStatePortals = async () => {
      try {
        setStatePortalsLoading(true);
        const response = await fetchStatePortals();
        setStatePortals(response.portals);
        setStatePortalsError('');
      } catch (error) {
        console.error('Failed to load primary state portals', error);
        setStatePortals([]);
        setStatePortalsError('Primary state portals are unavailable right now.');
      } finally {
        setStatePortalsLoading(false);
      }
    };

    loadStatePortals();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCategoryDirectory = async () => {
      try {
        setCategoryDirectoryLoading(true);
        const response = await fetchCategoryDirectory();
        if (cancelled) {
          return;
        }

        setCategoryDirectory(response.categories);
        setCategoryDirectoryError('');
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load category directory', error);
        setCategoryDirectory([]);
        setCategoryDirectoryError('Category directory is unavailable right now.');
      } finally {
        if (!cancelled) {
          setCategoryDirectoryLoading(false);
        }
      }
    };

    loadCategoryDirectory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setShowStateDirectory(false);
    setActiveCatalogueCategory('');

    if (!selectedState) {
      setStateCatalogue(null);
      setStateCatalogueError('');
      setStateCatalogueLoading(false);
      return;
    }

    let cancelled = false;

    const loadStateCatalogue = async () => {
      try {
        setStateCatalogueLoading(true);
        const response = await fetchStateCatalogue(selectedState);
        if (cancelled) {
          return;
        }

        setStateCatalogue(response);
        setStateCatalogueError('');
        setActiveCatalogueCategory('');
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load state catalogue', error);
        setStateCatalogue(null);
        setStateCatalogueError('State directory is unavailable right now.');
      } finally {
        if (!cancelled) {
          setStateCatalogueLoading(false);
        }
      }
    };

    loadStateCatalogue();

    return () => {
      cancelled = true;
    };
  }, [selectedState]);

  const runSearch = async (stateValue: string, queryValue: string, categoryValue = selectedCategory) => {
    try {
      setIsSearching(true);
      setSearchError('');
      setShowStateDirectory(false);
      setActiveCatalogueCategory('');
      const response = await searchServices({
        state: stateValue || undefined,
        query: queryValue || undefined,
        category: categoryValue || undefined
      });

      setResults(response.results);
      setRecommendations(response.recommendations);
      setEquivalents(response.equivalents);
      setSearchCounts(response.counts);
      setSelectedCategory(response.query.category);
      setSelectedDirectoryCategory(response.query.category || '');
      setSelectedDirectoryState(response.query.state || '');
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed', error);
      setSearchError('Could not fetch services right now. Please retry in a moment.');
      setResults([]);
      setRecommendations([]);
      setEquivalents([]);
      setSearchCounts(null);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runSearch(selectedState, query, selectedCategory);
  };

  const onSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    void runSearch(selectedState, suggestion, selectedCategory);
  };

  const onStateChange = (nextState: string) => {
    setSelectedState(nextState);
    void runSearch(nextState, query, selectedCategory);
  };

  const onStateShortcut = (stateName: string) => {
    setSelectedState(stateName);
    void runSearch(stateName, query, selectedCategory);
  };

  const onClearState = () => {
    setSelectedState('');
    if (hasSearched) {
      void runSearch('', query, selectedCategory);
    }
  };

  const onCategoryToggle = (categoryName: string) => {
    const nextCategory = categoryName === selectedCategory ? '' : categoryName;
    setSelectedCategory(nextCategory);
    if (hasSearched || query || selectedState || nextCategory) {
      void runSearch(selectedState, query, nextCategory);
    }
  };

  const showLoading = isSearching;
  const recommendedIds = new Set(recommendations.map((item) => item.service.id));
  const remainingResults = results.filter((service) => !recommendedIds.has(service.id));
  const hasRecommendations = recommendations.length > 0;
  const hasRemainingResults = remainingResults.length > 0;
  const hasEquivalentSuggestions = equivalents.length > 0;
  const hasAnyResults = hasRecommendations || hasRemainingResults || hasEquivalentSuggestions;
  const showInitialGuidance = !hasSearched && !showLoading;
  const selectedStateLabel = selectedState || 'All states';
  const popularStates = useMemo(() => knownStates.slice(0, 6), [knownStates]);
  const moreStatesCount = Math.max(0, knownStates.length - popularStates.length);
  const recommendedCount = searchCounts?.recommendations ?? recommendations.length;
  const otherCount = searchCounts?.results ?? remainingResults.length;
  const equivalentCount = searchCounts?.equivalents ?? equivalents.length;
  const highlightedCategories = useMemo(() => {
    if (availableCategories.length <= 8) {
      return availableCategories;
    }

    const initial = availableCategories.slice(0, 8);
    const engagementIndex = availableCategories.findIndex(
      (category) => category.name.toLowerCase() === 'engagement'
    );

    if (engagementIndex === -1) {
      return initial;
    }

    const alreadyHighlighted = initial.some(
      (category) => category.name.toLowerCase() === 'engagement'
    );

    if (alreadyHighlighted) {
      return initial;
    }

    const engagementCategory = availableCategories[engagementIndex];
    const adjusted = initial.slice(0, Math.max(0, initial.length - 1));
    return [...adjusted, engagementCategory];
  }, [availableCategories]);
  const catalogueStats: Array<{ label: string; value: number | null | undefined }> = [
    { label: 'Verified portals', value: catalogueSummary?.totalServices },
    { label: 'States & UTs', value: catalogueSummary?.totalStates },
    { label: 'Categories covered', value: catalogueSummary?.totalCategories }
  ];
  const liveLastUpdateLabel = liveSnapshot
    ? new Date(liveSnapshot.generatedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : '--:--:--';
  const liveModeLabel =
    liveMode === 'live' ? 'Live stream active' : liveMode === 'polling' ? 'Fallback polling mode' : 'Connecting';
  const expertTopStates = liveSnapshot?.topStates ?? [];
  const expertTopCategories = liveSnapshot?.topCategories ?? [];
  const stateCatalogueCategories = stateCatalogue?.categories ?? [];
  const filteredStateDirectoryServices = useMemo(() => {
    if (!stateCatalogue) {
      return [];
    }

    if (!activeCatalogueCategory) {
      return stateCatalogue.services;
    }

    const lowered = activeCatalogueCategory.toLowerCase();
    return stateCatalogue.services.filter((service) =>
      service.categories.some((category) => category.toLowerCase() === lowered)
    );
  }, [stateCatalogue, activeCatalogueCategory]);
  const showStateDirectoryToggle = Boolean(selectedState && stateCatalogue && stateCatalogue.totalServices > 0);
  const stateDirectoryEmpty = Boolean(stateCatalogue && stateCatalogue.totalServices === 0);
  const directoryCategoryOptions = useMemo(() => {
    return [...categoryDirectory]
      .map((entry) => entry.name)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a.localeCompare(b));
  }, [categoryDirectory]);
  const directoryStateOptions = useMemo(() => {
    const states = new Set<string>();
    categoryDirectory.forEach((entry) => {
      entry.states.forEach((stateEntry) => {
        if (stateEntry.services.length > 0) {
          states.add(stateEntry.state);
        }
      });
    });
    return Array.from(states).sort((a, b) => a.localeCompare(b));
  }, [categoryDirectory]);
  const filteredCategoryDirectory = useMemo(() => {
    const categoriesToConsider = selectedDirectoryCategory
      ? categoryDirectory.filter((entry) => entry.name === selectedDirectoryCategory)
      : categoryDirectory;

    return categoriesToConsider
      .map((entry) => {
        const filteredStates = selectedDirectoryState
          ? entry.states.filter((stateEntry) => stateEntry.state === selectedDirectoryState)
          : entry.states;

        return {
          ...entry,
          states: filteredStates.filter((stateEntry) => stateEntry.services.length > 0)
        };
      })
      .filter((entry) => entry.central.length > 0 || entry.states.length > 0);
  }, [categoryDirectory, selectedDirectoryCategory, selectedDirectoryState]);
  const hasDirectoryContent = filteredCategoryDirectory.length > 0;
  const categoryDirectoryMetrics = useMemo(() => {
    const summary = {
      totalCategories: categoryDirectory.length,
      centralServices: 0,
      stateServices: 0,
      statesCovered: 0
    };
    const seenStates = new Set<string>();

    categoryDirectory.forEach((entry) => {
      summary.centralServices += entry.central.length;
      entry.states.forEach((stateEntry) => {
        if (stateEntry.services.length > 0) {
          seenStates.add(stateEntry.state);
          summary.stateServices += stateEntry.services.length;
        }
      });
    });

    summary.statesCovered = seenStates.size;
    return summary;
  }, [categoryDirectory]);

  const scrollToSearch = () => {
    const searchSection = document.getElementById('search');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (!hasSearched || showLoading) {
      return;
    }

    const target = resultsRef.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasSearched, showLoading, results.length, recommendations.length]);

  return (
    <div className="site-shell">
      <header className="site-shell__header">
        <div className="site-shell__header-inner">
          <a className="site-shell__brand" href="/">
            <span className="site-shell__brand-mark" aria-hidden="true">
              BF
            </span>
            <span>BureauFree</span>
          </a>
          <nav className="site-shell__nav" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.label} className="site-shell__nav-link" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="site-shell__header-actions">
            <a className="site-shell__action-link" href="#category-directory">
              View catalogue
            </a>
            <button type="button" className="site-shell__action-button" onClick={scrollToSearch}>
              Get started
            </button>
          </div>
        </div>
      </header>
      <main className="site-shell__main">
        <div className="dashboard">
          <section className="dashboard-hero" id="search" aria-label="Discover official portals">
            <div className="dashboard-hero__content">
              <p className="dashboard-hero__kicker">Digital government guide</p>
              <h1 className="dashboard-hero__title">Skip queues. Reach the right portal in seconds.</h1>
              <p className="dashboard-hero__lede">
                Search verified Indian government websites, explore central shortcuts, and watch quick how-to videos
                before you apply.
              </p>
              <div className={`dashboard-hero__live-strip dashboard-hero__live-strip--${liveMode}`} aria-live="polite">
                <span className="dashboard-hero__live-dot" aria-hidden="true" />
                <strong>{liveModeLabel}</strong>
                <span>Last sync: {liveLastUpdateLabel}</span>
                <span>Server uptime: {formatUptime(liveSnapshot?.uptimeSeconds ?? 0)}</span>
              </div>
              {liveError ? <p className="dashboard-hero__live-error">{liveError}</p> : null}
              <ul className="dashboard-hero__highlights">
                {heroHighlights.map((highlight) => (
                  <li key={highlight.text} className="dashboard-hero__highlight">
                    <span className="dashboard-hero__highlight-icon" aria-hidden="true">
                      {highlight.icon}
                    </span>
                    <span>{highlight.text}</span>
                  </li>
                ))}
              </ul>
              <div className="dashboard-hero__metrics" aria-live="polite">
                {summaryError ? (
                  <span className="dashboard-hero__metric-error" role="alert">
                    {summaryError}
                  </span>
                ) : (
                  catalogueStats.map((stat) => (
                    <div key={stat.label} className="dashboard-hero__metric">
                      <span className="dashboard-hero__metric-value">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : '…'}
                      </span>
                      <span className="dashboard-hero__metric-label">{stat.label}</span>
                    </div>
                  ))
                )}
              </div>
              {liveSnapshot ? (
                <div className="dashboard-hero__insights-grid" aria-label="Expert system insights">
                  <article className="dashboard-hero__insight-card">
                    <h4>Realtime top states</h4>
                    <div className="dashboard-hero__insight-tags">
                      {expertTopStates.map((entry) => (
                        <span key={entry.state} className="dashboard-hero__insight-tag">
                          {entry.state} ({entry.count})
                        </span>
                      ))}
                    </div>
                  </article>
                  <article className="dashboard-hero__insight-card">
                    <h4>Expert intent hotspots</h4>
                    <div className="dashboard-hero__insight-tags">
                      {expertTopCategories.map((entry) => (
                        <span key={entry.name} className="dashboard-hero__insight-tag">
                          {entry.name} ({entry.count})
                        </span>
                      ))}
                    </div>
                  </article>
                </div>
              ) : null}
              <div className="dashboard-hero__shortcut-card" aria-label="Central government shortcuts">
                <div className="dashboard-hero__shortcut-header">
                  <h3>Central government quick links</h3>
                  <p>Jump straight to all-India services without searching.</p>
                </div>
                <div className="dashboard-hero__shortcut-list">
                  {centralQuickLinks.map((link) => (
                    <a
                      key={link.href}
                      className="dashboard-hero__shortcut"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <strong>{link.label}</strong>
                        <span>{link.description}</span>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="dashboard-hero__panel">
              <div className="dashboard-search">
                <div className="dashboard-search__intro">
                  <h2>Find the right portal</h2>
                  <p>Search by service, department, or keyword to uncover verified government links.</p>
                </div>
                <form className="dashboard-search__form" onSubmit={onSubmit}>
                  <div className="dashboard-search__control">
                    <label className="dashboard-search__label" htmlFor="state">
                      State or union territory
                    </label>
                    <div className="dashboard-search__state-row">
                      <select
                        id="state"
                        value={selectedState}
                        onChange={(event) => onStateChange(event.target.value)}
                        className="dashboard-search__select"
                        disabled={loadingStates}
                      >
                        <option value="">All states and central services</option>
                        {knownStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {selectedState ? (
                        <button type="button" className="dashboard-search__clear" onClick={onClearState}>
                          Clear
                        </button>
                      ) : null}
                    </div>
                    {statesError ? (
                      <p className="dashboard-search__error" role="alert">
                        {statesError}
                      </p>
                    ) : null}
                  </div>

                  <div className="dashboard-search__control">
                    <label className="dashboard-search__label" htmlFor="service-query">
                      What do you want to apply for?
                    </label>
                    <input
                      id="service-query"
                      className="dashboard-search__input"
                      placeholder='Try "income certificate", "scholarship", or "pension"'
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    <p className="dashboard-search__hint">
                      We search descriptions, departments, and keywords on official portals.
                    </p>
                  </div>

                  <button type="submit" className="dashboard-search__submit" disabled={showLoading}>
                    {showLoading ? 'Searching...' : 'Show official portals'}
                  </button>
                </form>

                <div className="dashboard-search__shortcuts" aria-live="polite">
                  <div className="dashboard-search__chips" role="list" aria-label="Popular searches">
                    {quickSearches.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        className="dashboard-search__chip"
                        onClick={() => onSuggestionClick(suggestion)}
                        disabled={showLoading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  {popularStates.length ? (
                    <div className="dashboard-search__states" role="group" aria-label="Popular states">
                      <span className="dashboard-search__states-label">Popular states</span>
                      <div className="dashboard-search__state-pills">
                        {popularStates.map((state) => (
                          <button
                            key={state}
                            type="button"
                            className="dashboard-search__state-pill"
                            onClick={() => onStateShortcut(state)}
                            disabled={showLoading}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                      {moreStatesCount > 0 ? (
                        <span className="dashboard-search__states-count">+{moreStatesCount} more</span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="dashboard-search__meta-card">
                    <strong>Tip:</strong> Combine your need with the document you expect. For example, “startup
                    approval” or “smart ration card”.
                  </div>
                  <div className="dashboard-search__categories" role="group" aria-label="Popular categories">
                    <span className="dashboard-search__categories-title">Browse by category</span>
                    {categoriesError ? (
                      <p className="dashboard-search__category-error" role="alert">
                        {categoriesError}
                      </p>
                    ) : (
                      <div className="dashboard-search__category-chips">
                        {loadingCategories && highlightedCategories.length === 0 ? (
                          <span className="dashboard-search__category-loading">Loading categories…</span>
                        ) : null}
                        {highlightedCategories.map((category) => (
                          <button
                            key={category.name}
                            type="button"
                            className={[
                              'dashboard-search__category-chip',
                              selectedCategory === category.name ? 'dashboard-search__category-chip--active' : ''
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => onCategoryToggle(category.name)}
                            disabled={showLoading}
                          >
                            {category.name}
                            <span className="dashboard-search__category-count" aria-hidden="true">
                              {category.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="state-portals" className="dashboard__state-directory" aria-live="polite">
            <div className="dashboard__state-directory-header">
              <div>
                <h2>Primary portal for every state and union territory</h2>
                <p>
                  {statePortalsLoading
                    ? 'Loading a curated portal for each jurisdiction...'
                    : statePortalsError
                    ? statePortalsError
                    : `${statePortals.length.toLocaleString()} jurisdictions covered with one primary portal each.`}
                </p>
              </div>
            </div>
            {statePortalsError ? (
              <p className="dashboard__state-directory-error" role="alert">
                {statePortalsError}
              </p>
            ) : null}
            {statePortalsLoading ? (
              <div className="dashboard__state-directory-loading" role="status">
                <span className="dashboard__spinner" aria-hidden="true" />
                <p>Finding the best portal for each state and union territory...</p>
              </div>
            ) : statePortals.length ? (
              <div className="dashboard__state-directory-grid" role="list">
                {statePortals.map((service) => (
                  <ServiceCard
                    key={`primary-state-portal-${service.id}`}
                    service={service}
                    badge="Primary portal"
                    note="One verified portal surfaced for this state or union territory."
                  />
                ))}
              </div>
            ) : null}
          </section>

          <section id="state-directory" className="dashboard__state-directory" aria-live="polite">
            {selectedState ? (
              <>
                <div className="dashboard__state-directory-header">
                  <div>
                    <h2>Browse all {stateCatalogue?.state ?? selectedState} portals</h2>
                    <p>
                      {stateCatalogueLoading
                        ? 'Loading full directory...'
                        : stateDirectoryEmpty
                        ? 'No additional portals are listed for this state yet.'
                        : `${stateCatalogue?.totalServices ?? 0} verified portals grouped by category.`}
                    </p>
                  </div>
                  <div className="dashboard__state-directory-actions">
                    <button
                      type="button"
                      className="dashboard__state-directory-toggle"
                      onClick={() => setShowStateDirectory((previous) => !previous)}
                      disabled={!showStateDirectoryToggle || stateCatalogueLoading}
                    >
                      {showStateDirectory ? 'Hide state directory' : 'Show all state portals'}
                    </button>
                    {showStateDirectory ? (
                      <button
                        type="button"
                        className="dashboard__state-directory-reset"
                        onClick={() => setActiveCatalogueCategory('')}
                        disabled={!activeCatalogueCategory}
                      >
                        Reset category filter
                      </button>
                    ) : null}
                  </div>
                </div>
                {stateCatalogueError ? (
                  <p className="dashboard__state-directory-error" role="alert">
                    {stateCatalogueError}
                  </p>
                ) : null}
                {showStateDirectory && !stateCatalogueLoading ? (
                  stateCatalogue && stateCatalogue.totalServices > 0 ? (
                    <>
                      <div className="dashboard__state-directory-categories" role="group" aria-label="State categories">
                        {stateCatalogueCategories.map((category) => (
                          <button
                            key={category.name}
                            type="button"
                            className={`dashboard__state-directory-pill${
                              activeCatalogueCategory === category.name ? ' dashboard__state-directory-pill--active' : ''
                            }`}
                            onClick={() =>
                              setActiveCatalogueCategory((current) =>
                                current === category.name ? '' : category.name
                              )
                            }
                          >
                            {category.name}
                            <span className="dashboard__state-directory-count" aria-hidden="true">
                              {category.count}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="dashboard__state-directory-grid" role="list">
                        {filteredStateDirectoryServices.map((service) => (
                          <ServiceCard key={`state-${service.id}`} service={service} />
                        ))}
                      </div>
                    </>
                  ) : null
                ) : null}
                {showStateDirectory && stateCatalogueLoading ? (
                  <div className="dashboard__state-directory-loading" role="status">
                    <span className="dashboard__spinner" aria-hidden="true" />
                    <p>Fetching portals for {stateCatalogue?.state ?? selectedState}...</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="dashboard__state-directory-placeholder">
                <h2>Select a state to browse official portals</h2>
                <p>Choose a state or union territory above to unlock its verified portal directory.</p>
              </div>
            )}
          </section>

          <section
            id="category-directory"
            className="dashboard__category-directory"
            aria-label="Explore by category"
            aria-live="polite"
          >
            <div className="dashboard__category-directory-header">
              <div>
                <h2>Explore central and state portals by category</h2>
                <p>
                  Filter by citizen need and optionally pick a state to reveal every verified portal, with central services
                  surfaced first.
                </p>
              </div>
              {!categoryDirectoryLoading && !categoryDirectoryError ? (
                <div className="dashboard__category-directory-metrics">
                  <div className="dashboard__category-directory-metric">
                    <span className="dashboard__category-directory-value">
                      {categoryDirectoryMetrics.totalCategories.toLocaleString()}
                    </span>
                    <span className="dashboard__category-directory-label">Categories</span>
                  </div>
                  <div className="dashboard__category-directory-metric">
                    <span className="dashboard__category-directory-value">
                      {categoryDirectoryMetrics.centralServices.toLocaleString()}
                    </span>
                    <span className="dashboard__category-directory-label">Central portals</span>
                  </div>
                  <div className="dashboard__category-directory-metric">
                    <span className="dashboard__category-directory-value">
                      {categoryDirectoryMetrics.stateServices.toLocaleString()}
                    </span>
                    <span className="dashboard__category-directory-label">State portals</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="dashboard__category-directory-filters">
              <label className="dashboard__category-directory-filter">
                <span>Category</span>
                <select
                  value={selectedDirectoryCategory}
                  onChange={(event) => setSelectedDirectoryCategory(event.target.value)}
                  disabled={categoryDirectoryLoading}
                >
                  <option value="">All categories</option>
                  {directoryCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="dashboard__category-directory-filter">
                <span>State focus</span>
                <select
                  value={selectedDirectoryState}
                  onChange={(event) => setSelectedDirectoryState(event.target.value)}
                  disabled={categoryDirectoryLoading}
                >
                  <option value="">All states &amp; central</option>
                  {directoryStateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              {(selectedDirectoryCategory || selectedDirectoryState) && !categoryDirectoryLoading ? (
                <button
                  type="button"
                  className="dashboard__category-directory-reset"
                  onClick={() => {
                    setSelectedDirectoryCategory('');
                    setSelectedDirectoryState('');
                  }}
                >
                  Reset filters
                </button>
              ) : null}
            </div>

            {categoryDirectoryError ? (
              <p className="dashboard__category-directory-error" role="alert">
                {categoryDirectoryError}
              </p>
            ) : null}

            {categoryDirectoryLoading ? (
              <div className="dashboard__category-directory-loading" role="status">
                <span className="dashboard__spinner" aria-hidden="true" />
                <p>Loading category directory…</p>
              </div>
            ) : hasDirectoryContent ? (
              <div className="dashboard__category-directory-list" role="list">
                {filteredCategoryDirectory.map((categoryEntry) => {
                  const stateServiceCount = categoryEntry.states.reduce(
                    (total, item) => total + item.services.length,
                    0
                  );

                  return (
                    <article key={categoryEntry.name} className="dashboard__category-directory-entry" role="listitem">
                      <header className="dashboard__category-directory-entry-header">
                        <h3>{categoryEntry.name}</h3>
                        <p>
                          {categoryEntry.central.length.toLocaleString()} central portal
                          {categoryEntry.central.length === 1 ? '' : 's'} · {stateServiceCount.toLocaleString()} state portal
                          {stateServiceCount === 1 ? '' : 's'}
                        </p>
                      </header>
                      {categoryEntry.central.length ? (
                        <div className="dashboard__category-directory-group" aria-label="Central portals">
                          <h4>Central services</h4>
                          <div className="dashboard__category-directory-grid" role="list">
                            {categoryEntry.central.map((service) => (
                              <ServiceCard key={`category-central-${categoryEntry.name}-${service.id}`} service={service} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {categoryEntry.states.map((stateBlock) => (
                        <div
                          key={`${categoryEntry.name}-${stateBlock.state}`}
                          className="dashboard__category-directory-group"
                          aria-label={`Portals for ${stateBlock.state}`}
                        >
                          <h4>{stateBlock.state}</h4>
                          <div className="dashboard__category-directory-grid" role="list">
                            {stateBlock.services.map((service) => (
                              <ServiceCard
                                key={`category-state-${categoryEntry.name}-${stateBlock.state}-${service.id}`}
                                service={service}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard__category-directory-empty">
                <h3>No portals match your filters yet</h3>
                <p>Try resetting filters or choosing another category to see available services.</p>
              </div>
            )}
          </section>

          <section id="insights" className="dashboard__tips" aria-label="Helpful guidance">
            {helpfulTips.map((tip) => (
              <article key={tip.title} className="dashboard__tip-card">
                <span className="dashboard__tip-icon" aria-hidden="true">
                  {tip.icon}
                </span>
                <div>
                  <h3>{tip.title}</h3>
                  <p>{tip.description}</p>
                </div>
              </article>
            ))}
          </section>

          <section ref={resultsRef} className="dashboard__results" aria-live="polite">
            {searchError ? (
              <div className="dashboard__status dashboard__status--error" role="alert">
                {searchError}
              </div>
            ) : null}

            {showLoading ? (
              <div className="dashboard__loading" role="status">
                <span className="dashboard__spinner" aria-hidden="true" />
                <p>
                  Gathering official portals for {selectedStateLabel}
                  {selectedCategory ? ` in ${selectedCategory}` : ' across all categories'}...
                </p>
              </div>
            ) : hasAnyResults ? (
              <div className="dashboard__results-collection">
                {hasRecommendations ? (
                  <div className="dashboard__results-group">
                    <div className="dashboard__group-header">
                      <h3>Smart matches</h3>
                      <p>
                        {recommendedCount} curated recommendation{recommendedCount === 1 ? '' : 's'} for {selectedStateLabel}
                        {selectedCategory ? ` in ${selectedCategory}` : ' across all categories'}.
                      </p>
                    </div>
                    <div className="dashboard__results-grid" role="list">
                      {recommendations.map((recommendation) => (
                        <ServiceCard
                          key={`rec-${recommendation.service.id}`}
                          service={recommendation.service}
                          emphasis
                          badge={`${recommendation.intent} • ${Math.round(recommendation.confidence * 100)}%`}
                          note={
                            recommendation.matchedSignals.length
                              ? `${recommendation.explanation} | Signals: ${recommendation.matchedSignals.join(', ')}`
                              : recommendation.explanation
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {hasRemainingResults ? (
                  <div className="dashboard__results-group">
                    <div className="dashboard__group-header">
                      <h3>All official portals</h3>
                      <p>
                        {otherCount} verified link{otherCount === 1 ? '' : 's'} that match your search
                        {selectedCategory ? ` in ${selectedCategory}` : ' across all categories'}.
                      </p>
                    </div>
                    <div className="dashboard__results-grid" role="list">
                      {remainingResults.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {hasEquivalentSuggestions ? (
                  <div className="dashboard__results-group">
                    <div className="dashboard__group-header">
                      <h3>Inter-State Equivalent Finder</h3>
                      <p>
                        {equivalentCount} alternative portal{equivalentCount === 1 ? '' : 's'} surfaced because your
                        selected state may have fewer direct matches.
                      </p>
                    </div>
                    <div className="dashboard__results-grid" role="list">
                      {equivalents.map((entry) => (
                        <ServiceCard
                          key={`equivalent-${entry.service.id}`}
                          service={entry.service}
                          badge={entry.origin === 'central' ? 'Central equivalent' : 'Inter-state equivalent'}
                          note={entry.reason}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : hasSearched ? (
              <div className="dashboard__status">
                <h3>No exact matches yet</h3>
                <p>Try a different keyword, reset filters, or explore another category to broaden your results.</p>
                <div className="dashboard__status-actions">
                  {quickSearches.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="dashboard__chip"
                      onClick={() => onSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : showInitialGuidance ? (
              <div className="dashboard__welcome">
                <h3>Ready to explore official portals?</h3>
                <p>Pick a state or tap a popular search to see trusted government websites instantly.</p>
                <div className="dashboard__welcome-actions">
                  {quickSearches.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="dashboard__chip"
                      onClick={() => onSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="dashboard__support">
            <div>
              <h3>Stay safe online</h3>
              <p>
                We only surface domains run by Indian government bodies. Double-check the URL before paying fees or
                sharing personal details.
              </p>
            </div>
            <a href="https://www.cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">
              Report suspicious portals ↗
            </a>
          </section>
        </div>
      </main>
    </div>
  );
};
