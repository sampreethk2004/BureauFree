import { describe, expect, it } from 'vitest';
import { runEngine } from '../src/engine';
import { validateRuleBundle } from '../src/validator';
import type { RuleBundle } from '../src/types';

const bundle: RuleBundle = {
  serviceId: 'demo-service',
  version: 1,
  publishedAt: new Date().toISOString(),
  rules: [
    {
      id: 'eligible-income',
      description: 'Citizen income is within required threshold',
      priority: 10,
      conditions: {
        all: [
          {
            fact: 'profile.income',
            operator: 'lessThanInclusive',
            value: 300000
          }
        ]
      },
      event: {
        type: 'eligibility:qualified',
        params: {
          level: 'high'
        }
      },
      metadata: {
        referenceUrl: 'https://example.gov.in/rules',
        collectedAt: new Date().toISOString(),
        jurisdiction: 'Telangana',
        reviewer: 'Analyst Team'
      },
      effectiveFrom: new Date().toISOString().slice(0, 10)
    }
  ]
};

describe('rules-engine', () => {
  it('validates bundle against schema', () => {
    expect(() => validateRuleBundle(bundle)).not.toThrow();
  });

  it('returns events for qualifying facts', async () => {
    const result = await runEngine(bundle, {
      profile: {
        income: 250000
      }
    });

    expect(result.events).toHaveLength(1);
    expect(result.events[0]?.type).toBe('eligibility:qualified');
  });
});
