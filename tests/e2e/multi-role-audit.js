import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import { getBrowserExecutablePath } from './puppeteer-suite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const AUDIT_SCREENSHOTS_DIR = path.join(REPORTS_DIR, 'screenshots', 'audit');
const REPORT_PATH = path.join(REPORTS_DIR, 'multi-role-audit-report.json');

if (!fs.existsSync(AUDIT_SCREENSHOTS_DIR)) {
  fs.mkdirSync(AUDIT_SCREENSHOTS_DIR, { recursive: true });
}

const ROLES_TO_AUDIT = [
  {
    role: 'ADMIN',
    label: 'Master System Administrator',
    email: 'eleanor.vance@enterprise.corp',
    password: 'Password123!',
    screens: [
      { path: '/dashboard', name: '01_admin_dashboard', title: 'Admin Control Center' },
      { path: '/assets', name: '02_admin_assets_list', title: 'Asset Inventory Catalog' },
      { path: '/requests', name: '04_admin_requests_queue', title: 'Gear Requisition Queue' },
      { path: '/maintenance', name: '05_admin_maintenance_bench', title: 'Diagnostic Service Bench' },
      { path: '/users', name: '06_admin_staff_directory', title: 'Staff Directory Management' },
      { path: '/departments', name: '07_admin_departments', title: 'Department Cost Centers' },
      { path: '/reports', name: '08_admin_reports_analytics', title: 'Financial & Lifecycle Reports' },
      { path: '/profile', name: '09_admin_profile', title: 'Administrator Profile' },
    ],
  },
  {
    role: 'ASSET_MANAGER',
    label: 'Fleet & Procurement Manager',
    email: 'david.kim@enterprise.corp',
    password: 'Password123!',
    screens: [
      { path: '/dashboard', name: '10_manager_dashboard', title: 'Fleet Hub & Financial Overview' },
      { path: '/assets', name: '11_manager_assets_catalog', title: 'Enterprise Asset Catalog' },
      { path: '/requests', name: '12_manager_requests_approval', title: 'Requisitions Approval Queue' },
      { path: '/maintenance', name: '13_manager_maintenance_dispatch', title: 'Maintenance Ticket Dispatch' },
      { path: '/reports', name: '14_manager_financial_reports', title: 'Valuation & Amortization Reports' },
      { path: '/profile', name: '15_manager_profile', title: 'Manager Account Profile' },
    ],
  },
  {
    role: 'TECHNICIAN',
    label: 'Hardware & Diagnostic Technician',
    email: 'benjamin.scott@enterprise.corp',
    password: 'Password123!',
    screens: [
      { path: '/dashboard', name: '16_tech_dashboard', title: 'Diagnostic Bench Queue Dashboard' },
      { path: '/maintenance', name: '17_tech_maintenance_workbench', title: 'Repair & Work Order Queue' },
      { path: '/assets', name: '18_tech_hardware_specs', title: 'Asset Technical Specifications' },
      { path: '/profile', name: '19_tech_profile', title: 'Technician Account Profile' },
    ],
  },
  {
    role: 'EMPLOYEE',
    label: 'End-User Staff / Requisitioner',
    email: 'aaron.paulson@enterprise.corp',
    password: 'Password123!',
    screens: [
      { path: '/dashboard', name: '20_employee_dashboard', title: 'Self-Service Gear Deck' },
      { path: '/assets', name: '21_employee_my_equipment', title: 'My Custody Hardware' },
      { path: '/requests', name: '22_employee_my_requests', title: 'My Hardware Requisitions' },
      { path: '/maintenance', name: '23_employee_reported_issues', title: 'My Defect Reports' },
      { path: '/profile', name: '24_employee_profile', title: 'Employee Account Profile' },
    ],
  },
];

async function runMultiRoleAudit() {
  console.log('='.repeat(75));
  console.log('   ITAM MULTI-ROLE COMPREHENSIVE UI/UX & FUNCTIONAL AUDIT');
  console.log('='.repeat(75));

  const baseUrl = 'http://localhost:5173';
  const executablePath = getBrowserExecutablePath();
  console.log(`[Browser] Binary: ${executablePath}`);
  console.log(`[Target]  Client URL: ${baseUrl}`);
  console.log(`[Target]  Screenshots Dir: ${AUDIT_SCREENSHOTS_DIR}\n`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    slowMo: 30,
    protocolTimeout: 180000,
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

  const auditResults = {
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalSessions: ROLES_TO_AUDIT.length,
    totalScreensAudited: 0,
    screenshots: [],
    consoleErrors: [],
    networkFailures: [],
    roleAudits: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore routine Vite HMR or favicon issues
      if (!text.includes('favicon') && !text.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED')) {
        auditResults.consoleErrors.push({
          time: new Date().toISOString(),
          url: page.url(),
          error: text,
        });
      }
    }
  });

  page.on('pageerror', (err) => {
    auditResults.consoleErrors.push({
      time: new Date().toISOString(),
      url: page.url(),
      error: `[PageError] ${err.message}`,
      stack: err.stack,
    });
  });

  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && !url.includes('/auth/setup-status')) {
      auditResults.networkFailures.push({
        time: new Date().toISOString(),
        url,
        status,
        statusText: res.statusText(),
      });
    }
  });

  const captureScreen = async (filename, label) => {
    const filePath = path.join(AUDIT_SCREENSHOTS_DIR, `${filename}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    auditResults.screenshots.push({ filename: `${filename}.png`, label, path: filePath });
    return filePath;
  };

  try {
    for (const session of ROLES_TO_AUDIT) {
      console.log(`\n>>> Auditing Role: [${session.role}] ${session.label}`);
      console.log(`    Identity: ${session.email}`);

      const sessionSummary = {
        role: session.role,
        label: session.label,
        email: session.email,
        loginSuccess: false,
        screens: [],
        metrics: {},
      };

      // 1. Clear session and navigate to login
      await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2', timeout: 20000 });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'networkidle2' });

      // 2. Perform Login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.click('input[type="email"]', { clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.type('input[type="email"]', session.email);

      await page.click('input[type="password"]', { clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.type('input[type="password"]', session.password);

      await page.click('button[type="submit"]');

      // Wait for navigation into authenticated area
      await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 800));

      sessionSummary.loginSuccess = true;
      console.log(`    ✔ Authentication successful for ${session.email}`);

      // 3. Audit each assigned screen for this role
      for (const screen of session.screens) {
        console.log(`    -> Visiting screen: ${screen.path} (${screen.title})`);

        const navStart = Date.now();
        await page.goto(`${baseUrl}${screen.path}`, { waitUntil: 'networkidle2', timeout: 20000 });
        await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 15000 }).catch(() => {});
        await new Promise((r) => setTimeout(r, 600));

        const navDurationMs = Date.now() - navStart;

        // Inspect page elements
        const pageMetrics = await page.evaluate(() => {
          const h1 = document.querySelector('h1')?.innerText?.trim() || '';
          const cards = document.querySelectorAll('[class*="rounded"]').length;
          const tables = document.querySelectorAll('table').length;
          const buttons = document.querySelectorAll('button').length;
          const badges = document.querySelectorAll('[class*="badge"], [class*="rounded-full"]').length;
          const emptyState = document.querySelector('[class*="empty"], [class*="Empty"]') !== null;
          return { h1, cards, tables, buttons, badges, emptyState };
        });

        // Capture screenshot
        await captureScreen(screen.name, `[${session.role}] ${screen.title}`);
        auditResults.totalScreensAudited++;

        sessionSummary.screens.push({
          path: screen.path,
          name: screen.name,
          title: screen.title,
          h1: pageMetrics.h1,
          navDurationMs,
          domStats: pageMetrics,
          status: 'SUCCESS',
        });

        console.log(`       ✔ Captured ${screen.name}.png (H1: "${pageMetrics.h1}") in ${navDurationMs}ms`);
      }

      // 4. Test Notification Bell for this role
      try {
        const bellBtn = await page.$('button[title*="Notification"], button[aria-label*="Notification"], header button:has(svg)');
        if (bellBtn) {
          await bellBtn.click();
          await new Promise((r) => setTimeout(r, 400));
          await captureScreen(`${session.role.toLowerCase()}_notifications_popover`, `[${session.role}] Notifications Drawer`);
          console.log(`       ✔ Captured notifications popover for ${session.role}`);
          // Close popover
          await page.click('body');
        }
      } catch (e) {
        // notification bell check optional
      }

      auditResults.roleAudits.push(sessionSummary);
    }

    auditResults.completedAt = new Date().toISOString();
    fs.writeFileSync(REPORT_PATH, JSON.stringify(auditResults, null, 2));

    console.log('\n' + '='.repeat(75));
    console.log('   MULTI-ROLE AUDIT COMPLETE');
    console.log('='.repeat(75));
    console.log(`Screenshots Captured: ${auditResults.totalScreensAudited}`);
    console.log(`Console Errors:       ${auditResults.consoleErrors.length}`);
    console.log(`Network Anomalies:    ${auditResults.networkFailures.length}`);
    console.log(`Detailed Report:      ${REPORT_PATH}`);
    console.log(`Screenshots Dir:      ${AUDIT_SCREENSHOTS_DIR}\n`);

  } catch (err) {
    console.error('[Multi-Role Audit Error]', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runMultiRoleAudit().catch((err) => {
  console.error('[Fatal Multi-Role Audit Failure]', err);
  process.exit(1);
});
