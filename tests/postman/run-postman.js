import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import newman from 'newman';
import { ensureTestAdmin } from '../utils/ensure-test-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTION_PATH = path.join(__dirname, 'itam_api_collection.json');
const ENVIRONMENT_PATH = path.join(__dirname, 'itam_api_environment.json');
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const REPORT_PATH = path.join(REPORTS_DIR, 'postman-report.json');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Function to check if backend server is responsive
const checkServerHealth = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/health', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(2500, () => {
      req.destroy();
      resolve(false);
    });
  });
};

async function main() {
  console.log('='.repeat(70));
  console.log('   ITAM POSTMAN API REST TEST WORKFLOW');
  console.log('='.repeat(70));
  console.log(`[Config] Target Base URL: http://localhost:5000/api`);
  console.log(`[Config] Collection:      ${COLLECTION_PATH}`);
  console.log(`[Config] Environment:     ${ENVIRONMENT_PATH}`);

  const isHealthy = await checkServerHealth();
  if (!isHealthy) {
    console.error('\n[Error] Backend server is not running or not responding at http://localhost:5000/api/health');
    console.error('Please start the server first:');
    console.error('  cd server && npm run dev\n');
    process.exit(1);
  }

  console.log('[Status] Backend API health check: ONLINE (200 OK)');
  await ensureTestAdmin();
  console.log('[Runner] Executing test suite via Newman...\n');

  const startTime = Date.now();
  const failures = [];
  const testResults = [];

  newman.run(
    {
      collection: COLLECTION_PATH,
      environment: ENVIRONMENT_PATH,
      reporters: ['cli'],
      bail: false,
    },
    (err, summary) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      if (err) {
        console.error('[Fatal Error] Newman execution error:', err);
        process.exit(1);
      }

      if (summary.run && summary.run.failures) {
        summary.run.failures.forEach((f) => {
          failures.push({
            request: f.source ? f.source.name : 'Unknown Request',
            test: f.error ? f.error.test : 'Assertion',
            message: f.error ? f.error.message : 'Unknown assertion failure',
            stack: f.error ? f.error.stack : null,
          });
        });
      }

      const totalRequests = summary.run.stats.requests.total;
      const failedRequests = summary.run.stats.requests.failed;
      const totalAssertions = summary.run.stats.assertions.total;
      const failedAssertions = summary.run.stats.assertions.failed;
      const passedAssertions = totalAssertions - failedAssertions;

      const report = {
        timestamp: new Date().toISOString(),
        durationSeconds: parseFloat(elapsed),
        summary: {
          requests: {
            total: totalRequests,
            failed: failedRequests,
          },
          assertions: {
            total: totalAssertions,
            passed: passedAssertions,
            failed: failedAssertions,
          },
        },
        failures,
      };

      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

      console.log('\n' + '='.repeat(70));
      console.log('   POSTMAN API TEST EXECUTION SUMMARY');
      console.log('='.repeat(70));
      console.log(`Duration:           ${elapsed}s`);
      console.log(`Total Requests:     ${totalRequests} (Failed: ${failedRequests})`);
      console.log(`Total Assertions:   ${totalAssertions}`);
      console.log(`Passed Assertions:  ${passedAssertions} \x1b[32m✔\x1b[0m`);
      console.log(`Failed Assertions:  ${failedAssertions} ${failedAssertions > 0 ? '\x1b[31m✘\x1b[0m' : ''}`);
      console.log(`Report JSON:        ${REPORT_PATH}`);
      console.log('='.repeat(70));

      if (failures.length > 0) {
        console.log('\n\x1b[31mFailed Assertions Breakdown:\x1b[0m');
        failures.forEach((fail, idx) => {
          console.log(`  ${idx + 1}. [${fail.request}] > ${fail.test}: ${fail.message}`);
        });
        console.log('');
        process.exit(1);
      } else {
        console.log('\n\x1b[32m✔ ALL API ENDPOINT SPECIFICATIONS PASSED CLEANLY.\x1b[0m\n');
        process.exit(0);
      }
    }
  );
}

main().catch((err) => {
  console.error('[Unhandled Exception]', err);
  process.exit(1);
});
