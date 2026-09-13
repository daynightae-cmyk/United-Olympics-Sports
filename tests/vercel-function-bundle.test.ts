import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Guards the production serverless failure mode (FUNCTION_INVOCATION_FAILED):
// the api/ closure must use extensionless relative imports so the Vercel
// function bundler can resolve sibling modules at runtime.

const repoRoot = path.resolve(import.meta.dirname, '..');
const closureDirs = ['api', 'src/server', 'src/db', 'src/lib'];

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

async function runBundleTests() {
  console.log('=== RUNNING VERCEL FUNCTION BUNDLE TESTS ===');

  // 1. No explicit .ts relative imports in the serverless closure
  const offenders: string[] = [];
  for (const dir of closureDirs) {
    for (const file of listTsFiles(path.join(repoRoot, dir))) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/(from|import)\s*\(?\s*['"]\.{1,2}\/[^'"]*\.ts['"]/g);
      if (matches) offenders.push(`${path.relative(repoRoot, file)}: ${matches.join(', ')}`);
    }
  }
  assert.equal(offenders.length, 0, `Extensioned TS imports break Vercel resolution:\n${offenders.join('\n')}`);

  // 2. The api entry bundles and serves health without crashing
  const { buildSync } = await import('esbuild');
  const outFile = path.join(repoRoot, 'dist', 'api-bundle-gate.cjs');
  buildSync({
    entryPoints: [path.join(repoRoot, 'api', 'index.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    outfile: outFile,
    logLevel: 'silent',
  });
  const bundled = (await import(pathToFileURL(outFile).href)) as {
    default: (req: unknown, res: unknown) => Promise<void>;
  };
  const handler = bundled.default;
  assert.equal(typeof handler, 'function');

  const res = {
    statusCode: 200,
    body: '',
    status(code: number) { res.statusCode = code; return res; },
    json(data: unknown) { res.body = JSON.stringify(data); return res; },
    setHeader() { return res; },
    end(data?: string) { if (data) res.body = data; return res; },
  };
  await handler({ url: '/api/v1/health', method: 'GET', headers: {}, query: {} }, res);
  assert.equal(res.statusCode, 200);
  const payload = JSON.parse(res.body) as { ok?: boolean; service?: string };
  assert.equal(payload.ok, true);
  assert.equal(payload.service, 'united-olympics-sports');
  fs.rmSync(outFile, { force: true });

  console.log('Vercel function bundle tests: PASS');
}

runBundleTests().catch((err) => {
  console.error('FATAL: Vercel function bundle test failure:', err);
  process.exit(1);
});
