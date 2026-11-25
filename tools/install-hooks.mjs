#!/usr/bin/env node
/**
 * Runs from the "prepare" script, so every "npm install" points git at the shared hooks in .githooks/.
 * That is how all four developers get the same pre-commit and pre-push checks without any setup step.
 * It does nothing in CI or when the folder is not a git checkout.
 */
import { chmodSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const hooksDir = join(root, '.githooks');

if (process.env['CI'] || !existsSync(join(root, '.git')) || !existsSync(hooksDir)) process.exit(0);

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: root, stdio: 'ignore' });
  // macOS / Linux need the executable bit; on Windows this is a harmless no-op.
  for (const file of readdirSync(hooksDir)) chmodSync(join(hooksDir, file), 0o755);
  console.log('git hooks installed (.githooks): UI rules are checked before every commit.');
} catch {
  console.warn('Could not install the git hooks. Run "npm run check:ui" yourself before committing.');
}
