import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import ffmpegPath from 'ffmpeg-static';
import { getBrowserExecutablePath } from './puppeteer-suite.js';
import { seedDemoUsers } from '../utils/seed-demo-users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const RECORDINGS_DIR = path.join(REPORTS_DIR, 'recordings');
const SCREENSHOTS_DIR = path.join(REPORTS_DIR, 'screenshots');

for (const dir of [REPORTS_DIR, RECORDINGS_DIR, SCREENSHOTS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function smoothScroll(page, distance = 350, steps = 8) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy(0, d), distance / steps).catch(() => {});
    await sleep(35);
  }
  await sleep(400);
}

async function smoothScrollTop(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })).catch(() => {});
  await sleep(400);
}

export async function runMultiRoleRecording() {
  console.log('='.repeat(75));
  console.log('   ITAM MULTI-ROLE DASHBOARD WALKTHROUGH & SCREEN RECORDING');
  console.log('='.repeat(75));

  // 1. Ensure all 4 role accounts exist in MongoDB with rich context
  await seedDemoUsers();

  const executablePath = getBrowserExecutablePath();
  const baseUrl = 'http://localhost:5173';
  const videoOutputPath = path.join(RECORDINGS_DIR, 'itam_complete_multi_role_walkthrough.mp4');

  console.log(`[Browser] Binary: ${executablePath}`);
  console.log(`[Target]  Base URL: ${baseUrl}`);
  console.log(`[Output]  Video: ${videoOutputPath}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    slowMo: 30,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
      '--disable-features=AutofillServerCommunication,PasswordManager',
      '--disable-save-password-bubble',
      '--no-default-browser-check',
      '--no-first-run',
      '--password-store=basic',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
    },
  });

  const page = await browser.newPage();

  // Create Screen Recorder instance
  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 25,
    ffmpeg_Path: ffmpegPath,
    videoFrame: { width: 1440, height: 900 },
    videoCrf: 20,
    videoCodec: 'libx264',
    videoPreset: 'faster',
    videoBitrate: 1800,
    aspectRatio: '16:9',
  });

  console.log('\n[Recording] Starting screen recording session...');
  await recorder.start(videoOutputPath);

  const roles = [
    {
      roleName: 'ADMIN',
      email: 'admin@enterprise.corp',
      password: 'Password123!',
      displayName: 'Primary Administrator',
      badgeColor: '#B88728',
      sections: [
        { name: 'Dashboard', path: '/dashboard', label: 'Admin Fleet Control Center & Health Score' },
        { name: 'Assets', path: '/assets', label: 'Asset Inventory & 360 Depreciation Detail' },
        { name: 'Requests', path: '/requests', label: 'Hardware Allocation & Requisitions Queue' },
        { name: 'Maintenance', path: '/maintenance', label: 'Repair Queue & Triage Bench' },
        { name: 'Team Members', path: '/users', label: 'Staff Identity Directory & Role Governance' },
        { name: 'Departments', path: '/departments', label: 'Corporate Organizational Units' },
        { name: 'Reports', path: '/reports', label: 'Executive Financial, Density & Depreciation Charts' },
        { name: 'Profile', path: '/profile', label: 'Administrator Profile & Real-Time Notification Bell' },
      ],
    },
    {
      roleName: 'ASSET_MANAGER',
      email: 'asset.manager@enterprise.corp',
      password: 'Password123!',
      displayName: 'Sarah Connor (Fleet Lead)',
      badgeColor: '#10B981',
      sections: [
        { name: 'Dashboard', path: '/dashboard', label: 'Fleet Operations Hub & Straight-Line Book Value' },
        { name: 'Assets', path: '/assets', label: 'Hardware Lifecycle Catalog & Specifications' },
        { name: 'Requests', path: '/requests', label: 'Requisition Approvals & Custody Assignments' },
        { name: 'Maintenance', path: '/maintenance', label: 'Maintenance Dispatches & Defect Triage' },
        { name: 'Reports', path: '/reports', label: 'Capital Valuation & Depreciation Intelligence' },
        { name: 'Profile', path: '/profile', label: 'Asset Manager Profile & System Preferences' },
      ],
    },
    {
      roleName: 'TECHNICIAN',
      email: 'technician@enterprise.corp',
      password: 'Password123!',
      displayName: 'Alex Rivera (Hardware Specialist)',
      badgeColor: '#3B82F6',
      sections: [
        { name: 'Dashboard', path: '/dashboard', label: 'Diagnostic Workbench Velocity & Active Shift' },
        { name: 'Maintenance', path: '/maintenance', label: 'Assigned Repair Queue & Diagnostic Bench' },
        { name: 'Assets', path: '/assets', label: 'Hardware Specifications & Serial Registry' },
        { name: 'Profile', path: '/profile', label: 'Technician Credentials & Work History' },
      ],
    },
    {
      roleName: 'EMPLOYEE',
      email: 'employee@enterprise.corp',
      password: 'Password123!',
      displayName: 'David Kim (Staff Engineer)',
      badgeColor: '#8B5CF6',
      sections: [
        { name: 'Dashboard', path: '/dashboard', label: 'Self-Service Workstation Deck & Assigned Gear' },
        { name: 'My Equipment', path: '/assets', label: 'Personal Custody Devices & Return Schedules' },
        { name: 'Requests', path: '/requests', label: 'Equipment Requisition Portal' },
        { name: 'Maintenance', path: '/maintenance', label: 'Hardware Defect & Damage Reporting' },
        { name: 'Profile', path: '/profile', label: 'Staff Profile & Custody Receipts' },
      ],
    },
  ];

  // Helper: Display floating overlay banner during recording
  const showRoleBanner = async (roleName, userEmail, description) => {
    try {
      await page.evaluate(
        ({ roleName, userEmail, description }) => {
          let banner = document.getElementById('walkthrough-overlay-banner');
          if (!banner) {
            banner = document.createElement('div');
            banner.id = 'walkthrough-overlay-banner';
            banner.style.position = 'fixed';
            banner.style.bottom = '22px';
            banner.style.right = '24px';
            banner.style.zIndex = '9999999';
            banner.style.background = 'rgba(12, 12, 18, 0.94)';
            banner.style.backdropFilter = 'blur(20px)';
            banner.style.border = '1px solid rgba(241, 203, 141, 0.4)';
            banner.style.boxShadow = '0 12px 36px rgba(0,0,0,0.65)';
            banner.style.borderRadius = '16px';
            banner.style.padding = '12px 22px';
            banner.style.fontFamily = 'Inter, -apple-system, sans-serif';
            banner.style.color = '#FFFFFF';
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.gap = '14px';
            banner.style.pointerEvents = 'none';
            document.body.appendChild(banner);
          }
          banner.innerHTML = `
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #F1CB8D; box-shadow: 0 0 14px #F1CB8D;"></div>
            <div>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #F1CB8D;">
                USER ROLE: ${roleName} <span style="font-weight: 400; opacity: 0.75; text-transform: none;">(${userEmail})</span>
              </div>
              <div style="font-size: 13px; font-weight: 600; color: #FFFFFF; margin-top: 2px;">
                ${description}
              </div>
            </div>
          `;
        },
        { roleName, userEmail, description }
      );
    } catch (e) {}
  };

  // Helper: Perform login
  const loginUser = async (email, password, roleName) => {
    console.log(`\n>>> Logging in as ${roleName} (${email})...`);
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2', timeout: 15000 });
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 10000 }).catch(() => {});
    await page.waitForSelector('form input[type="email"]', { timeout: 8000 });
    await showRoleBanner(roleName, email, `Signing in as ${roleName}`);

    // Focus, select all and type email
    await page.$eval('input[type="email"]', (el) => { el.focus(); el.select(); });
    await page.keyboard.press('Backspace');
    await page.type('input[type="email"]', email, { delay: 10 });

    // Focus, select all and type password
    await page.$eval('input[type="password"]', (el) => { el.focus(); el.select(); });
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', password, { delay: 10 });

    const typedEmail = await page.$eval('input[type="email"]', (el) => el.value);
    console.log(`  [Form Input] Typing verified: "${typedEmail}"`);

    await sleep(300);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard with automatic fallback
    try {
      await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 5000 });
    } catch (err) {
      console.log(`  [Auth Fallback] Synchronizing session token for ${roleName}...`);
      await page.evaluate(async (e, p) => {
        try {
          const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: e, password: p }),
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('itam_token', data.token);
            localStorage.setItem('itam_user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
          }
        } catch (fetchErr) {
          console.error('Fetch error:', fetchErr);
        }
      }, email, password);

      await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 8000 });
    }

    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }).catch(() => {});
    await sleep(1000);
    console.log(`  ✔ Successfully authenticated as ${roleName}`);
  };

  // Helper: Perform logout
  const logoutUser = async (roleName) => {
    console.log(`  <<< Logging out from ${roleName}...`);
    await showRoleBanner(roleName, '', `Signing out ${roleName}`);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await sleep(400);
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2', timeout: 10000 });
    await sleep(600);
  };

  const results = [];

  try {
    // =========================================================================
    // EXECUTE WALKTHROUGH FOR EACH ROLE
    // =========================================================================
    for (const r of roles) {
    const roleStartTime = Date.now();
    console.log('\n' + '-'.repeat(60));
    console.log(`ROLE AUDIT: ${r.roleName} (${r.displayName})`);
    console.log('-'.repeat(60));

    await loginUser(r.email, r.password, r.roleName);

    // Save screenshot of Role Dashboard
    const dashShotPath = path.join(SCREENSHOTS_DIR, `${r.roleName.toLowerCase()}_dashboard_walkthrough.png`);
    await page.screenshot({ path: dashShotPath });
    console.log(`  📸 Saved screenshot: ${dashShotPath}`);

    // Step 1: Inspect Role Dashboard
    await showRoleBanner(r.roleName, r.email, `Exploring ${r.roleName} Dashboard Bento`);
    await sleep(1200);

    // Hover over StatCards
    const cards = await page.$$('[class*="rounded"]');
    for (let i = 0; i < Math.min(cards.length, 4); i++) {
      try {
        await cards[i].hover();
        await sleep(350);
      } catch (e) {}
    }

    // Scroll down to view charts / audit stream / repair bench
    await smoothScroll(page, 450, 10);
    await sleep(800);
    await smoothScrollTop(page);
    await sleep(600);

    // Step 2: Navigate through all sections for this role
    for (const sec of r.sections) {
      console.log(`  -> Navigating to section: ${sec.name} (${sec.path})`);
      await showRoleBanner(r.roleName, r.email, `Section: ${sec.name} - ${sec.label}`);

      // If already on the page (e.g. dashboard), don't reload unnecessarily
      if (!page.url().endsWith(sec.path)) {
        const clicked = await page.evaluate((targetPath) => {
          const link = document.querySelector(`aside a[href="${targetPath}"]`);
          if (link) {
            link.click();
            return true;
          }
          return false;
        }, sec.path);

        if (!clicked) {
          await page.goto(`${baseUrl}${sec.path}`, { waitUntil: 'networkidle2', timeout: 12000 });
        } else {
          await page.waitForFunction((p) => window.location.pathname.startsWith(p), { timeout: 6000 }, sec.path).catch(() => {});
        }
      }

      await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 8000 }).catch(() => {});
      await sleep(1000);

      // Section-specific interactive gestures:
      if (sec.path === '/assets') {
        const searchInput = await page.$('input[placeholder*="Search"]');
        if (searchInput) {
          await searchInput.type('Dell', { delay: 40 });
          await sleep(600);
          await searchInput.click({ clickCount: 3 });
          await page.keyboard.press('Backspace');
          await sleep(400);
        }

        // On Admin, view an Asset 360 detail page with depreciation bar
        if (r.roleName === 'ADMIN') {
          const detailLink = await page.$('table tbody tr a, a[href*="/assets/"]');
          if (detailLink) {
            await showRoleBanner(r.roleName, r.email, `Asset 360 View & Straight-Line Depreciation Engine`);
            await detailLink.click();
            await sleep(1400);
            await smoothScroll(page, 320, 8);
            await smoothScrollTop(page);
            await page.goto(`${baseUrl}/assets`, { waitUntil: 'networkidle2' });
            await sleep(600);
          }
        }
      } else if (sec.path === '/reports') {
        // Tab toggling on Reports page
        const tabBtns = await page.$$('button');
        for (const btn of tabBtns) {
          const text = await page.evaluate((el) => el.innerText, btn);
          if (text.includes('Department') || text.includes('Valuation') || text.includes('Depreciation')) {
            await btn.click();
            await sleep(800);
          }
        }
      } else if (sec.path === '/requests') {
        await smoothScroll(page, 200, 6);
        await sleep(600);
        await smoothScrollTop(page);
      } else if (sec.path === '/maintenance') {
        await smoothScroll(page, 250, 6);
        await sleep(600);
        await smoothScrollTop(page);
      } else if (sec.path === '/profile') {
        // Trigger notification bell in header
        await showRoleBanner(r.roleName, r.email, `In-App Notification Center`);
        await page.evaluate(() => {
          const bell = document.querySelector('button[title*="Notification"]');
          if (bell) bell.click();
        });
        await sleep(1000);
        await page.evaluate(() => {
          const bell = document.querySelector('button[title*="Notification"]');
          if (bell) bell.click();
        });
        await sleep(500);
      }

      await smoothScroll(page, 250, 6);
      await smoothScrollTop(page);
      await sleep(600);
    }

    // Role completed
    await showRoleBanner(r.roleName, r.email, `Role Walkthrough Completed: ${r.roleName}`);
    await sleep(800);

    // Logout
    await logoutUser(r.roleName);
    await sleep(1000);

    const roleDuration = ((Date.now() - roleStartTime) / 1000).toFixed(1);
    results.push({
      role: r.roleName,
      user: r.email,
      sectionsVisited: r.sections.length,
      durationSeconds: parseFloat(roleDuration),
      status: 'COMPLETED',
    });
  }

    // Final landing screen
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });
    await showRoleBanner('ALL ROLES', 'COMPLETE', 'All 4 Role Walkthroughs Successfully Recorded');
    await sleep(1500);
  } finally {
    console.log('\n[Recording] Finalizing and saving screen recording...');
    await recorder.stop().catch((e) => console.warn('Recorder stop notice:', e.message));
    console.log(`[Recording] Saved successfully to: ${videoOutputPath}`);
    await browser.close().catch(() => {});
  }

  const videoStats = fs.statSync(videoOutputPath);
  const videoSizeMb = (videoStats.size / (1024 * 1024)).toFixed(2);

  console.log('\n' + '='.repeat(75));
  console.log('   MULTI-ROLE SCREEN RECORDING SUMMARY');
  console.log('='.repeat(75));
  console.log(`Total Roles Covered: ${results.length} (ADMIN, ASSET_MANAGER, TECHNICIAN, EMPLOYEE)`);
  console.log(`Video File Path:    ${videoOutputPath}`);
  console.log(`Video File Size:    ${videoSizeMb} MB`);
  for (const res of results) {
    console.log(`  ✔ [${res.role}] (${res.user}): ${res.sectionsVisited} sections in ${res.durationSeconds}s`);
  }
  console.log('='.repeat(75));

  return {
    videoOutputPath,
    videoSizeMb,
    results,
  };
}

if (process.argv[1] && process.argv[1].endsWith('multi-role-recording.js')) {
  runMultiRoleRecording()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Error in Multi-Role Recording]:', err);
      process.exit(1);
    });
}
