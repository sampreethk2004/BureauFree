import { GovernmentServicesService } from '../src/modules/services/government-services.service';
import { states } from '../src/data/government-services';

describe('GovernmentServicesService primary state portals', () => {
  const services = new GovernmentServicesService();

  it('returns one primary portal for every state and union territory', () => {
    const expectedStates = states.filter((state) => !state.toLowerCase().includes('india'));
    const primaryPortals = services.listStatePortals();

    expect(primaryPortals).toHaveLength(expectedStates.length);
    expect(primaryPortals.map((service) => service.state)).toEqual(expectedStates);
    expect(new Set(primaryPortals.map((service) => service.state)).size).toBe(expectedStates.length);

    for (const portal of primaryPortals) {
      expect(portal.url).toMatch(/^https?:\/\//);
    }
  });

  it('provides realtime catalogue snapshot with ranked insights', () => {
    const snapshot = services.getLiveSnapshot();

    expect(snapshot.generatedAt).toBeDefined();
    expect(snapshot.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(snapshot.summary.totalServices).toBeGreaterThan(0);
    expect(snapshot.summary.totalStates).toBeGreaterThan(0);
    expect(snapshot.summary.totalCategories).toBeGreaterThan(0);
    expect(snapshot.topStates.length).toBeGreaterThan(0);
    expect(snapshot.topCategories.length).toBeGreaterThan(0);
  });

  it('finds inter-state equivalents when state-specific results are sparse', () => {
    const equivalents = services.findEquivalentServices({
      state: 'Ladakh',
      query: 'driving licence renewal',
      category: 'Transport',
      existingServiceIds: []
    });

    expect(equivalents.length).toBeGreaterThan(0);
    expect(equivalents.some((entry) => entry.origin === 'central')).toBe(true);
    expect(equivalents.some((entry) => entry.service.state === 'Ladakh')).toBe(false);
    expect(equivalents.every((entry) => entry.score > 0)).toBe(true);
  });

  it('filters catalogue search states case-insensitively', () => {
    const results = services.search('andhra pradesh', 'driving licence', null);

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((service) => service.state === 'Andhra Pradesh')).toBe(true);
  });
});