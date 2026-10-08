const fs = require('fs');
const path = 'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `  private userRepo = this.dataEngine.for<UserManagementItem>('USERS');`;
const replacement = `  private userRepo = this.dataEngine.for<UserManagementItem>('USERS');
  private route = inject(ActivatedRoute);`;

if (content.includes(target) && !content.includes('private route = inject(ActivatedRoute);')) {
  content = content.replace(target, replacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Injected ActivatedRoute');
