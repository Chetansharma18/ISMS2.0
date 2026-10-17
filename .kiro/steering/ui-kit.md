# ISMS 2.0 frontend: rules for every developer and every AI tool

Angular 21, standalone components, signals, Tailwind. Four people and several AI tools work in this repo, so
the screens stay uniform only if everyone follows the rules below. They are checked automatically
(`npm run check:ui`, git hooks, CI), so a screen that breaks them does not merge.

## The one rule

**Never hand-build UI that the shared kit already has.** Every button, icon, field, dropdown, table, dialog, title bar,
filter row and page frame comes from `src/app/shared` (import from `'../../shared'`). A new page is configuration
plus kit components. Nobody designs a button, table or dialog again.

If the kit is missing something, **add it to the kit** (`src/app/shared/...` or `src/styles.css`), then use it.
Do not style it inside the screen.

## Start a new page from the generator, not from a blank file

```bash
npm run new:page -- list     <feature>/<file-name> "Page Title"   # table screen (app-list-page)
npm run new:page -- master   <feature>/<file-name> "Vendor Master" # lookup screen (app-master-crud-page)
npm run new:page -- document <feature>/<file-name> "Letter Title"  # official letter (app-document-page)
```

It creates the component from the kit, registers the lazy route in `app.routes.ts` and tells you which sidebar entry to add
(`src/app/core/layout/sidebar/sidebar-nav.config.ts`). AI tools: run it (or copy `features/grievance/grievance-list.component.ts`,
`features/admin-master/designation-master.component.ts`, `features/eoi/pages/ipa-editor/ipa-editor.component.ts`) instead of writing a screen from scratch.

## What to use

| Need | Use |
|---|---|
| Button, link that looks like a button | `<button appButton variant="primary\|outline\|secondary\|danger\|ghost" size="sm\|md\|lg" iconOnly>` |
| Icon | `<app-icon name="eye" size="sm" />` (filled: `solid`); new icons go into `shared/components/icon/icons*.ts` |
| Text field, select, text area | `<input appInput>`, `<select appInput>`, `<textarea appInput>` (`size="sm"`, `[invalid]`) |
| Dropdown with search / multi select | `<app-dropdown [options] [(value)]>` or `<app-dropdown multiple [(values)]>` |
| On / off | `<app-switch>` |
| Filter row (All / Approved / Pending ...) | `<app-filter-tabs [options] [(value)]>` |
| Table | `<app-table>`; printed-letter table: `<table appDocTable>` |
| Dialog | `<app-modal>` or `<app-action-modal>` |
| Page title bar with search | `<app-page-header [searchable]="true" [(searchQuery)]>`; buttons in its slot are `size="sm"` |
| Page frame | `<app-page-shell>`, `<app-list-page>`, `<app-document-page>`, `<app-master-crud-page>` |
| Card with a title | `<app-section-card>` |
| Lookup (master) screens | a `MasterCrudConfig` over `<app-master-crud-page>` |

The full list, recipes and examples are in `PROJECT_ARCHITECTURE_AND_WORKFLOW_GUIDE.md`, section 14.

## Do not

- Write `<button>`, `<table>`, `<input>`, `<select>`, `<textarea>`, `<svg>`, `<i class="fa ...">` or a `fixed inset-0` overlay in a screen.
- Put colour, border, padding or radius classes on `appButton` or `appInput` (`bg-`, `border`, `px-`, `py-`, `rounded`, `text-<colour>`). Use `variant` / `size`.
- Put your own search box or full-size button in the page header slot.
- Wrap a routed screen in your own `div` with padding and background. Use a page frame.
- Import the `shared` barrel in the app shell files (`app.component`, header, footer, sidebar, auth modals): import the kit file directly. It keeps the first bundle small.
- Call `localStorage` / `sessionStorage` directly (use `StorageService`) or compare role strings (use `PermissionService`).
- Add a dependency, or change `package.json`, without agreeing it with the team.

A deliberate exception needs a reason on the line above it: `<!-- ui-guard-allow: reason -->`
(for a whole screen that needs its own layout: `// ui-guard-allow: page-frame - reason` at the top of the file). Reviewers question every one.

## Look and content rules

- Primary actions are navy (the `primary` variant). No green accent colours for actions or highlights.
- Mock data and examples use neutral names: `Company 1`, `Committee Member 1`, `Scheme OIC`. No real people or organisations.
- Wording: "Approved", never "Accepted". No challan / e-GRAS / GRN / Treasury wording.

## Before you say it is done

```bash
npm run verify        # UI rules + type/template check + unit tests
```

Then open the screens you changed in the browser (restart `ng serve` first if you added files), open every add / edit dialog,
and check the console. A dialog renders its content before it opens and can fail on empty data.
Write a unit test for new logic (`*.util.ts` + `*.util.spec.ts`).

## Layout of the code

`src/app/core` (auth, data layer, layout, mocks), `src/app/shared` (the UI kit), `src/app/features/<area>` (screens: a thin container
plus child parts and `*.util.ts`). Navigation links are data in `sidebar-nav.config.ts`. Every screen is lazy-loaded.

<!-- This file is the source. `npm run sync:ai` copies it to CLAUDE.md, GEMINI.md, .github/copilot-instructions.md, .cursor/rules/ui-kit.mdc, .agents/rules/ui-kit.md and .kiro/steering/ui-kit.md. -->
