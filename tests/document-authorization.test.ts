import assert from 'node:assert/strict';
import { DocumentDomainRepository } from '../src/server/repositories/document-repository.ts';
import type { AuthorizationContext } from '../src/server/authorization-context.ts';
import { ApiError } from '../src/server/http.ts';
import type { DbQueryClient } from '../src/server/vertical-slice.ts';

const PLAYER_ID = 'f0000000-0000-4000-8000-000000000001';
const UNRELATED_PLAYER_ID = 'f0000000-0000-4000-8000-000000000002';

const playerCtx: AuthorizationContext = {
  uid: 'u-doc-player',
  provider: 'supabase',
  roles: ['player'],
  scopes: [],
  tenant: { organizationIds: [], countryIds: [], branchIds: [] },
  bindings: { playerIds: [PLAYER_ID], guardianIds: [], guardianPlayerIds: [], coachIds: [], coachGroupIds: [], coachPlayerIds: [] },
};

class MockDocumentDb implements DbQueryClient {
  public docs = new Map<string, any>();

  async query<T = any>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }> {
    const s = sql.toLowerCase();
    if (s.includes('insert into documents')) {
      const [id, ownerType, ownerId, storageKey, mimeType] = params as any[];
      const record = { id, owner_type: ownerType, owner_id: ownerId, storage_key: storageKey, mime_type: mimeType, status: 'active' };
      this.docs.set(id, record);
      return { rows: [record as unknown as T], rowCount: 1 };
    }
    if (s.includes('from documents where id = $1')) {
      const id = params?.[0] as string;
      const found = this.docs.get(id);
      return { rows: found ? [found as unknown as T] : [], rowCount: found ? 1 : 0 };
    }
    return { rows: [], rowCount: 0 };
  }
}

async function runDocumentAuthorizationTests() {
  console.log('=== RUNNING DOCUMENT AUTHORIZATION TESTS ===');
  const db = new MockDocumentDb();
  const repo = new DocumentDomainRepository(db);

  // 1. Authorized player registers medical certificate
  const doc = await repo.registerDocument(playerCtx, {
    ownerType: 'player',
    ownerId: PLAYER_ID,
    filename: 'medical-clearance.pdf',
    mimeType: 'application/pdf',
  });
  assert.equal(doc.ownerId, PLAYER_ID);
  assert.ok(doc.storageKey.startsWith('docs/player/'));

  // 2. Generate signed download URL
  const signed = await repo.generateSignedDownloadUrl(playerCtx, doc.id);
  assert.ok(signed.url.includes('/api/v1/documents/download'));
  assert.ok(signed.url.includes('sig='));
  assert.ok(signed.expiresAt);

  // 3. Registering document for unrelated player MUST FAIL (403)
  await assert.rejects(
    async () => {
      await repo.registerDocument(playerCtx, {
        ownerType: 'player',
        ownerId: UNRELATED_PLAYER_ID,
        filename: 'hack.pdf',
        mimeType: 'application/pdf',
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 403);
      assert.equal(err.code, 'UNRELATED_PLAYER_DENIED');
      return true;
    },
  );

  console.log('Document authorization tests: PASS');
}

runDocumentAuthorizationTests().catch((err) => {
  console.error('FATAL: Document authorization test failure:', err);
  process.exit(1);
});
