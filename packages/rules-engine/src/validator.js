"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRuleBundle = void 0;
const ajv_1 = __importDefault(require("ajv"));
const service_rule_schema_json_1 = __importDefault(require("./schema/service-rule.schema.json"));
let validator;
const validateRuleBundle = (bundle) => {
    if (!validator) {
        const ajv = new ajv_1.default({
            allErrors: true,
            strict: false
        });
        validator = ajv.compile(service_rule_schema_json_1.default);
    }
    const valid = validator(bundle);
    if (!valid && validator.errors) {
        const message = validator.errors
            .map((error) => `${error.instancePath} ${error.message ?? ''}`.trim())
            .join('; ');
        throw new Error(`Rule bundle validation failed: ${message}`);
    }
};
exports.validateRuleBundle = validateRuleBundle;
//# sourceMappingURL=validator.js.map