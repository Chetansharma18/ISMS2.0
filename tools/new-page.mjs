#!/usr/bin/env node
/**
 * Creates a new screen that is already built from the shared UI kit, and registers its route.
 * Start every new page from this, by hand or with an AI tool, so it never needs new design.
 *
 *   npm run new:page -- list     inspections/inspection-list "Inspection Reports"
 *   npm run new:page -- master   admin-master/vendor-master  "Vendor Master"
 *   npm run new:page -- document inspections/inspection-letter "Inspection Letter"
 *
 *   arguments: <kind> <feature-folder>/<file-name> "<Page title>" [--path <route>]
 *   kind:      list      a table screen: title bar with search, table, row actions   (app-list-page)
 *              master    a lookup screen: table + add / edit / view dialog from one config (app-master-crud-page)
 *              document  an official letter: sheet, Back button, action bar        (app-document-page)
 *   --path     the URL (default: the file name, for example "inspection-list")
 *
 * It writes src/app/features/<feature-folder>/<file-name>.component.ts, adds a lazy route to
 * src/app/app.routes.ts (before the "**" route) and prints what is left to do (sidebar link).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const appDir = join(root, 'src', 'app');

const args = process.argv.slice(2);
const pathFlag = args.indexOf('--path');
let routePath = null;
if (pathFlag !== -1) {
  routePath = args[pathFlag + 1] ?? null;
  args.splice(pathFlag, 2);
}
const [kind, target, title] = args;

function fail(message) {
  console.error(`new-page: ${message}`);
  console.error('usage: npm run new:page -- <list|master|document> <feature>/<file-name> "<Page title>" [--path <route>]');
  process.exit(1);
}

if (!['list', 'master', 'document'].includes(kind ?? '')) fail('kind must be list, master or document');
if (!target || !/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(target)) fail('second argument must look like feature-folder/file-name (lower-case, dashes)');
if (!title) fail('give the page title in quotes');
if (/['"`$\\<>]/.test(title)) fail('the title must not contain quotes, $, backslash or < >');

const [feature, name] = target.split('/');
const pascal = name.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
const className = `${pascal}Component`;
const constKey = name.replace(/-/g, '_').toUpperCase();
const route = routePath ?? name;
const filePath = join(appDir, 'features', feature, `${name}.component.ts`);
if (existsSync(filePath)) fail(`${filePath} already exists`);

const BT = '`';
const crumbs = `[{ label: 'Home', url: '/' }, { label: '${title}' }]`;

const TEMPLATES = {
  list: `import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ButtonComponent, IconComponent, ListPageComponent, TableColumn } from '../../shared';

interface Row {
  id: string;
  name: string;
  status: string;
}

/**
 * ${title}
 * A list screen: everything visible comes from the shared kit (app-list-page, appButton, app-icon).
 * Do not add your own header, search box, table or button styles; extend the kit if something is missing.
 */
@Component({
  selector: 'app-${name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListPageComponent, ButtonComponent, IconComponent],
  template: ${BT}
    <app-list-page
      title="${title}"
      [breadcrumbs]="${crumbs}"
      searchPlaceholder="Search..."
      [(searchQuery)]="query"
      [columns]="columns"
      [data]="filtered()"
      itemUnit="records"
      [customTemplates]="{ action: actionTemplate }"
    >
      <button headerActions appButton size="sm" type="button" (click)="add()">
        <app-icon name="plus" size="sm" />
        <span>Add</span>
      </button>
    </app-list-page>

    <ng-template #actionTemplate let-row>
      <button appButton variant="ghost" size="sm" type="button" (click)="view(row)">
        <app-icon name="eye" size="sm" />
        <span>View</span>
      </button>
    </ng-template>
  ${BT}
})
export class ${className} {
  readonly query = signal('');

  // TODO: load the rows from a service (DataEngineService) instead of this sample list.
  private readonly rows = signal<Row[]>([
    { id: '1', name: 'Sample record 1', status: 'Active' },
    { id: '2', name: 'Sample record 2', status: 'Active' }
  ]);

  readonly columns: TableColumn<Row>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'action', label: 'Action', align: 'center', width: 'min-w-[120px]' }
  ];

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.rows().filter(row => row.name.toLowerCase().includes(q)) : this.rows();
  });

  add(): void {
    // TODO: open an <app-action-modal> with <input appInput> fields.
  }

  view(row: Row): void {
    // TODO: open the detail view for ${BT}row${BT}.
    void row;
  }
}
`,

  master: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MasterCrudPageComponent, MasterCrudConfig, TableColumn } from '../../shared';

interface ${pascal}Item {
  id: string;
  name: string;
  code: string;
  status?: string;
}

const COLUMNS: TableColumn<${pascal}Item>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'name', label: 'Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'code', label: 'Code', cellClass: 'whitespace-nowrap font-mono text-xs text-slate-700' }
];

// TODO: register the '${constKey}' data key in core/mock (mock-database.service.ts, admin-masters.mock.ts)
// and in core/config/api.config.ts, like the other masters, so the page has data to load and save.
const CONFIG: MasterCrudConfig<${pascal}Item> = {
  dataKey: '${constKey}',
  entityLabel: '${title.replace(/ Master$/i, '')}',
  title: '${title}',
  searchPlaceholder: 'Search by name or code...',
  searchFields: ['name', 'code'],
  itemUnit: 'records',
  columns: COLUMNS,
  hasStatus: true,
  modalWidthClass: 'max-w-[520px]',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 100, placeholder: 'Enter name', colSpan: 3 },
    { key: 'code', label: 'Code', type: 'text', required: true, maxLength: 30, placeholder: 'e.g. ABC', uppercase: true, colSpan: 3 }
  ],
  createDefaults: () => ({ name: '', code: '' }),
  buildPayload: formData => ({
    name: formData.name.trim(),
    code: formData.code.trim().toUpperCase(),
    status: 'Active'
  }),
  deleteConfirmText: item => ${BT}Are you sure you want to delete "${'${item.name}'}"?${BT}
};

/** ${title}: a lookup screen. The page, table, dialog and Active toggle all come from MasterCrudPageComponent. */
@Component({
  selector: 'app-${name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent],
  template: ${BT}<app-master-crud-page [config]="config" />${BT}
})
export class ${className} {
  readonly config = CONFIG;
}
`,

  document: `import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent, DocumentPageComponent } from '../../shared';

/**
 * ${title}
 * A letter screen: Back button, title, paper sheet and an action bar come from app-document-page.
 * Put the letter itself inside; use <table appDocTable> for tables on the sheet.
 */
@Component({
  selector: 'app-${name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocumentPageComponent, ButtonComponent],
  template: ${BT}
    <app-document-page title="${title}" badge="Draft" [toast]="toast()" (back)="goBack()">
      <p>Write the letter here.</p>

      <ng-container actions>
        <button appButton variant="outline" size="lg" type="button" (click)="save()">Save</button>
      </ng-container>
    </app-document-page>
  ${BT}
})
export class ${className} {
  private readonly location = inject(Location);
  readonly toast = signal('');

  goBack(): void {
    this.location.back();
  }

  save(): void {
    // TODO: persist the draft.
    this.toast.set('Draft saved.');
  }
}
`
};

mkdirSync(dirname(filePath), { recursive: true });
writeFileSync(filePath, TEMPLATES[kind]);

// Register the lazy route before the "**" fallback.
const routesPath = join(appDir, 'app.routes.ts');
const routes = readFileSync(routesPath, 'utf8');
const entry = `  {
    path: '${route}',
    loadComponent: () =>
      import('./features/${feature}/${name}.component').then(
        (m) => m.${className}
      )
  },
`;
const wildcard = routes.search(/ {2}\{\s*path: '\*\*'/);
if (wildcard === -1) {
  console.warn(`new-page: could not find the "**" route; add this route to app.routes.ts yourself:\n${entry}`);
} else if (routes.includes(`path: '${route}',`)) {
  console.warn(`new-page: a route "${route}" already exists; the file was created but the route was not added.`);
} else {
  writeFileSync(routesPath, routes.slice(0, wildcard) + entry + routes.slice(wildcard));
}

console.log(`
Created   src/app/features/${feature}/${name}.component.ts   (${kind} page)
Route     /${route}   (app.routes.ts)

Next
  1. Add the sidebar link: src/app/core/layout/sidebar/sidebar-nav.config.ts
       { key: '${name}', label: '${title}', link: '/${route}', icon: 'list' }
     (put it in the array of the role that should see it)
  2. Replace the TODO parts. Keep using the kit: appButton, app-icon, appInput, app-dropdown, app-table, app-modal.
  3. npm run verify
`);
