const fs = require('fs');
const path = require('path');

// 1. Update schemes.mock.ts
const mockFile = 'd:/ISMS/ISMS2.0/src/app/core/mock/data/schemes.mock.ts';
let mockContent = fs.readFileSync(mockFile, 'utf8');

const mockTarget = `export const MOCK_AVAILABLE_ADMINS = [
  { id: 'adm-1', name: 'super admin 1', ssoId: 'SSO_SUPER_01', role: 'Super Admin' },
  { id: 'adm-2', name: 'super admin 2', ssoId: 'SSO_SUPER_02', role: 'Super Admin' },
  { id: 'adm-3', name: 'admin 1', ssoId: 'SSO_ADM_01', role: 'Scheme OC' },
  { id: 'adm-4', name: 'admin 2', ssoId: 'SSO_ADM_02', role: 'MIS Manager' },
  { id: 'adm-5', name: 'admin 3', ssoId: 'SSO_ADM_03', role: 'Programmer' },
  { id: 'adm-6', name: 'admin 4', ssoId: 'SSO_ADM_04', role: 'GM' },
  { id: 'adm-7', name: 'admin 5', ssoId: 'SSO_ADM_05', role: 'ZC' }
];`;

const mockReplacement = `export const MOCK_AVAILABLE_ADMINS = [
  { id: 'adm-1', name: 'Ramesh Suresh', ssoId: 'SSO_SUPER_01', role: 'Super Admin' },
  { id: 'adm-2', name: 'Ram Shyaam', ssoId: 'SSO_SUPER_02', role: 'Super Admin' },
  { id: 'adm-3', name: 'Siddesh', ssoId: 'SSO_ADM_01', role: 'Scheme OC' },
  { id: 'adm-4', name: 'Rahul Sharma', ssoId: 'SSO_ADM_02', role: 'MIS Manager' },
  { id: 'adm-5', name: 'Amit Kumar', ssoId: 'SSO_ADM_03', role: 'Programmer' },
  { id: 'adm-6', name: 'Priya Singh', ssoId: 'SSO_ADM_04', role: 'GM' },
  { id: 'adm-7', name: 'Vikram Patel', ssoId: 'SSO_ADM_05', role: 'ZC' }
];`;

if (mockContent.includes(mockTarget)) {
  mockContent = mockContent.replace(mockTarget, mockReplacement);
} else {
  mockContent = mockContent.replace(mockTarget.replace(/\n/g, '\r\n'), mockReplacement.replace(/\n/g, '\r\n'));
}
fs.writeFileSync(mockFile, mockContent, 'utf8');


// 2. Update tenders-page.component.ts
const tendersFile = 'd:/ISMS/ISMS2.0/src/app/features/tenders/tenders-page.component.ts';
let tendersContent = fs.readFileSync(tendersFile, 'utf8');

// A. HTML update
const htmlTarget = `<div class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto p-1.5 space-y-1">
                    @for (adm of availableAdmins; track adm.id) {`;

const htmlReplacement = `<div class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col">
                    <div class="p-1.5 border-b border-slate-100 shrink-0">
                      <div class="relative">
                        <input
                          type="text"
                          placeholder="Search admin name..."
                          [ngModel]="adminSearchQuery()"
                          (ngModelChange)="adminSearchQuery.set($event)"
                          (click)="$event.stopPropagation()"
                          class="w-full pl-7 pr-2 py-1.5 text-[11px] border border-slate-200 rounded focus:outline-none focus:border-[#174A6E] text-slate-700"
                        />
                        <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div class="max-h-56 overflow-y-auto p-1.5 space-y-1">
                    @for (adm of filteredAvailableAdmins(); track adm.id) {`;

if (tendersContent.includes(htmlTarget)) {
  tendersContent = tendersContent.replace(htmlTarget, htmlReplacement);
} else {
  tendersContent = tendersContent.replace(htmlTarget.replace(/\n/g, '\r\n'), htmlReplacement.replace(/\n/g, '\r\n'));
}

// B. TS Update
const tsTarget = `readonly availableAdmins = this.schemeService.getAvailableAdmins();`;
const tsReplacement = `readonly availableAdmins = this.schemeService.getAvailableAdmins();
  adminSearchQuery = signal<string>('');
  filteredAvailableAdmins = computed(() => {
    const q = this.adminSearchQuery().toLowerCase().trim();
    if (!q) return this.availableAdmins;
    return this.availableAdmins.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.role.toLowerCase().includes(q) || 
      a.ssoId.toLowerCase().includes(q)
    );
  });`;

if (tendersContent.includes(tsTarget)) {
  tendersContent = tendersContent.replace(tsTarget, tsReplacement);
} else {
  tendersContent = tendersContent.replace(tsTarget.replace(/\n/g, '\r\n'), tsReplacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(tendersFile, tendersContent, 'utf8');

console.log('Admin search added and mock data updated');
