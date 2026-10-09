import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { runE2ETests } from './puppeteer-suite.js';
import { ensureTestAdmin } from '../utils/ensure-test-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const REPORT_PATH = path.join(REPORTS_DIR, 'e2e-report.json');

const checkUrl = (url) => {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.get(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname,
          timeout: 3000,
        },
        (res) => {
          resolve(res.statusCode < 500);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
};

async function main() {
  console.log('='.repeat(70));
  console.log('   ITAM PUPPETEER FRONTEND E2E TEST WORKFLOW');
  console.log('='.repeat(70));

  const isBackendUp = await checkUrl('http://localhost:5000/api/health');
  const isFrontendUp = await checkUrl('http://localhost:5173');

  if (!isBackendUp) {
    console.error('\n[Error] Backend server is not running on http://localhost:5000');
    console.error('Please start the backend before running frontend tests:');
    console.error('  cd server && npm run dev\n');
    process.exit(1);
  }

  if (!isFrontendUp) {
    console.error('\n[Error] Frontend client dev server is not running on http://localhost:5173');
    console.error('Please start the frontend before running E2E tests:');
    console.error('  cd client && npm run dev\n');
    process.exit(1);
  }

  console.log('[Status] Backend API:       ONLINE (http://localhost:5000)');
  console.log('[Status] Frontend Client:   ONLINE (http://localhost:5173)');
  await ensureTestAdmin();

  const isHeaded = process.argv.includes('--headed') || process.argv.includes('--headless=false');
  const startTime = Date.now();

  const result = await runE2ETests({
    baseUrl: 'http://localhost:5173',
    apiBaseUrl: 'http://localhost:5000/api',
    headless: !isHeaded,
    slowMo: isHeaded ? 100 : 30,
  });

  const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

  const report = {
    timestamp: new Date().toISOString(),
    durationSeconds: parseFloat(durationSeconds),
    ...result,
  };

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log('='.repeat(70));
  console.log('   E2E FRONTEND TEST EXECUTION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Duration:       ${durationSeconds}s`);
  console.log(`Total Steps:    ${result.testSteps.length}`);
  const passed = result.testSteps.filter((s) => s.status === 'PASSED').length;
  const failed = result.testSteps.filter((s) => s.status === 'FAILED').length;
  console.log(`Passed Steps:   ${passed} \x1b[32m✔\x1b[0m`);
  console.log(`Failed Steps:   ${failed} ${failed > 0 ? '\x1b[31m✘\x1b[0m' : ''}`);
  console.log(`Report JSON:    ${REPORT_PATH}`);
  console.log(`Screenshots:    ${path.join(REPORTS_DIR, 'screenshots')}`);
  console.log('='.repeat(70));

  if (!result.success || failed > 0) {
    console.log('\n\x1b[31mFrontend E2E test failures detected!\x1b[0m');
    process.exit(1);
  } else {
    console.log('\n\x1b[32m✔ ALL FRONTEND INTERACTIONS & SCREENS PASSED SUCCESSFULLY.\x1b[0m\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('[Fatal E2E Runner Error]', err);
  process.exit(1);
});
