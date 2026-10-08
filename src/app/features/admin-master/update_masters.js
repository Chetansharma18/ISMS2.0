const fs = require('fs');
const path = require('path');

const dir = 'd:/ISMS/ISMS2.0/src/app/features/admin-master';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.component.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add Edit button to Action template
  const buttonHtml = `          <!-- Edit -->
          <button
            type="button"
            (click)="$event.stopPropagation(); openEditModal(item)"
            class="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-[12px] hover:underline cursor-pointer select-none transition-colors"
            title="Edit"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
          
          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>`;

  if (!content.includes('<span>Edit</span>') && content.includes('<ng-template #actionTemplate let-item>')) {
    const actionTemplateMatch = content.match(/<ng-template #actionTemplate let-item>[\s\S]*?<div[^>]*whitespace-nowrap[^>]*>/);
    if (actionTemplateMatch) {
      const splitIndex = actionTemplateMatch.index + actionTemplateMatch[0].length;
      content = content.slice(0, splitIndex) + '\n' + buttonHtml + content.slice(splitIndex);
      changed = true;
    }
  }

  // 2. Add openEditModal if it doesn't exist
  if (!content.includes('openEditModal(item')) {
    // Add editingId signal if not exists
    if (!content.includes('editingId = signal')) {
      content = content.replace(/showModal = signal<boolean>\(false\);/, 'showModal = signal<boolean>(false);\n  editingId = signal<string | null>(null);');
    }
    
    // Add openEditModal method
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
      // insert before openAddModal
      content = content.slice(0, addModalIndex) + editModalMethod + content.slice(addModalIndex);
      changed = true;
    }

    // 3. Update the submit method to handle edit
    const submitMethods = ['submitCourse', 'submitDesignation', 'submitEntry', 'submitCategory', 'submitPermission', 'submitScheme', 'submitSector', 'submitRole'];
    let submitMethod = null;
    for (const m of submitMethods) {
      if (content.includes(`${m}(): void {`)) {
        submitMethod = m;
        break;
      }
    }

    if (submitMethod) {
      // Find the update call: e.g., this.courses.update(current => { ... })
      // This is a bit tricky to replace reliably. Let's just modify the modal title
      // We will only do the basic Edit functionality which they asked for. We might not need full save logic if they just wanted the button. But since we are adding the modal, let's also fix the title.
      content = content.replace(/Add New [^<]*/g, (match) => {
        if (match.includes('Add New User')) return match;
        return `{{ editingId() ? 'Edit' : 'Add' }} ${match.replace('Add New ', '')}`;
      });

      // Update submit method to handle edit
      const regex = new RegExp(`(${submitMethod}\\(\\): void \\{[\\s\\S]*?)(const newItem:.*?\\{[\\s\\S]*?\\};\\s*)(this\\.[a-zA-Z]+\\.update\\(current => \\{[\\s\\S]*?return updated\\.map[\\s\\S]*?\\}\\);)`, 'm');
      
      const match = content.match(regex);
      if (match) {
        const replacement = `${match[1]}const editId = this.editingId();
    if (editId) {
      ${match[3].replace(/const updated = \[newItem, ...current\];/, 'const updated = current.map(item => item.id === editId ? { ...item, ...this.formData } : item);')}
    } else {
      ${match[2]}${match[3]}
    }`;
        content = content.replace(match[0], replacement);
      }
    }
  }

  // Also add editingId reset to openAddModal
  if (content.includes('openAddModal(): void {') && !content.match(/openAddModal\(\): void \{\s*this\.editingId\.set\(null\);/)) {
     content = content.replace('openAddModal(): void {', 'openAddModal(): void {\n    this.editingId.set(null);');
     changed = true;
  }


  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
