# ISMS 2.0 - Integrated Skill Management System
> **Government of Rajasthan | RSLDC (Rajasthan Skill and Livelihoods Development Corporation)**

---

## 📖 Complete Master Architecture & Developer Guide

The entire end-to-end instructions, working flow, file structure, centralized mock data control, role workflows, and developer tutorials are documented in a single comprehensive master file:

👉 **[PROJECT_ARCHITECTURE_AND_WORKFLOW_GUIDE.md](./PROJECT_ARCHITECTURE_AND_WORKFLOW_GUIDE.md)**

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
