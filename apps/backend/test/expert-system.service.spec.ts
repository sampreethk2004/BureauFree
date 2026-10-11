import { ExpertSystemService } from '../src/modules/services/expert-system.service';

describe('ExpertSystemService', () => {
  const expertSystem = new ExpertSystemService();

  it('returns explainable recommendations with confidence', async () => {
    const recommendations = await expertSystem.evaluate('Andhra Pradesh', 'driving licence renewal');

    expect(recommendations.length).toBeGreaterThan(0);

    for (const recommendation of recommendations) {
      expect(recommendation.serviceId).toBeTruthy();
      expect(recommendation.intent).toBeTruthy();
      expect(recommendation.explanation).toBeTruthy();
      expect(recommendation.confidence).toBeGreaterThanOrEqual(0.35);
      expect(recommendation.confidence).toBeLessThanOrEqual(0.99);
      expect(Array.isArray(recommendation.matchedSignals)).toBe(true);
    }
  });

  it('returns no recommendations when state is absent', async () => {
    const recommendations = await expertSystem.evaluate('', 'certificate');
    expect(recommendations).toEqual([]);
  });

  it('matches states case-insensitively', async () => {
    const recommendations = await expertSystem.evaluate('andhra pradesh', 'driving licence renewal');

    expect(recommendations.map((recommendation) => recommendation.serviceId)).toContain('ap-transport');
  });
});
