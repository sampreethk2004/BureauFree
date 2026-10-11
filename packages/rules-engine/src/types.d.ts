import type { RuleProperties, TopLevelCondition } from 'json-rules-engine';
export interface RuleSourceMetadata {
    referenceUrl: string;
    collectedAt: string;
    jurisdiction: string;
    reviewer: string;
}
export interface RuleDefinition {
    id: string;
    description: string;
    priority: number;
    conditions: TopLevelCondition;
    event: RuleProperties['event'];
    metadata: RuleSourceMetadata;
    effectiveFrom: string;
    effectiveTo?: string;
}
export interface RuleBundle {
    serviceId: string;
    version: number;
    publishedAt: string;
    rules: RuleDefinition[];
}
