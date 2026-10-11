"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEngine = exports.createEngine = void 0;
const json_rules_engine_1 = require("json-rules-engine");
const createEngine = (bundle) => {
    const engine = new json_rules_engine_1.Engine([], {
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
exports.createEngine = createEngine;
const runEngine = async (bundle, facts) => {
    const engine = (0, exports.createEngine)(bundle);
    const explanations = [];
    engine.on('success', (event, almanac) => {
        const runtimeFactKey = `explanation:${event.type}`;
        almanac.factValue(runtimeFactKey).then((value) => {
            if (value) {
                explanations.push(value);
            }
        });
    });
    const { events } = await engine.run(facts);
    return {
        events,
        explanations
    };
};
exports.runEngine = runEngine;
//# sourceMappingURL=engine.js.map