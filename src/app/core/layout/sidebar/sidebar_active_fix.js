const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/core/layout/sidebar/sidebar.component.ts';
let content = fs.readFileSync(path, 'utf8');

const target1 = `                  <a
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

const replacement1 = `                  <a
                    routerLink="/admin/user-management"
                    [queryParams]="{ filter: 'all' }"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    [routerLinkActiveOptions]="{ exact: true, queryParams: 'exact', matrixParams: 'ignored', paths: 'exact', fragment: 'ignored' }"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Users</span>
                  </a>

                  <a
                    routerLink="/admin/user-management"
                    [queryParams]="{ filter: 'blacklisted' }"
                    routerLinkActive="bg-[#EAF2F6] text-[#174A6E] font-semibold"
                    [routerLinkActiveOptions]="{ exact: true, queryParams: 'exact', matrixParams: 'ignored', paths: 'exact', fragment: 'ignored' }"
                    class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-[#F5F7F9] hover:text-[#174A6E] transition-colors flex items-center gap-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span class="truncate">Blacklisted users</span>
                  </a>`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
} else {
  content = content.replace(target1.replace(/\n/g, '\r\n'), replacement1.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed routerLinkActiveOptions');
