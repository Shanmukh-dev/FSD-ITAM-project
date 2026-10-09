# ITAM Project Rules: Automated Testing Workflows & Sub-Agent Triggers

> **Scope**: This rule file applies strictly to this IT Asset Management (ITAM) workspace alone.

---

## 1. Project Knowledge Base & Single Source of Truth Directive (MANDATORY)

1. **Always Consult `README.md` for Any Project Details**:
   - The [`README.md`](file:///C:/TSSV/Group%20Presentation/3rd%20Year/Sem%205/FSD/Project/README.md) file is the **authoritative single source of truth** for the entire project.
   - Whenever an assistant, developer, or sub-agent requires information regarding:
     - Architecture, tech stack, and zero-dummy-data principles
     - Role-based permissions matrix (`ADMIN`, `ASSET_MANAGER`, `TECHNICIAN`, `EMPLOYEE`)
     - Asset lifecycle state transitions and guard logic
     - Financial straight-line depreciation formulas and parameters
     - Complete REST API route specifications, query parameters, and payload schemas (~50 endpoints)
     - Database collections, schemas, indexes, and relationship models
     - Frontend design tokens, layout hierarchy, and context providers
     - Automated testing procedures (Postman Newman and Puppeteer E2E)
   - They **MUST FIRST READ AND CONSULT `README.MD`** before formulating answers, proposing modifications, or making architectural assumptions.
   - Never guess or fabricate API routes, field names, or schema contracts without verifying them against `README.md`.

---

## 2. Project Overview & Testing Architecture

This project includes dual automated quality assurance workflows located in `tests/`:
- **Postman API Test Suite** (`tests/postman/`): Newman CLI runner verifying ~50 Express REST endpoints, role permissions, CRUD lifecycles, and straight-line depreciation math.
- **Puppeteer Frontend E2E Suite** (`tests/e2e/`): End-to-end browser automation suite verifying all 10+ frontend screens, forms, modals, tables, charts, and notification interactions.

Three specialized sub-agents are defined for this project:
- **`Lucy`** (UI/UX Designer): Analyzes application UI screenshots in `tests/reports/screenshots/`, critiques UX flows, uses Google Stitch MCP, and designs/modernizes components for minimal click fatigue, low cognitive load, and premium visual feedback.
- **`Gabrille`** (Backend QA): Executes `node tests/postman/run-postman.js`, evaluates API responses, traces any endpoint failures to `server/src/`, and reports structured backend bug reports.
- **`Linda`** (Frontend QA): Executes `node tests/e2e/run-e2e.js`, inspects failure screenshots in `tests/reports/screenshots/`, checks DOM/console errors, and reports structured UI bug reports.

---

## 3. Triggering Protocol for Sub-Agents (MANDATORY)

1. **Only Trigger on Major Codebase Changes**:
   Sub-agents MUST ONLY be triggered when major changes have been applied to the codebase. Major changes include:
   - Modifying or adding backend API routes, controllers, services, middleware, or Mongoose models.
   - Modifying or adding frontend pages, components, routers, auth contexts, or state logic.
   - Significant refactoring of asset state transitions, depreciation formulas, or database schemas.

2. **Always Ask the User First**:
   - The assistant **MUST NOT** trigger `Gabrille` or `Linda` automatically.
   - Before invoking any sub-agent, the assistant **MUST EXPLICITLY ASK THE USER FOR PERMISSION** (using `ask_question` or a clear prompt).
   - The prompt must present clear options (e.g., Run both QA sub-agents (Gabrille & Linda), Run Gabrille (Backend QA only), Run Linda (Frontend QA only), or Skip testing).

3. **Sub-Agent Execution & Bug Reporting Workflow**:
   - Once the user confirms, the assistant invokes the chosen sub-agent(s) via `invoke_subagent`.
   - The sub-agent runs the respective workflow (`run-postman.js` or `run-e2e.js`).
   - If bugs, regressions, or broken assertions are found, the sub-agent isolates the root cause (file name and line numbers) and reports the structured bug report back to the main assistant.
   - The main assistant reviews the sub-agent's findings, informs the user, and prepares targeted fixes.
