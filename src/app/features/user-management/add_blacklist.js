const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';

let content = fs.readFileSync(path, 'utf8');

// 1. Add "Blacklisted Users" button to Role Filters
const tpBtnTarget = `        <button
          type="button"
          (click)="selectedRoleFilter.set('tp')"
          [ngClass]="selectedRoleFilter() === 'tp' ? 'bg-[#174A6E] text-white shadow-md border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#174A6E] hover:border-[#174A6E]/30'"
          class="px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex-1 text-center shadow-sm"
        >
          TP
        </button>
      </div>`;

const tpBtnReplacement = `        <button
          type="button"
          (click)="selectedRoleFilter.set('tp')"
          [ngClass]="selectedRoleFilter() === 'tp' ? 'bg-[#174A6E] text-white shadow-md border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#174A6E] hover:border-[#174A6E]/30'"
          class="px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex-1 text-center shadow-sm"
        >
          TP
        </button>
        <button
          type="button"
          (click)="selectedRoleFilter.set('blacklisted')"
          [ngClass]="selectedRoleFilter() === 'blacklisted' ? 'bg-rose-600 text-white shadow-md border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-600/30'"
          class="px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex-1 text-center shadow-sm"
        >
          Blacklisted Users
        </button>
      </div>`;

if (content.includes(tpBtnTarget)) {
  content = content.replace(tpBtnTarget, tpBtnReplacement);
} else {
  content = content.replace(tpBtnTarget.replace(/\n/g, '\r\n'), tpBtnReplacement.replace(/\n/g, '\r\n'));
}

// 2. Add Search User input box right after Role Filters and before Users Table
const tableTarget = `      <!-- Users Table -->
      <app-table`;

const tableReplacement = `      @if (selectedRoleFilter() === 'blacklisted') {
        <div class="w-full bg-white border border-rose-200 p-4 rounded-xl shadow-sm mt-3 mb-1 flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1 w-full">
            <label class="block text-slate-700 font-semibold mb-1.5 text-sm">Search User to Blacklist (SSO ID or Name)</label>
            <div class="flex gap-2">
              <input type="text" [ngModel]="blacklistInput()" (ngModelChange)="blacklistInput.set($event)" placeholder="Enter SSO ID or Name..." class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500">
              <button (click)="blacklistUserBySearch()" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm rounded-lg font-semibold shadow-sm transition-colors whitespace-nowrap cursor-pointer">
                Blacklist User
              </button>
            </div>
            @if (blacklistError()) {
              <div class="text-xs text-rose-500 mt-1.5 font-medium">{{ blacklistError() }}</div>
            }
            @if (blacklistSuccess()) {
              <div class="text-xs text-emerald-600 mt-1.5 font-medium">{{ blacklistSuccess() }}</div>
            }
          </div>
        </div>
      }

      <!-- Users Table -->
      <app-table`;

if (content.includes(tableTarget)) {
  content = content.replace(tableTarget, tableReplacement);
} else {
  content = content.replace(tableTarget.replace(/\n/g, '\r\n'), tableReplacement.replace(/\n/g, '\r\n'));
}

// 3. Update filteredUsers computed in TS
const computedTarget = `  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedRoleFilter().toLowerCase();
    const all = this.users();
    
    let filtered = all;
    if (filter !== 'all') {
      filtered = filtered.filter(u => 
        (u.roleType && u.roleType.toLowerCase().includes(filter)) || 
        (u.userType && u.userType.toLowerCase().includes(filter)) ||
        (u.schemeDepartment && u.schemeDepartment.toLowerCase().includes(filter)) ||
        // Fallback matching logic for specific 'department' and 'citizen' cases that might not exactly map to strings
        (filter === 'department' && u.userType === 'Admin')
      );
    }

    if (!q) return filtered;
    return filtered.filter(u =>
      (u.userId && u.userId.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.ssoId && u.ssoId.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });`;

const computedReplacement = `  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedRoleFilter().toLowerCase();
    const all = this.users();
    
    let filtered = all;
    
    if (filter === 'blacklisted') {
      filtered = filtered.filter(u => u.status === 'Blacklisted');
    } else if (filter !== 'all') {
      filtered = filtered.filter(u => 
        (u.roleType && u.roleType.toLowerCase().includes(filter)) || 
        (u.userType && u.userType.toLowerCase().includes(filter)) ||
        (u.schemeDepartment && u.schemeDepartment.toLowerCase().includes(filter)) ||
        // Fallback matching logic for specific 'department' and 'citizen' cases that might not exactly map to strings
        (filter === 'department' && u.userType === 'Admin')
      );
    }

    if (!q) return filtered;
    return filtered.filter(u =>
      (u.userId && u.userId.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.ssoId && u.ssoId.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  blacklistInput = signal('');
  blacklistError = signal('');
  blacklistSuccess = signal('');

  blacklistUserBySearch() {
    this.blacklistError.set('');
    this.blacklistSuccess.set('');
    const q = this.blacklistInput().trim().toLowerCase();
    if (!q) {
      this.blacklistError.set('Please enter a valid SSO ID or Name');
      return;
    }
    
    const usersList = this.users();
    // Search across name, ssoId, username, userId
    const userToBlacklist = usersList.find(u => 
      (u.ssoId && u.ssoId.toLowerCase() === q) || 
      (u.name && u.name.toLowerCase() === q) ||
      (u.username && u.username.toLowerCase() === q) ||
      (u.userId && u.userId.toLowerCase() === q)
    );
    
    if (!userToBlacklist) {
      this.blacklistError.set('User not found in system.');
      return;
    }
    
    if (userToBlacklist.status === 'Blacklisted') {
      this.blacklistError.set('User is already blacklisted.');
      return;
    }
    
    // Blacklist user
    userToBlacklist.status = 'Blacklisted';
    this.users.set([...usersList]); // Trigger update
    this.blacklistSuccess.set(\`Successfully blacklisted user: \${userToBlacklist.name || userToBlacklist.username} (\${userToBlacklist.ssoId || userToBlacklist.userId})\`);
    this.blacklistInput.set('');
    
    // Clear message after 3 seconds
    setTimeout(() => this.blacklistSuccess.set(''), 3000);
  }`;

if (content.includes(computedTarget)) {
  content = content.replace(computedTarget, computedReplacement);
} else {
  content = content.replace(computedTarget.replace(/\n/g, '\r\n'), computedReplacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated user-management');
