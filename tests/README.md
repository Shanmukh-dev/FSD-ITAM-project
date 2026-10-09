# ITAM Automated Testing Infrastructure (Postman & Puppeteer)

This directory contains the testing suites, CLI runners, and quality assurance workflows for the IT Asset Management (ITAM) platform.

---

## 1. Directory Structure

```
tests/
├── e2e/                               # Puppeteer Frontend E2E Suite
│   ├── puppeteer-suite.js             # 10+ Screen flows, forms, modals, assertions
│   └── run-e2e.js                     # CLI runner with health checks & reporting
├── postman/                           # Newman Postman Backend API Suite
│   ├── itam_api_collection.json       # Complete v2.1 Postman collection (~50 endpoints)
│   ├── itam_api_environment.json      # Local environment variables
│   └── run-postman.js                 # CLI runner with health checks & reporting
├── reports/                           # Output directory for test runs
│   ├── screenshots/                   # PNG screenshots captured during E2E runs
│   ├── postman-report.json            # JSON results from Postman runs
│   └── e2e-report.json                # JSON results from Puppeteer runs
├── run-all-tests.js                   # Unified runner executing both suites
└── package.json                       # Testing dependencies (newman, puppeteer-core)
```

---

## 2. Test Execution Commands

### Prerequisites
Make sure the backend and frontend are running:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

### Running Tests from Project Root
```bash
# Run Postman API tests only
npm run test:api

# Run Puppeteer E2E tests only
npm run test:e2e

# Run both suites sequentially
npm run test:all
```

### CLI Options for Puppeteer
```bash
# Run with visible browser window (headed mode) and slow-motion:
node tests/e2e/run-e2e.js --headed
```

---

## 3. Dedicated QA Sub-Agents

Two specialized sub-agents are configured for this project:

| Sub-Agent | Role | Workflow Executed | Output & Report |
| :--- | :--- | :--- | :--- |
| **`Gabrille`** | Backend QA Engineer | `node tests/postman/run-postman.js` | Analyzes endpoint failures, checks controller/model logic, reports bugs |
| **`Linda`** | Frontend QA Engineer | `node tests/e2e/run-e2e.js` | Analyzes DOM errors, inspects screenshots in `reports/screenshots/`, reports UI bugs |

### Sub-Agent Triggering Policy
- **Never triggered automatically**: Sub-agents are triggered only when major changes are introduced to the codebase.
- **Mandatory User Confirmation**: The AI assistant will always ask the user for confirmation before invoking these sub-agents.
