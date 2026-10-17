## What changed


## Checklist
- [ ] New screens were created with `npm run new:page` (or copy an existing screen that uses `app-list-page`, `app-master-crud-page` or `app-document-page`)
- [ ] No hand-written buttons, tables, inputs, selects, dialogs, icons or filter rows: everything comes from `src/app/shared` (`npm run check:ui` passes)
- [ ] If the kit was missing something, it was added to the kit (`src/app/shared`, `src/styles.css`), not styled inside the screen
- [ ] `npm run verify` passes (UI rules, type check, tests)
- [ ] I opened the changed screens in the browser, including the add / edit dialogs, and the console is clean
- [ ] Mock data uses neutral names (Company 1, Committee Member 1), no real people or organisations
