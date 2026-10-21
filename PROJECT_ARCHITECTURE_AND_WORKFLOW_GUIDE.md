# ISMS 2.0 - Complete Architecture, Workflow & Developer Guide

> **Integrated Skill Management System (ISMS 2.0)**  
> **Government of Rajasthan | RSLDC (Rajasthan Skill and Livelihoods Development Corporation)**  
> **Master Technical Documentation & Onboarding Manual for Developers**

---

## 📑 Table of Contents
1. [Quick Start & How to Run](#1-quick-start--how-to-run)
2. [Executive Overview & Tech Stack](#2-executive-overview--tech-stack)
3. [Centralized Mock System (The Master Switch)](#3-centralized-mock-system-the-master-switch)
4. [Application Architecture & Data Flow](#4-application-architecture--data-flow)
5. [User Roles & Complete End-to-End Workflows](#5-user-roles--complete-end-to-end-workflows)
6. [Complete Project File Structure & File Roles](#6-complete-project-file-structure--file-roles)
7. [Developer Guide 1: How to Add a New Scheme](#7-developer-guide-1-how-to-add-a-new-scheme)
8. [Developer Guide 2: How to Add / Customize Table Columns](#8-developer-guide-2-how-to-add--customize-table-columns)
9. [Developer Guide 3: How to Add a New Screen / Feature](#9-developer-guide-3-how-to-add-a-new-screen--feature)
10. [Document & PDF Viewer System (Statutory Certificates & Seals)](#10-document--pdf-viewer-system)
11. [Connecting Real Backend REST APIs (Spring Boot / Node.js)](#11-connecting-real-backend-rest-apis)
12. [Troubleshooting & Frequently Asked Questions (FAQ)](#12-troubleshooting--faq)
13. [Engineering Conventions (Component Structure, State, Storage, Testing)](#13-engineering-conventions)
14. [UI Kit Rules (Every Screen Uses the Shared Components)](#14-ui-kit-rules-every-screen-uses-the-shared-components)
15. [Screen & Route Map](#15-screen--route-map)
16. [Performance & Bundle Rules](#16-performance--bundle-rules)
17. [Team Workflow: Keeping Every Screen on the Kit](#17-team-workflow-keeping-every-screen-on-the-kit-developers-and-ai-tools)

---

## 1. Quick Start & How to Run

### Prerequisites
- **Node.js**: v20.x or newer
- **Angular CLI**: v21 (`@angular/cli`)

### Run Development Server
```bash
# Navigate to the project folder
cd "d:\ISMS\ISMS Frontend\ISMS2.0"

# Install dependencies (if fresh clone)
npm install

# Start development server
npm start
# OR
npx ng serve --port 4200
```
Open your browser at `http://localhost:4200`.

### Production Build, Type Check, Tests and UI Guard
```bash
npx ng build                                   # production build into dist/isms-ui
npx ngc -p tsconfig.app.json --noEmit          # fast type + template check, writes nothing
npx ng test --no-watch                         # Vitest unit tests (single run)
npm run check:ui                               # UI guard: fails on hand-written UI (see section 14)
```
*(`ngc --noEmit` catches TypeScript and template errors without touching `dist`, so it is safe to run while a build is in progress.)*

If the dev server shows an icon-name error or a screen that does not match the code, it is stale (a new file or folder was added while it ran). Stop it and run `npm start` again.

### Test Credentials (Built-in Auth Switcher)
Sign in on `/sso-login` and pick the role, or switch roles from the user menu in the top bar. The session is a JSON `isms_user` entry in `localStorage` (managed by `AuthService`), so a role can also be seeded from the browser console for testing.
| Role Name | Role ID | Default Access |
|---|---|---|
| **Super Admin** | `super_admin` | EOI configuration, Admin Masters, Two Step Verification, Dynamic Form Builder, User / Role / Permission management |
| **Department User** | `dept_admin` | 6-digit OTP, EOI responses, scrutiny desk, sanction order, MoU, IPA, SDC and batch approvals, grievances, camera monitoring |
| **Training Partner** | `existing_user` | Active schemes, 4-step OTR registration, EOI application, tender status, sanction order and IPA (view), SDC, batches, aspirants, grievances, history |
| **New User** | `new_user` | Active schemes, payment history and a mandatory OTR profile prompt |
| **Aspirant** | `aspirant` | Training calendar, expressed interest, profile (a profile prompt shows on first visit) |

---

## 2. Executive Overview & Tech Stack

ISMS 2.0 is an enterprise e-Governance portal developed for the Government of Rajasthan to manage skill training schemes, Expression of Interest (EOI) bidding, training partner accreditation, batch monitoring via CCTV, and official sanction orders.

### Core Tech Stack
- **Framework**: Angular 21 (Standalone Components, Signals, Reactive State with RxJS)
- **Testing**: Vitest through `ng test` (45 spec files, 390 tests at the time of writing)
- **Styling**: TailwindCSS with design tokens declared in `src/styles.css` under `@theme` (see section 13). Use token classes such as `bg-primary`, `text-brand`, `bg-navy`, `bg-surface-muted` instead of raw hex values. Button and field looks live in `@layer components` rules (`.btn*`, `.form-control*`) so Tailwind utilities can still override them.
- **UI kit**: one component per UI element (button, icon, modal, table, dropdown, switch, filter tabs, page header ...) plus page templates (page shell, list page, document page). Screens are configuration plus these components, and `npm run check:ui` enforces it (section 14).
- **Loading**: every screen is lazy-loaded and the initial bundle is about 576 kB raw (134 kB transfer). Section 16 lists the rules that keep it there.
- **Document & PDF Engine**: `jsPDF` vector rendering engine with official stamps, Ashok Stambh emblem, QR codes, and digital signature seals
- **Architecture**: Universal Data Engine pattern (`DataEngineService`) enabling instantaneous switching between Centralized Mock Data and live REST APIs with zero component rewrites.

---

## 3. Centralized Mock System (The Master Switch)

### Where is the Master Switch?
All mock data across the **entire application** is controlled from a single configuration parameter in:
📁 `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  useMockData: true, // 🟢 TRUE  = Master switch ON: All 13 mock datasets active across all screens
                     // 🔴 FALSE = Master switch OFF: Entire app stops mock data (0 records / empty state)
  simulatedDelayMs: 150,
  enableMockPersistence: true
};
```

### How the Central Switch Works
```
                        [src/environments/environment.ts]
                                        │
                                useMockData: boolean
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
     useMockData = true                                   useMockData = false
             │                                                     │
 ┌───────────────────────────┐                         ┌───────────────────────────┐
 │ • resolveMock(data)       │                         │ • resolveMock(data)       │
 │   returns full data array │                         │   returns [] (Empty array)│
 │ • MockDatabaseService     │                         │ • MockDatabaseService     │
 │   queries in-memory DB    │                         │   returns [] & 0 totals   │
 │ • EoiStateService loads   │                         │ • EoiStateService         │
 │   mock scheme seeds       │                         │   initializes []          │
 │ • All screens show rich   │                         │ • DataEngineService calls │
 │   demo records            │                         │   real REST API fallback  │
 └───────────────────────────┘                         └───────────────────────────┘
```

### The 13 Central Mock Datasets
All mock datasets are located in: 📁 `src/app/core/mock/data/`  
Every dataset is protected by `resolveMock(data)`. When `useMockData` is false, they automatically return empty arrays:

| # | Mock File | Exported Datasets | Screens Controlled |
|---|---|---|---|
| 1 | `schemes.mock.ts` | `MOCK_SCHEMES` | Active Schemes, EOI Details, Scheme Master |
| 2 | `eoi.mock.ts` | `MOCK_EOI_APPLICANTS` | EOI Submissions, Scrutiny Desk |
| 3 | `sanction-orders.mock.ts` | `MOCK_SANCTION_ORDERS` | Sanction Orders Table, Order PDF Generator |
| 4 | `ipa.mock.ts` | `MOCK_IPA_LIST` | In-Principle Approval (IPA) Table |
| 5 | `batches.mock.ts` | `MOCK_CAMERA_BATCHES`, `MOCK_BATCHES` | Camera Monitoring Desk, Batch List |
| 6 | `sdc.mock.ts` | `MOCK_SDC_CENTRES` | Skill Development Centres, Center Inspection |
| 7 | `aspirants.mock.ts` | `MOCK_ASPIRANTS` | Candidate List, Biometric Attendance |
| 8 | `grievances.mock.ts` | `MOCK_GRIEVANCES`, `MOCK_ADMIN_GRIEVANCES` | TP Helpdesk, Admin Grievance Escalations |
| 9 | `users.mock.ts` | `MOCK_MANAGEMENT_USERS`, `MOCK_USERS` | User Management, SSO IDs |
| 10 | `masters.mock.ts` | `MOCK_SECTORS`, `MOCK_COURSES`, `MOCK_DISTRICTS` | Dropdowns and selectors |
| 11 | `admin-masters.mock.ts` | 8 Master Lookup Tables | Course, Sector, Designation, Block Masters |
| 12 | `tenders.mock.ts` | `MOCK_SUBMITTED_TENDERS` | Tender status history |
| 13 | `mock.config.ts` | `resolveMock<T>()` | The Master resolver connecting `environment.ts` |

---

## 4. Application Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (UI)                         │
│  TendersPage | SchemeDetailView | ScrutinyDesk | SanctionOrders        │
│  CameraBatchList | UserManagement | AdminMasters | RegistrationShell   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  SHARED UI KIT (src/app/shared, section 14)            │
│  Templates : PageShell | ListPage | DocumentPage | SectionCard         │
│  Components: appButton | Icon | Modal / ActionModal | Table | Dropdown │
│              PageHeader | FilterTabs | Switch | OtpInput | MasterCrud  │
│  Directives: appInput (fields) | appDocTable (printed letters)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS SERVICES LAYER                         │
│  SchemeService | EoiApiService | EoiStateService | SdcService          │
│  AspirantService | BatchService | AuthService                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      UNIVERSAL DATA ENGINE                             │
│                      (DataEngineService)                               │
│                                   │                                    │
│             ┌─────────────────────┴─────────────────────┐              │
│             │ if (environment.useMockData == true)      │              │
│             ▼                                           ▼              │
│  [MockDatabaseService]                         [HttpService]           │
│  In-Memory Storage & CRUD                   Angular HttpClient         │
│  `core/mock/data/*.mock.ts`                             │              │
└─────────────────────────────────────────────────────────┼──────────────┘
                                                          │
                                                          ▼
                                             ┌───────────────────────────┐
                                             │ REAL BACKEND REST API     │
                                             │ (Spring Boot / Node / Go) │
                                             └───────────────────────────┘
```

---

## 5. User Roles & Complete End-to-End Workflows

### Role 1: Super Admin (`super_admin`)
```
[Login] ──► [EOI Configuration /admin/eoi-configuration]
                 │
                 ├──► "Configure New EOI" ──► Fill form (Name, EMD, Fees, RFP/SOP) ──► Publish
                 ├──► "Assign Committee" ──► Select 3 Committee Members
                 ├──► "Corrigendum" ──► Upload Revised Date / Term Notice
                 ├──► [Masters /admin/master/*] ──► EOI Category, Scheme, Scheme Category, Sector, Course,
                 │                                  District & Block, Designation, Doc, Remark, Grading
                 ├──► [Two Step Verification] ──► which of OTP / Auth App / PIN each role needs
                 ├──► [Dynamic Form Builder] ──► edit the fields of the registration and EOI forms
                 └──► [User Management] ──► Users, Blacklisted users, Role Management, Permission Management
```

### Role 2: Department Admin (`dept_admin`)
```
[Login] ──► [6-Digit Secure OTP Verification Modal] ──► Enters '123456'
                 │
                 ▼
          [EOI Responses /admin/eoi-view]
                 │
                 ▼
          [Applicant Submissions /admin/responses/:schemeId]
                 │
                 ▼
          [Scrutiny Desk /admin/review/:applicationId]
                 │
                 ├──► "View" on Statutory Docs ──► Full-Screen A4 Certificate Viewer
                 ├──► Review sections, past performance, remarks, grade
                 ├──► "Approve", "Reject" (with reason) or "Revert" (shortfall sent back to the TP)
                 │
                 ▼
          [Sanction Order /admin/sanction-orders]  (once every application of a scheme is decided)
                 │
                 ├──► Allocate Target  /admin/sanction-order/:schemeId
                 ├──► Draft + e-sign   /admin/eoi-sanction-editor/:schemeId ──► Signed PDF
                 └──► MoU draft        /admin/mou-draft/:schemeId (editable, saved per scheme)
                                   │
                                   ▼
          [IPA /admin/ipa] ──► approved TPs of a scheme /admin/ipa/:schemeId
                 │
                 ├──► Allocate Target / View IPA / Allocate New Target
                 └──► IPA editor /admin/ipa-editor/:schemeId/:appId ──► e-sign ──► release to the TP
          Also: SDC Approvals, Batch Approvals, Grievance Management, Camera Monitoring
```

### Role 3: Training Partner (`existing_user`)
```
[Login] ──► [Active Schemes /tenders]
                 │
                 ├──► "View Details" ──► Scheme Summary, RFP Download, Document Checklist
                 ├──► "Apply" ──► Verification Check:
                 │         ├── Has completed OTR? ──► Yes: Apply for EOI wizard /scheme-form
                 │         └── Not completed?     ──► 4-Step Registration /registration
                 ├──► 4-Step OTR (also reachable from Profile):
                 │         1. Organization Details   2. Authorized Person
                 │         3. Bank Details           4. Preview & Submit
                 ├──► Apply for EOI: processing fee, OTR profile, documents, preview, EMD payment, receipts
                 ├──► [Tender Status /tender-status] ──► track the application, answer a shortfall
                 ├──► [Sanction Order /tp/sanction-orders] and [IPA /ipa] ──► view released letters,
                 │                                                            "Register SDC" from an IPA
                 ├──► [SDC /sdcs] ──► [Batches /batches] ──► [Aspirants /aspirants]
                 └──► Grievance, History (payments), Profile
```

### Role 4: New User (`new_user`)
```
[Login] ──► Visits Scheme List
                 │
                 ▼
          Automated Prompt: "Complete Profile / OTR Registration"
                 │
                 ▼
          Redirects to /registration to complete statutory registration.
```

### Role 5: Aspirant (`aspirant`)
```
[Login] ──► [Training Calendar /training-calendar]  (filter by district, sector, keyword)
                 │
                 ├──► Profile prompt on first visit ──► "Complete Registration" or "Skip for Now"
                 ├──► [Expressed Interest /expressed-interest]
                 └──► [Profile /profile]  (aspirant profile summary)
```

---

## 6. Complete Project File Structure & File Roles

Paths below are relative to `src/`. Large screens are split into a thin container component plus child parts, so a folder usually holds one `*.component.ts` container, a folder of the same name with its parts, and `*.util.ts` / `*.model.ts` files.

```
src/
├── environments/                        # MASTER CONFIG: `useMockData`, `apiUrl`
├── styles.css                           # Tailwind entry + @theme design tokens
│
└── app/
    ├── app.config.ts / app.routes.ts    # Providers, router (every screen is lazy-loaded)
    ├── app.component.ts                 # Root: router-outlet, toast outlet, SSO redirect
    │
    ├── core/                            # SINGLETONS, DATA LAYER, LAYOUT
    │   ├── auth/                        # AuthService, guard, interceptor, OTP + SSO modals
    │   ├── config/                      # api.config.ts (endpoint registry), role/menu/app config
    │   ├── http/http.service.ts         # HttpClient wrapper
    │   ├── models/                      # Domain types shared by mocks, services and screens
    │   │                                #   (admin-masters, grievance, camera, tender, user-management ...)
    │   ├── permissions/                 # PermissionService: the one place for role checks
    │   ├── services/
    │   │   ├── data-engine.service.ts   # Universal repository: mock store or real HTTP
    │   │   ├── persisted-store.ts       # Signal-backed list persisted via StorageService
    │   │   ├── storage.service.ts       # ONLY gateway to localStorage / sessionStorage
    │   │   ├── notification.service.ts  # Toasts (rendered by app-toast-outlet)
    │   │   └── language.service.ts
    │   ├── layout/                      # header, footer, main-layout, auth-layout
    │   │   └── sidebar/                 #   sidebar.component.ts + sidebar-nav.config.ts (the links per role, as data)
    │   └── mock/                        # mock.config.ts, mock-database.service.ts, data/*.mock.ts
    │
    ├── shared/                          # THE UI KIT (import from '../../shared'; see section 14)
    │   ├── templates/                   # page-shell, list-page, document-page, section-card
    │   ├── components/
    │   │   ├── button/                  # appButton (attribute component on <button> / <a>)
    │   │   ├── icon/                    # app-icon + icons.lucide.ts (generated from tools/icons.map.json), icons.solid*.ts (filled)
    │   │   ├── form-controls/           # input/ (appInput directive) + app-form-input / select / textarea / file-upload / section
    │   │   ├── dropdown/                # app-dropdown: single, multi, search, "Other", "Select all"
    │   │   ├── filter-tabs/             # app-filter-tabs: the one row of status filter buttons
    │   │   ├── switch/  otp-input/  progress-ring/  backdrop/
    │   │   ├── modal/                   # app-modal (generic dialog with a footer slot)
    │   │   ├── action-modal/            # Standard dialog: title, body, primary/secondary actions
    │   │   ├── document-sheet-modal/    # Printable A4 sheet dialog
    │   │   ├── document-viewer-modal/   # Document / image preview
    │   │   ├── profile-preview-modal/
    │   │   ├── table/                   # app-table (sorting, pagination, custom cells) + appDocTable directive
    │   │   ├── page-header/             # Title bar with built-in search; slot for header buttons
    │   │   ├── status-badge/  empty-state/  loader/  stepper/  toast-outlet/
    │   │   ├── form-sdc/                # Config-driven dynamic form (+ form-sdc.util.ts)
    │   │   └── master-crud/             # Generic CRUD page driven by a config object
    │   ├── directives/                  # click-outside
    │   ├── pipes/                       # date-format, inr-currency
    │   ├── utils/                       # date, formatters, validators (+ specs)
    │   └── validators/ types/
    │
    └── features/                        # BUSINESS SCREENS
        ├── landing/  auth/sso-login/  registration/  profile/  payment-history/
        ├── tenders/                     # tenders-page, tender-status, scheme-detail-view
        │   ├── tenders-page/            #   child parts + tenders-page.util.ts (EOI configuration, committee, corrigendum)
        │   ├── tender-status/           #   tender list/detail parts, shortfall response, receipts service
        │   └── scheme-detail-view/      #   PDF service + util
        ├── eoi/
        │   ├── components/scheme-form/  #   Apply-for-EOI wizard: scheme-form.state.ts (per-instance state), steps/, util
        │   ├── components/document-editor/  shared editable A4 pieces (letterhead, clause list, signatory ...)
        │   ├── pages/
        │   │   ├── department-eoi-view/  applicant-submissions/  scrutiny-desk/   # intake and review
        │   │   ├── sanction-order/  sanction-order-list/  eoi-sanction-editor/    # allocate target, list, draft + e-sign + PDF
        │   │   ├── mou/                                                           # MoU draft per scheme (mou-content.ts)
        │   │   └── ipa-list/  ipa-editor/                                         # IPA list, approved TPs, editor + PDF
        │   └── services/                #   eoi-state.service.ts (facade) + .models/.seed/.util/.storage, shortfall bridge
        ├── ipa/                         # Training Partner view of released IPAs (View, Register SDC)
        ├── sdc/
        │   ├── components/              #   sdc-*, batch-*, aspirant-*, camera-* screens; aspirant-detail/,
        │   │                            #   aspirant-mapping/, batch-form/, batch-detail/, sdc-detail/ hold the child parts
        │   ├── config/                  #   form configs (aspirant-form.config.ts is a barrel)
        │   ├── models/                  #   sdc / batch / aspirant types
        │   └── services/                #   sdc / batch / aspirant services (PersistedStore)
        ├── aspirant/                    # Aspirant portal: training calendar, expressed interest, profile form
        ├── grievance/  admin-grievance/
        ├── two-step-verification/  dynamic-form-builder/   # Super Admin tools (form builder is lazy-loaded)
        ├── admin-master/                # 10 thin configs over MasterCrudPageComponent + doc-master and permission-master
        └── user-management/             # container + parts/ + util
```

---

## 7. Developer Guide 1: How to Add a New Scheme

### Option A: Via Code (In Central Mock Store)
1. Open [`src/app/core/mock/data/schemes.mock.ts`](src/app/core/mock/data/schemes.mock.ts).
2. Inside the `MOCK_SCHEMES = resolveMock([...])` array, add your new scheme object:

```typescript
{
  id: 'scheme-2026-green-energy',
  sNo: 11,
  refNo: 'RSLDC/EOI/GREEN-ENERGY/2026-27/01',
  schemeName: 'Mukhya Mantri Green Energy Skill Scheme',
  schemeTitle: 'Mukhya Mantri Green Energy Skill Scheme (MMGESS)',
  code: 'MMGESS-2026',
  schemeCategory: 'ALL',
  category: 'ALL',
  datePublished: '10/10/2026',
  closingDate: '31/12/2026',
  eoiCategory: 'General',
  eoiDescription: 'Expression of Interest for establishing solar, wind, and green hydrogen training centers across Western Rajasthan.',
  status: 'Open',
  rfpDocSize: '3.2 MB',
  sopDocSize: '1.8 MB',
  emdFee: '₹50,000',
  processFee: '₹2,500',
  summary: {
    description: 'Special initiative targeting 15,000 rural youth for certification in renewable energy installation and maintenance.',
    objectives: [
      'Establish 50 specialized green technology skill centers',
      'Provide NSQF Level 4 & 5 certified solar technicians',
      'Assure minimum 70% wage employment placement'
    ],
    targetGroup: 'Youth aged 18-35 residing in Rajasthan with minimum 10th standard qualification.',
    financialAllocation: '₹25.00 Crores'
  }
}
```
3. Save the file.
4. Open the browser at `/tenders` (Training Partner) or `/admin/eoi-configuration` (Super Admin). The new scheme instantly appears in the table, search filter, and detail modal.

### Option B: Via the Super Admin UI (No Code Needed)
1. Switch your active role to **Super Admin** using the top bar switcher.
2. Navigate to **EOI Configuration** (`/admin/eoi-configuration`).
3. Click the **"Configure New EOI"** button in the header.
4. Fill in:
   - Scheme Name & Code
   - Reference Number
   - Published & Closing Dates
   - EMD Amount & Processing Fee
   - Upload sample RFP / SOP documents
5. Click **Submit & Publish**. The scheme is saved in the central in-memory store and immediately visible to all users.

---

## 8. Developer Guide 2: How to Add / Customize Table Columns

All tables in ISMS 2.0 use the centralized shared component:  
📁 `src/app/shared/components/table/table.component.ts`

### Step 1: Define the Column in Component TypeScript
Open your component (for example, `src/app/features/user-management/user-management.component.ts`):

```typescript
import { TableColumn } from '../../shared';

// In your component class:
readonly columns: TableColumn<UserData>[] = [
  // 1. STANDARD TEXT COLUMN: Reads directly from item[key]
  { 
    key: 'username', 
    label: 'User Name', 
    align: 'left', 
    sortable: true,
    cellClass: 'font-semibold text-slate-800' 
  },

  // 2. NUMBER COLUMN: Formatted with center alignment
  { 
    key: 'sNo', 
    label: 'S. No.', 
    type: 'number', 
    align: 'center', 
    width: 'w-16' 
  },

  // 3. DATE COLUMN: Automatically formats timestamp or date string
  { 
    key: 'createdAt', 
    label: 'Created Date', 
    type: 'date', 
    align: 'center' 
  },

  // 4. CUSTOM TEMPLATE COLUMN: Uses an Angular ng-template for HTML/badges/buttons
  { 
    key: 'statusBadge', 
    label: 'Account Status', 
    type: 'custom', 
    align: 'center' 
  },

  // 5. ACTION BUTTON COLUMN
  { 
    key: 'actions', 
    label: 'Actions', 
    type: 'custom', 
    align: 'center', 
    width: 'w-32' 
  }
];
```

### Step 2: Provide the Custom Templates in Component HTML
In your component HTML template (e.g., `user-management.component.html`):

```html
<app-table
  [columns]="columns"
  [data]="usersSignal()"
  [pagination]="true"
  [pageSize]="10"
  [customTemplates]="{
    statusBadge: statusBadgeTpl,
    actions: actionsTpl
  }"
>
</app-table>

<!-- TEMPLATE 1: Status Badge -->
<ng-template #statusBadgeTpl let-item>
  @if (item.status === 'Active') {
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
    </span>
  } @else {
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Inactive
    </span>
  }
</ng-template>

<!-- TEMPLATE 2: Action Buttons (kit button + icon; no hand-styled buttons) -->
<ng-template #actionsTpl let-item>
  <div class="flex items-center justify-center whitespace-nowrap">
    <button appButton variant="ghost" size="sm" type="button" (click)="editUser(item)" title="Edit">
      <app-icon name="edit" size="sm" />
      <span>Edit</span>
    </button>
    <button appButton variant="ghost" size="sm" type="button" (click)="deleteUser(item)" title="Delete">
      <app-icon name="trash" size="sm" />
      <span>Delete</span>
    </button>
  </div>
</ng-template>
```

> A plain list screen does not need this wiring: wrap it in `<app-list-page>` (section 14) and pass `columns`, `data` and
> `customTemplates`. A master lookup screen needs no template at all: give `MasterCrudPageComponent` a config (section 14).

---

## 9. Developer Guide 3: How to Add a New Screen / Feature

To create a new screen (e.g. "Inspection Reports"):

### Step 1: Create the Feature Component
Create `src/app/features/inspections/inspection-list.component.ts`:
```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ListPageComponent, TableColumn } from '../../shared';

@Component({
  selector: 'app-inspection-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListPageComponent],
  template: `
    <app-list-page
      title="Centre Inspection Reports"
      [searchable]="false"
      [columns]="columns"
      [data]="inspections()"
    />
    <!-- With search: bind [(searchQuery)]="query" and filter the data in a computed(). -->
  `
})
export class InspectionListComponent {
  readonly inspections = signal([
    { id: 1, centerName: 'Jaipur SDC #01', inspector: 'S. K. Sharma', status: 'Compliant', date: '2026-10-01' }
  ]);

  readonly columns: TableColumn<any>[] = [
    { key: 'id', label: 'ID', align: 'center', width: 'w-16' },
    { key: 'centerName', label: 'Centre Name', align: 'left' },
    { key: 'inspector', label: 'Inspector Officer', align: 'left' },
    { key: 'date', label: 'Date', align: 'center' },
    { key: 'status', label: 'Status', align: 'center' }
  ];
}
```

### Step 2: Register the Route
Open [`src/app/app.routes.ts`](src/app/app.routes.ts) and add:
```typescript
{
  path: 'admin/inspections',
  loadComponent: () => import('./features/inspections/inspection-list.component').then(m => m.InspectionListComponent),
  title: 'ISMS 2.0 | Centre Inspections'
}
```

### Step 3: Add to Navigation Menu
The sidebar is data-driven. Open `src/app/core/layout/sidebar/sidebar-nav.config.ts` and add an entry to the array of the role that should see it (for example `DEPT_ADMIN_NAV`):
```typescript
{ key: 'dept-inspections', label: 'Inspections', link: '/admin/inspections', icon: 'clipboard-check' }
```
`icon` must be a name from `shared/components/icon` (section 14). No template change is needed.

---

## 10. Document & PDF Viewer System

ISMS 2.0 contains an authentic government document preview and PDF generation engine.

### Statutory Certificate Viewer (`/admin/review/:id`)
When a Department Admin reviews an applicant proposal and clicks **"View"** next to any statutory attachment (e.g. *Certificate of Incorporation*, *Audit Balance Sheet*, *PAN Card*):
1. The modal popup closes cleanly.
2. A full-screen authentic **Government of Rajasthan A4 Statutory Document Viewer** opens.
3. Features:
   - Official Ashok Stambh emblem & RSLDC bilingual header
   - Corporate details (CIN, Registration No, Registered Office Address)
   - High-fidelity **Government Red Seal Stamp** with emblem
   - Digital signature verification box
   - Instant **"Download PDF"** vector export (via `jsPDF`) and **"Print"** capabilities.

### Official Sanction Orders & IPA Letters
- **Sanction Orders** (`/admin/sanction-orders`): the department allocates physical targets per scheme, edits the order in `eoi-sanction-editor` (an `app-document-page` over the shared editable A4 pieces), signs it with `esign-modal` and downloads the PDF from `sanction-pdf.service.ts`. The Training Partner sees released orders read-only at `/tp/sanction-orders` (the same list component, route data `{ viewOnly: true }`).
- **MoU** (`/admin/mou-draft/:schemeId`): an editable draft per scheme (text in `mou-content.ts`), saved in `localStorage` under `isms_mou_draft_<schemeId>`.
- **In-Principle Approval (IPA)** (`/admin/ipa`): lists schemes, then the approved Training Partners of one scheme (Allocate Target / View IPA / Allocate New Target). `ipa-editor` drafts the letter, `esign-modal` signs it (it takes a `documentName`), `ipa-pdf.service.ts` exports it, and a released IPA is stored under `isms_ipa_issued_*`. The Training Partner sees released IPAs at `/ipa` with View and Register SDC.
- Both PDF services share `pdf-common.ts` (letterhead, emblem, signature block). Printed-letter tables in these screens use `<table appDocTable>`.

---

## 11. Connecting Real Backend REST APIs

When your backend (e.g. Spring Boot, NestJS, Node.js, Go) is ready to connect:

### Step 1: Update `environment.ts`
Set `useMockData: false` and point `apiUrl` to your live backend:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://isms-api.rajasthan.gov.in/api/v1',
  useMockData: false, // 🔴 Disables mock store, all services call real HTTP endpoints
  simulatedDelayMs: 0,
  enableMockPersistence: false
};
```

### Step 2: Verify Endpoints in `src/app/core/config/api.config.ts`
All REST endpoint paths and HTTP methods are defined in this single file:

```typescript
export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  
  SCHEMES: {
    LIST:   { url: '/schemes', method: 'GET' },
    GET:    { url: (id: string) => `/schemes/${id}`, method: 'GET' },
    CREATE: { url: '/schemes', method: 'POST' },
    UPDATE: { url: (id: string) => `/schemes/${id}`, method: 'PUT' },
    DELETE: { url: (id: string) => `/schemes/${id}`, method: 'DELETE' }
  },

  EOI: {
    SUBMISSIONS: { url: (schemeId: string) => `/eoi/schemes/${schemeId}/submissions`, method: 'GET' },
    SUBMIT:      { url: '/eoi/submissions', method: 'POST' },
    REVIEW:      { url: (id: string) => `/eoi/submissions/${id}/review`, method: 'POST' }
  },

  SANCTION_ORDERS: {
    LIST:   { url: '/sanction-orders', method: 'GET' },
    CREATE: { url: '/sanction-orders', method: 'POST' }
  }
};
```

### Step 3: Zero UI Code Changes Required
Because every screen uses `DataEngineService` or domain services (`SchemeService`, `EoiApiService`), **no UI components need to be modified**! When `useMockData: false`, the `DataEngineService` automatically routes calls to Angular's `HttpClient` via `HttpService`. If the backend is temporarily offline, safe empty fallbacks prevent the app from crashing.

---

## 12. Troubleshooting & FAQ

### Q1: Why are my tables empty with 0 records?
**Answer**: Check `src/environments/environment.ts`.  
If `useMockData: false`, all mock data is turned off globally. Set `useMockData: true` and save to immediately restore full demo data across all screens.

### Q2: How do I switch roles during testing?
**Answer**: Sign in again on `/sso-login` and pick another role, or (for a Super Admin / Department User account) use the role switcher in the user menu, which calls `authService.switchActiveRole('dept_admin' | 'super_admin')`. For a quick test, write an `isms_user` JSON entry (`id`, `ssoId`, `label`, `subLabel`, `role`, `isProfileComplete`) to `localStorage` and reload.

### Q3: How do Department Admins bypass the 6-Digit OTP modal?
**Answer**: The modal requires the test OTP `123456`. Entering this OTP or clicking "Verify" grants immediate Department Admin dashboard access.

### Q4: How do I verify there are no compilation errors?
**Answer**: Run `npx ngc -p tsconfig.app.json --noEmit` (empty output means clean), then `npx ng build`. Run `npm run check:ui` for the UI rules.

### Q5: The dev server shows an old screen, a missing icon name or an error that the code no longer has
**Answer**: It is stale. Stop `ng serve` and start it again. This happens after files or folders are added while it runs.

### Q6: A page is blank and the console shows `Cannot read properties of undefined`
**Answer**: Usually an input of a kit component received `undefined` (for example `[values]` of `app-dropdown`). Pass a default (`?? []`, or a stable empty array in the component) instead of an object lookup that can miss.

---

## 13. Engineering Conventions

### Component structure
- A screen is a **thin container**: it owns routing, data loading and orchestration. Presentation goes into child components in a folder named after the screen (`tenders-page/`, `batch-form/` ...). If a container passes 500 lines, split it.
- Pure logic (validation, mapping, totals, filtering) goes into a `*.util.ts` file with a `*.util.spec.ts` beside it. Utils take plain arguments and need no `TestBed`.
- Types live in `*.model.ts` next to the screen, or in `core/models` when the mock layer and services share them. Mock files re-export from there.
- Re-use before writing: buttons are `appButton`, icons `app-icon`, fields `appInput`, dropdowns `app-dropdown`, filter rows `app-filter-tabs`, tables `app-table`, list screens `app-list-page`, letter screens `app-document-page`, dialogs `app-modal` / `app-action-modal` (or `app-document-sheet-modal` for A4 sheets), wizards `app-stepper`, master lookups `MasterCrudPageComponent`. The full table is in section 14, and `npm run check:ui` fails the build when a screen hand-writes one of them.
- Large child sets share state through an `@Injectable()` provided by the parent component (see `scheme-form.state.ts`), not through a root singleton.

### Change detection and state
- Use signals for state read by templates. Use `ChangeDetectionStrategy.OnPush` on every component whose template reads only signals, signal inputs, immutable `@Input` values or `async` pipes.
- Components that edit a parent-owned object in place with `ngModel` must stay on the default strategy. Do not add OnPush there until that state is signal-based, or the view goes stale. Such components carry a comment saying so.
- Update list state immutably (`signal.update(list => list.map(...))`) so OnPush children re-render.
- `app-table` is OnPush. When a parent mutates an array in place (editable grids), hand the table a copy that changes with a version signal, otherwise the rows do not refresh.
- Avoid calling methods from templates for values that do not change per check; precompute them in a `computed()`.

### Subscriptions
- Subscribe to reads and route params with `takeUntilDestroyed(this.destroyRef)` as the last operator in the pipe.
- Do **not** add it to fire-and-forget writes (`create`, `update`, `delete`, submit calls). Cancelling those on navigation would drop the write once a real backend is connected.

### Storage
- Never call `localStorage` or `sessionStorage` directly. Use `StorageService`:
  `getItem/setItem/removeItem` (JSON), `getString/setString` (raw strings), and the `getSession*/setSession*/removeSessionItem` variants.
- Keep the on-disk format stable: a key written as a raw string must be read with `getString`, not `getItem`.
- For a persisted list that must also sync across tabs, use `createPersistedStore()` (`core/services/persisted-store.ts`).

### Roles and permissions
- Never compare role strings in a screen. Inject `PermissionService` and call `hasRole('dept_admin')` or `hasRole([...])`.

### Styling
- Tokens are declared in `src/styles.css` under `@theme`: `primary`, `brand`, `brand-dark`, `navy`, `navy-dark`, `ocean`, `ocean-dark`, `theme`, `surface-muted`, `field-border`.
- Use token classes (`bg-primary`, `text-brand`). Brand-blue **text** is `text-brand`; the legacy `.text-primary` class resolves to dark text.
- Do not use `!important` helper classes; they override every `hover:` and `disabled:` variant.
- Hide scrollbars with the `no-scrollbar` utility.
- **One font.** The portal uses Inter everywhere (with Noto Sans Devanagari for Hindi), declared once as `--font-sans` in `src/styles.css`. Screens never choose a family: no `font-mono`, `font-serif`, `font-['...']` or `font-family:` (the guard rejects them; `--font-mono` points to the same font as a safety net). Hierarchy comes from size and weight only: page title, section title, body and caption sizes (`--font-size-*`, `text-*`), `font-medium` / `font-semibold`, and `tabular-nums` for IDs, reference numbers and amounts. **Print output is left as it was and must not be changed:** the printed official letters (sanction order, IPA, MoU) keep `font-serif` (the guard allows it only in `LETTER_PATHS` of `tools/ui-guard.mjs`), and the receipt print windows and PDF services keep their own fonts.

### Testing
- Run `npx ng test --no-watch`. Specs sit beside the code they test.
- Cover pure utils, services (`DataEngineService`, `StorageService`, `PermissionService`, `NotificationService`, `PersistedStore`) and shared components with a small host component.
- In host components used by specs, drive inputs with signals (plain fields changed after the first check raise `NG0100`).

### Verifying a change
1. `npx ngc -p tsconfig.app.json --noEmit` (empty output means clean; it does not compile specs, so also run step 3).
2. `npm run check:ui`.
3. `npx ng test --no-watch`.
4. `npx ng build`, then open the screens you touched in the browser (restart `ng serve` first if it has been running since before you added files). Check the browser console for errors, and open the add / edit dialogs, because a dialog's content is rendered before it is opened and can fail on empty data.

---

> **ISMS 2.0 Architecture Documentation**  
> *Developed with precision for RSLDC Government of Rajasthan.*

---

## 14. UI Kit Rules (Every Screen Uses the Shared Components)

A new page is **configuration plus the shared components**. Nobody designs a button, dialog, table or
field again. The look of the whole portal is changed in one place: `src/styles.css` (the `.btn` and
`.form-control` rules, in Tailwind's `components` layer) or the kit component itself.

| Need | Use | Where |
|---|---|---|
| Button or link styled as a button | `<button appButton variant="primary\|outline\|secondary\|danger\|ghost\|inverse" size="xs\|sm\|md\|lg" [loading] [block] iconOnly>` (primary is navy; `inverse` is for dark backgrounds; `xs` is the 22px remove button) | `shared/components/button` |
| Icon | `<app-icon name="eye" size="sm" />` (sizes `xs sm md lg xl 2xl 3xl auto`, `[stroke]`; `auto` fills the box you give it with classes) | `shared/components/icon` |
| Text field, native select, text area | `<input appInput>`, `<select appInput>`, `<textarea appInput>` (`size="sm"`, `variant="plain\|underline"`, `[invalid]`) | `shared/components/form-controls/input` |
| Row of status / category filter buttons | `<app-filter-tabs [options]="[{ id, label, count }]" [(value)]>`; add `stretch` for equal widths | `shared/components/filter-tabs` |
| Labelled field with error text (registration / EOI / SDC form look) | `<app-form-input>`, `<app-form-select>`, `<app-form-textarea>`, `<app-form-file-upload>`, `<app-form-photos>` (several photos, minimum count), grouped with `<app-form-section title="...">` in a 12-column grid | `shared/components/form-controls` |
| Dropdown (single, multi, search, "Other", "Select all") | `<app-dropdown [options] [(value)]>` or `<app-dropdown multiple [(values)]>` | `shared/components/dropdown` |
| On/off switch | `<app-switch [checked] (toggled)>` | `shared/components/switch` |
| Dim layer behind a popup | `<app-backdrop>` | `shared/components/backdrop` |
| One-time-code boxes | `<app-otp-input>` | `shared/components/otp-input` |
| Percentage ring | `<app-progress-ring [value]>` | `shared/components/progress-ring` |
| Printed letter table | `<table appDocTable>` | `shared/components/table/doc-table.directive.ts` |
| Filled icon or brand mark | `<app-icon name="pdf-badge" solid />` | `shared/components/icon/icons.solid*.ts` |
| Dialog | `<app-modal title size (close)>` with a `modalFooter` slot; `<app-action-modal>` for confirm / simple prompts | `shared/components/modal`, `action-modal` |
| Data table | `<app-table [columns] [data] [customTemplates]>` | `shared/components/table` |
| Page header with search | `<app-page-header>` | `shared/components/page-header` |
| Page frame | `<app-page-shell>` | `shared/templates/page-shell` |
| List screen (header + search + table) | `<app-list-page>` | `shared/templates/list-page` |
| Letter / document screen (Back, title, sheet, Save / E-Sign bar) | `<app-document-page>` | `shared/templates/document-page` |
| Bordered card with a title | `<app-section-card>` | `shared/templates/section-card` |

### Recipe: a new list page
```ts
@Component({
  imports: [ListPageComponent, ButtonComponent],
  template: `
    <app-list-page title="Work Orders" searchPlaceholder="Search..." [(searchQuery)]="query"
                   [columns]="columns" [data]="rows()" [customTemplates]="{ action: actionTemplate }" />
    <ng-template #actionTemplate let-row><button appButton size="sm" (click)="open(row)">View</button></ng-template>
  `
})
```

### Enforcement
`npm run check:ui` (also run in the deploy workflow) fails when a template contains a raw `<button>`,
`<table>`, `<input>` (text types), `<select>`, `<textarea>`, inline `<svg>` or a hand-made
`fixed inset-0` overlay. Checkbox, radio, file and hidden inputs stay native.

Page title bars are checked too: the search box of a screen comes from `<app-page-header [searchable]="true"
[(searchQuery)]="...">` (never a hand-made input in the header slot), and every button placed in the header
slot is `size="sm"`. That is what keeps all title bars the same height and width.

The codebase currently has no exceptions. A deliberate one must carry a reason on the line above it:

```html
<!-- ui-guard-allow: signature block of the printed MoU -->
```

`npm run check:ui:report` lists the totals; `npm run check:ui:update` records a lower baseline after a
clean-up. Do not add exceptions to make a screen pass: add the missing piece to the kit instead.

### Recipe: a new master (lookup) page
A master screen is a config object. Copy `features/admin-master/designation-master.component.ts`: define `COLUMNS`, a `MasterCrudConfig` (title, `dataKey`, `fields`, `createDefaults`, `buildPayload`) and render
`<app-master-crud-page [config]="config" />`. The page, search, table, View / Edit / Active toggle and the add / edit dialog all come from `MasterCrudPageComponent`. Field types: `text`, `number`, `textarea`, `select`, `multiselect` (an `app-dropdown`), `permissions`.
Only a master with unusual cells or a combobox (Doc Master, Permission Management) is written by hand; it still uses the same page header, table, switch and action cell, so it looks identical.

### Icons (Lucide)
All outline icons come from [Lucide](https://lucide.dev) (ISC license), so every icon has the same drawing style. The app keeps its own short names, and `tools/icons.map.json` connects them:

```json
{ "close": "x", "edit": "square-pen", "trash": "trash" }
```

1. Find the icon: `npm run icons:find -- calendar` lists Lucide icons by name or tag (or browse lucide.dev/icons).
2. Add one line to `tools/icons.map.json`: `"my-name": "lucide-name"` (keep it sorted).
3. Run `npm run icons:build`. It writes `src/app/shared/components/icon/icons.lucide.ts` (generated: do not edit it; `npm run verify` and CI fail when it differs from the map).
4. Use `<app-icon name="my-name" />`. The name type (`IconName`) comes from the generated file, so a wrong name is a compile error.

`lucide-static` is a dev dependency used only by the generator; no icon library ships in the app bundle, only the paths that are in the map.
Filled icons and brand marks (play, pause, the PDF badge, logos) are a separate set: `icons.solid*.ts`, used with `<app-icon name="..." solid />`.
Raw `<svg>` is allowed only in the icon renderer (`shared/components/icon/`) and the progress ring; the guard rejects it in every other kit component and screen.

### The page title bar
`app-page-header` draws the title, an optional back button, the search box (`[searchable]`) and a slot for buttons and filters. Pages differ only in what they put into that slot. A page that needs a filter dropdown puts an `<select appInput size="sm">` in the slot; a page that needs a different search box does not exist.

### Adding or changing a kit component
- Put it in `shared/components/<name>/`, export it from `shared/components/index.ts`, and add its folder to `KIT_PREFIXES` in `tools/ui-guard.mjs` if it contains the raw markup it is built from.
- Colours, heights and radii belong to `src/styles.css` or the component. A screen never adds colour, border or padding classes to a kit button or field.
- Core files that load with the first page (`app.component`, header, footer, sidebar, auth modals) import kit files directly (`../../shared/components/button/button.component`), not the `shared` barrel, so that the first bundle stays small (section 16).

---

## 15. Screen & Route Map

Every route is lazy-loaded (`app.routes.ts`). Roles are listed in section 1; the sidebar links of each role are in `core/layout/sidebar/sidebar-nav.config.ts`.

| Area | Route | Screen | Template |
|---|---|---|---|
| Public | `/`, `/sso-login` | Landing, SSO login | custom |
| Training Partner | `/registration` | 4-step OTR registration | custom (stepper) |
| | `/tenders`, `/scheme-form` | Active schemes, Apply for EOI | list / wizard |
| | `/tender-status` | Application status, shortfall response | list + detail |
| | `/tp/sanction-orders`, `/ipa` | Released sanction orders and IPAs (read-only) | `app-list-page` |
| | `/sdcs`, `/sdc/create`, `/sdcs/:id` | SDC list, register, detail | list + detail |
| | `/batches`, `/batches/create`, `/batches/:id`, `/batches/:batchId/map-aspirant` | Batches and aspirant mapping | list + forms |
| | `/aspirants`, `/aspirants/:id` | Aspirants | list + detail |
| | `/grievance`, `/payment-history`, `/profile` | Grievance, history, profile | `app-list-page` / custom |
| Aspirant | `/training-calendar`, `/expressed-interest`, `/profile` | Aspirant portal | list |
| Department User | `/admin/eoi-view`, `/admin/responses/:schemeId` | EOI responses, applicant submissions | `app-list-page` |
| | `/admin/review/:applicationId` | Scrutiny desk | custom |
| | `/admin/sanction-orders`, `/admin/sanction-order/:schemeId`, `/admin/eoi-sanction-editor/:schemeId` | Sanction order list, allocate target, editor | list / `app-document-page` |
| | `/admin/mou-draft/:schemeId` | MoU draft | `app-document-page` |
| | `/admin/ipa`, `/admin/ipa/:schemeId`, `/admin/ipa-editor/:schemeId/:appId` | IPA list, approved TPs, editor | list / `app-document-page` |
| | `/sdc`, `/admin/batch-approvals`, `/admin/batch-detail/:id` | SDC and batch approvals | list + detail |
| | `/admin/grievance`, `/admin/camera-monitoring[/...]` | Grievance management, camera monitoring | list |
| Super Admin | `/admin/eoi-configuration` | Configure EOI, committee, corrigendum | list + dialogs |
| | `/admin/master/<name>` | 12 masters (section 14) | `MasterCrudPageComponent` |
| | `/admin/two-step-verification`, `/admin/dynamic-form-builder` | Security and form tools | list + dialogs |
| | `/admin/user-management` | Users, blacklist | list + dialogs |

---

## 16. Performance & Bundle Rules

Measured with `npx ng build` (production): initial bundle about **576 kB raw / 134 kB transfer**, no CommonJS warnings.

- **Lazy everything.** A screen is added with `loadComponent` in `app.routes.ts`. The dynamic form builder (the largest file) is a lazy route and is never imported by an eager file.
- **Eager files import only what they use.** The shell (app component, header, footer, sidebar, auth modals) imports kit components by file path. Importing the `shared` barrel there pulls the whole kit into the first bundle (it once added about 350 kB).
- **OnPush by default** for components that read only signals and signal inputs (section 13). Components that edit a parent object with `ngModel` stay on the default strategy.
- **CommonJS libraries** (`jspdf` and its helpers, `jszip`) are listed in `allowedCommonJsDependencies` in `angular.json`; PDF code loads with the screen that needs it.
- **Check before you ship a kit change.** Run `npx ng build` and compare the initial total; a jump of more than a few kB means a barrel import or a heavy library landed in an eager file.
- **Static data is data.** Navigation, master configs and form configs are plain objects (`sidebar-nav.config.ts`, `*.config.ts`); templates loop over them instead of repeating markup.

---

## 17. Team Workflow: Keeping Every Screen on the Kit (Developers and AI Tools)

Four developers and several AI tools add screens to this project. A rule that lives only in a document gets forgotten,
so the rules are enforced at five points, from the first keystroke to the merge:

| # | Where | What happens | Files |
|---|---|---|---|
| 1 | **Start of a page** | `npm run new:page -- list\|master\|document <feature>/<name> "Title"` creates the screen from the kit and adds its route. Starting from the generator means there is nothing to design. | `tools/new-page.mjs` |
| 2 | **While writing (AI tools)** | Every AI tool reads the same rules: Claude Code (`CLAUDE.md`), GitHub Copilot (`.github/copilot-instructions.md`), Cursor (`.cursor/rules/ui-kit.mdc`), Google Antigravity / Gemini (`.agents/rules/ui-kit.md`, `GEMINI.md`), Kiro (`.kiro/steering/ui-kit.md`). They are copies of `AGENTS.md`, and a check fails when a copy is stale. Edit only `AGENTS.md`, then run `npm run sync:ai`. | `AGENTS.md`, `tools/sync-ai-rules.mjs` |
| 3 | **On commit / push** | A git pre-commit hook runs the UI guard (about a second); pre-push also runs the type + template check. The hooks install themselves on `npm install` (`prepare` script). | `.githooks/`, `tools/install-hooks.mjs` |
| 4 | **On the pull request** | CI runs the guard, the AI-rules check, `ngc`, the unit tests and a production build. Turn on branch protection and mark the `CI / verify` check as required, otherwise a red PR can still be merged. The PR template carries the checklist. | `.github/workflows/ci.yml`, `.github/pull_request_template.md` |
| 5 | **On deploy** | `deploy.yml` repeats the guard before building the `Production` branch. | `.github/workflows/deploy.yml` |

### What the UI guard rejects (`npm run check:ui`)
| Rule | Meaning |
|---|---|
| `raw-button`, `raw-table`, `raw-input`, `raw-select`, `raw-textarea`, `raw-svg`, `raw-overlay` | A hand-written element where a kit component exists |
| `raw-icon-font` | `<i class="fa ...">` instead of `<app-icon>` |
| `raw-font` | `font-mono`, `font-serif`, `font-['...']` or a `font-family:` declaration: the portal has one font (Inter) |
| `button-style` | `appButton` with its own colour, border, padding or radius classes |
| `header-search`, `header-button-size` | A hand-made search box in the title bar, or a title-bar button that is not `size="sm"` |
| `page-frame` | A routed screen that is not inside `app-page-shell`, `app-list-page`, `app-document-page` or `app-master-crud-page` |

Existing screens that do not yet use a page frame are listed in `tools/ui-guard-baseline.json`. The baseline can only shrink: a new
page cannot be added to it, a listed page that is migrated is removed with `npm run check:ui:update`. The remaining ones are
`mou-draft`, `scrutiny-desk`, `profile-page`, `aspirant-detail`, `batch-detail`, `sdc-detail`, `tender-status` and `tenders-page`.
Screens that really need their own layout (landing, SSO login, the two wizards) carry `// ui-guard-allow: page-frame - reason` at the top of the file.

### Rules of the team
1. **Missing something in the kit? Add it to the kit** (a new variant, a new component, a new icon), in its own small PR, then use it. Never style it inside a screen.
2. **Ask AI tools to use the generator and to run `npm run verify`.** A good prompt starts with: "Follow AGENTS.md. Create the page with `npm run new:page`." If a tool ignores the rules, the guard stops the commit and prints what to use instead.
3. **No exceptions without a reason.** `ui-guard-allow` needs a reason in the comment and a reviewer who agrees. Reviewers should open the diff of `tools/ui-guard-baseline.json` and any new `ui-guard-allow`.
4. **Changing the rules** (a new guard rule, a new kit piece in the table of section 14) means updating `AGENTS.md`, running `npm run sync:ai`, and the guide, in the same PR.
5. **Do not change `package.json` dependencies without agreeing it first.** Run `npm ci` on a fresh clone; `npm install <package>` changes the shared lockfile for everyone.
6. **Review checklist for a new screen:** created with `new:page`, `npm run verify` is green, the screen was opened in the browser including its dialogs, and mock data uses neutral names.

### Commands
```bash
npm run new:page -- list <feature>/<name> "Title"   # new screen from the kit (also: master, document)
npm run check:ui                                    # UI rules only (about a second)
npm run verify                                      # UI rules + AI-rules check + type check + unit tests
npm run sync:ai                                     # copy AGENTS.md to the AI tools' files
npm run icons:find -- <word>                        # search the Lucide icons
npm run icons:build                                 # regenerate icons.lucide.ts after editing tools/icons.map.json
npm run check:ui:update                             # record a lower baseline after migrating a screen
```
