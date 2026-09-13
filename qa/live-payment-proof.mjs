// Owner-run live payment proof (manual, never in CI).
// Proves merchant wiring end-to-end against the deployed API WITHOUT moving
// money: PaymentIntent creation only (no confirmation), plus idempotency.
//
// Required env:
//   UOS_AUTH_TOKEN       test-user Bearer token (sign in, copy the access token)
//   UOS_CONFIRM_INTENT=1 explicit consent to create a test intent
// Optional env:
//   UOS_API_BASE         default https://unitedolympicsports.store
//   UOS_TEST_AMOUNT_MINOR default 100 (hard cap 500; refuse more)
//
// Exit nonzero with code EXTERNAL when the provider is not configured
// (proves fail-closed). Webhook replay stays an owner-dashboard step:
// resend any payment_intent event from Stripe to /api/v1/payments/webhook
// and watch the intent reconcile (dedup makes replays safe).
import assert from 'node:assert/strict';

const out = (line) => process.stdout.write(`${line}\n`);
const apiBase = (process.env.UOS_API_BASE || 'https://unitedolympicsports.store').replace(/\/$/, '');
const token = (process.env.UOS_AUTH_TOKEN || '').trim();
assert(token, 'UOS_AUTH_TOKEN is required (test-user access token)');
assert(process.env.UOS_CONFIRM_INTENT === '1', 'Set UOS_CONFIRM_INTENT=1 to consent to creating a test intent');
const amountMinor = Number(process.env.UOS_TEST_AMOUNT_MINOR || 100);
assert(Number.isInteger(amountMinor) && amountMinor > 0 && amountMinor <= 500, 'Test amount capped at 500 minor units');

const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
const idempotencyKey = `live-proof-${Date.now()}`;
const payload = {
  idempotencyKey,
  amountMinor,
  currency: 'AED',
  charge: true,
  orderId: `live-proof-${Date.now()}`,
};

const first = await fetch(`${apiBase}/api/v1/payments/intent`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify(payload),
});
const firstData = await first.json().catch(() => null);
if (first.status === 503) {
  process.stderr.write(`RESULT=BLOCKED code=${firstData?.error?.code} merchant provider not configured; nothing was charged.\n`);
  process.exit(3);
}
assert.equal(first.status, 201, `intent failed: HTTP ${first.status} ${JSON.stringify(firstData)}`);
assert.equal(firstData?.ok, true);
assert.ok(typeof firstData?.intent?.providerIntentId === 'string', 'missing provider intent id');
assert.ok(typeof firstData?.intent?.clientSecret === 'string', 'missing client secret');
assert.ok(!JSON.stringify(firstData).match(/sk_(live|test)_[A-Za-z0-9]+/), 'secret key must never appear in responses');
out(`RESULT=INTENT providerIntentId=${firstData.intent.providerIntentId} status=${firstData.intent.status}`);

// Idempotent replay: same key must return the same intent, never a duplicate.
const second = await fetch(`${apiBase}/api/v1/payments/intent`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify(payload),
});
const secondData = await second.json().catch(() => null);
assert.equal(second.status, 201);
assert.equal(secondData?.intent?.id, firstData?.intent?.id, 'idempotency violated: duplicate intent created');
out('RESULT=IDEMPOTENT same key returned the same intent');
out('NEXT=OWNER resend a payment_intent event from the Stripe dashboard to /api/v1/payments/webhook; replays are dedup-safe');
out('LIVE PAYMENT PROOF: PASS (no money moved; confirmation happens in the provider UI)');
