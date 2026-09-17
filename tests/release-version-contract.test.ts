import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version?: string };
const manifest = JSON.parse(readFileSync('public/version.json', 'utf8')) as {
  version?: string;
  build?: string;
  releasedAt?: string;
  minimumSupportedVersion?: string;
};
const runtime = readFileSync('src/platform/version.ts', 'utf8');

const expectedVersion = '1.0.1';
const expectedBuild = 'client-delivery-20260917';

assert.equal(pkg.version, expectedVersion, 'package version must match the client delivery release');
assert.equal(manifest.version, expectedVersion, 'public version manifest must match package version');
assert.equal(manifest.build, expectedBuild, 'public build id must identify the client delivery patch');
assert.equal(manifest.releasedAt, '2026-09-17', 'release date must be the actual client-delivery date');
assert.equal(manifest.minimumSupportedVersion, '1.0.0', 'patch release must preserve 1.0.0 as minimum supported version');
assert.match(runtime, /CURRENT_VERSION = '1\.0\.1'/, 'runtime version must match package/public metadata');
assert.match(runtime, /CURRENT_BUILD = 'client-delivery-20260917'/, 'runtime build id must match public metadata');
assert.ok(!runtime.includes("CURRENT_VERSION = '0.0.0'"), 'preview version must not remain active');
assert.notEqual(manifest.build, 'preview', 'public manifest must not claim preview after client release');

console.log('RELEASE VERSION CONTRACT: PASS');
