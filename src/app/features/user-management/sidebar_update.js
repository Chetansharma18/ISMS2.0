const fs = require('fs');
const path = require('path');

// 1. Sidebar Component
const sidebarPath = 'd:/ISMS/ISMS2.0/src/app/core/layout/sidebar/sidebar.component.ts';
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

const sidebarTarget = `                  <a
                    routerLink="/admin/user-management"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    [routerLinkActiveOptions]="{ exact: true }"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Users</span>
                  </a>`;

const sidebarReplacement = `                  <a
                    routerLink="/admin/user-management"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    [routerLinkActiveOptions]="{ exact: true }"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Users</span>
                  </a>

                  <a
                    routerLink="/admin/user-management"
                    [queryParams]="{ filter: 'blacklisted' }"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Blacklisted users</span>
                  </a>`;

if (sidebarContent.includes(sidebarTarget)) {
  sidebarContent = sidebarContent.replace(sidebarTarget, sidebarReplacement);
} else {
  sidebarContent = sidebarContent.replace(sidebarTarget.replace(/\n/g, '\r\n'), sidebarReplacement.replace(/\n/g, '\r\n'));
}
fs.writeFileSync(sidebarPath, sidebarContent, 'utf8');


// 2. User Management Component
const umPath = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';
let umContent = fs.readFileSync(umPath, 'utf8');

// Add ActivatedRoute import
const importTarget = `import { FormsModule } from '@angular/forms';`;
const importReplacement = `import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';`;
if (umContent.includes(importTarget) && !umContent.includes('import { ActivatedRoute')) {
  umContent = umContent.replace(importTarget, importReplacement);
}

// Add ActivatedRoute injection
const injectTarget = `  private userRepo = inject(MockDatabaseService);`;
const injectReplacement = `  private userRepo = inject(MockDatabaseService);
  private route = inject(ActivatedRoute);`;
if (umContent.includes(injectTarget) && !umContent.includes('private route = inject(ActivatedRoute);')) {
  umContent = umContent.replace(injectTarget, injectReplacement);
}

// Update constructor
const constructorTarget = `  constructor() {
    this.userRepo.getAll().subscribe(list => this.users.set(list));
  }`;
const constructorReplacement = `  constructor() {
    this.userRepo.getAll().subscribe(list => this.users.set(list));
    
    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'blacklisted') {
        this.selectedRoleFilter.set('blacklisted');
      } else {
        this.selectedRoleFilter.set('all');
      }
    });
  }`;
if (umContent.includes(constructorTarget)) {
  umContent = umContent.replace(constructorTarget, constructorReplacement);
} else {
  umContent = umContent.replace(constructorTarget.replace(/\n/g, '\r\n'), constructorReplacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(umPath, umContent, 'utf8');
console.log('Sidebar and routing updated');
