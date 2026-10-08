const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';

let content = fs.readFileSync(path, 'utf8');

// 1. Remove the Blacklisted Users inline tab button
const tabTarget = `        <button
          type="button"
          (click)="selectedRoleFilter.set('blacklisted')"
          [ngClass]="selectedRoleFilter() === 'blacklisted' ? 'bg-rose-600 text-white shadow-md border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-600/30'"
          class="px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex-1 text-center shadow-sm"
        >
          Blacklisted Users
        </button>`;

if (content.includes(tabTarget)) {
  content = content.replace(tabTarget, '');
} else {
  content = content.replace(tabTarget.replace(/\n/g, '\r\n'), '');
}

// 2. Hide the whole Role Filters bar if filter is blacklisted
const wrapTarget = `      <!-- Role Filters -->
      <div class="w-full flex flex-col sm:flex-row gap-3">`;

const wrapReplacement = `      <!-- Role Filters -->
      @if (selectedRoleFilter() !== 'blacklisted') {
        <div class="w-full flex flex-col sm:flex-row gap-3">`;

const closeTarget = `        </button>
      </div>

      @if (selectedRoleFilter() === 'blacklisted') {`;

const closeReplacement = `        </button>
        </div>
      }

      @if (selectedRoleFilter() === 'blacklisted') {`;

if (content.includes(wrapTarget)) {
  content = content.replace(wrapTarget, wrapReplacement);
  content = content.replace(closeTarget, closeReplacement);
} else {
  content = content.replace(wrapTarget.replace(/\n/g, '\r\n'), wrapReplacement.replace(/\n/g, '\r\n'));
  content = content.replace(closeTarget.replace(/\n/g, '\r\n'), closeReplacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(path, content, 'utf8');
console.log('Removed inline Blacklisted filter and hid filters on blacklisted view');
