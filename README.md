# ISMS 2.0 - Integrated Skill Management System
> **Government of Rajasthan | RSLDC (Rajasthan Skill and Livelihoods Development Corporation)**

---

## 📖 Complete Master Architecture & Developer Guide

The entire end-to-end instructions, working flow, file structure, centralized mock data control, role workflows, and developer tutorials are documented in a single comprehensive master file:

👉 **[PROJECT_ARCHITECTURE_AND_WORKFLOW_GUIDE.md](./PROJECT_ARCHITECTURE_AND_WORKFLOW_GUIDE.md)**

## Before you add or change a screen (developers and AI tools)

Every screen is built from the shared UI kit in `src/app/shared`; nothing is designed per page. Read **[AGENTS.md](./AGENTS.md)** (one page), then:

```bash
npm install                                          # also installs the git hooks
npm run new:page -- list <feature>/<name> "Title"    # start a new page from the kit (also: master, document)
npm run verify                                       # UI rules + type check + unit tests, before every push
```

The UI rules are checked on commit, on every pull request and on deploy (guide, section 17).

### Quick Reference of What is in the Guide:
1. **Quick Start & Running the App** (`npm start`, ports, credentials)
2. **Centralized Mock System (The Master Switch)**: Controlled via `src/environments/environment.ts` (`useMockData: true / false`)
3. **Application Architecture & Data Flow** (`DataEngineService`, `MockDatabaseService`, `HttpService`)
4. **User Roles & Workflows**: Super Admin, Dept Admin (6-digit OTP), Training Partner (OTR), New User
5. **Project File Structure & File Roles**: File-by-file explanation of every directory
6. **Developer Guide: How to Add a New Scheme**: Code method and Super Admin UI method
7. **Developer Guide: How to Add a New Table Column**: Plain text, numeric, and custom template columns
8. **Developer Guide: How to Add a New Screen**: Step-by-step feature component, route, and menu linking
9. **Document & PDF Viewer System**: Authentic Rajasthan Government statutory certificate & A4 viewer
10. **Connecting Real Backend REST APIs**: Seamless migration to Spring Boot / Node.js
11. **Troubleshooting & FAQ**
12. **Engineering conventions, UI kit rules, route map, performance rules** (sections 13 to 16)
13. **Team workflow: how the shared-component rules are enforced** (section 17)

---

## Development Server

To start the local development server:
```bash
npm start
# OR
npx ng serve --port 4200
```
Navigate to `http://localhost:4200/`.

## Production Build

To verify build integrity:
```bash
npx ng build
```
Builds cleanly with zero TypeScript errors.
