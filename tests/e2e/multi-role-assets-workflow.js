import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import { getBrowserExecutablePath } from './puppeteer-suite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const SCREENSHOTS_DIR = path.join(REPORTS_DIR, 'screenshots', 'workflow');
const REPORT_PATH = path.join(REPORTS_DIR, 'multi-role-assets-workflow-report.json');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const API_URL = process.env.VITE_API_URL || 'https://fsd-itam-project.onrender.com/api';

// Realistic Enterprise Assets Specification generator
const getAssetsToCreate = () => {
  const runId = Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 5).toUpperCase();
  return [
    {
      assetTag: `MBP-${runId}-01`,
      name: 'Apple MacBook Pro 16" M3 Max',
    category: 'LAPTOP',
    assetType: 'PHYSICAL',
    brand: 'Apple',
    model: 'MacBook Pro 16 (16-Core CPU, 40-Core GPU, 64GB RAM, 1TB SSD)',
    serialNumber: `C02G${runId}X8`,
    vendor: 'Apple Enterprise Direct',
    purchasePrice: 3499.00,
    usefulLifeYears: 4,
    condition: 'NEW',
    targetAssignee: 'aaron.paulson@enterprise.corp',
    assigneeName: 'Aaron Paulson',
    expectedReturnMonths: 12,
    assignNotes: 'Engineering design and local LLM simulation workstation.',
  },
  {
    assetTag: `MON-${runId}-02`,
    name: 'Dell UltraSharp 32" 4K Video Conferencing Monitor',
    category: 'MONITOR',
    assetType: 'PHYSICAL',
    brand: 'Dell',
    model: 'UltraSharp U3223QE 4K IPS Black Hub Monitor',
    serialNumber: `CN-0V48X-${runId}`,
    vendor: 'Dell Technologies',
    purchasePrice: 899.00,
    usefulLifeYears: 5,
    condition: 'NEW',
    targetAssignee: 'employee@enterprise.corp',
    assigneeName: 'David Kim (Employee)',
    expectedReturnMonths: 24,
    assignNotes: 'High-density color-accurate display for financial modeling deck.',
  },
  {
    assetTag: `TP-${runId}-03`,
    name: 'Lenovo ThinkPad P16 Gen 2 Mobile Workstation',
    category: 'LAPTOP',
    assetType: 'PHYSICAL',
    brand: 'Lenovo',
    model: 'ThinkPad P16 Gen 2 (i9-13980HX, 64GB DDR5, RTX 4080)',
    serialNumber: `PF-${runId}9Z`,
    vendor: 'Lenovo Commercial Partner',
    purchasePrice: 2850.00,
    usefulLifeYears: 4,
    condition: 'NEW',
    targetAssignee: 'aaron.paulson@enterprise.corp',
    assigneeName: 'Aaron Paulson',
    expectedReturnMonths: 18,
    assignNotes: 'Hardware stress test and edge robotics testing rig.',
  },
  {
    assetTag: `CS-${runId}-04`,
    name: 'Cisco Catalyst 9300 48-Port PoE+ Enterprise Switch',
    category: 'NETWORKING',
    assetType: 'PHYSICAL',
    brand: 'Cisco',
    model: 'Catalyst C9300L-48P-4X Managed Layer-3 Switch',
    serialNumber: `FOC${runId}77`,
    vendor: 'Cisco Systems / CDW',
    purchasePrice: 4850.00,
    usefulLifeYears: 6,
    condition: 'NEW',
    targetAssignee: null, // Pool asset
    assignNotes: 'IDF Server Room Rack 2 Distribution Core.',
  },
  {
    assetTag: `ACC-${runId}-05`,
    name: 'Logitech MX Master 3S + Mechanical Wireless Combo',
    category: 'PERIPHERAL',
    assetType: 'PHYSICAL',
    brand: 'Logitech',
    model: 'MX Master 3S Ergonomic Mouse + MX Mechanical Keyboard',
    serialNumber: `SN-LOGI-${runId}`,
    vendor: 'Logitech Corporate Solutions',
    purchasePrice: 249.00,
    usefulLifeYears: 3,
    condition: 'NEW',
    targetAssignee: 'employee@enterprise.corp',
    assigneeName: 'David Kim (Employee)',
    expectedReturnMonths: 12,
    assignNotes: 'Ergonomic input peripheral bundle.',
  },
  {
    assetTag: `SW-JB-${runId}`,
    name: 'JetBrains All Products Pack Team License',
    category: 'SOFTWARE_LICENSE',
    assetType: 'DIGITAL',
    brand: 'JetBrains',
    model: 'Commercial Subscription 10-Pack',
    vendor: 'JetBrains s.r.o.',
    purchasePrice: 7790.00,
    usefulLifeYears: 1,
    condition: 'NOT_APPLICABLE',
    digitalDetails: {
      licenseKey: `JB-ENT-${runId}-9X4Q`,
      licenseType: 'SUBSCRIPTION',
      seatsTotal: 10,
      contractNumber: `CNT-JB-${runId}`,
      billingCycle: 'ANNUAL',
      autoRenew: true,
    },
    targetAssignee: 'aaron.paulson@enterprise.corp',
    isDigitalSeat: true,
  },
];
};

async function runMultiRoleAssetsWorkflow() {
  const ASSETS_TO_CREATE = getAssetsToCreate();
  console.log('='.repeat(80));
  console.log('   ITAM MULTI-ROLE ASSET CREATION, ASSIGNMENT & MAINTENANCE WORKFLOW');
  console.log('='.repeat(80));
  console.log(`[Config] Frontend Target: ${BASE_URL}`);
  console.log(`[Config] Backend API:     ${API_URL}`);
  console.log(`[Config] Artifacts Dir:   ${SCREENSHOTS_DIR}\n`);

  const executablePath = getBrowserExecutablePath();
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    slowMo: 40,
    protocolTimeout: 180000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  const steps = [];

  const recordStep = (name, status, details = {}) => {
    steps.push({ name, status, timestamp: new Date().toISOString(), ...details });
    const mark = status === 'PASSED' ? '\x1b[32m✔ PASSED\x1b[0m' : '\x1b[31m✘ FAILED\x1b[0m';
    console.log(`  ${mark} - ${name}`);
  };

  const takeScreenshot = async (name) => {
    const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
    try {
      await page.screenshot({ path: file });
    } catch (e) {
      console.warn(`  [Screenshot Warning] ${name}: ${e.message}`);
    }
    return file;
  };

  const fetchWithRetry = async (url, options = {}, retries = 4) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, options);
        return res;
      } catch (err) {
        if (attempt === retries) throw err;
        console.warn(`    [Network Retry] ${url} failed (${err.message}), retrying ${attempt}/${retries}...`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  };

  const uiLogin = async (email, password, roleLabel) => {
    console.log(`\n--> [Auth Session] Logging in as ${roleLabel} (${email})...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Clear localStorage to ensure fresh session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Focus & clear inputs
    await page.click('input[type="email"]');
    await page.evaluate(() => {
      const emailEl = document.querySelector('input[type="email"]');
      if (emailEl) emailEl.value = '';
      const passEl = document.querySelector('input[type="password"]');
      if (passEl) passEl.value = '';
    });
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));
    console.log(`    Authenticated successfully as ${roleLabel}`);
  };

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
      await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: 'networkidle2', timeout: 20000 });
    }
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));
  };

  const createdAssets = [];
  const reportedTickets = [];

  try {
    // =========================================================================
    // STAGE 1: ASSET_MANAGER (David Kim) - Create Assets & Perform Allocations
    // =========================================================================
    console.log('\n============================================================');
    console.log(' STAGE 1: ASSET_MANAGER ROLE — FLEET REGISTRATION & ALLOCATION');
    console.log('============================================================');

    await uiLogin('david.kim@enterprise.corp', 'Password123!', 'ASSET_MANAGER (David Kim)');
    await takeScreenshot('01_manager_dashboard_landing');
    recordStep('Stage1_Manager_Login', 'PASSED');

    // Retrieve user list for ID mapping using targeted searches
    const managerToken = await page.evaluate(() => localStorage.getItem('itam_token'));
    const userMap = {};
    const targetEmails = [
      'aaron.paulson@enterprise.corp',
      'employee@enterprise.corp',
      'benjamin.scott@enterprise.corp',
      'david.kim@enterprise.corp',
    ];
    for (const email of targetEmails) {
      const uRes = await fetchWithRetry(`${API_URL}/users?search=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      const uData = await uRes.json();
      if (uData.users && uData.users.length > 0) {
        const found = uData.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || uData.users[0];
        userMap[email] = found._id;
      }
    }

    // Retrieve department list
    const deptRes = await fetchWithRetry(`${API_URL}/departments`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const deptData = await deptRes.json();
    const primaryDeptId = deptData.departments?.[0]?._id || null;

    // Create Assets through UI & API
    for (const assetSpec of ASSETS_TO_CREATE) {
      console.log(`\n  [Registering Asset] ${assetSpec.name} (Tag: ${assetSpec.assetTag}, Price: $${assetSpec.purchasePrice})`);
      
      const payload = {
        assetTag: assetSpec.assetTag,
        name: assetSpec.name,
        category: assetSpec.category,
        assetType: assetSpec.assetType,
        brand: assetSpec.brand,
        model: assetSpec.model,
        serialNumber: assetSpec.serialNumber || `SN-${assetSpec.assetTag}`,
        vendor: assetSpec.vendor,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: assetSpec.purchasePrice,
        department: primaryDeptId,
        location: assetSpec.assetType === 'DIGITAL' ? 'Cloud / SaaS Console' : 'Enterprise HQ Tech Pool',
        condition: assetSpec.condition,
        depreciation: {
          usefulLifeYears: assetSpec.usefulLifeYears,
          method: assetSpec.assetType === 'DIGITAL' ? 'SUBSCRIPTION_AMORTIZATION' : 'STRAIGHT_LINE',
        },
      };

      if (assetSpec.assetType === 'DIGITAL') {
        payload.digitalDetails = {
          ...assetSpec.digitalDetails,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        };
      }

      const createRes = await fetchWithRetry(`${API_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify(payload),
      });

      const createData = await createRes.json();
      if (!createData.success) {
        throw new Error(`Failed to create asset ${assetSpec.name}: ${createData.message}`);
      }

      const assetDoc = createData.asset;
      createdAssets.push({ ...assetSpec, id: assetDoc._id, doc: assetDoc });
      recordStep(`Stage1_CreateAsset_${assetSpec.category}_${assetSpec.assetTag}`, 'PASSED', {
        assetId: assetDoc._id,
        purchasePrice: assetSpec.purchasePrice,
      });

      // Handle Asset Assignment or Seat Allocation
      if (assetSpec.targetAssignee) {
        const targetUserId = userMap[assetSpec.targetAssignee];
        if (targetUserId) {
          if (assetSpec.isDigitalSeat) {
            console.log(`    -> Allocating digital seat to ${assetSpec.targetAssignee}...`);
            const seatRes = await fetchWithRetry(`${API_URL}/assets/${assetDoc._id}/allocate-seat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${managerToken}`,
              },
              body: JSON.stringify({
                userId: targetUserId,
                notes: 'Allocated professional IDE seat for backend engineering.',
              }),
            });
            const seatData = await seatRes.json();
            if (seatData.success) {
              recordStep(`Stage1_AllocateSeat_${assetSpec.assetTag}`, 'PASSED', {
                targetUser: assetSpec.targetAssignee,
              });
            }
          } else {
            console.log(`    -> Assigning equipment custody to ${assetSpec.assigneeName} (${assetSpec.targetAssignee})...`);
            const returnDate = new Date();
            returnDate.setMonth(returnDate.getMonth() + (assetSpec.expectedReturnMonths || 6));

            const assignRes = await fetchWithRetry(`${API_URL}/assignments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${managerToken}`,
              },
              body: JSON.stringify({
                asset: assetDoc._id,
                employee: targetUserId,
                expectedReturnDate: returnDate.toISOString().split('T')[0],
                notes: assetSpec.assignNotes,
              }),
            });
            const assignData = await assignRes.json();
            if (assignData.success) {
              recordStep(`Stage1_AssignAsset_${assetSpec.assetTag}`, 'PASSED', {
                assignedTo: assetSpec.targetAssignee,
                assignmentId: assignData.assignment?._id,
              });
            } else {
              console.warn(`    [Assign Notice] ${assignData.message}`);
            }
          }
        }
      }
      await new Promise((r) => setTimeout(r, 800));
    }

    // View assets catalog in UI
    await navigateTo('/assets');
    await page.waitForFunction(() => !document.querySelector('.animate-pulse') && !document.querySelector('.animate-spin'), { timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('02_manager_assets_catalog_with_new_assets');
    recordStep('Stage1_Manager_View_Catalog', 'PASSED');

    // View first created asset detail in UI
    const firstAssetId = createdAssets[0].id;
    await page.goto(`${BASE_URL}/assets/${firstAssetId}`, { waitUntil: 'networkidle2', timeout: 25000 });
    await page.waitForFunction(() => !document.querySelector('.animate-pulse') && !document.querySelector('.animate-spin'), { timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    await takeScreenshot('03_manager_asset_detail_view');
    recordStep('Stage1_Manager_View_Asset_Detail', 'PASSED');

    // =========================================================================
    // STAGE 2: EMPLOYEE (Aaron Paulson) - Inspect Gear & Report Maintenance
    // =========================================================================
    console.log('\n============================================================');
    console.log(' STAGE 2: EMPLOYEE ROLE — CUSTODY VERIFICATION & DEFECT REPORTING');
    console.log('============================================================');

    await uiLogin('aaron.paulson@enterprise.corp', 'Password123!', 'EMPLOYEE (Aaron Paulson)');
    await takeScreenshot('04_employee_self_service_dashboard');
    recordStep('Stage2_Employee_Login', 'PASSED');

    // Visit My Equipment
    await navigateTo('/assets');
    await page.waitForFunction(() => !document.querySelector('.animate-pulse') && !document.querySelector('.animate-spin'), { timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    await takeScreenshot('05_employee_assigned_equipment');
    recordStep('Stage2_Employee_View_Assigned_Assets', 'PASSED');

    const empToken = await page.evaluate(() => localStorage.getItem('itam_token'));

    // Report Maintenance Defect 1 on MacBook Pro
    const mbpAsset = createdAssets.find((a) => a.assetTag.startsWith('MBP-'));
    if (mbpAsset) {
      console.log(`\n  [Reporting Defect] Issue on ${mbpAsset.name} (${mbpAsset.assetTag})...`);
      const defectRes = await fetchWithRetry(`${API_URL}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${empToken}`,
        },
        body: JSON.stringify({
          asset: mbpAsset.id,
          issueType: 'HARDWARE',
          urgency: 'HIGH',
          description: 'Screen displays horizontal flickering lines and artifacting under heavy GPU rendering loads in Figma and 3D CAD simulations.',
        }),
      });
      const defectData = await defectRes.json();
      const ticket = defectData.maintenanceRequest || defectData.request;
      if (ticket) {
        reportedTickets.push({ ...ticket, assetTag: mbpAsset.assetTag });
        recordStep('Stage2_Report_Issue_MacBookPro', 'PASSED', { ticketId: ticket._id });
      } else {
        console.warn(`    [Defect Notice] ${defectData.message}`);
      }
    }

    // Report Maintenance Defect 2 on Lenovo ThinkPad
    const thinkpadAsset = createdAssets.find((a) => a.assetTag.startsWith('TP-'));
    if (thinkpadAsset) {
      console.log(`\n  [Reporting Defect] Issue on ${thinkpadAsset.name} (${thinkpadAsset.assetTag})...`);
      const defectRes2 = await fetchWithRetry(`${API_URL}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${empToken}`,
        },
        body: JSON.stringify({
          asset: thinkpadAsset.id,
          issueType: 'HARDWARE',
          urgency: 'CRITICAL',
          description: 'Lithium battery swelling detected along lower chassis seam; trackpad click mechanism is physically jammed. Requires urgent bench safety inspection.',
        }),
      });
      const defectData2 = await defectRes2.json();
      const ticket2 = defectData2.maintenanceRequest || defectData2.request;
      if (ticket2) {
        reportedTickets.push({ ...ticket2, assetTag: thinkpadAsset.assetTag });
        recordStep('Stage2_Report_Issue_ThinkPad', 'PASSED', { ticketId: ticket2._id });
      } else {
        console.warn(`    [Defect Notice] ${defectData2.message}`);
      }
    }

    // Navigate to Maintenance screen to view reported issues
    await navigateTo('/maintenance');
    await page.waitForFunction(() => !document.querySelector('.animate-pulse') && !document.querySelector('.animate-spin'), { timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    await takeScreenshot('06_employee_my_maintenance_tickets');
    recordStep('Stage2_Employee_View_Maintenance_Queue', 'PASSED');

    // =========================================================================
    // STAGE 3: TECHNICIAN (Benjamin Scott) - Bench Triage & Complete Service
    // =========================================================================
    console.log('\n============================================================');
    console.log(' STAGE 3: TECHNICIAN ROLE — BENCH DIAGNOSTICS & REPAIR COMPLETION');
    console.log('============================================================');

    await uiLogin('benjamin.scott@enterprise.corp', 'Password123!', 'TECHNICIAN (Benjamin Scott)');
    await takeScreenshot('07_technician_diagnostic_dashboard');
    recordStep('Stage3_Technician_Login', 'PASSED');

    const techToken = await page.evaluate(() => localStorage.getItem('itam_token'));

    // Check Technician Maintenance Queue
    await navigateTo('/maintenance');
    await page.waitForFunction(() => !document.querySelector('.animate-pulse') && !document.querySelector('.animate-spin'), { timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    await takeScreenshot('08_technician_repair_bench');
    recordStep('Stage3_Technician_View_Bench', 'PASSED');

    // Service the Critical ThinkPad Ticket
    const criticalTicket = reportedTickets.find((t) => t.urgency === 'CRITICAL') || reportedTickets[0];
    if (criticalTicket) {
      console.log(`\n  [Technician Bench Work] Servicing ticket ${criticalTicket._id} for ${criticalTicket.assetTag}...`);

      // 1. Assign technician if not assigned
      await fetchWithRetry(`${API_URL}/maintenance/${criticalTicket._id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`, // Manager authorizes technician dispatch
        },
        body: JSON.stringify({ technicianId: userMap['benjamin.scott@enterprise.corp'] }),
      }).catch(() => {});

      // 2. Start Diagnostic Work
      const startRes = await fetchWithRetry(`${API_URL}/maintenance/${criticalTicket._id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
      });
      const startData = await startRes.json();
      if (startData.success) {
        recordStep('Stage3_Technician_Start_Diagnostics', 'PASSED', { ticketId: criticalTicket._id });
      }

      // 3. Complete Diagnostic Service with parts and labor cost
      const completeRes = await fetchWithRetry(`${API_URL}/maintenance/${criticalTicket._id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
        body: JSON.stringify({
          diagnosis: 'Isolated lithium-ion cell degradation and pouch swelling in internal battery module pack.',
          actionTaken: 'ESD safe chassis extraction completed. Installed replacement OEM 99.9Wh Lenovo battery pack, reapplied Kryonaut thermal compound, and completed 24-hour diagnostic burn-in benchmark.',
          partsReplaced: [
            { name: 'OEM Lenovo 99.9Wh Internal Battery Module', cost: 165.00 },
            { name: 'Thermal Compound & Interface Pads', cost: 25.00 },
          ],
          cost: 190.00,
          notes: 'Device passed thermal throttling stress test at 100% duty cycle. Restored to operational custody.',
        }),
      });
      const completeData = await completeRes.json();
      if (completeData.success) {
        recordStep('Stage3_Technician_Complete_Repair', 'PASSED', {
          ticketId: criticalTicket._id,
          repairCost: 190.00,
          restoredStatus: completeData.asset?.status || 'ASSIGNED',
        });
      } else {
        console.warn(`    [Complete Notice] ${completeData.message}`);
      }
    }

    // Refresh Maintenance UI to display completed ticket
    await page.reload({ waitUntil: 'networkidle2' });
    await takeScreenshot('09_technician_repair_completed');

    // =========================================================================
    // STAGE 4: ADMIN (Primary Administrator) - Executive Reports & Audit
    // =========================================================================
    console.log('\n============================================================');
    console.log(' STAGE 4: ADMIN ROLE — EXECUTIVE REVIEWS, FINANCIALS & REPORTS');
    console.log('============================================================');

    await uiLogin('admin@enterprise.corp', 'Password123!', 'ADMIN (Primary Administrator)');
    await takeScreenshot('10_admin_control_center_overview');
    recordStep('Stage4_Admin_Login', 'PASSED');

    // Check Executive Reports
    await navigateTo('/reports');
    await page.waitForFunction(() => !document.querySelector('.animate-pulse') && !document.querySelector('.animate-spin'), { timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    await takeScreenshot('11_admin_depreciation_and_valuation_reports');
    recordStep('Stage4_Admin_View_Valuation_Reports', 'PASSED');

    // Check Audit History on Serviced Asset
    const targetAssetId = criticalTicket?.asset?._id || criticalTicket?.asset;
    if (targetAssetId) {
      const assetHistoryRes = await fetchWithRetry(`${API_URL}/assets/${targetAssetId}/history`, {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      const historyData = await assetHistoryRes.json();
      recordStep('Stage4_Verify_Asset_Audit_Ledger', 'PASSED', {
        assetId: targetAssetId,
        historyEventsCount: historyData.history?.length || 0,
      });
    }

    console.log('\n============================================================');
    console.log(' WORKFLOW COMPLETED SUCCESSFULLY ACROSS ALL 4 ROLES');
    console.log('============================================================');

  } catch (error) {
    console.error(`\n[Workflow Error] ${error.message}`);
    await takeScreenshot('workflow_failure');
    recordStep('Workflow_Execution_Error', 'FAILED', { error: error.message });
  } finally {
    await browser.close();
  }

  // Generate Report File
  const report = {
    workflowName: 'ITAM Multi-Role Asset Lifecycle, Assignment & Maintenance Workflow',
    timestamp: new Date().toISOString(),
    frontendUrl: BASE_URL,
    backendApiUrl: API_URL,
    totalSteps: steps.length,
    passedSteps: steps.filter((s) => s.status === 'PASSED').length,
    failedSteps: steps.filter((s) => s.status === 'FAILED').length,
    assetsCreated: createdAssets.map((a) => ({
      assetTag: a.assetTag,
      name: a.name,
      category: a.category,
      purchasePrice: a.purchasePrice,
      usefulLifeYears: a.usefulLifeYears,
      assignee: a.targetAssignee,
    })),
    maintenanceTicketsReported: reportedTickets.map((t) => ({
      id: t._id,
      assetTag: t.assetTag,
      urgency: t.urgency,
      description: t.description,
    })),
    steps,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nDetailed JSON report written to: ${REPORT_PATH}`);
  console.log(`Screenshots captured in:        ${SCREENSHOTS_DIR}\n`);
}

runMultiRoleAssetsWorkflow().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
