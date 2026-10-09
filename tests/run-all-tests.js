import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: 'inherit',
      cwd: __dirname,
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Script exited with code ${code}`));
    });
  });
}

async function runAll() {
  console.log('='.repeat(70));
  console.log('   STARTING FULL SYSTEM TEST RUN (API + E2E)');
  console.log('='.repeat(70));

  try {
    console.log('\n[Phase 1/2] Running Postman Newman API Route Tests...');
    await runScript(path.join(__dirname, 'postman', 'run-postman.js'));

    console.log('\n[Phase 2/2] Running Puppeteer E2E Frontend Interaction Tests...');
    await runScript(path.join(__dirname, 'e2e', 'run-e2e.js'));

    console.log('\n' + '='.repeat(70));
    console.log('   ✔ ALL WORKFLOWS PASSED (API + FRONTEND)');
    console.log('='.repeat(70));
    process.exit(0);
  } catch (err) {
    console.error('\n\x1b[31m[Test Suite Failed]\x1b[0m', err.message);
    process.exit(1);
  }
}

runAll();
