const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';

let content = fs.readFileSync(path, 'utf8');

// Update Interface
const interfaceTarget = `  mobileNo?: string;
  schemeStatus: 'Active' | 'Inactive';
}`;
const interfaceReplacement = `  mobileNo?: string;
  schemeStatus: 'Active' | 'Inactive' | 'Blacklisted';
}`;

if (content.includes(interfaceTarget)) {
  content = content.replace(interfaceTarget, interfaceReplacement);
} else {
  content = content.replace(interfaceTarget.replace(/\n/g, '\r\n'), interfaceReplacement.replace(/\n/g, '\r\n'));
}

// Update Template
const templateTarget = `        } @else if (item.userType === 'TP' || item.roleType === 'tp') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Blacklisted
          </span>`;
const templateReplacement = `        } @else if (item.userType === 'TP' || item.roleType === 'tp' || item.schemeStatus === 'Blacklisted') {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
            Blacklisted
          </span>`;
if (content.includes(templateTarget)) {
  content = content.replace(templateTarget, templateReplacement);
} else {
  content = content.replace(templateTarget.replace(/\n/g, '\r\n'), templateReplacement.replace(/\n/g, '\r\n'));
}

// Update filteredUsers logic & properties
const logicRegex = /  readonly filteredUsers = computed\(\(\) => \{[\s\S]*?\}\);[\s\S]*?setTimeout\(\(\) => this\.blacklistSuccess\.set\(''\), 3000\);\n  \}/;

const newLogic = `  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedRoleFilter().toLowerCase();
    const all = this.users();
    
    let filtered = all;
    
    if (filter === 'blacklisted') {
      filtered = filtered.filter(u => u.schemeStatus === 'Blacklisted' || (u.schemeStatus !== 'Active' && (u.userType === 'TP' || u.roleType === 'tp')));
    } else if (filter !== 'all') {
      filtered = filtered.filter(u => 
        (u.roleType && u.roleType.toLowerCase().includes(filter)) || 
        (u.userType && u.userType.toLowerCase().includes(filter)) ||
        (u.schemeDepartment && u.schemeDepartment.toLowerCase().includes(filter)) ||
        (filter === 'department' && u.userType === 'Admin')
      );
    }

    if (!q) return filtered;
    return filtered.filter(u =>
      (u.userId && u.userId.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.ssoId && u.ssoId.toLowerCase().includes(q)) ||
      (u.schemeDepartment && u.schemeDepartment.toLowerCase().includes(q))
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
      this.blacklistError.set('Please enter a valid SSO ID or Username');
      return;
    }
    
    const usersList = this.users();
    const userToBlacklist = usersList.find(u => 
      (u.ssoId && u.ssoId.toLowerCase() === q) || 
      (u.username && u.username.toLowerCase() === q) ||
      (u.userId && u.userId.toLowerCase() === q)
    );
    
    if (!userToBlacklist) {
      this.blacklistError.set('User not found in system.');
      return;
    }
    
    if (userToBlacklist.schemeStatus === 'Blacklisted' || (userToBlacklist.schemeStatus !== 'Active' && (userToBlacklist.userType === 'TP' || userToBlacklist.roleType === 'tp'))) {
      this.blacklistError.set('User is already blacklisted.');
      return;
    }
    
    userToBlacklist.schemeStatus = 'Blacklisted';
    this.users.set([...usersList]);
    this.blacklistSuccess.set(\`Successfully blacklisted user: \${userToBlacklist.username} (\${userToBlacklist.ssoId || userToBlacklist.userId})\`);
    this.blacklistInput.set('');
    
    setTimeout(() => this.blacklistSuccess.set(''), 3000);
  }`;

content = content.replace(logicRegex, newLogic);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed typescript properties for blacklist');
