const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';

let content = fs.readFileSync(path, 'utf8');

const regex = /readonly filteredUsers = computed\(\(\) => \{[\s\S]*?\}\);/;

const replacement = `  readonly filteredUsers = computed(() => {
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
    
    userToBlacklist.status = 'Blacklisted';
    this.users.set([...usersList]);
    this.blacklistSuccess.set(\`Successfully blacklisted user: \${userToBlacklist.name || userToBlacklist.username} (\${userToBlacklist.ssoId || userToBlacklist.userId})\`);
    this.blacklistInput.set('');
    
    setTimeout(() => this.blacklistSuccess.set(''), 3000);
  }`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed typescript methods');
