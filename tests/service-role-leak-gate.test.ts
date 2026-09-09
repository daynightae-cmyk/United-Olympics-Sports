import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- RUNNING SERVICE ROLE LEAK GATE TEST ---');

const projectRoot = path.resolve(import.meta.dirname, '..');
const clientDirs = [
  path.join(projectRoot, 'src'),
  path.join(projectRoot, 'public')
];

const forbiddenTerms = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'service_role_key',
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY'
];

// Server or build-only files that may reference admin keys safely (must NOT be in client bundle)
const allowedServerPaths = [
  path.normalize('src/db/migrate.ts'),
  path.normalize('src/lib/supabase-admin.ts'),
  path.normalize('server.ts')
];

let scannedCount = 0;
const violations: Array<{ file: string; term: string }> = [];

function scanDir(currentDir: string) {
  if (!fs.existsSync(currentDir)) return;
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      scanDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.mjs'].includes(ext)) continue;

      const relativePath = path.relative(projectRoot, fullPath);
      // If file is an allowed server file, check whether it has client leakage markers
      const isAllowedServer = allowedServerPaths.some((p) => relativePath.endsWith(p));

      const content = fs.readFileSync(fullPath, 'utf8');
      scannedCount++;

      for (const term of forbiddenTerms) {
        if (content.includes(term)) {
          if (isAllowedServer) {
            // Verify server-side file does not export it to client window or meta env
            assert.ok(!content.includes(`window.${term}`), `Client window leak of ${term} in ${relativePath}`);
            assert.ok(!content.includes(`import.meta.env.${term}`), `Client bundle leak of ${term} in ${relativePath}`);
          } else {
            violations.push({ file: relativePath, term });
          }
        }
      }
    }
  }
}

for (const dir of clientDirs) {
  scanDir(dir);
}

console.log(`Scanned ${scannedCount} files for service role key leakage.`);
assert.equal(violations.length, 0, `Detected forbidden service role references in client code: ${JSON.stringify(violations, null, 2)}`);

console.log('PASS: Zero service role key leaks detected in client code.');
