// Owner-run live OTP proof (manual, never in CI).
// Proves Supabase SMS delivery end-to-end against the deployed API.
//
// Required env:
//   UOS_TEST_PHONE    E.164 test number owned by the operator (e.g. +971501234567)
//   UOS_CONFIRM_SEND=1  explicit consent to send exactly ONE real SMS
// Optional env:
//   UOS_API_BASE      default https://unitedolympicsports.store
//
// Flow: request code -> operator pastes the received code -> verify.
// The code is never printed or logged. Exit nonzero when SMS is not
// enabled (proves fail-closed) or when any step misbehaves.
import assert from 'node:assert/strict';
import readline from 'node:readline';

const out = (line) => process.stdout.write(`${line}\n`);
const apiBase = (process.env.UOS_API_BASE || 'https://unitedolympicsports.store').replace(/\/$/, '');
const phone = (process.env.UOS_TEST_PHONE || '').trim();
assert(/^\+[1-9]\d{7,14}$/.test(phone), 'UOS_TEST_PHONE must be an E.164 number you own (e.g. +971501234567)');
assert(process.env.UOS_CONFIRM_SEND === '1', 'Set UOS_CONFIRM_SEND=1 to consent to sending exactly ONE real SMS');
const masked = `${phone.slice(0, 5)}******${phone.slice(-2)}`;

const post = async (path, body) => {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
};

// 1. Request — 200 proves SMS delivery is enabled; 503 proves fail-closed.
const requested = await post('/api/v1/auth/phone/request', { phone, website: '' });
if (requested.status === 503) {
  process.stderr.write(`RESULT=BLOCKED code=${requested.data?.error?.code} SMS is not enabled on the auth project; no SMS was sent.\n`);
  process.exit(3);
}
assert.equal(requested.status, 200, `request failed: HTTP ${requested.status} ${JSON.stringify(requested.data)}`);
assert.equal(requested.data?.ok, true);
out(`RESULT=SENT masked=${requested.data?.maskedPhone || masked} one SMS dispatched`);

// 2. Operator pastes the received code (never echoed back).
const code = await new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Paste the received code: ', (answer) => {
    rl.close();
    resolve(answer.trim());
  });
});
assert(code.length >= 4, 'A code is required to complete the proof');

// 3. Verify — 200 with a session proves the full loop.
const verified = await post('/api/v1/auth/phone/verify', { phone, code });
assert.equal(verified.status, 200, `verify failed: HTTP ${verified.status} ${JSON.stringify(verified.data)}`);
assert.equal(typeof verified.data?.session?.access_token, 'string', 'verify did not return a session');
assert.ok(!('secret' in (verified.data || {})), 'response must not contain secrets');
out('RESULT=VERIFIED session issued for the phone identity (portal binding still enforced separately)');
out('LIVE OTP PROOF: PASS');
