import fs from 'node:fs';
import path from 'node:path';

const dataFile = path.join('apps', 'backend', 'src', 'data', 'government-services.ts');
const fileContents = fs.readFileSync(dataFile, 'utf8');
const urlPattern = /url:\s*'([^']+)'/g;
const urls = Array.from(new Set([...fileContents.matchAll(urlPattern)].map((match) => match[1])));

let successCount = 0;
const failures = [];

const concurrency = 8;
let pointer = 0;

const fetchWithTimeout = async (resource, options = {}) => {
  const { timeout = 15000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...rest, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
};

const worker = async () => {
  while (pointer < urls.length) {
    const currentIndex = pointer;
    const currentUrl = urls[currentIndex];
    pointer += 1;

    try {
      const response = await fetchWithTimeout(currentUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const { status } = response;
      if (status >= 400) {
        failures.push({ url: currentUrl, status, reason: `HTTP ${status}` });
      } else {
        successCount += 1;
      }
    } catch (error) {
      failures.push({ url: currentUrl, status: null, reason: error.name === 'AbortError' ? 'Timeout' : error.message });
    }
  }
};

await Promise.all(Array.from({ length: concurrency }, () => worker()));

console.log(`Checked ${urls.length} URLs.`);
console.log(`Successful responses: ${successCount}`);
console.log(`Failures: ${failures.length}`);

if (failures.length) {
  console.log('\nFailures:');
  failures.forEach((failure) => {
    console.log(`- ${failure.url} -> ${failure.reason}`);
  });
}
