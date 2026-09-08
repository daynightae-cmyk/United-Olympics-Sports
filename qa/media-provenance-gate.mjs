import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const MANIFEST_PATH = 'media-provenance.json';
const MEDIA_EXTENSION = /\.(?:avif|gif|jpe?g|png|svg|webp|mp4|webm|mov|m4v|mp3|m4a|wav|ogg|woff2?|ttf|otf)$/i;
const SHA40 = /^[0-9a-f]{40}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PLACEHOLDER = /^(?:unknown|pending|todo|tbd|n\/?a|none|-+)$/i;
const RIGHTS_BASES = new Set([
  'owner-supplied',
  'commissioned',
  'licensed',
  'public-domain',
  'generated',
  'other-documented',
]);

function fail(message) {
  throw new Error(`Media provenance gate: ${message}`);
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function parseTree(spec) {
  let output;
  try {
    output = git(['ls-tree', '-r', spec]);
  } catch (error) {
    const stderr = String(error?.stderr ?? '').trim();
    fail(`unable to read Git tree ${spec}${stderr ? ` (${stderr})` : ''}`);
  }

  const files = new Map();
  if (!output) return files;

  for (const line of output.split('\n')) {
    const match = line.match(/^\d+\s+blob\s+([0-9a-f]{40})\t(.+)$/);
    if (!match) continue;
    const [, sha, path] = match;
    files.set(path, sha);
  }
  return files;
}

function isProtectedAsset(path, roots) {
  return MEDIA_EXTENSION.test(path) && roots.some((root) => path === root || path.startsWith(`${root}/`));
}

function nonPlaceholder(value, label, assetPath) {
  assert.equal(typeof value, 'string', `${assetPath}: ${label} must be a string`);
  const trimmed = value.trim();
  assert(trimmed.length > 0, `${assetPath}: ${label} is required`);
  assert(!PLACEHOLDER.test(trimmed), `${assetPath}: ${label} may not be a placeholder`);
  return trimmed;
}

function validateRecord(assetPath, record) {
  assert(record && typeof record === 'object' && !Array.isArray(record), `${assetPath}: approval record must be an object`);
  assert.equal(record.status, 'approved', `${assetPath}: status must be approved`);
  assert(RIGHTS_BASES.has(record.rightsBasis), `${assetPath}: unsupported rightsBasis ${String(record.rightsBasis)}`);
  nonPlaceholder(record.source, 'source', assetPath);
  nonPlaceholder(record.approvedBy, 'approvedBy', assetPath);
  const approvedAt = nonPlaceholder(record.approvedAt, 'approvedAt', assetPath);
  assert(DATE.test(approvedAt), `${assetPath}: approvedAt must use YYYY-MM-DD`);
  const parsedDate = new Date(`${approvedAt}T00:00:00Z`);
  assert(!Number.isNaN(parsedDate.getTime()), `${assetPath}: approvedAt is not a valid date`);
  nonPlaceholder(record.evidence, 'evidence', assetPath);

  const allowedKeys = new Set(['status', 'rightsBasis', 'source', 'approvedBy', 'approvedAt', 'evidence']);
  for (const key of Object.keys(record)) {
    assert(allowedKeys.has(key), `${assetPath}: unsupported approval field ${key}`);
  }
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
assert.equal(manifest.version, 1, 'media-provenance.json: version must be 1');
assert(manifest.policy && typeof manifest.policy === 'object', 'media-provenance.json: policy is required');
assert(Array.isArray(manifest.policy.protectedRoots) && manifest.policy.protectedRoots.length > 0, 'media-provenance.json: protectedRoots are required');
assert.equal(manifest.policy.allowedApprovalStatus, 'approved', 'media-provenance.json: allowedApprovalStatus must remain approved');
nonPlaceholder(manifest.policy.baselineMeaning, 'policy.baselineMeaning', MANIFEST_PATH);
nonPlaceholder(manifest.policy.newOrModifiedAssetRule, 'policy.newOrModifiedAssetRule', MANIFEST_PATH);

const roots = [...new Set(manifest.policy.protectedRoots.map((root) => String(root).replace(/\/$/, '')))];
assert.equal(roots.length, manifest.policy.protectedRoots.length, 'media-provenance.json: protectedRoots must be unique');
assert(manifest.baselineTrees && typeof manifest.baselineTrees === 'object', 'media-provenance.json: baselineTrees are required');
assert(manifest.assets && typeof manifest.assets === 'object' && !Array.isArray(manifest.assets), 'media-provenance.json: assets must be an object');

const currentAssets = new Map();
const baselineAssets = new Map();

for (const root of roots) {
  const baselineTree = manifest.baselineTrees[root];
  assert.equal(typeof baselineTree, 'string', `${root}: baseline tree is required`);
  assert(SHA40.test(baselineTree), `${root}: baseline tree must be a 40-character Git SHA`);

  const baselineRelative = parseTree(baselineTree);
  const currentRelative = parseTree(`HEAD:${root}`);

  for (const [relativePath, sha] of baselineRelative) {
    const fullPath = `${root}/${relativePath}`;
    if (MEDIA_EXTENSION.test(fullPath)) baselineAssets.set(fullPath, sha);
  }
  for (const [relativePath, sha] of currentRelative) {
    const fullPath = `${root}/${relativePath}`;
    if (MEDIA_EXTENSION.test(fullPath)) currentAssets.set(fullPath, sha);
  }
}

const explicitEntries = Object.entries(manifest.assets);
for (const [assetPath, record] of explicitEntries) {
  assert(isProtectedAsset(assetPath, roots), `${assetPath}: manifest entry is outside protected media roots or has an unsupported extension`);
  assert(currentAssets.has(assetPath), `${assetPath}: manifest entry points to a file that is not tracked at HEAD`);
  validateRecord(assetPath, record);
}

const grandfathered = [];
const explicitlyApproved = [];
const blocked = [];

for (const [assetPath, currentSha] of currentAssets) {
  const baselineSha = baselineAssets.get(assetPath);
  if (baselineSha === currentSha) {
    grandfathered.push(assetPath);
    continue;
  }

  const record = manifest.assets[assetPath];
  if (!record) {
    blocked.push(assetPath);
    continue;
  }
  validateRecord(assetPath, record);
  explicitlyApproved.push(assetPath);
}

if (blocked.length > 0) {
  const details = blocked.map((path) => `  - ${path}`).join('\n');
  fail(
    `new or byte-modified protected media require explicit approved provenance records in ${MANIFEST_PATH}:\n${details}`,
  );
}

const deletedFromBaseline = [...baselineAssets.keys()].filter((path) => !currentAssets.has(path));
const documentedLegacy = explicitEntries.filter(([path]) => baselineAssets.get(path) === currentAssets.get(path)).length;

console.log('Media provenance gate passed.');
console.log(`  protected roots: ${roots.join(', ')}`);
console.log(`  current protected assets: ${currentAssets.size}`);
console.log(`  unchanged legacy baseline assets: ${grandfathered.length}`);
console.log(`  explicitly approved new/modified assets: ${explicitlyApproved.length}`);
console.log(`  explicitly documented unchanged legacy assets: ${documentedLegacy}`);
console.log(`  baseline assets removed from HEAD: ${deletedFromBaseline.length}`);
console.log('  baseline status is technical grandfathering only and makes no legal rights assertion.');
