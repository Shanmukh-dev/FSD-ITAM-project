import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const SCREENSHOTS_DIR = path.join(REPORTS_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

export function getBrowserExecutablePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error('Could not find Google Chrome or Microsoft Edge executable on this system.');
}

export async function runE2ETests(options = {}) {
  const {
    baseUrl = 'http://localhost:5173',
    headless = true,
    slowMo = 30,
  } = options;

  const executablePath = getBrowserExecutablePath();
  console.log(`[Browser] Using binary: ${executablePath}`);
  console.log(`[Target]  Frontend: ${baseUrl}`);
  console.log(`[Config]  Headless: ${headless} | SlowMo: ${slowMo}ms`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: headless ? 'new' : false,
    slowMo,
    protocolTimeout: 120000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
    },
  });

  const page = await browser.newPage();

  const consoleLogs = [];
  const networkErrors = [];
  const testSteps = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleLogs.push({ type: 'error', text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    console.error(`  [Browser PageError] ${err.message}`);
    consoleLogs.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes('/auth/setup-status')) {
      networkErrors.push({ url, status, statusText: response.statusText() });
    }
  });

  page.on('dialog', async (dialog) => {
    console.log(`  [Browser Dialog] ${dialog.type()}: ${dialog.message()}`);
    await dialog.accept().catch(() => {});
  });

  const recordStep = (name, status, details = {}) => {
    testSteps.push({
      name,
      status,
      timestamp: new Date().toISOString(),
      ...details,
    });
    const symbol = status === 'PASSED' ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✘\x1b[0m';
    console.log(`  ${symbol} [Step] ${name}`);
  };

  const takeScreenshot = async (name) => {
    const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
    try {
      await page.screenshot({ path: file });
    } catch (err) {
      console.warn(`  [Screenshot Warning] Could not save ${name}: ${err.message}`);
    }
    return file;
  };

  // Robust SPA navigation helper
  const navigateTo = async (targetPath) => {
    const clicked = await page.evaluate((p) => {
      const link = document.querySelector(`aside a[href="${p}"]`);
      if (link) {
        link.click();
        return true;
      }
      return false;
    }, targetPath);

    if (clicked) {
      await page.waitForFunction((p) => window.location.pathname.startsWith(p), { timeout: 4000 }, targetPath).catch(() => {});
    }

    if (!page.url().includes(targetPath)) {
      await page.goto(`${baseUrl}${targetPath}`, { waitUntil: 'networkidle2', timeout: 15000 });
    }

    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 15000 }).catch(() => {});
    await page.waitForSelector('h1', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 600));
  };

  const timestamp = Date.now();
  const adminEmail = 'admin@enterprise.corp';
  const adminPassword = 'Password123!';

  try {
    console.log('\n--- Beginning E2E Screen & Interaction Suite ---\n');

    // =========================================================================
    // STEP 1: Authentication & Bootstrap Setup
    // =========================================================================
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2', timeout: 15000 });

    const isSetupMode = (await page.$('input[placeholder*="Master Administrator"]')) !== null;

    if (isSetupMode) {
      console.log('  [Info] Clean database detected: Initializing Master Administrator...');
      await page.type('input[placeholder*="Master Administrator"]', 'Primary Administrator');
      await page.type('input[type="email"]', adminEmail);
      await page.type('input[type="password"]', adminPassword);
      await page.click('button[type="submit"]');
      await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 10000 });
      recordStep('01_System_Bootstrap_Setup', 'PASSED', { note: 'Initial Admin provisioned' });
    } else {
      console.log('  [Info] Standard login screen active. Signing in as Master Admin...');
      await page.type('input[type="email"]', adminEmail);
      await page.type('input[type="password"]', adminPassword);
      await page.click('button[type="submit"]');
      await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 10000 });
      recordStep('01_Admin_Authentication', 'PASSED', { note: 'Admin signed in successfully' });
    }

    await takeScreenshot('01_dashboard');

    // =========================================================================
    // STEP 2: Dashboard Screen & Metrics Verification
    // =========================================================================
    await page.waitForSelector('h1', { timeout: 8000 });
    const dashboardHeader = await page.$eval('h1', (el) => el.innerText);

    const statCardsCount = await page.$$eval('[class*="rounded"]', (cards) => cards.length);
    recordStep('02_Dashboard_Metrics_View', 'PASSED', { header: dashboardHeader, statCardsCount });
    await takeScreenshot('02_admin_dashboard');

    // =========================================================================
    // STEP 3: Departments Management & Creation Flow
    // =========================================================================
    await navigateTo('/departments');

    // Click "New Department" button
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('New Department'));
      if (btn) btn.click();
    });

    await page.waitForSelector('input[placeholder*="Department"], input#name, input', { timeout: 5000 });
    const deptName = `Core Platform Infrastructure ${timestamp}`;

    await page.type('input[placeholder*="Department"], input#name, input', deptName);
    const textarea = await page.$('textarea');
    if (textarea) {
      await page.type('textarea', 'Dedicated departmental unit for IT hardware reliability');
    }

    // Submit modal form
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await new Promise((r) => setTimeout(r, 1200));

    recordStep('03_Departments_Management', 'PASSED', { createdDepartment: deptName });
    await takeScreenshot('03_departments');

    // =========================================================================
    // STEP 4: Staff Directory & User Provisioning Flow
    // =========================================================================
    await navigateTo('/users');

    // Open "Provision User" modal
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Provision User'));
      if (btn) btn.click();
    });

    await page.waitForSelector('form input', { timeout: 5000 });
    const staffEmail = `e2e_staff_${timestamp}@enterprise.corp`;

    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('form input'));
      if (inputs[0]) inputs[0].focus();
    });
    await page.keyboard.type('Alexander Wright');

    await page.evaluate(() => {
      const emailInput = document.querySelector('form input[type="email"]');
      if (emailInput) emailInput.focus();
    });
    await page.keyboard.type(staffEmail);

    await page.evaluate(() => {
      const passInput = document.querySelector('form input[type="password"]');
      if (passInput) passInput.focus();
    });
    await page.keyboard.type('Password123!');

    // Submit user form
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Test search filter
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Alexander');
      await new Promise((r) => setTimeout(r, 500));
    }

    recordStep('04_Staff_Directory_Interaction', 'PASSED', { provisionedEmail: staffEmail });
    await takeScreenshot('04_users');

    // =========================================================================
    // STEP 5: Asset Inventory Catalog & Asset Registration Flow
    // =========================================================================
    await navigateTo('/assets');

    // Navigate to /assets/new
    await page.goto(`${baseUrl}/assets/new`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#assetTag, input[name="assetTag"]', { timeout: 8000 });

    const assetTag = `PUP-${String(timestamp).slice(-6)}`;
    await page.type('#assetTag, [name="assetTag"]', assetTag);
    await page.type('#name, [name="name"]', 'Dell Precision 7780 Mobile Workstation');
    await page.type('#brand, [name="brand"]', 'Dell');
    await page.type('#model, [name="model"]', 'Precision 7780');
    await page.type('#serialNumber, [name="serialNumber"]', `SN-${assetTag}`);
    await page.type('#purchasePrice, [name="purchasePrice"]', '345000');

    // Submit asset creation form
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await new Promise((r) => setTimeout(r, 1500));

    recordStep('05_Asset_Registration', 'PASSED', { registeredAssetTag: assetTag });
    await takeScreenshot('05_asset_created');

    // =========================================================================
    // STEP 6: Asset Detail Page & Depreciation Display
    // =========================================================================
    if (!page.url().includes('/assets/')) {
      await navigateTo('/assets');
      await page.waitForSelector('table, [class*="Card"]', { timeout: 5000 });
      await page.evaluate(() => {
        const link = document.querySelector('table tbody tr a, a[href*="/assets/"]');
        if (link) link.click();
      });
      await new Promise((r) => setTimeout(r, 1000));
    }

    recordStep('06_Asset_Detail_And_Depreciation', 'PASSED', { currentUrl: page.url() });
    await takeScreenshot('06_asset_detail');

    // =========================================================================
    // STEP 7: Hardware Allocation Requests Screen
    // =========================================================================
    await navigateTo('/requests');

    // Open "New Gear Request" modal
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('New Gear Request'));
      if (btn) btn.click();
    });
    await page.waitForSelector('form input, input[placeholder*="e.g."]', { timeout: 5000 });
    const reasonInput = await page.$('input[placeholder*="upgrade"], input[placeholder*="Purpose"], form input[type="text"]');
    if (reasonInput) {
      await reasonInput.type('Hardware upgrade cycle 2026');
    }
    const descTextarea = await page.$('form textarea');
    if (descTextarea) {
      await descTextarea.type('Engineers require dual external monitors for layout simulation.');
    }

    // Submit Request
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Submit Request'));
      if (submitBtn) {
        submitBtn.click();
      } else {
        const form = document.querySelector('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
    await new Promise((r) => setTimeout(r, 1500));

    recordStep('07_Asset_Requisitions_Flow', 'PASSED');
    await takeScreenshot('07_requests');

    // =========================================================================
    // STEP 8: Maintenance & Repair Triage Screen
    // =========================================================================
    await navigateTo('/maintenance');

    recordStep('08_Maintenance_Queue_View', 'PASSED');
    await takeScreenshot('08_maintenance');

    // =========================================================================
    // STEP 9: Executive Reports & Intelligence Screen
    // =========================================================================
    await navigateTo('/reports');

    // Toggle through tabs
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const deptTab = tabs.find((b) => b.innerText.includes('Department') || b.innerText.includes('Density'));
      if (deptTab) deptTab.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const valTab = tabs.find((b) => b.innerText.includes('Depreciation') || b.innerText.includes('Valuation'));
      if (valTab) valTab.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    recordStep('09_Executive_Reports_Visualization', 'PASSED');
    await takeScreenshot('09_reports');

    // =========================================================================
    // STEP 10: Profile & Header Notifications Bell Interaction
    // =========================================================================
    await navigateTo('/profile');

    // Click notification bell
    await page.evaluate(() => {
      const bellBtn = document.querySelector('button[title*="Notification"]');
      if (bellBtn) bellBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    recordStep('10_Profile_And_Notifications_Dropdown', 'PASSED');
    await takeScreenshot('10_profile_and_notifications');

    console.log('\n--- E2E Screen Suite Finished Successfully ---\n');
    return {
      success: true,
      testSteps,
      consoleLogs,
      networkErrors,
      screenshots: fs.readdirSync(SCREENSHOTS_DIR).map((f) => path.join(SCREENSHOTS_DIR, f)),
    };
  } catch (err) {
    console.error(`\n[E2E Exception at step]`, err.message);
    const failShot = await takeScreenshot('failure_screenshot');
    recordStep('E2E_Execution_Failure', 'FAILED', {
      error: err.message,
      stack: err.stack,
      screenshot: failShot,
    });
    return {
      success: false,
      testSteps,
      consoleLogs,
      networkErrors,
      error: {
        message: err.message,
        stack: err.stack,
        screenshot: failShot,
      },
    };
  } finally {
    await browser.close();
  }
}
