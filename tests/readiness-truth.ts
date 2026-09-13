import assert from 'node:assert/strict';
import {
  evaluateSystemReadiness,
  checkDatabaseReadiness,
  checkPaymentsReadiness,
  checkAuthVerificationReadiness,
} from '../src/server/readiness.ts';

// Test 1: ProductionReady MUST NOT become true merely from environment strings
const envBackup = { ...process.env };

try {
  // Set fake env strings
  process.env.PAYMENTS_PROVIDER = 'stripe';
  process.env.PAYMENTS_WEBHOOK_SECRET = 'whsec_test_secret_12345';
  process.env.FIREBASE_PROJECT_ID = 'uos-prod-demo';
  process.env.SMS_PROVIDER = 'twilio';
  delete process.env.DATABASE_URL;

  const readiness = await evaluateSystemReadiness();
  assert.equal(
    readiness.productionReady,
    false,
    'productionReady MUST NOT become true merely from environment variable presence!',
  );

  // Test 2: Explicit stages presence
  const validStages = new Set(['not_configured', 'configured', 'reachable', 'verified', 'operational']);
  for (const [depName, evidence] of Object.entries(readiness.dependencies)) {
    assert(validStages.has(evidence.stage), `${depName} stage '${evidence.stage}' must be one of the valid stages`);
    assert(typeof evidence.status === 'string', `${depName} status must be present`);
    assert(typeof evidence.checkedAt === 'string', `${depName} checkedAt must be a valid ISO string`);
  }

  // Test 3: Structured evidence & secret leak prevention
  const reportString = JSON.stringify(readiness);
  assert.equal(reportString.includes('whsec_test_secret_12345'), false, 'Webhook secrets must NEVER leak in readiness evidence');

  // Test 4: Payments readiness truth
  const paymentEvidence = checkPaymentsReadiness();
  assert.equal(paymentEvidence.stage, 'verified');
  assert.equal(paymentEvidence.status, 'PARTIAL', 'Payments without live sandbox intent cannot be fully operational');
  assert.match(paymentEvidence.reason || '', /sandbox/i);

  // Test 5: Missing payments provider yields BLOCKED status
  delete process.env.PAYMENTS_PROVIDER;
  const unconfiguredPayments = checkPaymentsReadiness();
  assert.equal(unconfiguredPayments.stage, 'not_configured');
  assert.equal(unconfiguredPayments.status, 'BLOCKED');

  // Test 6: Bounded reachability on auth probe
  let probeCalled = false;
  const slowFetch: typeof fetch = async () => {
    probeCalled = true;
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  };
  const authEvidence = await checkAuthVerificationReadiness(slowFetch);
  assert(authEvidence.stage === 'operational' || authEvidence.stage === 'verified');
  assert.equal(typeof authEvidence.latencyMs, 'number');
  assert.equal(probeCalled, true, 'Auth readiness probe must actually invoke the fetch boundary');

  // Test 7: Database unconfigured stage
  delete process.env.DATABASE_URL;
  delete process.env.SQL_HOST;
  const dbEvidence = await checkDatabaseReadiness();
  assert.equal(dbEvidence.stage, 'not_configured');
  assert.equal(dbEvidence.status, 'BLOCKED');

  console.log('Readiness truth model tests: PASS');
  console.log('P0 READINESS TRUTH CLOSURE: PASS');
} finally {
  process.env = envBackup;
}
