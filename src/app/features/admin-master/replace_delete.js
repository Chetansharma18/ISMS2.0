const fs = require('fs');
const path = require('path');

const dir = 'd:/ISMS/ISMS2.0/src/app/features/admin-master';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.component.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the Delete button HTML
  const regex = /<div class="h-3\.5 w-\[1px\] bg-slate-300 shrink-0 mx-2"><\/div>\s*<button[\s\S]*?<span>Delete<\/span>\s*<\/button>/;
  
  const toggleHtml = `<!-- Active / Inactive Toggle -->
          <div class="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-2"></div>
          <div
            class="inline-flex items-center gap-1.5"
            title="Toggle Status"
            (click)="$event.stopPropagation();"
          >
            <button
              type="button"
              (click)="item.status = item.status === 'Active' ? 'Inactive' : 'Active'"
              class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              [ngClass]="item.status === 'Inactive' ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-500 hover:bg-emerald-600'"
              role="switch"
              [attr.aria-checked]="item.status === 'Active'"
            >
              <span class="sr-only">Toggle Active Status</span>
              <span
                class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                [ngClass]="item.status === 'Inactive' ? 'translate-x-0' : 'translate-x-3'"
              ></span>
            </button>
            <span 
              class="font-medium text-[12px] select-none transition-colors cursor-pointer"
              (click)="item.status = item.status === 'Active' ? 'Inactive' : 'Active'"
              [ngClass]="item.status === 'Inactive' ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'"
            >
              {{ item.status === 'Inactive' ? 'Inactive' : 'Active' }}
            </span>
          </div>`;

  if (content.match(regex)) {
    content = content.replace(regex, toggleHtml);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
