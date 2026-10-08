const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';

let content = fs.readFileSync(path, 'utf8');

// 1. Update schemeStatusTemplate
const statusTarget = `      <ng-template #schemeStatusTemplate let-item>
        @if (item.schemeStatus === 'Active') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
            Active
          </span>
        } @else if (item.userType === 'TP' || item.roleType === 'tp' || item.schemeStatus === 'Blacklisted') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Blacklisted
          </span>
        } @else {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Inactive
          </span>
        }
      </ng-template>`;

const statusReplacement = `      <ng-template #schemeStatusTemplate let-item>
        @if (item.schemeStatus === 'Active') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
            Active
          </span>
        } @else if (item.schemeStatus === 'Blacklisted') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Blacklisted
          </span>
        } @else {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Inactive
          </span>
        }
      </ng-template>`;

if (content.includes(statusTarget)) {
  content = content.replace(statusTarget, statusReplacement);
} else {
  content = content.replace(statusTarget.replace(/\n/g, '\r\n'), statusReplacement.replace(/\n/g, '\r\n'));
}

// 2. Update actionTemplate toggle
const actionTarget = `            <button
              type="button"
              (click)="toggleUserStatus(item)"
              class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="item.schemeStatus === 'Inactive' ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-500 hover:bg-emerald-600'"
              role="switch"
              [attr.aria-checked]="item.schemeStatus === 'Active'"
            >
              <span class="sr-only">Toggle Active Status</span>
              <span
                class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="item.schemeStatus === 'Inactive' ? 'translate-x-0' : 'translate-x-3'"
              ></span>
            </button>
            <span 
              class="font-medium text-[12px] select-none transition-colors cursor-pointer"
              (click)="toggleUserStatus(item)"
              [ngClass]="item.schemeStatus === 'Inactive' ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'"
            >
              {{ item.schemeStatus === 'Inactive' ? 'Inactive' : 'Active' }}
            </span>`;

const actionReplacement = `            <button
              type="button"
              (click)="toggleUserStatus(item)"
              class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="item.schemeStatus !== 'Active' ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-500 hover:bg-emerald-600'"
              role="switch"
              [attr.aria-checked]="item.schemeStatus === 'Active'"
            >
              <span class="sr-only">Toggle Active Status</span>
              <span
                class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="item.schemeStatus !== 'Active' ? 'translate-x-0' : 'translate-x-3'"
              ></span>
            </button>
            <span 
              class="font-medium text-[12px] select-none transition-colors cursor-pointer"
              (click)="toggleUserStatus(item)"
              [ngClass]="item.schemeStatus !== 'Active' ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'"
            >
              {{ item.schemeStatus !== 'Active' ? 'Inactive' : 'Active' }}
            </span>`;

if (content.includes(actionTarget)) {
  content = content.replace(actionTarget, actionReplacement);
} else {
  content = content.replace(actionTarget.replace(/\n/g, '\r\n'), actionReplacement.replace(/\n/g, '\r\n'));
}

// 3. Update filteredUsers computed property
const filteredUsersTarget = `    if (filter === 'blacklisted') {
      filtered = filtered.filter(u => u.schemeStatus === 'Blacklisted' || (u.schemeStatus !== 'Active' && (u.userType === 'TP' || u.roleType === 'tp')));
    }`;
const filteredUsersReplacement = `    if (filter === 'blacklisted') {
      filtered = filtered.filter(u => u.schemeStatus === 'Blacklisted');
    }`;

if (content.includes(filteredUsersTarget)) {
  content = content.replace(filteredUsersTarget, filteredUsersReplacement);
} else {
  content = content.replace(filteredUsersTarget.replace(/\n/g, '\r\n'), filteredUsersReplacement.replace(/\n/g, '\r\n'));
}

// 4. Update blacklistUserBySearch
const searchTarget = `    if (userToBlacklist.schemeStatus === 'Blacklisted' || (userToBlacklist.schemeStatus !== 'Active' && (userToBlacklist.userType === 'TP' || userToBlacklist.roleType === 'tp'))) {
      this.blacklistError.set('User is already blacklisted.');
      return;
    }`;
const searchReplacement = `    if (userToBlacklist.schemeStatus === 'Blacklisted') {
      this.blacklistError.set('User is already blacklisted.');
      return;
    }`;

if (content.includes(searchTarget)) {
  content = content.replace(searchTarget, searchReplacement);
} else {
  content = content.replace(searchTarget.replace(/\n/g, '\r\n'), searchReplacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed implicit blacklisting of TP users');
