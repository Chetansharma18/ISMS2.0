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

---

## 1. Quick Start & How to Run

### Prerequisites
- **Node.js**: v18.x or v20.x
- **Angular CLI**: v18+ / v21+ (`@angular/cli`)

### Run Development Server
```bash
# Navigate to the project folder
cd d:\ISMS\Frontend\isms-ui\isms-ui

# Install dependencies (if fresh clone)
npm install

# Start development server
npm start
# OR
npx ng serve --port 4200
```
Open your browser at `http://localhost:4200`.

### Production Build Check
```bash
npx ng build
```
*(Build compiles with zero TypeScript errors into `dist/isms-ui`)*.

### Test Credentials (Built-in Auth Switcher)
Click the user profile icon or role switcher in the top navigation bar to test any role:
| Role Name | Role ID | Default Access |
|---|---|---|
| **Super Admin** | `super_admin` | Full system control, Scheme config, Admin Masters, Committee assignment |
| **Department Admin** | `dept_admin` | 6-Digit OTP security, Proposal scrutiny desk, Sanction order generation |
| **Training Partner** | `existing_user` | Scheme browsing, 4-step OTR registration, Proposal submission, Grievances |
| **New User** | `new_user` | Mandatory OTR profile setup prompt |

---

## 2. Executive Overview & Tech Stack

ISMS 2.0 is an enterprise e-Governance portal developed for the Government of Rajasthan to manage skill training schemes, Expression of Interest (EOI) bidding, training partner accreditation, batch monitoring via CCTV, and official sanction orders.

### Core Tech Stack
- **Framework**: Angular 18+ (Standalone Components, Signals, Reactive State with RxJS)
- **Styling**: TailwindCSS & Custom Vanilla CSS (Official Rajasthan Government Palette: `#0B3558` Deep Navy, `#174A6E` Slate Blue, `#F8FAFC` Clean Slate)
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
│                         SHARED REUSABLE UI                             │
│  TableComponent (Generic Data Table with Sorting, Pagination, Custom)  │
│  PageHeaderComponent | ActionModalComponent | ButtonComponent          │
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
[Login] ──► [Active Schemes /admin/tenders]
                 │
                 ├──► Click "Configure EOI" ──► Fill Modal (Name, EMD, Fees, RFP/SOP) ──► Publish
                 ├──► Click "Assign Committee" ──► Select 3 Department Officers
                 ├──► Click "Corrigendum" ──► Upload Revised Date/Term Notice
                 └──► [Admin Masters] ──► Manage Sectors, Courses, Districts, Designations
```

### Role 2: Department Admin (`dept_admin`)
```
[Login] ──► [6-Digit Secure OTP Verification Modal] ──► Enters '123456'
                 │
                 ▼
          [EOI Responses /admin/eoi-view]
                 │
                 ▼
          [Applicant Submissions /admin/applicants/:schemeId]
                 │
                 ▼
          [Application Review Desk /admin/review/:id]
                 │
                 ├──► Click "View" on Statutory Docs ──► Opens Full-Screen A4 Certificate Viewer
                 ├──► Award Technical Scores (Capacity, Financials, Prior Training)
                 ├──► Assign Grade (A/B/C)
                 └──► Click "Approve Proposal" OR "Reject with Reason"
                                   │
                                   ▼
          [Sanction Orders /admin/sanction-orders]
                 │
                 └──► Issue Official Sanction Order ──► Generate & Download Signed PDF
```

### Role 3: Training Partner (`existing_user`)
```
[Login] ──► [Active Schemes /admin/tenders]
                 │
                 ├──► Click "View Details" ──► Scheme Summary, RFP Download, Document Checklist
                 ├──► Click "Apply Now" ──► Verification Check:
                 │         ├── Has completed OTR? ──► Yes: Proceed to Scheme Application Form
                 │         └── Not completed?     ──► Redirects to 4-Step Registration Wizard
                 ├──► Complete 4-Step OTR:
                 │         1. Organization Details (PAN, CIN, Registered Office)
                 │         2. Authorized Signatory (SSO ID, Aadhaar, Designation)
                 │         3. Financial & Experience (Turnover, Prior Trainees)
                 │         4. Bank Account Details (Account No, IFSC, Cancelled Cheque)
                 ├──► Pay EMD & Processing Fee via Gateway Mock
                 └──► Track Status ──► View In-Principle Approval (IPA) Letter
```

### Role 4: New User (`new_user`)
```
[Login] ──► Visits Scheme List
                 │
                 ▼
          Automated Prompt: "Complete Profile / OTR Registration"
                 │
                 ▼
          Redirects to /applicant-profile to complete statutory registration.
```

---

## 6. Complete Project File Structure & File Roles

```
d:/ISMS/Frontend/isms-ui/isms-ui/src/
│
├── environments/
│   ├── environment.ts                   # MASTER CONFIG: toggle `useMockData: true/false`, apiUrl
│   └── environment.prod.ts              # Production config
│
├── app/
│   ├── app.config.ts                    # Root Angular application providers, router, animations, HTTP
│   ├── app.routes.ts                    # Master route declarations (Lazy-loaded feature components)
│   ├── app.component.ts                 # Root wrapper (Header, Sidebar, Role Switcher, Router-Outlet)
│   │
│   ├── core/                            # SINGLETON SERVICES & ARCHITECTURE CORE
│   │   ├── auth/
│   │   │   ├── auth.service.ts          # Authentication state, current user, role switching, logout
│   │   │   ├── auth.guard.ts            # Route guard preventing unauthorized role access
│   │   │   └── components/
│   │   │       └── dept-admin-otp-modal/# 6-digit OTP modal dialog for Department Admin login
│   │   │
│   │   ├── config/
│   │   │   └── api.config.ts            # Central registry of all backend REST endpoints & HTTP methods
│   │   │
│   │   ├── http/
│   │   │   └── http.service.ts          # Angular HttpClient wrapper with error handling & headers
│   │   │
│   │   ├── services/
│   │   │   └── data-engine.service.ts   # UNIVERSAL REPOSITORY: Bridges mock store vs. real backend HTTP
│   │   │
│   │   └── mock/                        # CENTRALIZED MOCK SUBSYSTEM
│   │       ├── mock.config.ts           # resolveMock<T>() helper linked to environment.useMockData
│   │       ├── mock-database.service.ts # In-memory relational storage with CRUD & filtering
│   │       └── data/                    # 13 Mock Datasets (schemes, eoi, users, sdc, batches, etc.)
│   │
│   ├── shared/                          # REUSABLE UI COMPONENT LIBRARY
│   │   ├── components/
│   │   │   ├── table/                   # Generic table: sorting, pagination, search, custom cells
│   │   │   ├── page-header/             # Standard title, breadcrumbs, action button area
│   │   │   ├── button/                  # Interactive button with variants (primary, outline, danger)
│   │   │   └── action-modal/            # Modal dialog shell with header, body, footer
│   │   └── models/
│   │       └── table.model.ts           # TypeScript interfaces: TableColumn<T>, TableAction, PageEvent
│   │
│   └── features/                        # BUSINESS FEATURE MODULES (SCREENS)
│       ├── tenders/                     # SCHEMES & EOI CREATION
│       │   ├── tenders-page.component.ts        # Active Schemes list & Super Admin "Configure EOI"
│       │   ├── scheme-detail-view.component.ts  # Full Scheme overview, RFP download, PDF generator
│       │   ├── scheme-form.component.ts         # Multi-step EOI Scheme creation form
│       │   └── services/scheme.service.ts       # Scheme service connecting to DataEngineService
│       │
│       ├── registration/                # ONE-TIME REGISTRATION (OTR)
│       │   ├── registration-shell.component.ts  # 4-Step Registration Wizard
│       │   └── models/otr-form.model.ts         # Org, Signatory, Bank data models
│       │
│       ├── eoi/                         # EOI SUBMISSIONS & SCRUTINY DESK
│       │   ├── pages/
│       │   │   ├── department-eoi-view/         # List of EOI schemes with total response counts
│       │   │   ├── applicant-submissions/       # List of applicant organizations under a scheme
│       │   │   └── scrutiny-desk/               # Scrutiny desk with Document Viewer & Scoring
│       │   └── services/
│       │       ├── eoi-state.service.ts         # Reactive state for applicants & scrutiny
│       │       └── eoi-api.service.ts           # EOI endpoints connector
│       │
│       ├── sdc/                         # SANCTION ORDERS & CCTV MONITORING
│       │   ├── components/
│       │   │   ├── sanction-orders.component.ts # Sanction Order table & printable document viewer
│       │   │   └── camera-batch-list.component.ts# Live CCTV camera feeds with Pan/Zoom & Record
│       │   └── models/sdc.model.ts              # Sanction Order, SDC Centre, Camera feed types
│       │
│       ├── ipa/                         # IN-PRINCIPLE APPROVAL (IPA)
│       │   └── ipa-list.component.ts            # IPA document table & official PDF generator
│       │
│       ├── grievance/                   # TRAINING PARTNER HELPDESK
│       │   └── grievance-list.component.ts      # Ticket raising, category selection, status track
│       │
│       ├── admin-grievance/             # OFFICER GRIEVANCE ESCALATION
│       │   └── admin-grievance-list.component.ts# Ticket review, priority assignment, resolution
│       │
│       ├── admin-master/                # MASTER LOOKUP TABLES (8 MASTERS)
│       │   ├── course-master.component.ts       # Course QP codes and NSQF levels
│       │   ├── sector-master.component.ts       # Industry sector codes
│       │   ├── designation-master.component.ts  # Department officer designations
│       │   ├── district-block-master.component.ts# Rajasthan districts & blocks
│       │   ├── eoi-category-master.component.ts # EOI categories (General, RTD, Special)
│       │   ├── permission-master.component.ts   # System permissions
│       │   ├── scheme-master.component.ts       # Master scheme catalog
│       │   └── user-role-master.component.ts    # Role permission mappings
│       │
│       └── user-management/             # USER ACCOUNTS
│           └── user-management.component.ts     # User management, SSO IDs, active status toggles
```

---

## 7. Developer Guide 1: How to Add a New Scheme

### Option A: Via Code (In Central Mock Store)
1. Open [`src/app/core/mock/data/schemes.mock.ts`](file:///d:/ISMS/Frontend/isms-ui/isms-ui/src/app/core/mock/data/schemes.mock.ts).
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
4. Open the browser at `/admin/tenders`. The new scheme instantly appears in the table, search filter, and detail modal.

### Option B: Via the Super Admin UI (No Code Needed)
1. Switch your active role to **Super Admin** using the top bar switcher.
2. Navigate to **Active Schemes** (`/admin/tenders`).
3. Click the blue **"Configure EOI"** button in the header.
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
import { TableColumn } from '../../../shared/models/table.model';

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

<!-- TEMPLATE 2: Action Buttons -->
<ng-template #actionsTpl let-item>
  <div class="flex items-center justify-center gap-2">
    <button (click)="editUser(item)" class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
      <i class="fa fa-edit"></i>
    </button>
    <button (click)="deleteUser(item)" class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete">
      <i class="fa fa-trash"></i>
    </button>
  </div>
</ng-template>
```

---

## 9. Developer Guide 3: How to Add a New Screen / Feature

To create a new screen (e.g. "Inspection Reports"):

### Step 1: Create the Feature Component
Create `src/app/features/inspections/inspection-list.component.ts`:
```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { TableColumn } from '../../shared/models/table.model';

@Component({
  selector: 'app-inspection-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="p-6 space-y-6">
      <app-page-header
        title="Centre Inspection Reports"
        subtitle="Live physical verification audits of Skill Development Centres"
      ></app-page-header>
      
      <app-table [columns]="columns" [data]="inspections()"></app-table>
    </div>
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
Open [`src/app/app.routes.ts`](file:///d:/ISMS/Frontend/isms-ui/isms-ui/src/app/app.routes.ts) and add:
```typescript
{
  path: 'admin/inspections',
  loadComponent: () => import('./features/inspections/inspection-list.component').then(m => m.InspectionListComponent),
  title: 'ISMS 2.0 | Centre Inspections'
}
```

### Step 3: Add to Navigation Menu
Open the sidebar navigation in `src/app/app.component.html` and add the link:
```html
<a routerLink="/admin/inspections" routerLinkActive="active-nav" class="nav-item">
  <i class="fa fa-clipboard-check"></i>
  <span>Inspections</span>
</a>
```

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
- **Sanction Orders** (`/admin/sanction-orders`): Automatically generates official government sanction orders containing physical targets, financial grant allocations, and installment schedules.
- **In-Principle Approval (IPA)** (`/admin/ipa`): Generates and exports official letters of intent for accredited Training Partners.

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
**Answer**: Use the role selector in the top navbar or call `authService.setRole('super_admin' | 'dept_admin' | 'existing_user' | 'new_user')`.

### Q3: How do Department Admins bypass the 6-Digit OTP modal?
**Answer**: The modal requires the test OTP `123456`. Entering this OTP or clicking "Verify" grants immediate Department Admin dashboard access.

### Q4: How do I verify there are no compilation errors?
**Answer**: Run `npx ng build` in PowerShell. Ensure it exits with code 0.

---

> **ISMS 2.0 Architecture Documentation**  
> *Developed with precision for RSLDC Government of Rajasthan.*
