import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Guards the proven production serverless failure mode (FUNCTION_INVOCATION_FAILED
// with ERR_MODULE_NOT_FOUND for '/var/task/src/server/routes' from
// '/var/task/api/index.js'): Vercel compiles api/*.ts file-by-file, so the api
// closure must use extension-safe relative imports (explicit `.js` suffixes)
// that plain Node ESM can resolve without a bundler. Extensionless imports
// crash every serverless route at boot.

const repoRoot = path.resolve(import.meta.dirname, '..');
const closureDirs = ['api', 'src/server', 'src/db', 'src/lib', 'src/admin/data'];

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

  // 1. No extensionless (or .ts-suffixed) relative imports in the serverless
  // closure: every relative specifier must carry an explicit extension so the
  // file-by-file compiled output resolves under Node ESM.
  const offenders: string[] = [];
  const specifierPattern = /(?:from\s*|import\s*\(\s*|import\s+)(['"])(\.[^'"]+)\1/g;
  for (const dir of closureDirs) {
    for (const file of listTsFiles(path.join(repoRoot, dir))) {
      const content = fs.readFileSync(file, 'utf8');
      for (const match of content.matchAll(specifierPattern)) {
        const specifier = match[2];
        if (/\.[A-Za-z0-9]+$/.test(specifier)) {
          if (specifier.endsWith('.ts') || specifier.endsWith('.tsx')) {
            offenders.push(`${path.relative(repoRoot, file)}: TS-suffixed import ${specifier}`);
          }
          continue;
        }
        offenders.push(`${path.relative(repoRoot, file)}: extensionless import ${specifier}`);
      }
    }
  }
  assert.equal(offenders.length, 0, `Extension-unsafe imports crash Vercel serverless boot:\n${offenders.join('\n')}`);

  // 2. JSON imports in the closure must declare an import attribute, otherwise
  // plain Node ESM rejects them at boot (ERR_IMPORT_ATTRIBUTE_MISSING).
  const jsonOffenders: string[] = [];
  const jsonPattern = /import\s+[^'"]*?from\s*['"]([^'"]+\.json)['"]/g;
  for (const dir of closureDirs) {
    for (const file of listTsFiles(path.join(repoRoot, dir))) {
      const content = fs.readFileSync(file, 'utf8');
      for (const match of content.matchAll(jsonPattern)) {
        const statement = content.slice(Math.max(0, (match.index ?? 0) - 200), (match.index ?? 0) + match[0].length + 60);
        if (!/with\s*\{\s*type\s*:\s*['"]json['"]\s*\}/.test(statement)) {
          jsonOffenders.push(`${path.relative(repoRoot, file)}: ${match[0].trim()}`);
        }
      }
    }
  }
  assert.equal(jsonOffenders.length, 0, `JSON imports without import attributes crash Node ESM boot:\n${jsonOffenders.join('\n')}`);

  // 3. Firebase Admin must stay lazy: no static value import of firebase-admin
  // anywhere in the closure. The admin SDK graph (jwks-rsa/jose) crashes some
  // serverless loaders at module-evaluation time, so importing this module
  // must never throw and every admin access must go through getAdminAuth()
  // (dynamic import inside the caller's try/catch = fail closed).
  // Allowed: `import type ... from 'firebase-admin/...'` (erased) and
  // dynamic await import('firebase-admin/...').
  const staticAdminPattern = /^\s*import\s+(?!type\b)[^'"]*?from\s*['"]firebase-admin[^'"]*['"]/gm;
  const adminOffenders: string[] = [];
  for (const dir of closureDirs) {
    for (const file of listTsFiles(path.join(repoRoot, dir))) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(staticAdminPattern);
      if (matches) adminOffenders.push(`${path.relative(repoRoot, file)}: ${matches.join(', ')}`);
    }
  }
  assert.equal(adminOffenders.length, 0, `Static firebase-admin imports crash serverless boot; use getAdminAuth():\n${adminOffenders.join('\n')}`);

  // 4. The firebase-admin module itself must load without credentials and
  // without initializing anything (import-time side-effect free).
  const savedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const savedAdc = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  try {
    const adminModule = (await import(pathToFileURL(path.join(repoRoot, 'src', 'lib', 'firebase-admin.ts')).href)) as {
      getAdminAuth: unknown;
    };
    assert.equal(typeof adminModule.getAdminAuth, 'function', 'firebase-admin module must export lazy getAdminAuth');
  } finally {
    if (savedServiceAccount !== undefined) process.env.FIREBASE_SERVICE_ACCOUNT_JSON = savedServiceAccount;
    if (savedAdc !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = savedAdc;
  }

  // 3. The api entry bundles and serves health without crashing
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
