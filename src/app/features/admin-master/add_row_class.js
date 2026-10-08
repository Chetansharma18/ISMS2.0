const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  ...fs.readdirSync('d:/ISMS/ISMS2.0/src/app/features/admin-master')
    .filter(f => f.endsWith('.component.ts'))
    .map(f => path.join('d:/ISMS/ISMS2.0/src/app/features/admin-master', f)),
  'd:/ISMS/ISMS2.0/src/app/features/user-management/user-management.component.ts'
];

for (const filePath of filesToUpdate) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (!content.includes('[rowClass]="getRowClass"')) {
    content = content.replace(/<app-table/, '<app-table\n        [rowClass]="getRowClass"');
    changed = true;
  }

  if (!content.includes('getRowClass = (item: any): string => {')) {
    const methodStr = `
  getRowClass = (item: any): string => {
    const isInactive = item.status === 'Inactive' || item.schemeStatus === 'Inactive';
    return isInactive ? 'opacity-50 bg-slate-50 transition-colors' : 'bg-white transition-colors';
  };
`;
    // Insert after search query or similar signal definition, or just at the end of the class before the last brace.
    content = content.replace(/}\s*$/, methodStr + '\n}\n');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}
