import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBrowserPath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('No Chrome or Edge found');
}

const outDir = path.join(__dirname, 'reports', 'diagrams');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const htmlTemplate = (content, title, subtitle) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Calibri:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FFFFFF;
      color: #1B2A2E;
      font-family: 'Calibri', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 1200px;
      min-height: 700px;
    }
    .container {
      width: 100%;
      background: #F4FAF9;
      border: 1.5px solid #D7E7E5;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 168, 150, 0.08);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1.5px solid #D7E7E5;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #1B2A2E;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #00A896;
    }
    .badge {
      background: #E0F2F1;
      color: #00796B;
      border: 1px solid #B2DFDB;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .grid {
      display: grid;
      gap: 16px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #D7E7E5;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .card-title {
      font-size: 14px;
      font-weight: 700;
      color: #028090;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #EBF5F4;
      padding-bottom: 6px;
    }
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .tag {
      background: #F4FAF9;
      color: #2D3E42;
      border: 1px solid #D7E7E5;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11.5px;
      font-weight: 600;
    }
    .tag-accent {
      background: #E6F7F5;
      color: #00796B;
      border-color: #A2E3DA;
    }
    .arrow {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #00A896;
      font-size: 22px;
      font-weight: bold;
      line-height: 1.2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">
        <span class="dot"></span>
        ${title}
      </div>
      <div class="badge">${subtitle || 'ITAM ENTERPRISE SPECIFICATION'}</div>
    </div>
    ${content}
  </div>
</body>
</html>`;

async function render() {
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 740, deviceScaleFactor: 2 });

  // 1. Architecture Diagram (Consistent Light Teal Palette)
  const archContent = `
    <div class="grid" style="grid-template-columns: 1fr auto 1.2fr auto 1fr; align-items: stretch;">
      <!-- Client Tier -->
      <div class="card" style="border-top: 4px solid #00A896;">
        <div class="card-title">🌐 Client Tier (React 19)</div>
        <p style="font-size:12px; color:#5A6E72; margin-bottom:10px;">High-speed SPA with concurrent updates & zero eye fatigue UI.</p>
        <div class="tag-list">
          <span class="tag tag-accent">React 19.2</span>
          <span class="tag tag-accent">Vite 8.3</span>
          <span class="tag">Tailwind CSS v4</span>
          <span class="tag">Lucide Icons</span>
          <span class="tag">Recharts 3.10</span>
          <span class="tag">AuthContext</span>
          <span class="tag">ThemeContext</span>
          <span class="tag">NotificationContext</span>
          <span class="tag">Axios Bearer Interceptor</span>
          <span class="tag">Command Palette (Ctrl+K)</span>
        </div>
      </div>

      <div class="arrow">⇄<br><span style="font-size:10px; color:#00796B; font-weight:normal;">REST JSON</span></div>

      <!-- Application Tier -->
      <div class="card" style="border-top: 4px solid #028090;">
        <div class="card-title">⚙️ Application Tier (Express 4)</div>
        <p style="font-size:12px; color:#5A6E72; margin-bottom:10px;">Decoupled MVC pipeline, RBAC authorization & financial engines.</p>
        <div class="tag-list">
          <span class="tag tag-accent">Node.js (18 / 20 LTS)</span>
          <span class="tag tag-accent">Express.js 4.21</span>
          <span class="tag">JWT Stateless Auth</span>
          <span class="tag">RBAC Role Guards</span>
          <span class="tag">Depreciation Service</span>
          <span class="tag">FSM Asset Rules Engine</span>
          <span class="tag">History Audit Service</span>
          <span class="tag">Helmet & Mongo-Sanitize</span>
          <span class="tag">56 REST Endpoints</span>
        </div>
      </div>

      <div class="arrow">⇄<br><span style="font-size:10px; color:#00796B; font-weight:normal;">Mongoose ODM</span></div>

      <!-- Data Tier -->
      <div class="card" style="border-top: 4px solid #1B2A2E;">
        <div class="card-title">🗄️ Data Tier (MongoDB / Mongoose)</div>
        <p style="font-size:12px; color:#5A6E72; margin-bottom:10px;">NoSQL clustered store with compound indexing & integrity rules.</p>
        <div class="tag-list">
          <span class="tag tag-accent">MongoDB (Atlas / local)</span>
          <span class="tag tag-accent">Mongoose 8.9</span>
          <span class="tag">9 Collections</span>
          <span class="tag">Compound Indexes</span>
          <span class="tag">Unique Asset Tags</span>
          <span class="tag">Referential Integrity Guards</span>
          <span class="tag">Zero Dummy Data</span>
        </div>
      </div>
    </div>

    <!-- Testing Tier Banner -->
    <div class="card" style="margin-top:16px; border-top: 4px solid #F59E0B; background:#FFFFFF;">
      <div class="card-title" style="color:#B45309;">🛡️ Automated Quality Assurance Harness (Dual Newman & Puppeteer Suites)</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
        <div style="font-size:12px; color:#2D3E42; line-height:1.5;">
          <strong style="color:#028090;">Postman API Suite (Newman CLI):</strong><br>
          • 46+ REST Requests, 47+ strict schema & RBAC assertions.<br>
          • Automated token injection, lifecycle state transitions & depreciation math checks.
        </div>
        <div style="font-size:12px; color:#2D3E42; line-height:1.5;">
          <strong style="color:#028090;">Puppeteer Frontend E2E Suite:</strong><br>
          • 10 sequential browser user journeys across all screens, modals & forms.<br>
          • Visual screenshot captures & automated anomaly diagnostics in <code>tests/reports/</code>.
        </div>
      </div>
    </div>
  `;
  await page.setContent(htmlTemplate(archContent, 'System Architecture & Data Flow Model', '3-TIER + AUTOMATED QA HARNESS'));
  await page.screenshot({ path: path.join(outDir, 'architecture_diagram.png'), fullPage: true });
  console.log('Rendered consistent architecture_diagram.png');

  // 2. Use Case Diagram
  const useCaseContent = `
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:14px;">
      <!-- Admin -->
      <div class="card" style="border-top: 3.5px solid #00A896;">
        <div class="card-title" style="color:#00796B;">👑 Master Admin</div>
        <p style="font-size:11px; color:#5A6E72; margin-bottom:8px;">System Governance & Setup</p>
        <ul style="font-size:11.5px; color:#1B2A2E; padding-left:14px; line-height:1.6;">
          <li>Bootstrap Master Account</li>
          <li>Provision Staff Directory</li>
          <li>Create/Manage Departments</li>
          <li>Global Asset CRUD & Status</li>
          <li>Executive Valuation Reports</li>
          <li>Deactivate / Delete Records</li>
        </ul>
      </div>

      <!-- Asset Manager -->
      <div class="card" style="border-top: 3.5px solid #028090;">
        <div class="card-title" style="color:#028090;">💼 Asset Manager</div>
        <p style="font-size:11px; color:#5A6E72; margin-bottom:8px;">Fleet & License Controller</p>
        <ul style="font-size:11.5px; color:#1B2A2E; padding-left:14px; line-height:1.6;">
          <li>Register Hardware / Licenses</li>
          <li>Allocate Digital Seats</li>
          <li>Approve / Reject Requests</li>
          <li>Fulfill Approved Gear Tickets</li>
          <li>Dispatch Maintenance Tickets</li>
          <li>Depreciation & Amortization</li>
        </ul>
      </div>

      <!-- Technician -->
      <div class="card" style="border-top: 3.5px solid #F59E0B;">
        <div class="card-title" style="color:#B45309;">🔧 Technician</div>
        <p style="font-size:11px; color:#5A6E72; margin-bottom:8px;">Diagnostics & Service</p>
        <ul style="font-size:11.5px; color:#1B2A2E; padding-left:14px; line-height:1.6;">
          <li>Diagnostic Bench Queue</li>
          <li>Claim Defect Tickets</li>
          <li>Begin Diagnostics (IN_PROGRESS)</li>
          <li>Log Replaced Parts & Cost</li>
          <li>Restore Asset to Operational</li>
          <li>Inspect Technical History</li>
        </ul>
      </div>

      <!-- Employee -->
      <div class="card" style="border-top: 3.5px solid #10B981;">
        <div class="card-title" style="color:#059669;">👤 Staff Employee</div>
        <p style="font-size:11px; color:#5A6E72; margin-bottom:8px;">End-User Custodian</p>
        <ul style="font-size:11.5px; color:#1B2A2E; padding-left:14px; line-height:1.6;">
          <li>View Assigned Custody Deck</li>
          <li>Submit Gear Requisitions</li>
          <li>Cancel Pending Requests</li>
          <li>Report Equipment Defects</li>
          <li>Initiate Return Handover</li>
          <li>Receive Notification Alerts</li>
        </ul>
      </div>
    </div>

    <div class="card" style="margin-top:14px; background:#FFFFFF; border:1px solid #D7E7E5;">
      <div style="display:flex; justify-content:space-around; align-items:center; font-size:12px; color:#3E5C58;">
        <div>🔄 <strong>FSM Handover Guard:</strong> Condition routes return to AVAILABLE or MAINTENANCE</div>
        <div>🔐 <strong>RBAC Guard:</strong> JWT Bearer verification + authorize() middleware on every route</div>
        <div>📜 <strong>Audit Guard:</strong> Immutable AssetHistory logging on all lifecycle events</div>
      </div>
    </div>
  `;
  await page.setContent(htmlTemplate(useCaseContent, 'Actor Roles & Operational Use Cases', 'ROLE-BASED ACCESS CONTROL (RBAC) DOMAIN'));
  await page.screenshot({ path: path.join(outDir, 'use_case_diagram.png'), fullPage: true });
  console.log('Rendered consistent use_case_diagram.png');

  // 3. ER Diagram
  const erContent = `
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:14px;">
      <!-- Row 1: Core Identity & Asset -->
      <div class="card">
        <div class="card-title">👤 User (Identity)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>_id:</strong> ObjectId (Primary Key)<br>
          • <strong>name, email:</strong> String (unique, regex)<br>
          • <strong>role:</strong> ADMIN | ASSET_MANAGER | TECH | EMPLOYEE<br>
          • <strong>department:</strong> ObjectId &rarr; Department<br>
          • <strong>isActive:</strong> Boolean (default true)
        </div>
      </div>

      <div class="card">
        <div class="card-title">🏢 Department (Organization)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>_id:</strong> ObjectId (Primary Key)<br>
          • <strong>name:</strong> String (unique, trim)<br>
          • <strong>description:</strong> String<br>
          • <strong>head:</strong> ObjectId &rarr; User<br>
          • <em>Integrity check: blocks deletion if assets/users attached</em>
        </div>
      </div>

      <div class="card" style="border-left: 3.5px solid #00A896;">
        <div class="card-title">💻 Asset (Fleet Registry)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>_id:</strong> ObjectId (Primary Key)<br>
          • <strong>assetTag:</strong> String (unique, indexed)<br>
          • <strong>assetType:</strong> PHYSICAL | DIGITAL<br>
          • <strong>status:</strong> AVAILABLE | ASSIGNED | MAINTENANCE...<br>
          • <strong>assignedTo:</strong> ObjectId &rarr; User<br>
          • <strong>depreciation:</strong> { usefulLifeYears, method }<br>
          • <strong>digitalDetails:</strong> { seatsTotal, allocatedUsers }
        </div>
      </div>

      <!-- Row 2: Operational Workflows -->
      <div class="card">
        <div class="card-title">🤝 Assignment (Custody)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>_id:</strong> ObjectId (Primary Key)<br>
          • <strong>asset:</strong> ObjectId &rarr; Asset<br>
          • <strong>employee:</strong> ObjectId &rarr; User<br>
          • <strong>assignedBy:</strong> ObjectId &rarr; User<br>
          • <strong>returnCondition:</strong> NEW | GOOD | FAIR | POOR<br>
          • <strong>isActive:</strong> Boolean (Compound Index)
        </div>
      </div>

      <div class="card">
        <div class="card-title">📝 AssetRequest (Requisitions)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>_id:</strong> ObjectId (Primary Key)<br>
          • <strong>requester:</strong> ObjectId &rarr; User<br>
          • <strong>category:</strong> Enum (ASSET_CATEGORIES)<br>
          • <strong>priority:</strong> LOW | MEDIUM | HIGH | URGENT<br>
          • <strong>status:</strong> PENDING | APPROVED | FULFILLED...<br>
          • <strong>fulfilledAsset:</strong> ObjectId &rarr; Asset
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔧 MaintenanceRequest (Defects)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>_id:</strong> ObjectId (Primary Key)<br>
          • <strong>asset:</strong> ObjectId &rarr; Asset<br>
          • <strong>reportedBy:</strong> ObjectId &rarr; User<br>
          • <strong>assignedTechnician:</strong> ObjectId &rarr; User<br>
          • <strong>status:</strong> REPORTED | IN_PROGRESS | COMPLETED<br>
          • <strong>urgency:</strong> LOW | MEDIUM | HIGH | CRITICAL
        </div>
      </div>

      <!-- Row 3: Records, Audit & Notifications -->
      <div class="card">
        <div class="card-title">🛠️ MaintenanceRecord (Repairs)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>maintenanceRequest:</strong> ObjectId &rarr; Ticket<br>
          • <strong>technician:</strong> ObjectId &rarr; User<br>
          • <strong>diagnosis, actionTaken:</strong> String<br>
          • <strong>partsReplaced:</strong> [{ name, cost }]<br>
          • <strong>cost:</strong> Number (Total cumulative spend)
        </div>
      </div>

      <div class="card">
        <div class="card-title">📜 AssetHistory (Audit Ledger)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>asset:</strong> ObjectId &rarr; Asset (indexed)<br>
          • <strong>action:</strong> HISTORY_ACTIONS enum<br>
          • <strong>performedBy:</strong> ObjectId &rarr; User<br>
          • <strong>timestamp:</strong> Date (Compound Index desc)<br>
          • <strong>details:</strong> Mixed (Immutable snapshot)
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔔 Notification (In-App Alerts)</div>
        <div style="font-size:11.5px; color:#2D3E42; line-height:1.6;">
          • <strong>recipient:</strong> ObjectId &rarr; User<br>
          • <strong>type:</strong> NOTIFICATION_TYPES enum<br>
          • <strong>title, message:</strong> String<br>
          • <strong>isRead:</strong> Boolean (Compound Index)<br>
          • <strong>relatedId, relatedType:</strong> Polymorphic ref
        </div>
      </div>
    </div>
  `;
  await page.setContent(htmlTemplate(erContent, 'Database Schema & 9 Mongoose Models Specification', 'RELATIONAL INTEGRITY & SCHEMA SPECIFICATION'));
  await page.screenshot({ path: path.join(outDir, 'er_diagram.png'), fullPage: true });
  console.log('Rendered consistent er_diagram.png');

  // 4. UI Design System Overview Collage
  const uiContent = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
      <div class="card" style="border-top:3.5px solid #00A896;">
        <div class="card-title">🎨 Syntropic Asset OS Tokens</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; font-size:12px; margin-top:8px;">
          <div style="background:#FFFFFF; padding:10px; border-radius:6px; border:1px solid #D7E7E5;">
            <strong style="color:#028090;">Canvas Midnight Slate</strong><br>
            <code>#150F29 / #0B0F17</code><br>
            <span style="font-size:11px; color:#5A6E72;">Zero eye strain dark mode</span>
          </div>
          <div style="background:#FFFFFF; padding:10px; border-radius:6px; border:1px solid #D7E7E5;">
            <strong style="color:#1B2A2E;">Elevated Surface</strong><br>
            <code>#211C36 / #2C2641</code><br>
            <span style="font-size:11px; color:#5A6E72;">Tonal depth cards & rails</span>
          </div>
          <div style="background:#E6F7F5; padding:10px; border-radius:6px; border:1px solid #A2E3DA;">
            <strong style="color:#00796B;">Primary Indigo / Teal</strong><br>
            <code>#574BFF / #00A896</code><br>
            <span style="font-size:11px; color:#5A6E72;">High-intent action focus</span>
          </div>
          <div style="background:#ECFDF5; padding:10px; border-radius:6px; border:1px solid #A7F3D0;">
            <strong style="color:#059669;">Emerald Pulse</strong><br>
            <code>#10B981</code><br>
            <span style="font-size:11px; color:#5A6E72;">Available fleet status & health</span>
          </div>
        </div>
      </div>

      <div class="card" style="border-top:3.5px solid #028090;">
        <div class="card-title">⚡ Ergonomic Component Suite</div>
        <ul style="font-size:12px; color:#1B2A2E; padding-left:16px; line-height:1.7;">
          <li><strong>AppShell Layout</strong>: Collapsible drawer & desktop sidebar rail with route guards.</li>
          <li><strong>Command Palette (Ctrl+K)</strong>: Keyboard-driven instant navigation & entity search.</li>
          <li><strong>QuickActionMenu</strong>: Context-aware header dropdown for instant 1-click workflows.</li>
          <li><strong>NotificationBell</strong>: Background 30s polling badge with 1-click mark-all-read.</li>
          <li><strong>ThemeToggle</strong>: 3 modes (Arctic Light, Obsidian Dark, System Sync).</li>
          <li><strong>Recharts Analytics</strong>: Status donut charts, department density & valuation trends.</li>
        </ul>
      </div>
    </div>

    <div class="card" style="margin-top:14px; background:#FFFFFF; border:1px solid #D7E7E5;">
      <div style="font-size:12px; color:#3E5C58; text-align:center;">
        Designed for high-frequency enterprise IT operations: Tabular numeric alignment (<code>tabular-nums</code>) prevents financial column wobble; zero dummy data architecture ensures every metric reflects real database documents.
      </div>
    </div>
  `;
  await page.setContent(htmlTemplate(uiContent, 'Syntropic Asset OS — UI/UX Design System', 'DESIGN TOKENS & ERGONOMIC WORKFLOWS'));
  await page.screenshot({ path: path.join(outDir, 'ui_design_overview.png'), fullPage: true });
  console.log('Rendered consistent ui_design_overview.png');

  // 5. State Machine Diagram
  const smContent = `
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:16px;">
      <!-- Available -->
      <div class="card" style="border-top:4px solid #00A896;">
        <div class="card-title" style="color:#00796B;">🟢 AVAILABLE (Pool Buffer)</div>
        <p style="font-size:12px; color:#2D3E42; line-height:1.5;">Unit registered in warehouse pool with active warranty and clean operational condition.</p>
        <div class="tag-list">
          <span class="tag tag-accent">&rarr; ASSIGNED (Allocate to Staff)</span>
          <span class="tag">&rarr; MAINTENANCE (Defect in Pool)</span>
          <span class="tag">&rarr; RETIRED (Decommission)</span>
        </div>
      </div>

      <!-- Assigned -->
      <div class="card" style="border-top:4px solid #028090;">
        <div class="card-title" style="color:#028090;">🔵 ASSIGNED (Active Custody)</div>
        <p style="font-size:12px; color:#2D3E42; line-height:1.5;">Deployed to staff custodian with expected return date and tracked department allocation.</p>
        <div class="tag-list">
          <span class="tag tag-accent">&rarr; RETURNED (Check-in / Handover)</span>
          <span class="tag">&rarr; MAINTENANCE (Defect Reported)</span>
        </div>
      </div>

      <!-- Returned -->
      <div class="card" style="border-top:4px solid #D97706;">
        <div class="card-title" style="color:#B45309;">🟡 RETURNED (Condition Triage)</div>
        <p style="font-size:12px; color:#2D3E42; line-height:1.5;">Temporary check-in holding state evaluated automatically against return condition.</p>
        <div class="tag-list">
          <span class="tag tag-accent">&rarr; AVAILABLE (NEW / GOOD / FAIR)</span>
          <span class="tag">&rarr; MAINTENANCE (POOR / DAMAGED)</span>
        </div>
      </div>

      <!-- Maintenance -->
      <div class="card" style="border-top:4px solid #EF4444;">
        <div class="card-title" style="color:#B91C1C;">🔴 MAINTENANCE (Bench Diagnostic)</div>
        <p style="font-size:12px; color:#2D3E42; line-height:1.5;">In diagnostic bench queue. Parts and labor logged prior to operational restoration.</p>
        <div class="tag-list">
          <span class="tag tag-accent">&rarr; ASSIGNED (If prior active owner)</span>
          <span class="tag">&rarr; AVAILABLE (If unassigned pool)</span>
        </div>
      </div>

      <!-- Retired -->
      <div class="card" style="border-top:4px solid #8B5CF6;">
        <div class="card-title" style="color:#6D28D9;">🟣 RETIRED (Decommissioned)</div>
        <p style="font-size:12px; color:#2D3E42; line-height:1.5;">End-of-life hardware. Decommission guard: Unit must be returned prior to retirement.</p>
        <div class="tag-list">
          <span class="tag tag-accent">&rarr; DISPOSED (Certified E-Waste)</span>
        </div>
      </div>

      <!-- Disposed -->
      <div class="card" style="border-top:4px solid #64748B;">
        <div class="card-title" style="color:#475569;">⚫ DISPOSED (Terminal State)</div>
        <p style="font-size:12px; color:#2D3E42; line-height:1.5;">Irreversible terminal state for certified e-waste recycling, scrap, or donation handover.</p>
        <div class="tag-list">
          <span class="tag">Terminal Node (No Exits)</span>
        </div>
      </div>
    </div>

    <!-- State Guard Rules Banner -->
    <div class="card" style="background:#FFFFFF; border:1px solid #D7E7E5;">
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; font-size:12px; color:#2D3E42;">
        <div>🔒 <strong>Decommission Guard:</strong> Cannot transition to RETIRED or DISPOSED if asset is currently assigned.</div>
        <div>⚖️ <strong>Auto-Routing Guard:</strong> Handover inspection routes cleanly to AVAILABLE vs MAINTENANCE.</div>
        <div>📜 <strong>Immutable Audit Trail:</strong> Every transition creates an append-only snapshot in <code>AssetHistory</code>.</div>
      </div>
    </div>
  `;
  await page.setContent(htmlTemplate(smContent, 'Asset Lifecycle State Machine (FSM)', 'FINITE STATE TRANSITION RULES & GUARDS'));
  await page.screenshot({ path: path.join(outDir, 'state_machine_diagram.png'), fullPage: true });
  console.log('Rendered consistent state_machine_diagram.png');

  await browser.close();
  console.log('All diagrams re-rendered in consistent light enterprise theme!');
}

render().catch(err => {
  console.error('Rendering error:', err);
  process.exit(1);
});
