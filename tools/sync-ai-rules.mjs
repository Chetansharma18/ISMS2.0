#!/usr/bin/env node
/**
 * Keeps the instructions of every AI tool identical. AGENTS.md is the single source; the other tools read their own file:
 *   CLAUDE.md                          Claude Code
 *   .github/copilot-instructions.md    GitHub Copilot
 *   .cursor/rules/ui-kit.mdc           Cursor
 *   GEMINI.md, .agents/rules/ui-kit.md Google Antigravity / Gemini (the rule is set to "always on")
 *   .kiro/steering/ui-kit.md           Kiro
 *
 *   node tools/sync-ai-rules.mjs          rewrite the copies from AGENTS.md   (npm run sync:ai)
 *   node tools/sync-ai-rules.mjs --check  fail when a copy is out of date     (pre-commit, CI, npm run verify)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const source = readFileSync(join(root, 'AGENTS.md'), 'utf8');

const CURSOR_HEADER = '---\ndescription: ISMS UI kit rules. Use the shared components, never hand-build UI.\nalwaysApply: true\n---\n\n';

const ANTIGRAVITY_HEADER = '---\ntrigger: always_on\ndescription: ISMS UI kit rules. Use the shared components, never hand-build UI.\n---\n\n';

const TARGETS = {
  'CLAUDE.md': source,
  'GEMINI.md': source,
  '.github/copilot-instructions.md': source,
  '.cursor/rules/ui-kit.mdc': CURSOR_HEADER + source,
  '.agents/rules/ui-kit.md': ANTIGRAVITY_HEADER + source,
  '.kiro/steering/ui-kit.md': source
};

const check = process.argv.includes('--check');
const stale = [];

for (const [file, content] of Object.entries(TARGETS)) {
  const path = join(root, file);
  const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (current === content) continue;
  if (check) {
    stale.push(file);
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log('updated ' + file);
  }
}

if (check && stale.length > 0) {
  console.error('AI rule files are out of date with AGENTS.md:\n  ' + stale.join('\n  ') + '\nRun: npm run sync:ai');
  process.exit(1);
}
if (check) console.log('sync-ai-rules: ok');
