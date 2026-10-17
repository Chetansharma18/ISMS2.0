#!/usr/bin/env node
/**
 * UI guard: keeps every screen on the shared components.
 *
 * It scans the app (not the shared UI kit itself) for hand-written UI that the kit already covers:
 *   raw-button   a <button> without the `appButton` attribute      -> <button appButton ...>
 *   raw-table    a hand-written <table>                            -> <app-table> / <app-list-page>
 *   raw-overlay  a hand-made full-screen overlay (`fixed inset-0`) -> <app-modal>
 *   raw-svg      inline <svg> markup in a feature                  -> <app-icon name="...">
 *   raw-input    a text <input> without `appInput`                 -> <input appInput ...>
 *   raw-select   a <select> without `appInput`                     -> <select appInput ...>
 *   raw-textarea a <textarea> without `appInput`                   -> <textarea appInput ...>
 *   header-search / header-button-size  see HEADER_RULES below (page title bars look identical)
 *   button-style, raw-icon-font          see FILE_RULES below
 *   page-frame   a routed screen outside <app-page-shell> / <app-list-page> / <app-document-page> / <app-master-crud-page>
 *
 * Existing violations are recorded per file in tools/ui-guard-baseline.json. The check fails when a
 * file has MORE violations than its baseline (or a new file has any). Migrating a screen lowers its
 * count; run `npm run check:ui:update` to record the lower number so it can never grow back.
 *
 * A deliberate exception (for example a print-style document table) is allowed by putting this
 * comment directly above it, with a reason:   <!-- ui-guard-allow: printed letter layout -->
 *
 * Usage:
 *   node tools/ui-guard.mjs            check against the baseline (exit 1 on a regression)
 *   node tools/ui-guard.mjs --update   rewrite the baseline with the current counts
 *   node tools/ui-guard.mjs --report   print totals and the worst files
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const appDir = join(root, 'src', 'app');
const baselinePath = join(root, 'tools', 'ui-guard-baseline.json');

/** Folders that ARE the kit: they are allowed to contain the raw markup the kit is built from. */
const KIT_PREFIXES = [
  'shared/templates/',
  'shared/components/button/',
  'shared/components/icon/',
  'shared/components/modal/',
  'shared/components/switch/',
  'shared/components/backdrop/',
  'shared/components/otp-input/',
  'shared/components/progress-ring/',
  'shared/components/dropdown/',
  'shared/components/action-modal/',
  'shared/components/document-sheet-modal/',
  'shared/components/document-viewer-modal/',
  'shared/components/page-header/',
  'shared/components/table/',
  'shared/components/stepper/',
  'shared/components/form-controls/',
  'shared/components/loader/',
  'shared/components/status-badge/',
  'shared/components/empty-state/',
  'shared/components/toast-outlet/'
];

const RULES = {
  'raw-button': /<button\b(?![^>]*\bappButton\b)/g,
  // A printed-letter table carries `appDocTable`.
  'raw-table': /<table\b(?![^>]*\bappDocTable\b)/g,
  'raw-overlay': /fixed inset-0/g,
  'raw-svg': /<svg\b/g,
  // Checkbox, radio, file, hidden and range inputs stay native.
  'raw-input': /<input\b(?![^>]*\bappInput\b)(?![^>]*\btype="(?:checkbox|radio|file|hidden|range)")/g,
  'raw-select': /<select\b(?![^>]*\bappInput\b)/g,
  'raw-textarea': /<textarea\b(?![^>]*\bappInput\b)/g
};

/**
 * Rules about how the shared page header is used. They look inside every <app-page-header>...</app-page-header>:
 *   header-search       a hand-made search box in the header slot   -> [searchable]="true" [(searchQuery)]
 *   header-button-size  a header button without size="sm"          -> <button appButton size="sm">
 * so that every page title bar has the same search box and the same button height.
 */
const HEADER_BLOCK = /<app-page-header\b[\s\S]*?<\/app-page-header>/g;
const HEADER_RULES = {
  'header-search': block => [...block.matchAll(/<input\b[^>]*\bappInput\b[^>]*>/g)].map(m => m.index),
  'header-button-size': block =>
    [...block.matchAll(/<(?:button|a)\b[^>]*\bappButton\b[^>]*>/g)].filter(m => !/\bsize="/.test(m[0])).map(m => m.index)
};

/**
 * Rules that look at the whole file:
 *   button-style  a kit button given its own colour, border, padding or radius classes
 *                 -> use variant / size; a new look is added to the kit, not to a screen
 *   raw-icon-font an icon-font tag (<i class="fa ...">)          -> <app-icon name="...">
 */
const BUTTON_TAG = /<(?:button|a)\b[^>]*\bappButton\b[^>]*>/g;
const BUTTON_STYLE_CLASS = /(?:^|\s)(?:hover:|focus:|disabled:)?(?:bg-|border(?:-|\s|$)|px-|py-|rounded|shadow|text-(?:white|black|slate|gray|navy|brand|primary|rose|red|emerald|green|blue|sky|amber|yellow|purple|\[))/;
const FILE_RULES = {
  'button-style': text =>
    [...text.matchAll(BUTTON_TAG)]
      .filter(m => {
        const cls = /\bclass="([^"]*)"/.exec(m[0]);
        return cls !== null && BUTTON_STYLE_CLASS.test(cls[1]);
      })
      .map(m => m.index),
  'raw-icon-font': text => [...text.matchAll(/<i\s+class="[^"]*\bfa[sbrl]?[\s-]/g)].map(m => m.index)
};

/**
 * Every routed screen must sit in one of the page frames, so a new page starts from the same layout:
 *   <app-page-shell>, <app-list-page>, <app-document-page> or <app-master-crud-page>.
 * A screen that really needs its own layout (a wizard, a landing page) says so with
 *   <!-- ui-guard-allow: page-frame - reason -->   anywhere in the file.
 */
const PAGE_FRAME = /<app-(?:page-shell|list-page|document-page|master-crud-page)\b/;
const PAGE_FRAME_RULE = 'page-frame';

/** Files that app.routes.ts loads: every `import('./features/...')`, as a path relative to src/app. */
function routedFiles() {
  const routesPath = join(appDir, 'app.routes.ts');
  if (!existsSync(routesPath)) return new Set();
  const found = new Set();
  for (const m of readFileSync(routesPath, 'utf8').matchAll(/import\('(\.\/[^']+)'\)/g)) {
    found.add(m[1].replace(/^\.\//, '') + '.ts');
  }
  return found;
}

const ALLOW = 'ui-guard-allow';

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    // Services and utils build printable HTML strings (receipts, PDFs, previews), which are not Angular templates.
    else if (name.endsWith('.ts') && !/\.(spec|service|util)\.ts$/.test(name)) yield full;
  }
}

function scan() {
  /** @type {Record<string, Record<string, number>>} */
  const result = {};
  const routed = routedFiles();
  for (const file of walk(appDir)) {
    const rel = relative(appDir, file).split(sep).join('/');
    if (KIT_PREFIXES.some(prefix => rel.startsWith(prefix))) continue;
    if (rel.includes('/mock/') || rel.startsWith('core/mock/')) continue;

    const text = readFileSync(file, 'utf8');
    for (const [rule, pattern] of Object.entries(RULES)) {
      let count = 0;
      for (const match of text.matchAll(pattern)) {
        // An exception is marked on the line above (or the same line).
        const before = text.slice(Math.max(0, match.index - 240), match.index);
        const lastLine = before.split('\n').slice(-5).join('\n');
        if (lastLine.includes(ALLOW)) continue;
        count++;
      }
      if (count > 0) (result[rel] ??= {})[rule] = count;
    }
    for (const [rule, find] of Object.entries(HEADER_RULES)) {
      let count = 0;
      for (const block of text.matchAll(HEADER_BLOCK)) {
        for (const offset of find(block[0])) {
          const at = block.index + offset;
          const lastLine = text.slice(Math.max(0, at - 240), at).split('\n').slice(-5).join('\n');
          if (!lastLine.includes(ALLOW)) count++;
        }
      }
      if (count > 0) (result[rel] ??= {})[rule] = count;
    }
    for (const [rule, find] of Object.entries(FILE_RULES)) {
      let count = 0;
      for (const offset of find(text)) {
        const lastLine = text.slice(Math.max(0, offset - 240), offset).split('\n').slice(-5).join('\n');
        if (!lastLine.includes(ALLOW)) count++;
      }
      if (count > 0) (result[rel] ??= {})[rule] = count;
    }
    if (routed.has(rel) && !PAGE_FRAME.test(text) && !text.includes(`${ALLOW}: page-frame`)) {
      (result[rel] ??= {})[PAGE_FRAME_RULE] = 1;
    }
  }
  return result;
}

function total(map) {
  const sums = Object.fromEntries(
    [...Object.keys(RULES), ...Object.keys(HEADER_RULES), ...Object.keys(FILE_RULES), PAGE_FRAME_RULE].map(rule => [rule, 0])
  );
  for (const rules of Object.values(map)) for (const [rule, n] of Object.entries(rules)) sums[rule] += n;
  return sums;
}

const current = scan();
const mode = process.argv[2] ?? '';

if (mode === '--update') {
  const sorted = Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(baselinePath, JSON.stringify(sorted, null, 2) + '\n');
  console.log('ui-guard: baseline updated', total(current));
  process.exit(0);
}

if (mode === '--report') {
  console.log('ui-guard totals:', total(current));
  const worst = Object.entries(current)
    .map(([file, rules]) => [file, Object.values(rules).reduce((a, b) => a + b, 0), rules])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  for (const [file, n, rules] of worst) console.log(String(n).padStart(4), file, JSON.stringify(rules));
  process.exit(0);
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {};
const problems = [];
const improved = [];

for (const [file, rules] of Object.entries(current)) {
  for (const [rule, count] of Object.entries(rules)) {
    const allowed = baseline[file]?.[rule] ?? 0;
    if (count > allowed) problems.push(`${file}: ${rule} ${count} (allowed ${allowed})`);
  }
}
for (const [file, rules] of Object.entries(baseline)) {
  for (const [rule, allowed] of Object.entries(rules)) {
    const count = current[file]?.[rule] ?? 0;
    if (count < allowed) improved.push(`${file}: ${rule} ${count} < ${allowed}`);
  }
}

if (problems.length > 0) {
  console.error('ui-guard: hand-written UI found where a shared component exists.\n');
  for (const line of problems) console.error('  ' + line);
  console.error(
    '\nUse the shared component instead (button: <button appButton>, dialog: <app-modal>, table: <app-table>, icon: <app-icon>).' +
      '\n  raw-*           a hand-written element: use the kit component (list in AGENTS.md)' +
      '\n  header-*        page title bar: <app-page-header [searchable]="true">, header buttons size="sm"' +
      '\n  button-style    no colour / border / padding classes on appButton: use variant and size' +
      '\n  page-frame      a routed screen must sit in app-page-shell / app-list-page / app-document-page / app-master-crud-page' +
      '\nStarting a new page?  npm run new:page -- list <feature>/<name> "Title"' +
      '\nFor a deliberate exception add  <!-- ui-guard-allow: reason -->  on the line above it' +
      '\n(whole screen: a  // ui-guard-allow: page-frame - reason  comment at the top of the file).'
  );
  process.exit(1);
}

console.log('ui-guard: ok', total(current));
if (improved.length > 0) {
  console.log(`\n${improved.length} place(s) are below the baseline. Run "npm run check:ui:update" to lock in the progress.`);
}
