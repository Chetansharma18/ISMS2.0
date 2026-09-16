# ISMS 2.0 — COMPLETE TECHNICAL AUDIT & ARCHITECTURAL DOCUMENTATION
**Target Feature:** `src/app/features/forms` (TP/PIA One-Time Registration)  
**System:** Integrated Scheme Management System (ISMS 2.0), Rajasthan  
**Audit Date:** September 16, 2026  
**Target Directory:** `d:\ISMS 2.0\ISMS2.0\src\app\features\forms`  
**Analysis Classification:** Static Code Analysis, Architecture Inspection & Field-Level Audit (Zero-Modification Mode)  

---

## 1. COMPLETE FORMS FOLDER STRUCTURE

The `src/app/features/forms` module houses the one-time registration workflow for Training Partners (TP) and Project Implementing Agencies (PIA). It contains 7 files across 3 subdirectories.

### File Tree
```
d:/ISMS 2.0/ISMS2.0/src/app/features/forms/
├── forms.routes.ts                                         (12 lines, 343 B)
├── components/
│   └── tp-pia-registration/
│       ├── tp-pia-registration.component.html              (2,565 lines, 175,001 B)
│       ├── tp-pia-registration.component.scss              (63 lines, 1,251 B)
│       └── tp-pia-registration.component.ts                (1,257 lines, 40,014 B)
├── models/
│   └── tp-pia-registration.model.ts                        (152 lines, 2,979 B)
└── services/
    ├── form-validation.service.ts                          (607 lines, 20,513 B)
    └── tp-pia-registration.service.ts                      (467 lines, 15,005 B)
```

### File Details & Dependency Matrix

| File Path | Type | Lines | Size | Primary Responsibility | Downstream Consumers | Direct Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `forms.routes.ts` | TS (Routes) | 12 | 343 B | Route definitions for forms module; defines `FORMS_ROUTES` with paths `''` and `'tp-pia-registration'`. | `src/app/app.routes.ts` (lazy loaded) | `@angular/router`, `TpPiaRegistrationComponent` |
| `models/tp-pia-registration.model.ts` | TS (Models) | 152 | 2,979 B | Central domain model definitions (`TpPiaRegistrationData`, sub-interfaces, enums). | Component, Validation Service, Registration Service | None |
| `services/form-validation.service.ts` | TS (Service) | 607 | 20,513 B | Synchronous field & tab validators, regex pattern library, error maps, submission trackers, toast messaging. | `tp-pia-registration.component.ts` | `@angular/core`, `tp-pia-registration.model.ts` |
| `services/tp-pia-registration.service.ts` | TS (Service) | 467 | 15,005 B | Reactive state store for form data (`signal<TpPiaRegistrationData>`), auto-save debouncer, localStorage sync, sample mock data, application number generator, dropdown constant lists. | `tp-pia-registration.component.ts` | `@angular/core`, `tp-pia-registration.model.ts` |
| `components/tp-pia-registration/tp-pia-registration.component.ts` | TS (Component) | 1,257 | 40,014 B | Master wizard controller. Manages 5 tabs, 5 searchable dropdowns, 4 modals, keyboard input filters, date formatters, file upload logic, step navigation, and final submission. | `forms.routes.ts` | `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`, Models, Validation Service, Registration Service |
| `components/tp-pia-registration/tp-pia-registration.component.html` | HTML (Template) | 2,565 | 175,001 B | Monolithic template containing Rajasthan portal header, responsive stepper bar, 5 step cards, custom dropdowns, 4 dialog modals, mobile & desktop document tables, and review summary. | `tp-pia-registration.component.ts` | Binds to TS properties and methods |
| `components/tp-pia-registration/tp-pia-registration.component.scss` | SCSS (Styles) | 63 | 1,251 B | Custom styling for scrollbar suppression (`.no-scrollbar`), smooth step transitions (`.step-content-smooth`), number input spinner suppression (`.no-spinners`), and dropdown scrollbars (`.dropdown-menu-scroll`). | `tp-pia-registration.component.ts` | Plain CSS/SCSS |

---

## 2. MAIN COMPONENT — COMPLETE ANALYSIS
**Component:** `TpPiaRegistrationComponent`  
**Source Path:** `d:\ISMS 2.0\ISMS2.0\src\app\features\forms\components\tp-pia-registration\tp-pia-registration.component.ts`

### 2.1 Imports Inventory & Rationale

#### Angular Core & Common Imports
1. **`Component`** (`@angular/core`): Decorator required to declare the class as an Angular UI component.
2. **`inject`** (`@angular/core`): Functional dependency injection function used to inject `TpPiaRegistrationService` and `FormValidationService` directly in property declarations without constructor boilerplate.
3. **`signal`** (`@angular/core`): Reactive state primitive used for local interactive states: `activeTab`, `showSuccessModal`, `fontScale`, accordion open/close flags, dropdown open flags, dropdown search query strings, drag-and-drop flags, and modal states.
4. **`computed`** (`@angular/core`): Derived reactive primitive used to calculate filtered dropdown option lists, tab-level error dictionaries, aggregate error collections, and tab completion/validity statuses.
5. **`ChangeDetectionStrategy`** (`@angular/core`): Configures the component to use `OnPush` change detection, minimizing template re-evaluations to signal changes and user interactions.
6. **`HostListener`** (`@angular/core`): Listens to window/document-level DOM events: `document:click` (to close searchable dropdowns when clicking outside) and `document:keydown.escape` (to dismiss dropdowns on Escape).
7. **`OnInit`** (`@angular/core`): Lifecycle interface; `ngOnInit()` verifies whether `data.basicInfo.applicationNo` exists and generates one if absent.
8. **`CommonModule`** (`@angular/common`): Provides core Angular structural directives including `ngClass` and pipes.
9. **`FormsModule`** (`@angular/forms`): Supplies `ngModel` and `ngModelChange` directives for two-way data binding across input, select, textarea, and checkbox controls.
10. **`RouterModule`** (`@angular/router`): Included in the component `imports` array for potential routing linkages (currently dormant in template).

#### Service & Constant Imports (`../../services/tp-pia-registration.service`, `../../services/form-validation.service`)
11. **`TpPiaRegistrationService`**: Primary state container service holding the reactive form data signal and localStorage synchronization routines.
12. **`INDIAN_STATES`**: Array of 29 Indian States used to populate searchable state dropdowns.
13. **`RAJASTHAN_DISTRICTS`**: Array of 33 Rajasthan Districts used for district search.
14. **`BUSINESS_ACTIVITIES`**: Array of 7 business activities for the organization profile select.
15. **`ID_PROOF_TYPES`**: Array of identity proof types for authorized person.
16. **`COMMON_BANKS`**: Array of 14 common commercial/scheduled banks for bank search.
17. **`TRANSFER_MODES`**: Array of 4 electronic transfer modes (`RTGS`, `NEFT`, `ECS`, `CBS`).
18. **`ACCOUNT_TYPES`**: Array of 2 bank account types (`Current Account`, `Savings Account`).
19. **`FormValidationService`**: Injected validation service providing synchronous validation rules, tab status tracking, and toast alerts.

#### Model Imports (`../../models/tp-pia-registration.model`)
20. **`OfficerInCharge`**: Model representing an administrative officer record.
21. **`AwardItem`**: Model representing an organization award/recognition.
22. **`UploadedDocument`**: Model representing compliance documents and their upload metadata.
23. **`TpPiaRegistrationData`**: Comprehensive aggregate model for the entire TP/PIA dossier.

### 2.2 Component Configuration & Metadata
- **Selector:** `app-tp-pia-registration`
- **Standalone:** `true`
- **ChangeDetection:** `ChangeDetectionStrategy.OnPush`
- **Imports Array:** `[CommonModule, FormsModule, RouterModule]`
- **Template URL:** `./tp-pia-registration.component.html`
- **Style URL:** `./tp-pia-registration.component.scss`
- **Lifecycle Hook Implementation:** `OnInit` -> `ngOnInit()` initializes the application number if not present.

### 2.3 Reactive State Management & Component Properties

| Property / Signal | Type | Initial Value | Nature | Purpose & Scope | Mutated In | Read In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `service` | `TpPiaRegistrationService` | Injected | Service | Central state and draft storage | None | Component & template |
| `valService` | `FormValidationService` | Injected | Service | Validation engine | None | Component & template |
| `Math` | `Math` | Native Math | Global | Exposes native `Math` to template | None | Template |
| `activeTab` | `WritableSignal<number>` | `1` | Signal | Currently active step (1 to 5) | `switchTab()`, `nextTab()`, `prevTab()` | Stepper UI, step containers, header info |
| `showSuccessModal` | `WritableSignal<boolean>` | `false` | Signal | Toggles final submission success dialog | `submitFinalApplication()`, close button | Success modal template |
| `fontScale` | `WritableSignal<'standard' | 'large' | 'xlarge'>` | `'standard'` | Signal | UI font size scaling | `setFontScale()` | HTML documentElement |
| `declarationAgreed` | `boolean` | `false` | Property | Checkbox state for Step 5 legal declaration | `[(ngModel)]` binding | Submit button disabled state |
| `isOrgProfileOpen` | `WritableSignal<boolean>` | `true` | Signal | Accordion toggle for Step 1 Section 1.1 | Toggle button in Section 1.1 | Section 1.1 container visibility |
| `isContactDetailsOpen` | `WritableSignal<boolean>` | `false` | Signal | Accordion toggle for Step 1 Section 1.2 | Toggle button in Section 1.2 | Section 1.2 container visibility |
| `isAddressRecordsOpen` | `WritableSignal<boolean>` | `false` | Signal | Accordion toggle for Step 1 Section 1.2 (Address) | Toggled simultaneously with contact details | Section 1.2 overflow class |
| `isReviewStep1Open` | `WritableSignal<boolean>` | `true` | Signal | Step 5 review accordion for Organisation block | Header click | Step 5 Block 1 visibility |
| `isReviewOrgProfileOpen` | `WritableSignal<boolean>` | `true` | Signal | Step 5 review sub-accordion for Profile | Sub-header click | Step 5 Sub-block 1.1 visibility |
| `isReviewContactOpen` | `WritableSignal<boolean>` | `false` | Signal | Step 5 review sub-accordion for Contact | Sub-header click | Step 5 Sub-block 1.2 visibility |
| `isReviewAddressOpen` | `WritableSignal<boolean>` | `false` | Signal | Step 5 review sub-accordion for Address | Sub-header click | Step 5 Sub-block 1.3 visibility |
| `isReviewAuthPersonOpen` | `WritableSignal<boolean>` | `false` | Signal | Step 5 review accordion for Authorized Person | Header click | Step 5 Block 2 visibility |
| `isReviewBankOpen` | `WritableSignal<boolean>` | `false` | Signal | Step 5 review accordion for Bank Details | Header click | Step 5 Block 3 visibility |
| `isReviewDocsOpen` | `WritableSignal<boolean>` | `false` | Signal | Step 5 review accordion for Documents | Header click | Step 5 Block 4 visibility |
| `tabs` | `TabItem[]` | 5 items | Readonly Array | Tab metadata (id, label, shortLabel, icon) | Immutable | Stepper rendering loop (`@for`) |
| `currentStepInfo` | `{ title: string; subtitle: string }` | Getter | Dynamic | Returns responsive step title and subtitle | Evaluates `activeTab()` | Form title banner |
| `data` | `TpPiaRegistrationData` | Getter | Dynamic | Accessor for `service.formData()` | Evaluates signal | All input bindings & TS logic |
| `changeTimer` | `any` | `undefined` | Timer | Debounce timer handle for auto-save dispatch (60ms) | `onDataChange()` | Timer reset & dispatch |
| `tab1Errors` | `Signal<Record<string, string>>` | Computed | Computed | Validation errors for Tab 1 | Recomputed on `formData()` | Merged into `errors` |
| `tab2Errors` | `Signal<Record<string, string>>` | Computed | Computed | Validation errors for Tab 2 | Recomputed on `formData()` | Merged into `errors` |
| `tab3Errors` | `Signal<Record<string, string>>` | Computed | Computed | Validation errors for Tab 3 | Recomputed on `formData()` | Merged into `errors` |
| `tab4ProjectErrors` | `Signal<Record<string, string>>` | Computed | Computed | Validation errors for Tab 4 | Recomputed on `formData()` | Merged into `errors` |
| `errors` | `Signal<Record<string, string>>` | Computed | Computed | Merged error dictionary for all fields | Recomputed when any tab error changes | `isFieldInvalid()`, `getFieldError()` |
| `tabStatuses` | `Signal<Record<number, { isCompleted: boolean; isSubmittedInvalid: boolean }>>` | Computed | Computed | Tab visual status map (valid, completed, invalid) | Recomputed on form data or tab state change | Stepper circle classes & step indicators |
| `isDistrictDropdownOpen` | `WritableSignal<boolean>` | `false` | Signal | District searchable dropdown open state | `toggleDistrictDropdown()`, outside click | Dropdown menu popup |
| `districtSearchQuery` | `WritableSignal<string>` | `''` | Signal | District search text filter | Search input `[(ngModel)]`, clear | Filtered computed |
| `filteredDistricts` | `Signal<string[]>` | Computed | Computed | Filtered list of districts matching query | Computed from query | Dropdown option list |
| `isStateRegDropdownOpen` | `WritableSignal<boolean>` | `false` | Signal | State Where Registered dropdown open state | `toggleStateRegDropdown()`, outside click | Dropdown menu popup |
| `stateRegSearchQuery` | `WritableSignal<string>` | `''` | Signal | State Where Registered search text filter | Search input `[(ngModel)]`, clear | Filtered computed |
| `filteredStatesReg` | `Signal<string[]>` | Computed | Computed | Filtered list of states matching query | Computed from query | Dropdown option list |
| `isStateAddrDropdownOpen` | `WritableSignal<boolean>` | `false` | Signal | Address State/UT dropdown open state | `toggleStateAddrDropdown()`, outside click | Dropdown menu popup |
| `stateAddrSearchQuery` | `WritableSignal<string>` | `''` | Signal | Address State search text filter | Search input `[(ngModel)]`, clear | Filtered computed |
| `filteredStatesAddr` | `Signal<string[]>` | Computed | Computed | Filtered list of states matching query | Computed from query | Dropdown option list |
| `isStateAuthDropdownOpen` | `WritableSignal<boolean>` | `false` | Signal | Authorized Person State dropdown open state | `toggleStateAuthDropdown()`, outside click | Dropdown menu popup |
| `stateAuthSearchQuery` | `WritableSignal<string>` | `''` | Signal | Authorized Person State search text filter | Search input `[(ngModel)]`, clear | Filtered computed |
| `filteredStatesAuth` | `Signal<string[]>` | Computed | Computed | Filtered list of states matching query | Computed from query | Dropdown option list |
| `isBankDropdownOpen` | `WritableSignal<boolean>` | `false` | Signal | Bank Name searchable dropdown open state | `toggleBankDropdown()`, outside click | Dropdown menu popup |
| `bankSearchQuery` | `WritableSignal<string>` | `''` | Signal | Bank Name search text filter | Search input `[(ngModel)]`, clear | Filtered computed |
| `filteredBanks` | `Signal<string[]>` | Computed | Computed | Filtered list of banks matching query | Computed from query | Dropdown option list |
| `isBankDragging` | `WritableSignal<boolean>` | `false` | Signal | Visual drag-over indicator for cheque dropzone | `onBankDragOver()`, `onBankDragLeave()` | Dropzone border/background CSS |
| `bankFileError` | `WritableSignal<string>` | `''` | Signal | Error message for cheque upload | `handleBankFile()`, `removeBankFile()` | Dropzone error banner |
| `docErrorMessage` | `WritableSignal<string>` | `''` | Signal | Error message for Step 4 document upload | `onDocFileSelected()` | Step 4 error banner |
| `previewingDoc` | `WritableSignal<UploadedDocument | null>` | `null` | Signal | Document instance currently viewed in preview modal | Preview button click, modal close | Document preview modal |
| `showOfficerModal` | `WritableSignal<boolean>` | `false` | Signal | Officer In-Charge CRUD modal open state | `openAddOfficerModal()`, `closeOfficerModal()` | Officer modal template |
| `isOfficerEditing` | `WritableSignal<boolean>` | `false` | Signal | Differentiates Add vs Edit mode for officer | `openAddOfficerModal()`, `editOfficer()` | Modal title and button text |
| `modalOfficerSubmitted` | `WritableSignal<boolean>` | `false` | Signal | Flag tracking if officer save was attempted | `saveOfficer()`, `openAddOfficerModal()` | Modal validation error display |
| `isOfficerOpen` | `WritableSignal<boolean>` | `true` | Signal | Dormant accordion flag for officer list | Set to `true` | Unused in active HTML |
| `currentOfficer` | `OfficerInCharge` | Blank Officer | Property | Model instance backing officer dialog | Edited in dialog inputs | Officer dialog input bindings |
| `showAwardModal` | `WritableSignal<boolean>` | `false` | Signal | Award Record CRUD modal open state | `openAddAwardModal()`, `closeAwardModal()` | Award modal template |
| `isAwardEditing` | `WritableSignal<boolean>` | `false` | Signal | Differentiates Add vs Edit mode for award | `openAddAwardModal()`, `editAward()` | Modal title and button text |
| `modalAwardSubmitted` | `WritableSignal<boolean>` | `false` | Signal | Flag tracking if award save was attempted | `saveAward()`, `openAddAwardModal()` | Modal validation error display |
| `isAwardOpen` | `WritableSignal<boolean>` | `true` | Signal | Dormant accordion flag for award list | Set to `true` | Unused in active HTML |
| `currentAward` | `AwardItem` | Blank Award | Property | Model instance backing award dialog | Edited in dialog inputs | Award dialog input bindings |
| `todayIso` | `string` | Getter | Dynamic | Today's date (`YYYY-MM-DD`) | Evaluates `new Date()` | `[max]` attribute on registration picker |
| `maxDobIso` | `string` | Getter | Dynamic | Max DOB (18 years ago, `YYYY-MM-DD`) | Evaluates `new Date()` | `[max]` attribute on DOB picker |
| `minDobIso` | `string` | Getter | Dynamic | Min DOB (100 years ago, `YYYY-MM-DD`) | Evaluates `new Date()` | `[min]` attribute on DOB picker |

---

### 2.4 Complete Method Inventory (64 Methods)

| Method Name | Parameters | Return | Exact Purpose | Data Read | Data Written | Service Invocation | UI / Behavioral Effect |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ngOnInit` | None | `void` | Initializes application number if not present | `data.basicInfo.applicationNo` | `data.basicInfo.applicationNo` | `service.updateFormData()`, `service.generateApplicationNo()` | Sets default application number |
| `currentStepInfo` (get) | None | `{title, subtitle}` | Returns responsive step header title & subtitle based on activeTab | `activeTab()` | None | None | Updates header banner |
| `data` (get) | None | `TpPiaRegistrationData` | Accessor for current form data object | `service.formData()` | None | None | Template data source |
| `onDataChange` | None | `void` | Debounces updates (60ms) and triggers auto-save | None | `changeTimer` | `service.updateFormData()` | Refreshes reactive signal & triggers auto-save |
| `getFieldValue` | `fieldKey: string` | `any` | Traverses dot-delimited property path on form data | `data`, `fieldKey` | None | None | Resolves field value for validation check |
| `isFieldInvalid` | `fieldKey: string` | `boolean` | Evaluates whether field has validation error and should display it | `errors()`, `getFieldValue()`, `valService.isTabSubmitted()` | None | `valService.isTabSubmitted()` | Toggles red error border and error message |
| `getFieldError` | `fieldKey: string` | `string` | Returns error message string if invalid | `errors()`, `isFieldInvalid()` | None | None | Renders error text in `<p>` tag |
| `isTabValid` | `tabId: number` | `boolean` | Evaluates tab validity | `data` | None | `valService.isTabValid()` | Validates tab status |
| `isTabCompleted` | `tabId: number` | `boolean` | Checks if tab is completed | `tabStatuses()` | None | None | Sets green checkmark icon in stepper |
| `isTabSubmittedInvalid`| `tabId: number` | `boolean` | Checks if tab was submitted with errors | `tabStatuses()` | None | None | Sets red exclamation icon in stepper |
| `closeAllDropdowns` | None | `void` | Closes all 5 searchable dropdowns | None | Sets 5 dropdown signals to `false` | None | Dismisses open dropdown menus |
| `toggleDistrictDropdown`| `event?: MouseEvent` | `void` | Toggles district dropdown and focuses search input | `isDistrictDropdownOpen()` | Toggles signal, resets query | None | Opens/closes district menu & focuses input |
| `selectDistrict` | `dist: string` | `void` | Selects district and closes menu | None | `registeredAddress.district`, resets query & open signal | None | Updates district and runs address change handler |
| `clearDistrict` | `event?: MouseEvent` | `void` | Clears selected district | None | `registeredAddress.district = ''` | None | Resets district to empty |
| `toggleStateRegDropdown` | `event?: MouseEvent` | `void` | Toggles registered state dropdown | `isStateRegDropdownOpen()` | Toggles signal, resets query | None | Opens/closes state reg menu & focuses input |
| `selectStateReg` | `state: string` | `void` | Selects registered state | None | `entityInfo.stateWhereRegistered`, resets query & open | None | Updates state reg and triggers change |
| `clearStateReg` | `event?: MouseEvent` | `void` | Clears registered state | None | `entityInfo.stateWhereRegistered = ''` | None | Resets state reg to empty |
| `toggleStateAddrDropdown`| `event?: MouseEvent` | `void` | Toggles address state dropdown | `isStateAddrDropdownOpen()` | Toggles signal, resets query | None | Opens/closes address state menu & focuses input |
| `selectStateAddr` | `state: string` | `void` | Selects address state | None | `registeredAddress.state`, resets query & open | None | Updates address state and syncs postal |
| `clearStateAddr` | `event?: MouseEvent` | `void` | Clears address state | None | `registeredAddress.state = ''` | None | Resets address state to empty |
| `toggleStateAuthDropdown`| `event?: MouseEvent` | `void` | Toggles authorized state dropdown | `isStateAuthDropdownOpen()` | Toggles signal, resets query | None | Opens/closes auth state menu & focuses input |
| `selectStateAuth` | `state: string` | `void` | Selects authorized state | None | `authorizedOrg.state`, resets query & open | None | Updates auth state and triggers change |
| `clearStateAuth` | `event?: MouseEvent` | `void` | Clears authorized state | None | `authorizedOrg.state = ''` | None | Resets auth state to empty |
| `toggleBankDropdown` | `event?: MouseEvent` | `void` | Toggles bank dropdown | `isBankDropdownOpen()` | Toggles signal, resets query | None | Opens/closes bank menu & focuses input |
| `selectBank` | `bank: string` | `void` | Selects bank name | None | `bankDetails.bankName`, resets query & open | None | Updates bank name and triggers change |
| `clearBank` | `event?: MouseEvent` | `void` | Clears bank name | None | `bankDetails.bankName = ''` | None | Resets bank name to empty |
| `onDocumentClick` | `event: MouseEvent` | `void` | Outside-click handler closing dropdowns | Event target | Sets 5 dropdown signals to `false` | None | Closes menus when clicking outside |
| `onEscapePress` | None | `void` | Escape key listener closing dropdowns | None | Sets 5 dropdown signals to `false` | None | Dismisses open dropdown menus on Escape |
| `toggleSameAddress` | None | `void` | Syncs postal address with registered address | `data.sameAsRegistered`, `registeredAddress` | `postalAddress` fields | `service.updateFormData()` | Automatically copies address fields |
| `onRegisteredAddressChange`| None | `void` | Triggers postal sync if sameAsRegistered is active | `data.sameAsRegistered` | None | Calls `toggleSameAddress()`, `onDataChange()` | Keeps postal in sync with registered |
| `todayIso` (get) | None | `string` | Returns current date in YYYY-MM-DD | System clock | None | None | Date picker upper bound |
| `maxDobIso` (get) | None | `string` | Returns date 18 years ago in YYYY-MM-DD | System clock | None | None | DOB date picker upper bound (18 yrs min age) |
| `minDobIso` (get) | None | `string` | Returns date 100 years ago in YYYY-MM-DD | System clock | None | None | DOB date picker lower bound (100 yrs max age) |
| `onlyNumbers` | `event: KeyboardEvent` | `boolean` | Prevents non-digit keystrokes | `event.key` | None | None | Blocks character input on numeric fields |
| `onlyLetters` | `event: KeyboardEvent` | `boolean` | Allows letters, spaces, and dots | `event.key` | None | None | Blocks digits and special symbols |
| `onlyLettersSymbols` | `event: KeyboardEvent` | `boolean` | Allows letters, spaces, and & / - . | `event.key` | None | None | Blocks digits on organization short name |
| `onlyAlphanumericSymbols`| `event: KeyboardEvent` | `boolean` | Allows letters, numbers, spaces, & / - . | `event.key` | None | None | Restricts registration number & branch names |
| `onlyAlphanumeric` | `event: KeyboardEvent` | `boolean` | Allows letters and numbers only | `event.key` | None | None | Restricts PAN, IFSC, Passport inputs |
| `onlyDecimals` | `event: KeyboardEvent, currentVal: any` | `boolean` | Restricts input to digits and max 1 decimal point | `event.key`, `currentVal` | None | None | Restricts turnover input |
| `sanitizeNumbers` | `val: any, maxLen?: number` | `string` | Strips all non-digit characters | `val` | None | None | Sanitizes pasted or typed numbers |
| `sanitizeLetters` | `val?: string, maxLen?: number` | `string` | Strips non-letter/space/dot characters | `val` | None | None | Sanitizes full name and guardian name |
| `sanitizeAlphanumericUpper`| `val?: string, maxLen?: number` | `string` | Converts to uppercase alphanumeric | `val` | None | None | Sanitizes PAN, IFSC, Passport |
| `sanitizeAlphanumericSymbols`| `val?: string, maxLen?: number` | `string` | Strips non-alphanumeric/symbol characters | `val` | None | None | Sanitizes branch and designation |
| `sanitizeAlphanumericSymbolsUpper`| `val?: string, maxLen?: number` | `string` | Converts to uppercase alphanumeric with symbols | `val` | None | None | Sanitizes Voter ID, Bhamashah |
| `sanitizeLettersSymbolsUpper`| `val?: string, maxLen?: number` | `string` | Converts to uppercase letters and symbols (no numbers) | `val` | None | None | Sanitizes short name |
| `sanitizeDecimals` | `val: any, maxLen?: number` | `string` | Strips invalid decimal formats | `val` | None | None | Sanitizes turnover input |
| `formatDateDisplay` | `dateStr?: string` | `string` | Converts ISO YYYY-MM-DD to DD/MM/YYYY | `dateStr` | None | None | Formats display text for date fields |
| `getIsoDate` | `dateStr?: string` | `string` | Converts DD/MM/YYYY to ISO YYYY-MM-DD | `dateStr` | None | None | Sets native date picker `[value]` |
| `onDateInput` | `event: Event, field: 'registration' | 'dob'` | `void` | Auto-inserts slashes as user types date | `event.target.value` | Formatted date string in form data | Calls `onDataChange()` / `onDobChange()` | Real-time date typing mask |
| `onDatePick` | `event: Event, field: 'registration' | 'dob'` | `void` | Receives date from native date picker | `event.target.value` | Formatted date string in form data | Calls `onDataChange()` / `onDobChange()` | Syncs native picker to input |
| `openPicker` | `picker: HTMLInputElement` | `void` | Triggers browser native date picker UI | `picker` | None | None | Opens date picker modal |
| `onDobChange` | None | `void` | Calculates age based on DOB string | `data.authorizedOrg.dob` | `data.authorizedOrg.age` | Calls `onDataChange()` | Auto-computes age |
| `onTypeIdProofChange` | None | `void` | Syncs `idNo` when ID type dropdown changes | `data.authorizedOrg.typeIdProof`, existing IDs | `data.authorizedOrg.idNo` | Calls `onDataChange()` | Prepopulates `idNo` from selected ID |
| `onAadhaarChange` | None | `void` | Sanitizes Aadhaar to 12 digits | `data.authorizedOrg.aadhaarNo` | `data.authorizedOrg.aadhaarNo` | Calls `onDataChange()` | Restricts Aadhaar input |
| `onVoterIdChange` | None | `void` | Uppercases Voter ID and syncs with `idNo` | `data.authorizedOrg.voterIdNo` | `voterIdNo`, `idNo` | Calls `onDataChange()` | Syncs Voter ID to master ID |
| `onPassportChange` | None | `void` | Uppercases Passport and syncs with `idNo` | `data.authorizedOrg.passportNo` | `passportNo`, `idNo` | Calls `onDataChange()` | Syncs Passport to master ID |
| `onBhamashahChange` | None | `void` | Syncs Bhamashah to `idNo` | `data.authorizedOrg.bhamashahNo` | `idNo` | Calls `onDataChange()` | Syncs Bhamashah to master ID |
| `onPanChange` | None | `void` | Uppercases PAN and syncs with `idNo` | `data.authorizedOrg.pan` | `pan`, `idNo` | Calls `onDataChange()` | Syncs PAN to master ID |
| `onBankDragOver` | `e: DragEvent` | `void` | Sets `isBankDragging` to true | Drag event | `isBankDragging = true` | None | Shows drag-over highlight |
| `onBankDragLeave` | `e: DragEvent` | `void` | Sets `isBankDragging` to false | Drag event | `isBankDragging = false` | None | Removes drag-over highlight |
| `onBankFileDrop` | `e: DragEvent` | `void` | Handles dropped cheque file | `e.dataTransfer.files` | Calls `handleBankFile()` | None | Processes dropped file |
| `onBankFileSelected` | `e: Event` | `void` | Handles selected cheque file from file input | `input.files` | Calls `handleBankFile()` | None | Processes selected file |
| `handleBankFile` | `file: File` | `void` | Validates size (5MB) & ext, saves cheque metadata | `file` | `bankFileError`, `bankDetails.cancelledChequeFileName/Size`, updates `doc-bank` | `service.updateFormData()` | Displays uploaded file card |
| `removeBankFile` | None | `void` | Clears cheque metadata | None | Clears cheque properties, resets `doc-bank` to pending | `service.updateFormData()` | Reverts dropzone to empty |
| `documents` (get) | None | `UploadedDocument[]` | Returns list of statutory documents | `service.formData().documents` | None | None | Table & card rendering loop |
| `totalRequiredCount` (get)| None | `number` | Counts mandatory documents | `documents` | None | None | Displays mandatory count |
| `uploadedRequiredCount` (get)| None | `number` | Counts uploaded mandatory documents | `documents` | None | None | Displays uploaded count |
| `isTab4Submitted` (get) | None | `boolean` | Checks if Tab 4 was submitted | None | None | `valService.isTabSubmitted(4)` | Toggles validation styling |
| `isTab4Invalid` (get) | None | `boolean` | Checks if Tab 4 has missing required docs | `isTab4Submitted`, counts | None | None | Displays banner on Step 4 |
| `onDocFileSelected` | `event: Event, docId: string` | `void` | Validates size/type and attaches document | `file`, `docId` | `docErrorMessage`, updates document item in array | `service.updateFormData()` | Updates document row state |
| `removeDocument` | `docId: string` | `void` | Detaches document and resets to pending | `docId` | Resets fileName, fileSize, uploadDate, status | `service.updateFormData()` | Reverts document row state |
| `showOfficerModal` (get) | None | `boolean` | Returns officer modal signal | None | None | None | Dialog visibility |
| `officers` (get) | None | `OfficerInCharge[]` | Returns officers array from form data | `service.formData().officers` | None | None | Officers list data source |
| `isOfficerTabInvalid` (get)| None | `boolean` | Evaluates officer tab validity | None | None | `valService.isTabSubmitted(2)`, `isTabValid(2)` | Error indicator |
| `officerErrors` (get) | None | `Record<string, string>` | Validates `currentOfficer` | `currentOfficer` | None | `valService.validateOfficer()` | Dialog validation |
| `isOfficerModalFieldInvalid`| `field: keyof OfficerInCharge` | `boolean` | Checks if officer dialog field is invalid | `officerErrors`, `currentOfficer`, `modalOfficerSubmitted` | None | None | Dialog error border |
| `getOfficerModalFieldError`| `field: keyof OfficerInCharge` | `string` | Returns error string for officer field | `officerErrors` | None | None | Dialog error message |
| `openAddOfficerModal` | None | `void` | Opens dialog in Add mode | None | `isOfficerEditing = false`, resets `currentOfficer`, `showOfficerModal = true` | None | Displays Add Officer dialog |
| `editOfficer` | `off: OfficerInCharge` | `void` | Opens dialog in Edit mode | `off` | `isOfficerEditing = true`, copies officer, `showOfficerModal = true` | None | Displays Edit Officer dialog |
| `deleteOfficer` | `id: string` | `void` | Confirms and deletes officer record | User confirm | Removes officer from `officers` array | `service.updateFormData()` | Deletes officer from list |
| `saveOfficer` | None | `void` | Validates and saves officer to array | `currentOfficer` | Appends or updates officer in array | `valService.validateOfficer()`, `service.updateFormData()` | Closes dialog on success |
| `closeOfficerModal` | None | `void` | Closes officer dialog | None | `showOfficerModal = false` | None | Hides modal |
| `getEmptyOfficer` | None | `OfficerInCharge` | Returns blank officer data template | None | None | None | Initial state factory |
| `awards` (get) | None | `AwardItem[]` | Returns awards array from form data | `service.formData().awards` | None | None | Awards list data source |
| `awardErrors` (get) | None | `Record<string, string>` | Validates `currentAward` | `currentAward` | None | `valService.validateAward()` | Dialog validation |
| `isAwardModalFieldInvalid`| `field: keyof AwardItem` | `boolean` | Checks if award dialog field is invalid | `awardErrors`, `currentAward`, `modalAwardSubmitted` | None | None | Dialog error border |
| `getAwardModalFieldError` | `field: keyof AwardItem` | `string` | Returns error string for award field | `awardErrors` | None | None | Dialog error message |
| `openAddAwardModal` | None | `void` | Opens dialog in Add mode | None | `isAwardEditing = false`, resets `currentAward`, `showAwardModal = true` | None | Displays Add Award dialog |
| `editAward` | `award: AwardItem` | `void` | Opens dialog in Edit mode | `award` | `isAwardEditing = true`, copies award, `showAwardModal = true` | None | Displays Edit Award dialog |
| `deleteAward` | `id: string` | `void` | Confirms and deletes award record | User confirm | Removes award from `awards` array | `service.updateFormData()` | Deletes award from list |
| `onAwardFileSelected` | `event: Event` | `void` | Attaches file name to `currentAward` | `input.files` | `currentAward.documentName` | None | Attaches document to award |
| `saveAward` | None | `void` | Validates and saves award to array | `currentAward` | Appends or updates award in array | `valService.validateAward()`, `service.updateFormData()` | Closes dialog on success |
| `closeAwardModal` | None | `void` | Closes award dialog | None | `showAwardModal = false` | None | Hides modal |
| `getEmptyAward` | None | `AwardItem` | Returns blank award data template | None | None | None | Initial state factory |
| `scrollStepIntoView` | `tabId: number` | `void` | Smoothly scrolls stepper button into viewport | DOM element `#step-btn-{id}` | None | None | Keeps stepper centered |
| `switchTab` | `tabId: number` | `void` | Switches active tab, auto-saves draft, scrolls top | `activeTab()`, `data` | Sets `activeTab = tabId`, saves draft | `valService.isTabValid()`, `service.saveDraftSync()` | Navigates to selected step |
| `nextTab` | None | `void` | Validates current step, displays toast if invalid, advances step | `activeTab()`, `data` | Sets `activeTab = current + 1`, saves draft | `valService.markTabSubmitted()`, `valService.showToast()`, `service.saveDraftSync()` | Advances wizard to next step |
| `prevTab` | None | `void` | Navigates to previous step, saves draft | `activeTab()` | Sets `activeTab = current - 1`, saves draft | `service.saveDraftSync()` | Navigates back one step |
| `populateDemo` | None | `void` | Populates sample government demo data | Sample data | Updates entire form data, completes all tabs | `service.populateSampleData()`, `valService.markTabCompleted()` | Populates all fields with mock data |
| `openPreviewModal` | None | `void` | Wrapper navigating to Step 5 (Review) | None | None | Calls `switchTab(5)` | Displays Review Step |
| `openReviewModal` | None | `void` | Wrapper navigating to Step 5 (Review) | None | None | Calls `switchTab(5)` | Displays Review Step |
| `submitFinalApplication`| None | `void` | Final submission verification and modal display | `declarationAgreed`, `data` | Marks tabs submitted, updates status to 'Submitted', opens modal | `valService.getFirstInvalidTab()`, `service.updateFormData()` | Submits form & displays success dialog |
| `confirmSubmit` | None | `void` | Wrapper delegating to `submitFinalApplication()` | None | None | Calls `submitFinalApplication()` | Triggers submission |
| `printAcknowledgement`| None | `void` | Triggers browser native print window | None | None | Calls `window.print()` | Opens print dialog |
| `setFontScale` | `scale: 'standard' | 'large' | 'xlarge'` | `void` | Applies font scale class to document root | `scale` | `fontScale` signal, documentElement classes | None | Resizes typography |

### 2.5 Code Pattern Categorization & Identification
- **Wrapper / Delegation Methods:**
  - `openPreviewModal()` -> simply calls `switchTab(5)`.
  - `openReviewModal()` -> simply calls `switchTab(5)` (duplicate of `openPreviewModal`).
  - `confirmSubmit()` -> simply calls `submitFinalApplication()`.
- **Dormant / Unused Controller Methods in HTML:**
  - `openAddOfficerModal()`, `editOfficer()`, `deleteOfficer()`, `saveOfficer()`, `closeOfficerModal()`
  - `openAddAwardModal()`, `editAward()`, `deleteAward()`, `saveAward()`, `closeAwardModal()`
  - `populateDemo()`
  - `setFontScale()`
  *(Note: The modals for Officer and Award are written into the HTML lines 2216–2509, but there are zero buttons or triggers in the 5 main tabs that ever call `openAddOfficerModal()` or `openAddAwardModal()`. They are remnants from a previous tab-based architecture).*
- **Repeated Dropdown Logic:**
  - 5 near-identical implementations for District, State Reg, State Addr, State Auth, and Bank Name (toggle, select, clear, outside-click, escape, search filter). Totaling ~150 lines of duplicate logic.


---

## 3. FORM WIZARD / STEP FLOW & NAVIGATION

The application implements a 5-step sequential wizard with non-blocking direct-tab jumping, validation gating on forward progression, auto-saving drafts on every tab switch, and automatic viewport repositioning.

### 3.1 Step Definitions & Metadata

| Step ID | Label | Short Label | Icon | Header Title | Header Subtitle | Primary Data Domain |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- |
| **1** | Organisation Details | Organisation | 🏢 | Step 1: Organisation / Company Basic Details | Primary profile, legal constitution, address records, and workflow authority | `basicInfo`, `entityInfo`, `registeredAddress`, `postalAddress` |
| **2** | Auth Person (Org) | Auth (Org) | ✍️ | Step 2: Authorized Person Details (Organisation Level) | Statutory corporate signatory, identity proofs, and legal credentials | `authorizedOrg` |
| **3** | Bank Details | Bank Details | 🏦 | Step 3: Bank Details | PFMS / DBT disbursal dedicated bank account, transfer mode, and verification records | `bankDetails` |
| **4** | Document Upload | Documents | 📁 | Step 4: Document Upload | Mandatory statutory compliance documents, registration certificate, PAN, GST, and affidavits | `documents` |
| **5** | Review & Submit | Review | 📋 | Step 5: Review & Final Submission | Review all application details, edit any section if needed, and submit the application | Readonly aggregate & declaration |

### 3.2 Navigation Mechanics

```
[Step 1: Org Details]  <--->  [Step 2: Auth Person]  <--->  [Step 3: Bank Details]  <--->  [Step 4: Documents]  <--->  [Step 5: Review & Submit]
         |                              |                             |                             |                             |
   (Next Step)                    (Next Step)                   (Next Step)                   (Next Step)                 (Submit Final)
         v                              v                             v                             v                             v
  Validate Tab 1                 Validate Tab 2                Validate Tab 3                Validate Tab 4             Validate Tabs 1-4 & Decl.
  -> Save Draft                  -> Save Draft                 -> Save Draft                 -> Save Draft              -> Set status: 'Submitted'
  -> Advance to 2                -> Advance to 3               -> Advance to 4               -> Advance to 5            -> Show Success Modal
```

1. **Direct Tab Clicking (`switchTab(tabId)`):**
   - Users can click any step button in the top stepper at any time.
   - If the current tab is valid, it marks it completed via `valService.markTabCompleted(current)`.
   - It performs a synchronous draft save via `service.saveDraftSync()`.
   - It updates `activeTab.set(tabId)`, clears active toasts, scrolls to top of page, and scrolls the active stepper button into view.
2. **Next Step Button (`nextTab()`):**
   - Evaluates on current `activeTab()`.
   - Marks the tab as submitted via `valService.markTabSubmitted(current)`.
   - If `current <= 4` and `!valService.isTabValid(current, this.data)`:
     - Triggers an error toast: `"Please fill all required fields correctly in \"{tabName}\" before proceeding."`
     - Aborts forward progression.
     - Automatically scrolls window to top to display error highlights.
   - If valid:
     - Marks current tab completed via `valService.markTabCompleted(current)`.
     - Clears toasts and runs `service.saveDraftSync()`.
     - Increments `activeTab` to `current + 1`.
     - Scrolls window to top and aligns stepper button in view.
3. **Back Step Button (`prevTab()`):**
   - Decrements `activeTab` by 1 if `activeTab() > 1`.
   - Disabled on Step 1.
   - Runs `service.saveDraftSync()` and smoothly scrolls to top.
4. **Step Visual Indicator Logic (`tabStatuses` Computed):**
   - **Active Step:** `bg-[#1a2656] text-white` (Navy Blue circle showing step number).
   - **Completed Step:** `bg-emerald-600 text-white` (Green circle showing checkmark `✓`).
   - **Submitted with Errors:** `bg-rose-500 text-white` (Red circle showing exclamation `!`).
   - **Untouched Step:** `bg-white border-2 border-slate-300 text-slate-500` (Grey outlined circle showing step number).

---

## 4. EXHAUSTIVE FORM FIELD INVENTORY

The following matrix documents all **65 individual input controls, textareas, selects, dropdowns, checkboxes, and file dropzones** present across the 5 wizard steps and modal dialogs.

| # | Step / Location | Section / Container | Field Label | Exact Model Binding | Control Type | Req? | Length Limits | Placeholder / Default | Handlers & Keypress | Sanitization Logic | Validation Rule & Error Message |
| :-: | :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| 1 | Step 1 | 1.1 Org Profile | Application No. | `data.basicInfo.applicationNo` | text | Opt | Max 30 | Auto-generated / `'ISMS-TP-...' ` | Readonly, tabindex="-1" | None | System generated |
| 2 | Step 1 | 1.1 Org Profile | Date of Registration | `data.basicInfo.dateOfRegistration` | text + date | Opt | Max 10 | "DD/MM/YYYY" | `(input)="onDateInput($event, 'registration')"`, paired with hidden native picker | Auto-slash formatting DD/MM/YYYY | Valid date, DD/MM/YYYY, not future |
| 3 | Step 1 | 1.1 Org Profile | TP/PIA Full Name | `data.basicInfo.fullName` | text | **Yes** | 3 - 100 | "Enter TP/PIA Full Name (Letters only)" | `(keypress)="onlyLetters($event)"`, `(input)="...sanitizeLetters(..., 100); onDataChange()"` | Letters, spaces, dots only | Required, >=3 chars, <=100 chars, letters only |
| 4 | Step 1 | 1.1 Org Profile | TP/PIA Short Name | `data.basicInfo.shortName` | text | **Yes** | 2 - 30 | "e.g. KUSHAL / SKILL-ORG" | `(keypress)="onlyLettersSymbols($event)"`, `(input)="...sanitizeLettersSymbolsUpper(..., 30); onDataChange()"` | Uppercase letters, spaces, & / - . | Required, >=2 chars, <=30 chars, uppercase letters & symbols |
| 5 | Step 1 | 1.1 Org Profile | Entity Registration Number | `data.basicInfo.registrationNumber` | text | Opt | 3 - 30 | "Enter Entity Registration Number" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbolsUpper(..., 30); onDataChange()"` | Uppercase alphanumeric + symbols | If entered: >=3 chars, <=30 chars, alphanumeric & symbols |
| 6 | Step 1 | 1.1 Org Profile | Organisation PAN No. | `data.basicInfo.panNo` | text | Opt | Max 10 | "10-character PAN (e.g. ABCDE1234F)" | `(keypress)="onlyAlphanumeric($event)"`, `(input)="...sanitizeAlphanumericUpper(..., 10); onDataChange()"` | Uppercase alphanumeric | If entered: Valid 10-char PAN (`[A-Z]{5}[0-9]{4}[A-Z]`) |
| 7 | Step 1 | 1.1 Org Profile | Type of Business / Activity | `data.entityInfo.businessActivity` | select | Opt | N/A | "-- Select Business Activity --" | `(change)="onDataChange()"` | Option list selection | Optional |
| 8 | Step 1 | 1.1 Org Profile | State Where Registered | `data.entityInfo.stateWhereRegistered` | custom dropdown | Opt | N/A | Default: 'Rajasthan' | `(click)="toggleStateRegDropdown()"`, search query, selection, clear | Filtered from `INDIAN_STATES` | Optional |
| 9 | Step 1 | 1.1 Org Profile | Annual Turnover (₹ in Lakhs) | `data.entityInfo.turnOver` | text (decimal) | **Yes** | Max 10 | "Turnover (e.g. 150.00)" | `(keypress)="onlyDecimals($event, ...)"`, `(input)="...sanitizeDecimals(..., 10); onDataChange()"` | Digits + max 1 decimal point | Required, numeric >= 0, <= 10,000,000 |
| 10 | Step 1 | 1.1 Org Profile | Official Website | `data.basicInfo.website` | url | Opt | Max 100 | "https://www.organisation.org" | `(input)="onDataChange()"` | Free text | If entered: <=100 chars, valid URL pattern |
| 11 | Step 1 | 1.2 Contact | Organisation Contact No. | `data.basicInfo.contactNo` | tel | **Yes** | Max 10 | "10-digit mobile number" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 10); onDataChange()"` | Digits only (max 10) | Required, valid 10-digit mobile (`^[6-9]\d{9}$`) |
| 12 | Step 1 | 1.2 Contact | Company Official Email-ID | `data.basicInfo.emailId` | email | **Yes** | Max 80 | "info@organisation.org" | `(input)="onDataChange()"` | Free text | Required, valid email regex pattern |
| 13 | Step 1 | 1.2 Address | Premises / Building, Street & Area (Reg) | `data.registeredAddress.address` | textarea | **Yes** | Max 250 | "Enter Building, Street, Landmark" | `(ngModelChange)="onRegisteredAddressChange()"` | Free text | Required, non-empty |
| 14 | Step 1 | 1.2 Address | State/UT (Registered) | `data.registeredAddress.state` | custom dropdown | **Yes** | N/A | Default: 'Rajasthan' | `(click)="toggleStateAddrDropdown()"`, search query, select, clear | Filtered from `INDIAN_STATES` | Required, non-empty |
| 15 | Step 1 | 1.2 Address | District (Registered) | `data.registeredAddress.district` | custom dropdown OR text | **Yes** | Max 80 | "-- District --" (or text if outside RJ) | If RJ: `toggleDistrictDropdown()`; Else: text input with `onlyLetters` | RJ: `RAJASTHAN_DISTRICTS`; Else: letters only | Required, non-empty |
| 16 | Step 1 | 1.2 Address | Pincode (Registered) | `data.registeredAddress.pincode` | text (num) | **Yes** | Max 6 | "6 digits" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 6); onRegisteredAddressChange()"` | Digits only (max 6) | Required, exactly 6 digits (`^\d{6}$`) |
| 17 | Step 1 | 1.2 Address | Same as Registered (Checkbox) | `data.sameAsRegistered` | checkbox | Opt | N/A | Default: `false` | `(change)="toggleSameAddress()"` | Boolean | Toggles automatic sync to postal address |
| 18 | Step 1 | 1.2 Address | Postal / Mailing Address | `data.postalAddress.address` | textarea | **Cond.** | Max 250 | "Enter Postal Address details" | `(ngModelChange)="onDataChange()"`, disabled if `sameAsRegistered` | Free text | Required if `!sameAsRegistered` |
| 19 | Step 2 | Personal Profile | Name (Authorized Person) | `data.authorizedOrg.name` | text | **Yes** | 3 - 100 | "Enter Authorized Person Full Name" | `(keypress)="onlyLetters($event)"`, `(input)="...sanitizeLetters(..., 100); onDataChange()"` | Letters, spaces, dots | Required, >=3 chars, letters only |
| 20 | Step 2 | Personal Profile | S/O, D/O, W/O (Guardian) | `data.authorizedOrg.guardianName` | text | Opt | Max 100 | "Father's / Husband's / Guardian's Name"| `(keypress)="onlyLetters($event)"`, `(input)="...sanitizeLetters(..., 100); onDataChange()"` | Letters, spaces, dots | If entered: letters, spaces, dots only |
| 21 | Step 2 | Personal Profile | Date of Birth | `data.authorizedOrg.dob` | text + date | Opt | Max 10 | "DD/MM/YYYY" | `(input)="onDateInput($event, 'dob')"`, paired with native picker | Auto-slash formatting DD/MM/YYYY | If entered: valid date, age >= 18 & <= 100 |
| 22 | Step 2 | Personal Profile | Age (Years) | `data.authorizedOrg.age` | text (num) | Opt | Max 3 | "Age (Years)" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 3); onDataChange()"` | Digits only (max 3) | If entered: numeric, 18 <= age <= 100 |
| 23 | Step 2 | Personal Profile | Designation | `data.authorizedOrg.designation` | text | Opt | Max 80 | "e.g. Director / Managing Partner / Trustee"| `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbols(..., 80); onDataChange()"` | Alphanumeric + symbols | Optional |
| 24 | Step 2 | Personal Profile | Residence Address | `data.authorizedOrg.residenceAddress` | textarea | Opt | Max 250 | "House / Flat No., Premises, Street, Area" | `(ngModelChange)="onDataChange()"` | Free text | Optional |
| 25 | Step 2 | Contact & Proofs | Mobile No. (Authorized Person) | `data.authorizedOrg.contactNo` | tel | **Yes** | Max 10 | "10-digit mobile number" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 10); onDataChange()"` | Digits only (max 10) | Required, valid 10-digit mobile (`^[6-9]\d{9}$`) |
| 26 | Step 2 | Contact & Proofs | Email-Id | `data.authorizedOrg.emailId` | email | Opt | Max 80 | "e.g. signatory@organisation.org" | `(input)="onDataChange()"` | Free text | If entered: valid email regex |
| 27 | Step 2 | Contact & Proofs | PAN Card No. | `data.authorizedOrg.pan` | text | **Yes** | Max 10 | "10-character PAN (e.g. ABCDE1234F)" | `(keypress)="onlyAlphanumeric($event)"`, `(input)="...sanitizeAlphanumericUpper(..., 10); onDataChange()"` | Uppercase alphanumeric | Required, valid 10-char PAN (`[A-Z]{5}[0-9]{4}[A-Z]`) |
| 28 | Step 2 | Contact & Proofs | Aadhaar No. | `data.authorizedOrg.aadhaarNo` | text (num) | **Yes** | Max 12 | "12-digit Aadhaar Number" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 12); onAadhaarChange()"` | Digits only (max 12) | Required, exactly 12 digits (`^\d{12}$`) |
| 29 | Step 2 | Contact & Proofs | State (Authorized Person) | `data.authorizedOrg.state` | custom dropdown | Opt | N/A | Default: 'Rajasthan' | `(click)="toggleStateAuthDropdown()"`, search query, select, clear | Filtered from `INDIAN_STATES` | Optional |
| 30 | Step 2 | Contact & Proofs | Type ID Proof (Secondary) | `data.authorizedOrg.typeIdProof` | select | Opt | N/A | "-- Select ID Proof Type --" | `(change)="onTypeIdProofChange()"` | Selection from `idTypes` | Optional |
| 31 | Step 2 | Contact & Proofs | Voter Id No. (Dynamic) | `data.authorizedOrg.voterIdNo` | text | Cond. | Max 20 | "e.g. RJ/04/123/98765" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbolsUpper(..., 20); onVoterIdChange()"` | Uppercase alphanumeric + symbols | Displayed if Type ID Proof = 'Voter ID Card' |
| 32 | Step 2 | Contact & Proofs | Passport No. (Dynamic) | `data.authorizedOrg.passportNo` | text | Cond. | Max 12 | "e.g. Z1234567" | `(keypress)="onlyAlphanumeric($event)"`, `(input)="...sanitizeAlphanumericUpper(..., 12); onPassportChange()"` | Uppercase alphanumeric | Displayed if Type ID Proof = 'Passport' |
| 33 | Step 2 | Contact & Proofs | Driving License No. (Dynamic)| `data.authorizedOrg.idNo` | text | Cond. | Max 20 | "e.g. RJ14 20200012345" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbolsUpper(..., 20); onDataChange()"` | Uppercase alphanumeric + symbols | Displayed if Type ID Proof = 'Driving License' |
| 34 | Step 2 | Contact & Proofs | Bhamashah No. (Dynamic) | `data.authorizedOrg.bhamashahNo` | text | Cond. | Max 20 | "e.g. BHAM-12345678" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbolsUpper(..., 20); onBhamashahChange()"` | Uppercase alphanumeric + symbols | Displayed if Type ID Proof = 'Bhamashah Card' |
| 35 | Step 2 | Contact & Proofs | Generic Secondary ID (Dynamic) | `data.authorizedOrg.idNo` | text | Cond. | Max 30 | "Enter ID Number" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbols(..., 30); onDataChange()"` | Alphanumeric + symbols | Displayed if other non-empty ID type selected |
| 36 | Step 3 | Bank Credentials | Name of the Bank | `data.bankDetails.bankName` | custom dropdown | **Yes** | N/A | "-- Select Bank Name --" | `(click)="toggleBankDropdown()"`, search query, select, clear | Filtered from `COMMON_BANKS` | Required, non-empty |
| 37 | Step 3 | Bank Credentials | Account No. | `data.bankDetails.accountNo` | text (num) | **Yes** | 9 - 18 | "Enter Bank Account Number (9 to 18 digits)" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 18); onDataChange()"` | Digits only (max 18) | Required, 9 to 18 digits (`^\d{9,18}$`) |
| 38 | Step 3 | Bank Credentials | IFSC Code | `data.bankDetails.ifscCode` | text | **Yes** | Max 11 | "e.g. SBIN0004129" | `(keypress)="onlyAlphanumeric($event)"`, `(input)="...sanitizeAlphanumericUpper(..., 11); onDataChange()"` | Uppercase alphanumeric | Required, 11-char IFSC (`^[A-Z]{4}0[A-Z0-9]{6}$`) |
| 39 | Step 3 | Bank Credentials | Type of Account | `data.bankDetails.accountType` | select | Opt | N/A | Default: 'Current Account' | `(change)="onDataChange()"` | Options: Current, Savings | Optional |
| 40 | Step 3 | Bank Credentials | Mode of electronic transfer | `data.bankDetails.electronicTransferMode` | select | Opt | N/A | Default: 'RTGS' | `(change)="onDataChange()"` | Options: RTGS, NEFT, ECS, CBS | Optional |
| 41 | Step 3 | Branch & Verification | Branch Name | `data.bankDetails.branchName` | text | **Yes** | Max 80 | "e.g. Malviya Nagar Branch, Jaipur" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbols(..., 80); onDataChange()"` | Alphanumeric + symbols | Required, non-empty |
| 42 | Step 3 | Branch & Verification | MICR Code | `data.bankDetails.micrCode` | text (num) | Opt | Max 9 | "9-digit MICR code (e.g. 302002018)" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 9); onDataChange()"` | Digits only (max 9) | If entered: exactly 9 digits (`^\d{9}$`) |
| 43 | Step 3 | Branch & Verification | Branch Address | `data.bankDetails.branchAddress` | textarea | **Yes** | Max 250 | "Enter complete postal address of branch" | `(ngModelChange)="onDataChange()"` | Free text | Required, non-empty |
| 44 | Step 3 | Branch & Verification | Cancelled Cheque Upload | `data.bankDetails.cancelledChequeFileName` | file dropzone | Opt | Max 5MB | Formats: PDF, JPG, PNG | `onBankDragOver`, `onBankFileDrop`, `onBankFileSelected`, `removeBankFile` | Validates size <=5MB, ext .pdf/.jpg/.jpeg/.png | Syncs with `doc-bank` in documents array |
| 45 | Step 4 | Compliance Documents | Doc 1: Registration Certificate | `documents['doc-reg-cert']` | file input | **Yes** | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-reg-cert')`, remove, preview | File type & size | Mandatory upload required before step advance |
| 46 | Step 4 | Compliance Documents | Doc 2: PAN Card | `documents['doc-pan']` | file input | **Yes** | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-pan')`, remove, preview | File type & size | Mandatory upload required before step advance |
| 47 | Step 4 | Compliance Documents | Doc 3: GST Certificate | `documents['doc-gst']` | file input | **Yes** | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-gst')`, remove, preview | File type & size | Mandatory upload required before step advance |
| 48 | Step 4 | Compliance Documents | Doc 4: Audited Balance Sheet | `documents['doc-turnover']` | file input | Opt | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-turnover')`, remove, preview | File type & size | Optional |
| 49 | Step 4 | Compliance Documents | Doc 5: Cancelled Cheque / Bank Passbook | `documents['doc-bank']` | file input | Opt | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-bank')`, remove, preview | File type & size | Optional (auto-synced from Step 3 upload) |
| 50 | Step 4 | Compliance Documents | Doc 6: Board Resolution / POA | `documents['doc-board-res']` | file input | Opt | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-board-res')`, remove, preview | File type & size | Optional |
| 51 | Step 4 | Compliance Documents | Doc 7: NSDC Certificate | `documents['doc-nsdc']` | file input | Opt | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-nsdc')`, remove, preview | File type & size | Optional |
| 52 | Step 4 | Compliance Documents | Doc 8: Additional Supporting Doc | `documents['doc-other']` | file input | Opt | Max 5MB | PDF, JPG, PNG | `onDocFileSelected($event, 'doc-other')`, remove, preview | File type & size | Optional |
| 53 | Step 5 | Legal Undertaking | Declaration Checkbox | `declarationAgreed` | checkbox | **Yes** | N/A | Default: `false` | `[(ngModel)]="declarationAgreed"` | Boolean | Must be checked (`true`) to submit application |
| 54 | Modal | Officer In-Charge | Officer Name | `currentOfficer.name` | text | **Yes** | Max 100 | "Full legal name" | `(keypress)="onlyLetters($event)"`, `(input)="...sanitizeLetters(..., 100)"` | Letters, spaces, dots | Required, letters only |
| 55 | Modal | Officer In-Charge | Designation | `currentOfficer.designation` | text | **Yes** | Max 80 | "e.g. Officer In-Charge" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbols(..., 80)"` | Alphanumeric + symbols | Required, non-empty |
| 56 | Modal | Officer In-Charge | Mobile No. | `currentOfficer.mobileNo` | tel | **Yes** | Max 10 | "10 digit mobile" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 10)"` | Digits only (max 10) | Required, 10-digit mobile (`^[6-9]\d{9}$`) |
| 57 | Modal | Officer In-Charge | Email ID | `currentOfficer.emailId` | email | **Yes** | Max 80 | "officer@domain.org" | Two-way `[(ngModel)]` | Free text | Required, valid email pattern |
| 58 | Modal | Officer In-Charge | PAN | `currentOfficer.pan` | text | Opt | Max 10 | "ABCDE1234F" | `(keypress)="onlyAlphanumeric($event)"`, `(input)="...sanitizeAlphanumericUpper(..., 10)"` | Uppercase alphanumeric | If entered: valid 10-char PAN |
| 59 | Modal | Officer In-Charge | Aadhaar No. | `currentOfficer.aadhaarNo` | text (num) | Opt | Max 12 | "12 digit Aadhaar" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 12)"` | Digits only (max 12) | If entered: exactly 12 digits |
| 60 | Modal | Officer In-Charge | Bhamashah No. | `currentOfficer.bhamashahNo` | text | Opt | Max 20 | "Bhamashah ID" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbolsUpper(..., 20)"` | Uppercase alphanumeric + symbols | Optional |
| 61 | Modal | Officer In-Charge | Voter ID No. | `currentOfficer.voterIdNo` | text | Opt | Max 20 | "EPIC / Voter ID" | `(keypress)="onlyAlphanumericSymbols($event)"`, `(input)="...sanitizeAlphanumericSymbolsUpper(..., 20)"` | Uppercase alphanumeric + symbols | Optional |
| 62 | Modal | Officer In-Charge | Passport No. | `currentOfficer.passportNo` | text | Opt | Max 12 | "Passport number" | `(keypress)="onlyAlphanumeric($event)"`, `(input)="...sanitizeAlphanumericUpper(..., 12)"` | Uppercase alphanumeric | Optional |
| 63 | Modal | Award Record | Award / Recognition Name | `currentAward.awardName` | text | **Yes** | Max 100 | "e.g. Best Skill Development Partner" | Two-way `[(ngModel)]` | Free text | Required, non-empty |
| 64 | Modal | Award Record | Awarding Agency / Body | `currentAward.awardingAgency` | text | **Yes** | Max 100 | "e.g. NSDC / Ministry of Skill" | Two-way `[(ngModel)]` | Free text | Required, non-empty |
| 65 | Modal | Award Record | Year of Award | `currentAward.year` | text (num) | Opt | Max 4 | "2025" | `(keypress)="onlyNumbers($event)"`, `(input)="...sanitizeNumbers(..., 4)"` | Digits only (max 4) | If entered: 4-digit year 1950 - 2100 |
| 66 | Modal | Award Record | Level | `currentAward.level` | select | Opt | N/A | "-- Select Level --" | Two-way `[(ngModel)]` | Options: State, National, International | Optional |
| 67 | Modal | Award Record | Description / Remarks | `currentAward.description` | text | Opt | Max 200 | "Brief details about recognition..." | Two-way `[(ngModel)]` | Free text | Optional |
| 68 | Modal | Award Record | Supporting Document | `currentAward.documentName` | file input | Opt | N/A | PDF, JPG, PNG | `(change)="onAwardFileSelected($event)"` | Attaches file name | Optional |

---

## 5. TEMPLATE / HTML ARCHITECTURE & REPETITION ANALYSIS

The template (`tp-pia-registration.component.html`) is a **monolithic file of 2,565 lines and 175 KB**.

### Line Breakdown by Major Structural Segment

| Template Segment | Line Range | Line Count | Percent of File | Key Sub-components / Contents |
| :--- | :---: | :---: | :---: | :--- |
| **1. Official Portal Header** | 1 – 33 | 33 | 1.3% | Ashoka Lion Emblem, State Titles, Bilingual Slogan, Saffron Stripe |
| **2. Stepper Navigation Bar** | 34 – 85 | 52 | 2.0% | Responsive step circles, labels, connector lines, status badges |
| **3. Form Title & Mandatory Legend** | 86 – 106 | 21 | 0.8% | Dynamic `currentStepInfo.title`, subtitle, mandatory indicator |
| **4. Step 1: Organisation Details** | 107 – 760 | 654 | 25.5% | 1.1 Profile (Application No, Date, Names, PAN, Turnover, Website), 1.2 Contact & Addresses (Phone, Email, Registered Address, Postal Address, 3 Searchable Dropdowns) |
| **5. Step 2: Authorized Person** | 761 – 1157 | 397 | 15.5% | Personal Profile (Name, Guardian, DOB, Age, Designation, Address), Contact & Statutory Proofs (Mobile, Email, PAN, Aadhaar, State Dropdown, Dynamic ID field) |
| **6. Step 3: Bank Details** | 1158 – 1473 | 316 | 12.3% | Bank Credentials (Searchable Bank dropdown, Account No, IFSC, Type, Mode), Branch & Verification (Branch Name, MICR, Address, Cheque Dropzone) |
| **7. Step 4: Document Upload** | 1474 – 1737 | 264 | 10.3% | Upload counter banner, error alerts, Mobile Card View (`block md:hidden`), Desktop Table View (`hidden md:block`), 8 document rows with actions |
| **8. Step 5: Review & Final Submission**| 1738 – 2107 | 370 | 14.4% | Collapsible review accordions for Step 1, 2, 3, 4, quick edit jump buttons, legal declaration checkbox, terms |
| **9. Bottom Action Buttons** | 2108 – 2141 | 34 | 1.3% | Back button (`prevTab`), Next Step button (`nextTab`), Final Submit button (`submitFinalApplication`) |
| **10. Dialog Modals** | 2142 – 2565 | 424 | 16.5% | Document Preview Modal (2146–2214), Officer In-Charge CRUD Modal (2217–2391), Award Record CRUD Modal (2394–2509), Submission Success Modal (2513–2563) |

### Redundant and Repeated Markup Patterns

1. **Repeated Input Shell & Character Counter Pattern (Occurs 28 times):**
```html
<div class="flex items-center justify-between mb-1">
  <label class="block text-xs font-semibold text-slate-700">
    Field Label <span class="text-rose-500 font-bold">*</span>
  </label>
  <span class="text-[10px] text-slate-400 font-mono">{{ data.property.length || 0 }}/100</span>
</div>
<input ... [ngClass]="isFieldInvalid('...') ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/20'"
  class="w-full h-9 px-3 border rounded-md text-sm text-slate-800 placeholder-slate-400 hover:border-slate-400 focus:ring-1 transition outline-none" />
@if (isFieldInvalid('...')) {
  <p class="text-xs text-rose-600 mt-1 font-medium">{{ getFieldError('...') }}</p>
}
```
Every input field manually re-declares the flex label wrapper, character length calculation, ternary `ngClass` condition with hardcoded Tailwind strings, and `@if (isFieldInvalid())` error paragraph.

2. **Repeated Searchable Dropdown Markup (Occurs 5 times, ~350 lines total):**
Lines 270–343 (State Reg), lines 502–575 (State Addr), lines 578–662 (District), lines 989–1062 (State Auth), and lines 1178–1255 (Bank). Each declares identical button triggers, chevron SVG rotation, floating absolute panel (`top-full left-0 mt-1`), search input with magnifying glass SVG, clear button (`✕`), and `dropdown-menu-scroll` button list.

3. **Duplicated Document Presentation Markup (Occurs twice in Step 4, ~240 lines):**
The 8 documents are rendered twice: once in the mobile card list (`block md:hidden`, lines 1515–1616) and once in the desktop `<table>` view (`hidden md:block`, lines 1618–1734). Both iterate over `documents` and duplicate the file name, status badge, preview button, file input label, and remove button.

4. **Duplicated Modal Wrappers (Occurs 4 times, ~400 lines):**
Each modal declares an identical backdrop (`fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6`), an identical header with close button (`&times;`), and an identical footer button group.

---

## 6. SEARCHABLE DROPDOWNS DEEP DIVE & COMPARISON

The component implements 5 custom searchable dropdown components directly in the template and TypeScript.

### Comparison Matrix

| Dropdown Name | Bound Model Property | Source Array | Open Signal | Search Query Signal | Filtered Computed | Outside Click Container Class | Search Input DOM ID | Special Conditional Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **State Where Registered** | `data.entityInfo.stateWhereRegistered` | `INDIAN_STATES` (29) | `isStateRegDropdownOpen` | `stateRegSearchQuery` | `filteredStatesReg` | `.statereg-dropdown-container` | `#statereg-search-input` | Downward positioning (`top-full`) |
| **Address State/UT** | `data.registeredAddress.state` | `INDIAN_STATES` (29) | `isStateAddrDropdownOpen` | `stateAddrSearchQuery` | `filteredStatesAddr` | `.stateaddr-dropdown-container` | `#stateaddr-search-input` | Downward positioning; triggers postal sync |
| **Registered District** | `data.registeredAddress.district` | `RAJASTHAN_DISTRICTS` (33) | `isDistrictDropdownOpen` | `districtSearchQuery` | `filteredDistricts` | `.district-dropdown-container` | `#district-search-input` | Active only when State === 'Rajasthan'; switches to plain text input for other states |
| **Auth Person State** | `data.authorizedOrg.state` | `INDIAN_STATES` (29) | `isStateAuthDropdownOpen` | `stateAuthSearchQuery` | `filteredStatesAuth` | `.stateauth-dropdown-container` | `#stateauth-search-input` | Downward positioning |
| **Bank Name** | `data.bankDetails.bankName` | `COMMON_BANKS` (14) | `isBankDropdownOpen` | `bankSearchQuery` | `filteredBanks` | `.bank-dropdown-container` | `#bank-search-input` | Downward positioning |

### Identical Mechanism Across All 5 Dropdowns
1. **Trigger:** A stylized `<button>` displaying the currently selected value or placeholder, with a clear icon (`✕`) when populated, and a chevron SVG that rotates 180° when open.
2. **Toggle:** Calls `toggleXDropdown($event)`, which calls `closeAllDropdowns()`, flips the signal, clears search query, and uses `setTimeout(..., 50)` to set DOM focus to the text input.
3. **Popup Panel:** Positioned `absolute top-full left-0 mt-1 w-full min-w-[240px] z-50` with shadow and scrollable menu (`.dropdown-menu-scroll`).
4. **Filtering:** An `@for` loop over the `computed()` signal which filters the source array case-insensitively (`items.filter(s => s.toLowerCase().includes(q))`).
5. **Dismissal:** `@HostListener('document:click')` inspects `target.closest('.*-dropdown-container')`; `@HostListener('document:keydown.escape')` closes all 5 dropdowns.

---

## 7. ACCORDIONS & COLLAPSIBLE UI ELEMENTS

The component defines 10 reactive signals controlling collapsible UI panels.

| Accordion Signal | Initial State | Controlling Trigger | Affected Template Block | Interactions & Anomalies |
| :--- | :---: | :--- | :--- | :--- |
| `isOrgProfileOpen` | `true` | Button at line 113 | Step 1, Section 1.1 (Org Profile) | Independent accordion. Expanded by default. |
| `isContactDetailsOpen` | `false` | Button at line 394 | Step 1, Section 1.2 (Contact & Address) | **Coupled:** The button simultaneously inverts BOTH `isContactDetailsOpen` and `isAddressRecordsOpen`. |
| `isAddressRecordsOpen` | `false` | Button at line 394 | Step 1, Section 1.2 (Address Overflow) | **Coupled:** Toggled together with `isContactDetailsOpen`. |
| `isReviewStep1Open` | `true` | Header at line 1745 | Step 5, Block 1 (Org Details Summary) | Parent accordion wrapping sub-accordions 1.1, 1.2, 1.3. |
| `isReviewOrgProfileOpen` | `true` | Header at line 1773 | Step 5, Sub-block 1.1 | Nested inside `isReviewStep1Open`. |
| `isReviewContactOpen` | `false` | Header at line 1817 | Step 5, Sub-block 1.2 | Nested inside `isReviewStep1Open`. |
| `isReviewAddressOpen` | `false` | Header at line 1842 | Step 5, Sub-block 1.3 | Nested inside `isReviewStep1Open`. |
| `isReviewAuthPersonOpen`| `false` | Header at line 1874 | Step 5, Block 2 (Auth Person Summary) | Independent accordion in Step 5. |
| `isReviewBankOpen` | `false` | Header at line 1967 | Step 5, Block 3 (Bank Details Summary) | Independent accordion in Step 5. |
| `isReviewDocsOpen` | `false` | Header at line 2044 | Step 5, Block 4 (Documents Summary) | Independent accordion in Step 5. |
| `isOfficerOpen` | `true` | None (TS line 957) | None | **Dormant:** Declared in TypeScript, never bound in HTML. |
| `isAwardOpen` | `true` | None (TS line 1050) | None | **Dormant:** Declared in TypeScript, never bound in HTML. |

---

## 8. MODALS ANALYSIS

Four distinct dialog modal structures are defined at the bottom of the HTML template (lines 2144–2565).

### 1. Document Preview Modal (`previewingDoc`)
- **Trigger:** "Preview" button on any statutory document row in Step 4 (lines 1564, 1589, 1677, 1703).
- **Controlling Signal:** `previewingDoc: WritableSignal<UploadedDocument | null>`.
- **Purpose:** Displays document metadata (type, mandatory/optional, filename, upload date) and a mock document frame with a verified badge.
- **Dismissal:** Top close button `&times;` or bottom "Close" button sets `previewingDoc.set(null)`.

### 2. Officer In-Charge CRUD Modal (`showOfficerModal`)
- **Trigger:** `openAddOfficerModal()` or `editOfficer(off)`.
- **Controlling Signals:** `showOfficerModal`, `isOfficerEditing`, `modalOfficerSubmitted`.
- **State Model:** `currentOfficer: OfficerInCharge`.
- **Fields Inside Modal:** Name (*), Designation (*), Mobile No (*), Email ID (*), PAN, Aadhaar No, Bhamashah No, Voter ID No, Passport No.
- **Save Routine (`saveOfficer`):** Marks `modalOfficerSubmitted = true`, validates via `valService.validateOfficer(this.currentOfficer)`, appends to or updates `service.formData().officers`, closes modal.
- **CRITICAL ARCHITECTURAL FINDING:** **Orphaned Feature.** While the modal HTML exists (lines 2217–2391) and the controller has full CRUD methods (`openAddOfficerModal`, `editOfficer`, `deleteOfficer`, `saveOfficer`), there are **zero buttons in the active 5 steps of the HTML that call `openAddOfficerModal()`**.

### 3. Award Record CRUD Modal (`showAwardModal`)
- **Trigger:** `openAddAwardModal()` or `editAward(award)`.
- **Controlling Signals:** `showAwardModal`, `isAwardEditing`, `modalAwardSubmitted`.
- **State Model:** `currentAward: AwardItem`.
- **Fields Inside Modal:** Award Name (*), Awarding Agency (*), Year of Award, Level (State/National/International), Description, Supporting Document file input.
- **Save Routine (`saveAward`):** Marks `modalAwardSubmitted = true`, validates via `valService.validateAward(this.currentAward)`, appends to or updates `service.formData().awards`, closes modal.
- **CRITICAL ARCHITECTURAL FINDING:** **Orphaned Feature.** Identical to the Officer modal, the Award modal HTML (lines 2394–2509) and controller methods exist, but there are **zero buttons in the active template that trigger `openAddAwardModal()`**.

### 4. Final Submission Success Modal (`showSuccessModal`)
- **Trigger:** `submitFinalApplication()` upon successful validation and declaration agreement.
- **Controlling Signal:** `showSuccessModal: WritableSignal<boolean>`.
- **Contents:** Success checkmark icon, "Application Submitted!" heading, summary card with `applicationNo`, organisation full name, submission date, "Print Acknowledgement" button (`window.print()`), and "Close" button.


---

## 9. DOCUMENT & FILE UPLOAD SUBSYSTEM

The module handles file uploads across three distinct domains: Bank Cheque Verification (Step 3), Statutory Compliance Documents (Step 4), and Award Supporting Documents (Modal).

### 9.1 Upload Domain Specifications

| Upload Domain | Bound Model Property | File Type Constraints | Max Size | UI Upload Mechanism | Handlers in Component | Synchronization / Side Effects |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **Cancelled Cheque** (Step 3) | `bankDetails.cancelledChequeFileName`, `bankDetails.cancelledChequeFileSize` | `.pdf`, `.jpg`, `.jpeg`, `.png` | 5 MB | Drag & Drop Zone + Hidden File Input | `onBankDragOver()`, `onBankDragLeave()`, `onBankFileDrop()`, `onBankFileSelected()`, `removeBankFile()` | Automatically synchronizes with `doc-bank` in `data.documents` array. |
| **Statutory Documents** (Step 4) | `data.documents[docId].fileName`, `fileSize`, `uploadDate`, `status` | `.pdf`, `.jpg`, `.jpeg`, `.png` | 5 MB | Individual "Browse" button per row in table & mobile cards | `onDocFileSelected($event, docId)`, `removeDocument(docId)` | Updates `status: 'uploaded'`; tracked by `uploadedRequiredCount`. |
| **Award Document** (Modal) | `currentAward.documentName` | `.pdf`, `.jpg`, `.jpeg`, `.png` | 5 MB | Standard file input button | `onAwardFileSelected($event)` | Sets file name string on `currentAward`. |

### 9.2 Statutory Compliance Document Inventory (Step 4)

Initial documents are seeded via `INITIAL_DOCUMENTS` in `tp-pia-registration.service.ts`:

| Document ID | Document Type | Label / Description | Mandatory? | Default Status |
| :--- | :--- | :--- | :---: | :---: |
| `doc-reg-cert` | Registration Certificate | Organisation Registration Certificate | **Mandatory (*)** | pending |
| `doc-pan` | PAN Card | Organisation PAN Card | **Mandatory (*)** | pending |
| `doc-gst` | GST Certificate | GST Registration Certificate | **Mandatory (*)** | pending |
| `doc-turnover` | Audited Balance Sheet | Audited Balance Sheet / Turnover Certificate | Optional | pending |
| `doc-bank` | Bank Proof | Cancelled Cheque / Bank Passbook | Optional | pending |
| `doc-board-res` | Board Resolution | Board Resolution / Power of Attorney for Signatory | Optional | pending |
| `doc-nsdc` | NSDC Certificate | NSDC Partner Certificate (If Applicable) | Optional | pending |
| `doc-other` | Supporting Document | Additional Supporting Document | Optional | pending |

### 9.3 Validation & Handling Pipeline
1. **Size Validation:** If `file.size > 5 * 1024 * 1024` (5 MB), an error is dispatched (`"filename exceeds the maximum 5 MB limit"`) and processing terminates.
2. **Type Validation:** Extracted extension is checked against `['pdf', 'jpg', 'jpeg', 'png']`. If invalid, error is set.
3. **Metadata Calculation:** Formats size string (`sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB'`) and date string (`dateFormatted = new Date().toLocaleDateString('en-GB')`).
4. **State Storage:** Note that **the actual binary File object is NOT stored in the frontend state or uploaded via HTTP multipart**. Only the metadata (`fileName`, `fileSize`, `uploadDate`, `status`) is written to `TpPiaRegistrationData`.

---

## 10. DATE HANDLING & DUAL-PICKER ARCHITECTURE

The application manages two date fields:
1. `data.basicInfo.dateOfRegistration` (Step 1)
2. `data.authorizedOrg.dob` (Step 2)

### 10.1 Dual-Picker Architecture

Each date input employs a dual-control strategy:
- **Visible Primary Input:** A standard text input with a mask handler (`onDateInput`) allowing direct typing in `DD/MM/YYYY` format.
- **Hidden Native Date Input:** An HTML5 `<input type="date">` element positioned absolutely with `opacity-0 pointer-events-none w-0 h-0 -z-10` linked via template reference (`#regDatePicker`, `#dobPicker`).
- **Calendar Icon Button:** Calls `openPicker(pickerRef)`, which attempts to invoke `picker.showPicker()` (modern HTML5 API) with fallback to `picker.focus(); picker.click()`.

### 10.2 Format Conversion Pipeline
- **Internal Storage Format:** The form data stores dates as strings. Depending on user entry, it may be stored as `DD/MM/YYYY` (from text input) or `YYYY-MM-DD` (from sample data or native picker).
- **`formatDateDisplay(dateStr)`:** Converts ISO `YYYY-MM-DD` strings to `DD/MM/YYYY` for template rendering.
- **`getIsoDate(dateStr)`:** Converts `DD/MM/YYYY` strings to ISO `YYYY-MM-DD` for the hidden native picker's `[value]` attribute.
- **`onDateInput($event, field)`:** Strips non-digits, slices to 8 digits, and dynamically injects slashes: `DD/MM/YYYY`.

### 10.3 Age Calculation Logic (`onDobChange`)
When the DOB input updates, `onDobChange()` parses the date (handling both `/` and `-` separators), compares it against the current system date, calculates the exact age in years, and updates `data.authorizedOrg.age`.

---

## 11. INPUT SANITIZATION & KEYBOARD EVENT RESTRICTIONS

The component employs a two-tier defense: keypress event suppression (preventing illegal characters from being typed) and input sanitization (cleaning pasted content or auto-fill).

### Complete Sanitizer & Restriction Matrix

| Function Name | Nature | Allowed Characters / Logic | Regex Pattern | Fields Utilizing |
| :--- | :--- | :--- | :--- | :--- |
| **`onlyNumbers`** | Keypress Event | Allows digits 0-9 and control keys (Backspace, Tab, Arrows, Enter, Delete) | `/^\d$/` | Contact numbers, Aadhaar, Pincode, Account No, MICR, Age, Year |
| **`onlyLetters`** | Keypress Event | Allows letters (a-z, A-Z), spaces, and dots | `/^[a-zA-Z\s.]$/` | TP/PIA Full Name, Authorized Person Name, Guardian Name, Officer Name |
| **`onlyLettersSymbols`**| Keypress Event | Allows letters, spaces, and `/`, `&`, `-`, `.` (No digits) | `/^[a-zA-Z\s/&.-]$/` | TP/PIA Short Name |
| **`onlyAlphanumericSymbols`** | Keypress Event | Allows letters, digits, spaces, and `/`, `&`, `-`, `.` | `/^[a-zA-Z0-9\s/&.-]$/` | Registration No, Designation, Branch Name, Voter ID, Bhamashah |
| **`onlyAlphanumeric`** | Keypress Event | Allows strict letters and digits only | `/^[a-zA-Z0-9]$/` | PAN No, IFSC Code, Passport No |
| **`onlyDecimals`** | Keypress Event | Allows digits and at most ONE decimal point `.` | Digits + `'.'` check | Annual Turnover (`turnOver`) |
| **`sanitizeNumbers`** | Input Sanitizer | Strips all non-digit characters; enforces maxlength | `/\D/g` | Mobile No, Aadhaar No, Pincode, Bank Account No, MICR, Age, Year |
| **`sanitizeLetters`** | Input Sanitizer | Strips non-letters, spaces, and dots; enforces maxlength | `/[^a-zA-Z\s.]/g` | Full Name, Guardian Name, Officer Name |
| **`sanitizeAlphanumericUpper`** | Input Sanitizer | Converts to uppercase; strips non-alphanumerics | `/[^A-Z0-9]/g` | PAN, IFSC, Passport |
| **`sanitizeAlphanumericSymbols`** | Input Sanitizer | Strips non-alphanumeric and symbols (`& / - .`) | `/[^a-zA-Z0-9\s/&.-]/g` | Designation, Branch Name |
| **`sanitizeAlphanumericSymbolsUpper`** | Input Sanitizer | Uppercases; strips non-alphanumeric and symbols | `/[^A-Z0-9\s/&.-]/g` | Registration Number, Voter ID, Bhamashah |
| **`sanitizeLettersSymbolsUpper`** | Input Sanitizer | Uppercases; allows letters, spaces, symbols (no digits) | `/[^A-Z\s/&.-]/g` | Short Name |
| **`sanitizeDecimals`** | Input Sanitizer | Strips non-digits and multiple decimal points | Custom slice logic | Annual Turnover |

---

## 12. VALIDATION ENGINE & RULES MATRIX

The validation subsystem is housed in `src/app/features/forms/services/form-validation.service.ts` and consumed by `TpPiaRegistrationComponent`.

### 12.1 Regular Expression Patterns Library (`VALIDATION_PATTERNS`)

```typescript
export const VALIDATION_PATTERNS = {
  mobile: /^[6-9]\d{9}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  pincode: /^\d{6}$/,
  aadhaar: /^\d{12}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  micr: /^\d{9}$/,
  cin: /^[a-zA-Z0-9]{21}$/,
  bankAccount: /^\d{9,18}$/,
  url: /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i,
};
```

### 12.2 Validation Methods Matrix

| Method Name | Target Data Entity | Evaluated Fields & Conditions | Validation Outcome / Error Message |
| :--- | :--- | :--- | :--- |
| **`validateTab1`** | `basicInfo`, `entityInfo`, `registeredAddress`, `postalAddress` | - `fullName`: required, 3-100 chars, letters only<br>- `shortName`: required, 2-30 chars, letters/symbols<br>- `registrationNumber`: optional, 3-30 chars, alphanumeric<br>- `website`: optional, <=100 chars, valid URL<br>- `dateOfRegistration`: optional, DD/MM/YYYY, not future<br>- `contactNo`: required, valid 10-digit mobile<br>- `emailId`: required, valid email pattern<br>- `panNo`: optional, valid 10-char PAN<br>- `registeredAddress.address`: required<br>- `registeredAddress.state`: required<br>- `registeredAddress.district`: required<br>- `registeredAddress.pincode`: required, 6 digits<br>- `turnOver`: required, numeric >= 0, <= 10,000,000<br>- `postalAddress.address`: required if `!sameAsRegistered` | Returns `TabValidationResult` with populated `errors` dictionary. |
| **`validateTab2`** | `authorizedOrg` | - `name`: required, >=3 chars, letters only<br>- `guardianName`: optional, letters only<br>- `dob`: optional, DD/MM/YYYY, age >= 18 & <= 100<br>- `age`: optional, 18 <= age <= 100<br>- `contactNo`: required, valid 10-digit mobile<br>- `pan`: required, valid 10-char PAN<br>- `aadhaarNo`: required, exactly 12 digits<br>- `emailId`: optional, valid email pattern | Returns `TabValidationResult` with populated `errors` dictionary. |
| **`validateTab3`** | `bankDetails` | - `bankName`: required, non-empty<br>- `accountNo`: required, 9 to 18 digits<br>- `ifscCode`: required, valid 11-char IFSC<br>- `branchName`: required, non-empty<br>- `branchAddress`: required, non-empty<br>- `micrCode`: optional, exactly 9 digits | Returns `TabValidationResult` with populated `errors` dictionary. |
| **`validateTab4`** | `documents` | - Checks all documents where `required === true`<br>- Verifies `status === 'uploaded'` and `fileName` present | Dispatches error if missing required docs count > 0. |
| **`validateTab5`** | Master Data | Delegates directly to `validateTab3(data)` | Matches Tab 3 validation. |
| **`validateTab6`** | `awards` | Iterates over `data.awards` and runs `validateAward()` | Dispatches error if any award has invalid details. |
| **`validateTab7`** | Master Data | Delegates directly to `validateTab4(data)` | Matches Tab 4 validation. |
| **`validateOfficer`** | `OfficerInCharge` | - `name`: required, letters only<br>- `designation`: required<br>- `mobileNo`: required, 10-digit mobile<br>- `emailId`: required, valid email<br>- `pan`: optional, valid PAN<br>- `aadhaarNo`: optional, 12 digits | Used inside Officer Modal. |
| **`validateAward`** | `AwardItem` | - `awardName`: required<br>- `awardingAgency`: required<br>- `year`: optional, 4-digit year 1950–2100 | Used inside Award Modal. |
| **`validateDate`** | Date string | Complete date parser and range validator | Validates format, valid days per month, leap years, min/max limits. |

### 12.3 The Validation Cache Object Identity Bug
In `FormValidationService` (lines 568–592):
```typescript
private validationCache = new Map<number, { dataRef: any; result: TabValidationResult }>();

getTabValidation(tabId: number, data: TpPiaRegistrationData): TabValidationResult {
  const cached = this.validationCache.get(tabId);
  if (cached && cached.dataRef === data) {
    return cached.result;
  }
  ...
}
```
**CRITICAL FLAW:** In `TpPiaRegistrationService`, `updateFormData` always creates a new object reference via object spread (`curr => ({ ...curr })`). Therefore, on every single keystroke, `dataRef === data` evaluates to **`false`**. The cache **never hits** during active typing, rendering the memoization logic completely ineffectual.

---

## 13. DATA MODEL AUDIT & DISCREPANCIES

The domain interfaces reside in `src/app/features/forms/models/tp-pia-registration.model.ts`.

### 13.1 Interface Structure
- **`BasicOrgInfo`**: Application metadata, entity name, registration number, contacts, PAN, CIN, GST.
- **`EntityInfo`**: Turnover, blacklisting status, NSDC partnership, nature of entity, applicant category, state, EOI details.
- **`AddressInfo`**: Address premises, state, district, pincode.
- **`WorkflowInfo`**: Internal department workflow routing (action, markTo, markToOfficer, remarks).
- **`OfficerInCharge`**: Administrative officer details.
- **`AuthorizedPersonOrg`**: Corporate statutory signatory details.
- **`AuthorizedPersonProject`**: Project-level authorized person details.
- **`BankDetails`**: Disbursal bank account, IFSC, branch, cheque metadata.
- **`AwardItem`**: Entity recognition details.
- **`UploadedDocument`**: Document metadata, upload date, status.
- **`TpPiaRegistrationData`**: Aggregate container aggregating all sub-interfaces.

### 13.2 Model Architectural Discrepancies & Stale Code
1. **Mismatched Tab Number Comments:**
   Lines 122–146 of `tp-pia-registration.model.ts` list:
   ```typescript
   // Tab 1: basicInfo, entityInfo, registeredAddress, postalAddress, sameAsRegistered, workflowInfo
   // Tab 2: officers
   // Tab 3: authorizedOrg
   // Tab 4: authorizedProject
   // Tab 5: bankDetails
   // Tab 6: awards
   // Tab 7: documents
   ```
   However, the active application has only **5 steps**. Tab 2 in the UI is actually `authorizedOrg`, Tab 3 is `bankDetails`, Tab 4 is `documents`, and Tab 5 is `Review & Submit`. The model comments reflect an obsolete 7-tab layout.
2. **Orphaned `AuthorizedPersonProject` Interface:**
   The interface `AuthorizedPersonProject` (lines 76–84) and its corresponding property `authorizedProject` on `TpPiaRegistrationData` (line 137) are **completely absent from the HTML template**. No UI exists to view or edit project-level authorized persons.
3. **Unused Properties on `BasicOrgInfo` & `EntityInfo`:**
   - `cinNo` (BasicOrgInfo): Defined in model and sample data, but has no input field in the HTML template.
   - `gstNo` (BasicOrgInfo): Defined in model and sample data, but has no input field in Step 1 (GST Certificate is only uploaded as a document).
   - `blackListed`, `nsdcPartner`, `natureOfEntity`, `categoryOfApplicant`, `eoiReferenceNo`, `dateOfEoiPublished` (EntityInfo): Defined in model and populated by demo data, but omitted from Step 1 HTML form.
   - `workflowInfo` (TpPiaRegistrationData): Populated in demo data, completely omitted from UI.

---

## 14. REGISTRATION SERVICE AUDIT

The service `TpPiaRegistrationService` (`src/app/features/forms/services/tp-pia-registration.service.ts`) serves as the central data store.

### 14.1 State & Properties
- **`formData`**: `signal<TpPiaRegistrationData>(this.getInitialState())` — Central reactive state for the entire form.
- **`autoSaveStatus`**: `signal<'saved' | 'saving' | 'idle'>('idle')` — Tracks auto-save activity.
- **`lastSavedTime`**: `signal<string>('')` — Formatted timestamp string of last save.
- **`isSaving`**: `computed(() => this.autoSaveStatus() === 'saving')` — Readonly indicator for saving state.
- **`lastSaveMessage`**: `signal<string>('')` — User-facing toast/status message.
- **`autoSaveTimer`**: Internal timer handle for 400ms auto-save debounce.

### 14.2 Persistence Mechanism
- **Key:** `'isms_tp_pia_registration_draft_v1'`.
- **Target Storage:** Browser `localStorage`.
- **Auto-save Lifecycle:** 
  - `updateFormData()` triggers `triggerAutoSave()`.
  - Debounces for 400ms before invoking `saveDraftSync()`.
  - Window `beforeunload` listener invokes `saveDraftSync()` synchronously.
  - On service instantiation, constructor calls `restoreSavedDraft()`. If valid draft JSON exists, restores state into `formData` signal.

### 14.3 Static Constants Exported
Exports `INITIAL_DOCUMENTS`, `INDIAN_STATES`, `RAJASTHAN_DISTRICTS`, `NATURE_OF_ENTITIES`, `SCHEME_NAMES`, `BUSINESS_ACTIVITIES`, `APPLICANT_CATEGORIES`, `WORKFLOW_ACTIONS`, `MARK_TO_ROLES`, `ID_PROOF_TYPES`, `COMMON_BANKS`, `TRANSFER_MODES`, `ACCOUNT_TYPES`.

---

## 15. ROUTING ARCHITECTURE

Routing is declared in `src/app/features/forms/forms.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { TpPiaRegistrationComponent } from './components/tp-pia-registration/tp-pia-registration.component';

export const FORMS_ROUTES: Routes = [
  {
    path: '',
    component: TpPiaRegistrationComponent,
  },
  {
    path: 'tp-pia-registration',
    component: TpPiaRegistrationComponent,
  }
];
```

- **Integration:** Lazy-loaded in `src/app/app.routes.ts` under `path: 'forms'`:
  `loadChildren: () => import('./features/forms/forms.routes').then(m => m.FORMS_ROUTES)`.
- **Accessible URLs:**
  - `http://localhost:4200/forms`
  - `http://localhost:4200/forms/tp-pia-registration`
- **Route Guards / Resolvers:** None. The route is completely open and public.


---

## 16. END-TO-END DATA FLOW ANALYSIS

```
[ User Keystroke / Input Event ]
              │
              ▼
[ Keypress Filter: onlyNumbers / onlyLetters ]  ---> (Event cancelled if illegal key)
              │
              ▼
[ Input Sanitizer: sanitizeLetters / sanitizeNumbers ]
              │
              ▼
[ Two-way Model Mutation via [(ngModel)] on this.data.* ]
              │
              ▼
[ Component onDataChange() debounces 60ms ]
              │
              ▼
[ service.updateFormData(curr => ({ ...curr })) ]
              │
              ├───────────────────────────────────┐
              ▼                                   ▼
[ formData.set(newCopy) ]              [ triggerAutoSave(400ms) ]
              │                                   │
              ▼                                   ▼
[ computed() signals re-evaluate: ]    [ localStorage.setItem(...) ]
  - tab1Errors, tab2Errors...
  - errors
  - tabStatuses
              │
              ▼
[ Template OnPush Change Detection evaluates: ]
  - isFieldInvalid(fieldKey)
  - getFieldError(fieldKey)
  - Stepper icons & classes
```

### Detailed Data Flow Stages
1. **User Interaction & Keyboard Suppression:** Keystroke triggers `onlyNumbers()` or `onlyLetters()`. If regex check fails, `event.preventDefault()` halts entry before value reaches the DOM element.
2. **Template Model Mutation:** Angular's `[(ngModel)]` directive directly writes the new primitive value into the nested property of `this.data` (e.g. `data.basicInfo.fullName`). Note that because `this.data` returns the mutable reference from the service's current signal, **the property is mutated in-place before `service.updateFormData()` is called**.
3. **Component Change Debounce (`onDataChange`):** Clears and sets a 60ms timer. When the timer expires, it calls `service.updateFormData(curr => ({ ...curr }))`.
4. **Service Signal Notification:** `service.updateFormData()` runs the callback, creating a shallow clone of the master object, and calls `this.formData.set(updated)`.
5. **Auto-save Dispatch:** `service.triggerAutoSave()` debounces 400ms before stringifying the state and committing it to browser `localStorage` under key `'isms_tp_pia_registration_draft_v1'`.
6. **Reactive Recomputation:** The modification of `formData` notifies downstream `computed()` signals:
   - `tab1Errors`, `tab2Errors`, `tab3Errors`, `tab4ProjectErrors`
   - `errors` (aggregates the tab errors)
   - `tabStatuses` (evaluates whether steps are completed or invalid)
7. **Template OnPush Re-render:** Angular re-evaluates bound template expressions (`isFieldInvalid()`, `getFieldError()`, `tabStatuses()`) and updates visual validation classes, error texts, and step badges.

---

## 17. PERFORMANCE & CHANGE DETECTION ANALYSIS

### 17.1 Confirmed Current Performance Bottlenecks & Architectural Bugs

| # | Classification | Exact Issue | Technical Cause | Real-World Performance Impact |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **CONFIRMED** | **Validation Cache Ineffectiveness** | `FormValidationService.getTabValidation` uses object identity comparison (`cached.dataRef === data`). Since `updateFormData` spreads `curr` into a new object on every change, the reference is always new. | **Zero cache hits during typing.** Validation algorithms run repeatedly and redundantly across change detection ticks. |
| **2** | **CONFIRMED** | **Redundant Intermediate Computed Signals** | Component defines `tab1Errors`, `tab2Errors`, `tab3Errors`, `tab4ProjectErrors`, and then merges them into `errors`. | Each of the 4 computed signals re-evaluates independently on every form data update, creating 5 computed signal recalculations per keystroke instead of 1. |
| **3** | **CONFIRMED** | **Date Object Instantiation on Every Render** | `todayIso`, `maxDobIso`, and `minDobIso` are implemented as getters creating `new Date()` instances every time they are evaluated in template attribute bindings. | Unnecessary garbage collection churn during typing and scrolling in Step 1 & 2. |
| **4** | **CONFIRMED** | **Inline Regular Expression Re-compilation** | Input restriction functions (`onlyNumbers`, `onlyLetters`, `onlyLettersSymbols`, `onlyAlphanumericSymbols`, etc.) construct new `RegExp` literal instances on every single keypress event. | Micro-overhead on every keyboard keystroke; should be static module-level constants. |
| **5** | **CONFIRMED** | **Monolithic Template DOM Size** | A single 2,565-line HTML template with thousands of DOM nodes is maintained inside a single Angular component. | When change detection runs, Angular must traverse the entire component DOM tree, inspecting all 5 steps and 4 modals even though 4 steps and all modals are hidden. |
| **6** | **CONFIRMED** | **Repeated String Splitting in Template Expressions** | `isFieldInvalid(key)` and `getFieldError(key)` call `getFieldValue(key)`, which splits the key string on `'.'` and loops through properties on every change detection pass for dozens of fields. | Unnecessary string operations per field evaluated in the template. |

### 17.2 Possible / Marginal Optimizations
- **Searchable Dropdown Filtering:** The computed signals `filteredDistricts`, `filteredStatesReg`, etc. run `.filter()` on arrays with 14 to 33 items. Because the arrays are tiny, performance overhead is negligible, though extracting them to a shared component would dramatically clean up component code size.
- **Component Subtree Splitting:** Splitting each of the 5 tabs into dedicated standalone child components (`app-tp-org-details`, `app-tp-auth-person`, `app-tp-bank-details`, `app-tp-documents`, `app-tp-review`) would restrict Angular's `OnPush` change detection specifically to the active tab's subtree.

### 17.3 Non-Issues / Patterns Functioning As Intended
- **`OnPush` Strategy:** The component correctly uses `ChangeDetectionStrategy.OnPush`.
- **LocalStorage Performance:** Auto-saving is properly debounced to 400ms, preventing main thread I/O thrashing during fast typing.
- **Signal Mutability:** Despite the direct mutation of nested properties via `[(ngModel)]`, the 60ms debounce in `onDataChange()` ensures that Angular signals do receive new object references, triggering reactivity reliably.

---

## 18. CODE QUALITY & ARCHITECTURAL ASSESSMENT

### 18.1 Single Responsibility Principle (SRP) Violation
`TpPiaRegistrationComponent` is a classic **"God Component"** encompassing 1,257 lines of TypeScript and 2,565 lines of HTML. It simultaneously assumes responsibilities for:
1. Stepper wizard state and navigation logic
2. 5 distinct business domains (Organisation, Signatory, Bank, Documents, Review)
3. 5 separate searchable dropdown UI controllers (open, close, filter, clear, outside click, escape)
4. Character-level input filtering and regex sanitization
5. Dual-input date picker formatting and age calculation
6. File upload drag-and-drop and binary size validation
7. CRUD modal management for Officers and Awards
8. LocalStorage persistence coordination

### 18.2 Dormant & Orphaned Code
1. **Officer In-Charge CRUD Subsystem:** The component contains complete state management, validation, and HTML modal structure for Officers (`officers`, `currentOfficer`, `openAddOfficerModal`, `saveOfficer`, etc.), yet **no UI elements in the 5 steps allow users to view, add, or edit officers**.
2. **Award Record CRUD Subsystem:** Similarly, the Awards modal (`awards`, `currentAward`, `openAddAwardModal`, `saveAward`, etc.) is fully written into the component and template, but completely inaccessible in the main user journey.
3. **Duplicate Wrapper Methods:** `openPreviewModal()`, `openReviewModal()`, and `confirmSubmit()` are redundant passthroughs to `switchTab(5)` and `submitFinalApplication()`.
4. **Dormant Variables:** `isOfficerOpen` (line 957) and `isAwardOpen` (line 1050) are declared as signals but never bound in the template.

---

## 19. TEXTUAL DEPENDENCY & COUPLING MAP

```
src/app/app.routes.ts
       │ (loadChildren)
       ▼
src/app/features/forms/forms.routes.ts
       │
       ▼
TpPiaRegistrationComponent
 ├── TpPiaRegistrationService
 │    ├── signal<TpPiaRegistrationData> (Master State)
 │    ├── localStorage ('isms_tp_pia_registration_draft_v1')
 │    └── Static Constants (INDIAN_STATES, COMMON_BANKS, etc.)
 ├── FormValidationService
 │    ├── VALIDATION_PATTERNS (Regex library)
 │    ├── Tab Validators (validateTab1, validateTab2, etc.)
 │    ├── tabStatuses, submittedTabs, completedTabs
 │    └── toastMessage signal
 ├── Data Models (tp-pia-registration.model.ts)
 │    ├── TpPiaRegistrationData
 │    ├── BasicOrgInfo, EntityInfo, AddressInfo
 │    ├── AuthorizedPersonOrg, AuthorizedPersonProject
 │    ├── BankDetails, AwardItem, UploadedDocument
 └── Template: tp-pia-registration.component.html (2,565 lines)
      ├── Header & Stepper
      ├── Step 1: Organisation Profile & Addresses (3 Dropdowns)
      ├── Step 2: Authorized Person Org (1 Dropdown, Dynamic IDs)
      ├── Step 3: Bank Details (1 Dropdown, Cheque Dropzone)
      ├── Step 4: Statutory Documents (Table & Mobile Cards)
      ├── Step 5: Review & Declaration
      └── 4 Dialog Modals (Preview, Officer, Award, Success)
```

---

## 20. EXACT CURRENT USER FLOW & RUNTIME BEHAVIOR

### Step-by-Step Runtime Walkthrough

1. **Route Activation (`/forms` or `/forms/tp-pia-registration`):**
   - `forms.routes.ts` initializes `TpPiaRegistrationComponent`.
   - In `TpPiaRegistrationService` constructor, `restoreSavedDraft()` checks `localStorage` for `'isms_tp_pia_registration_draft_v1'`.
   - If a saved draft exists, it loads it into `formData` signal.
   - In `ngOnInit()`, if `applicationNo` is empty, it assigns a newly generated number (e.g. `ISMS-TP-748291`).
2. **Step 1: Organisation Details:**
   - Active step circle 1 is highlighted in Navy Blue (`bg-[#1a2656]`).
   - Section 1.1 (Profile) is open by default. User enters Full Name, Short Name, Registration Number, PAN, Turnover, and selects Business Activity and Registered State.
   - User clicks Section 1.2 header to expand Contact & Address.
   - User fills Contact No, Email, Registered Premises, District (searchable if Rajasthan), State, and Pincode.
   - Checking "Same as Registered" instantly copies Registered Address to Postal Address and disables Postal Address.
   - User clicks "Next Step".
   - `nextTab()` runs `valService.validateTab1()`. If any required field is invalid, an error toast appears at the top and the window smoothly scrolls to top.
   - If valid, Tab 1 is marked completed (`✓` in green circle), draft is saved to localStorage, and wizard advances to Step 2.
3. **Step 2: Authorized Person (Organisation Level):**
   - Active step circle 2 is highlighted.
   - User enters Name (*), Mobile (*), PAN (*), Aadhaar (*).
   - User enters DOB. The input mask inserts slashes (`DD/MM/YYYY`). On blur, `onDobChange()` calculates the age in years.
   - User selects Secondary ID type (e.g. Voter ID). The dynamic input field appears below.
   - User clicks "Next Step". `valService.validateTab2()` validates mandatory fields. If valid, advances to Step 3.
4. **Step 3: Bank Details:**
   - Active step circle 3 is highlighted.
   - User clicks Bank Name button; searchable dropdown opens downwards. User searches "State Bank", selects SBI.
   - User inputs Account Number (*), IFSC Code (*), Branch Name (*), Branch Address (*).
   - User drags and drops a cancelled cheque PDF into the dropzone (or clicks to browse).
   - File handler validates that size <= 5 MB and extension is PDF/JPG/PNG. Card displays file name, formatted size, and "Ready" indicator.
   - User clicks "Next Step". Advances to Step 4.
5. **Step 4: Statutory Document Upload:**
   - Active step circle 4 is highlighted. Banner displays: `"Uploaded: 0 / 3 Mandatory"`.
   - User browses and uploads Registration Certificate, PAN Card, and GST Certificate.
   - Counter updates to `"Uploaded: 3 / 3 Mandatory"`.
   - User can click "Preview" on any document to inspect details inside the Document Preview modal.
   - User clicks "Next Step". Advances to Step 5.
6. **Step 5: Review & Final Submission:**
   - Active step circle 5 is highlighted.
   - User reviews collapsible accordion cards summarizing all entered details from Steps 1 to 4.
   - User can click "Edit Step X" to immediately jump back to that step.
   - User checks the mandatory "Declaration" checkbox.
   - "Submit Final Application" button becomes enabled.
   - User clicks "Submit Final Application".
   - `submitFinalApplication()` verifies that `declarationAgreed === true` and `getFirstInvalidTab() === null`.
   - Form data status is set to `'Submitted'`.
   - `showSuccessModal` signal is set to `true`, displaying the submission success dialog.
   - User clicks "Print Acknowledgement" to invoke native browser print dialog, or clicks "Close".

---

## 21. POTENTIAL OPTIMIZATION & REFACTORING TARGETS

*Note: As per strict task instructions, these are purely analytical recommendations. Zero code has been altered.*

### Group A: Safe / Low Risk Optimizations
1. **Dormant Wrapper Method Elimination:**
   - **Current:** `openPreviewModal()`, `openReviewModal()`, `confirmSubmit()` simply wrap other methods.
   - **Target:** Remove wrappers and bind directly to `switchTab(5)` and `submitFinalApplication()`.
   - **Risk:** Zero.
2. **Static Date Getters to Readonly Class Properties:**
   - **Current:** `todayIso`, `maxDobIso`, `minDobIso` are getters that execute `new Date()` on every template render cycle.
   - **Target:** Compute once in `readonly` class properties on component initialization.
   - **Risk:** Zero.
3. **Static Regex Hoisting:**
   - **Current:** Inline regexes like `/^\d$/`, `/^[a-zA-Z\s.]$/` recompile on every keystroke.
   - **Target:** Hoist to module-level `const` declarations or import from a shared validation pattern file.
   - **Risk:** Zero.
4. **Clean Stale Tab Comments in Data Model:**
   - **Current:** Comments in `tp-pia-registration.model.ts` refer to 7 tabs.
   - **Target:** Update comments to match active 5-step architecture.
   - **Risk:** Zero.

### Group B: Medium Risk Optimizations
5. **Reusable Searchable Dropdown Component:**
   - **Current:** 5 nearly identical searchable dropdowns are copy-pasted across the template and TS (~350 lines HTML, ~150 lines TS).
   - **Target:** Create a standalone `SearchableDropdownComponent` with `@Input() items`, `@Input() value`, and `@Output() valueChange`.
   - **Benefit:** Eliminates ~450 lines of duplicate markup and logic; unifies outside-click and keyboard navigation.
   - **Risk:** Low-Medium (requires testing two-way binding on all 5 dropdowns).
6. **Fix Validation Cache Identity Check:**
   - **Current:** `cached.dataRef === data` fails every time because of object spreading in `updateFormData`.
   - **Target:** Key cache by a change version counter or deep equality/stable hash.
   - **Benefit:** Restores intended performance caching behavior.
   - **Risk:** Low.
7. **Consolidate Validation Computed Signals:**
   - **Current:** 4 intermediate tab error computed signals merge into `errors`.
   - **Target:** Merge into a single computed signal evaluating the tabs directly.
   - **Benefit:** Reduces reactive graph complexity from 5 signals to 1.
   - **Risk:** Low.

### Group C: Higher Risk / Architectural Refactoring
8. **Split Monolithic Component into 5 Step Sub-components:**
   - **Current:** 1,257-line TS file and 2,565-line HTML file in a single component.
   - **Target:** Decompose into:
     - `tp-pia-registration-shell.component` (Stepper header, footer navigation, state orchestrator)
     - `step-org-details.component`
     - `step-auth-person.component`
     - `step-bank-details.component`
     - `step-document-upload.component`
     - `step-review-submit.component`
   - **Benefit:** Adheres to Single Responsibility Principle, drastically improves readability, decouples change detection to active step subtrees, and simplifies unit testing.
   - **Risk:** Medium-High (requires careful input/output or shared service state alignment).
9. **Eliminate or Integrate Dormant Officer & Award Subsystems:**
   - **Current:** 300+ lines of HTML and 150+ lines of TS represent Officer and Award CRUD modals that cannot be triggered by users.
   - **Target:** Either wire up dedicated "Add Officer" and "Add Award" cards in Step 1/2, or cleanly prune them to dedicated sub-features.
   - **Risk:** Medium (requires product owner clarification on whether officers and awards are part of Phase 1 requirements).

---

## 22. EXECUTIVE SUMMARY & KEY METRICS

### 15 Critical Quantitative Metrics

| # | Metric Description | Exact Value |
| :-: | :--- | :---: |
| **1** | Total Files in `src/app/features/forms` | **7 files** |
| **2** | Total Components | **1 component** (`TpPiaRegistrationComponent`) |
| **3** | Total Services | **2 services** (`TpPiaRegistrationService`, `FormValidationService`) |
| **4** | Total Domain Model Files | **1 file** (`tp-pia-registration.model.ts`) |
| **5** | Total Defined Routes | **2 routes** (`''` and `'tp-pia-registration'`) |
| **6** | Main Component TypeScript Line Count | **1,257 lines** (40,014 bytes) |
| **7** | Main Component HTML Template Line Count | **2,565 lines** (175,001 bytes) |
| **8** | Main Component SCSS Line Count | **63 lines** (1,251 bytes) |
| **9** | Number of Form Wizard Steps | **5 steps** |
| **10** | Approximate Total Field Count (including Modals & Dynamic fields) | **68 distinct inputs / controls** |
| **11** | Number of Custom Searchable Dropdowns | **5 dropdowns** (District, State Reg, State Addr, State Auth, Bank) |
| **12** | Number of Dialog Modals in Template | **4 modals** (Preview, Officer CRUD, Award CRUD, Success) |
| **13** | Number of Validation Engine Methods | **10 methods** in `FormValidationService` |
| **14** | Major Duplicated Logic Areas | **4 areas** (5x Dropdowns, 2x Document Views, 28x Input shells, 4x Modal shells) |
| **15** | Dormant / Orphaned Features Identified | **2 complete CRUD subsystems** (Officer In-Charge & Awards) |

### Top Architectural Observations
1. **High Functional Completeness:** The forms feature contains rich government portal validation, thorough input masking (Aadhaar, PAN, IFSC, Mobile, Turnover, Dates), real-time auto-saving to localStorage, and responsive UI.
2. **Extreme Component Density:** The main component violates Single Responsibility Principle by combining 5 complex domains, 5 custom searchable dropdowns, 4 modals, and all sanitizers in a single monolithic controller.
3. **Orphaned Subsystems:** The Officer In-Charge and Award Record modals represent complete CRUD features that exist in both the TypeScript controller and HTML template, but lack entry-point trigger buttons in the active wizard steps.
4. **Validation Cache Bug:** The memoization cache in `FormValidationService` fails 100% of cache checks during user typing due to object reference inequality caused by immutable state spreading.
