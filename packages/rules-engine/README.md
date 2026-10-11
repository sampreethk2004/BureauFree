# Rules Engine Package

Shared expert-system package used by backend services.

## Implemented Capabilities
- Rule type system (`RuleBundle`, `RuleDefinition`, metadata contracts).
- JSON Schema validation using Ajv (`validateRuleBundle`).
- Engine wrapper around `json-rules-engine` (`createEngine`, `runEngine`).
- Explanation capture for matched rules.

## Public Exports
- `types`: shared rule interfaces.
- `validator`: bundle validation against schema.
- `engine`: execution APIs.

## Example Usage
```ts
import { runEngine, validateRuleBundle } from '@bureaufree/rules-engine';

validateRuleBundle(bundle);
const result = await runEngine(bundle, {
	state: 'Andhra Pradesh',
	needsTransport: true
});
```

## Development Commands
From workspace root:

```bash
pnpm --filter @bureaufree/rules-engine run build
pnpm --filter @bureaufree/rules-engine run test
pnpm --filter @bureaufree/rules-engine run lint
```

## Schema Location
- `src/schema/service-rule.schema.json`

## Integration
- Backend consumes this package in `apps/backend` to generate expert recommendations and explanations.
