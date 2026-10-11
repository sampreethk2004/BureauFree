import Ajv, { ValidateFunction } from 'ajv';
import schema from './schema/service-rule.schema.json';
import { RuleBundle } from './types';

let validator: ValidateFunction<RuleBundle> | undefined;

export const validateRuleBundle = (bundle: RuleBundle) => {
  if (!validator) {
    const ajv = new Ajv({
      allErrors: true,
      strict: false
    });
    validator = ajv.compile<RuleBundle>(schema as never);
  }

  const valid = validator(bundle);
  if (!valid && validator.errors) {
    const message = validator.errors
      .map((error) => `${error.instancePath} ${error.message ?? ''}`.trim())
      .join('; ');
    throw new Error(`Rule bundle validation failed: ${message}`);
  }
};
