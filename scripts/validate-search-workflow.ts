import { searchServices, states, categoryStats } from '../apps/backend/src/data/government-services';

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
  const results = searchServices(state, query, category);
  console.log(`\nScenario: ${description}`);
  console.log(`State: ${state ?? 'All'} | Query: ${query || '∅'} | Category: ${category ?? 'All'}`);
  console.log(`Matches: ${results.length}`);
  if (results.length) {
    console.log(`Sample: ${results.slice(0, 3).map((service) => service.name).join('; ')}`);
  }
}
