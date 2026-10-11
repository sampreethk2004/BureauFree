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
export declare const createEngine: (bundle: RuleBundle) => Engine;
export declare const runEngine: (bundle: RuleBundle, facts: Record<string, unknown>) => Promise<EngineResult>;
