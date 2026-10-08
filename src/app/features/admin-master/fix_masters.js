const fs = require('fs');
const path = require('path');

const dir = 'd:/ISMS/ISMS2.0/src/app/features/admin-master';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.component.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add editingId signal if not exists
  if (!content.includes('editingId = signal')) {
    content = content.replace(/showModal = signal<boolean>\(false\);/, 'showModal = signal<boolean>(false);\n  editingId = signal<string | null>(null);');
    changed = true;
  }
  
  // Add openEditModal method if not exists
  if (!content.includes('openEditModal(item: any): void')) {
    const addModalIndex = content.indexOf('openAddModal(): void {');
    if (addModalIndex !== -1) {
      const editModalMethod = `
  openEditModal(item: any): void {
    this.editingId.set(item.id);
    this.submitted.set(false);
    this.formData = { ...this.formData, ...item };
    this.showModal.set(true);
  }
`;
      content = content.slice(0, addModalIndex) + editModalMethod + content.slice(addModalIndex);
      changed = true;
    }
  }

  // Update submit methods
  const submitMethods = ['submitCourse', 'submitDesignation', 'submitEntry', 'submitCategory', 'submitPermission', 'submitScheme', 'submitSector', 'submitRole'];
  let submitMethod = null;
  for (const m of submitMethods) {
    if (content.includes(`${m}(): void {`)) {
      submitMethod = m;
      break;
    }
  }

  if (submitMethod && !content.includes('const editId = this.editingId();')) {
    const regex = new RegExp(`(${submitMethod}\\(\\): void \\{[\\s\\S]*?)(const newItem:.*?\\{[\\s\\S]*?\\};\\s*)(this\\.[a-zA-Z]+\\.update\\(current => \\{[\\s\\S]*?return updated\\.map[\\s\\S]*?\\}\\);)`, 'm');
    const match = content.match(regex);
    if (match) {
      const replacement = `${match[1]}const editId = this.editingId();
    if (editId) {
      ${match[3].replace(/const updated = \[newItem, ...current\];/, 'const updated = current.map((item: any) => item.id === editId ? { ...item, ...this.formData } : item);')}
    } else {
      ${match[2]}${match[3]}
    }`;
      content = content.replace(match[0], replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
