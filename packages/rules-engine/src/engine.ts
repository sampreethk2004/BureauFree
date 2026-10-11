import { Engine, RuleProperties } from 'json-rules-engine';
import { RuleBundle } from './types';

export interface EngineContext {
  facts: Record<string, unknown>;
  bundle: RuleBundle;
}

export interface EngineResult {
  events: RuleProperties['event'][];
  explanations: Array<{
    ruleId: string;
    description: string;
  }>;
}

export const createEngine = (bundle: RuleBundle) => {
  const engine = new Engine([], {
    allowUndefinedFacts: true
  });

  for (const rule of bundle.rules) {
    engine.addRule({
      name: rule.id,
      conditions: rule.conditions,
      event: rule.event,
      priority: rule.priority,
      onSuccess: async (event, almanac) => {
        await almanac.addRuntimeFact(`explanation:${rule.id}`, {
          ruleId: rule.id,
          description: rule.description
        });
      }
    });
  }

  return engine;
};

export const runEngine = async (bundle: RuleBundle, facts: Record<string, unknown>): Promise<EngineResult> => {
  const engine = createEngine(bundle);
  const explanations: EngineResult['explanations'] = [];

  engine.on('success', (event, almanac) => {
    const runtimeFactKey = `explanation:${event.type}`;
    almanac.factValue(runtimeFactKey).then((value) => {
      if (value) {
        explanations.push(value as EngineResult['explanations'][number]);
      }
    });
  });

  const { events } = await engine.run(facts);
  return {
    events,
    explanations
  };
};
