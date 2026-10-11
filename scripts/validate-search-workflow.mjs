import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataModulePath = path.resolve(__dirname, '../apps/backend/dist/data/government-services.js');

const dataModule = await import(pathToFileURL(dataModulePath));
const { searchServices, states, categoryStats } = dataModule;

const scenarios = [
  {
    description: 'Pan-India keyword search',
    state: null,
    query: 'scholarship',
    category: null
  },
  {
    description: 'State-filtered search',
    state: 'Kerala',
    query: '',
    category: null
  },
  {
    description: 'Category-filtered search',
    state: null,
    query: '',
    category: 'Citizen Services'
  }
];

console.log(`Known states loaded: ${states.length}`);
console.log(`Known categories tallied: ${categoryStats.length}`);

for (const scenario of scenarios) {
  const { description, state, query, category } = scenario;
  const results = searchServices(state, query, category ?? null);
  console.log(`\nScenario: ${description}`);
  console.log(`State: ${state ?? 'All'} | Query: ${query || '∅'} | Category: ${category ?? 'All'}`);
  console.log(`Matches: ${results.length}`);
  if (results.length) {
    console.log(`Sample: ${results.slice(0, 3).map((service) => service.name).join('; ')}`);
  }
}
