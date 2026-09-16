import assert from 'node:assert/strict';
import {
  mapProviderSubject,
  normalizePhoneNumber,
  validateSafeReturnTo,
} from '../src/server/identity-strategy.ts';
import {
  DEFAULT_AUTH_SUPABASE_URL,
  getSupabaseAuthConfig,
} from '../src/server/supabase-auth-config.ts';

async function runIdentityStrategyTests() {
  console.log('=== RUNNING IDENTITY PROVIDER STRATEGY TESTS ===');

  // 1. Provider Subject Mapping
  const sbSubject = mapProviderSubject('supabase', 'uuid-1234', 'User@Example.com', '0501234567');
  assert.equal(sbSubject.provider, 'supabase');
  assert.equal(sbSubject.normalizedUid, 'supabase:uuid-1234');
  assert.equal(sbSubject.email, 'user@example.com');
  assert.equal(sbSubject.phone, '+971501234567');

  const fbSubject = mapProviderSubject('firebase', 'fb-uid-999');
  assert.equal(fbSubject.provider, 'firebase');
  assert.equal(fbSubject.normalizedUid, 'fb-uid-999');

  // 2. Phone E.164 Normalization
  assert.equal(normalizePhoneNumber('050 123 4567'), '+971501234567');
  assert.equal(normalizePhoneNumber('+971-50-123-4567'), '+971501234567');
  assert.equal(normalizePhoneNumber('00971501234567'), '+971501234567');
  assert.equal(normalizePhoneNumber('invalid!phone'), null);
  assert.equal(normalizePhoneNumber('123'), null);

  // 3. OAuth Safe returnTo Redirect Protection
  assert.equal(validateSafeReturnTo('/portal/schedule'), '/portal/schedule');
  assert.equal(validateSafeReturnTo('https://unitedolympicssports.com/portal/player'), 'https://unitedolympicssports.com/portal/player');
  assert.equal(validateSafeReturnTo('https://dubai.unitedolympicssports.com/dashboard'), 'https://dubai.unitedolympicssports.com/dashboard');
  assert.equal(validateSafeReturnTo('http://localhost:3000/callback'), 'http://localhost:3000/callback');

  // Open redirect attempts MUST be sanitized to fallback
  assert.equal(validateSafeReturnTo('https://evil-phishing.com/steal-creds'), '/portal/overview');
  assert.equal(validateSafeReturnTo('//attacker.com'), '/portal/overview');
  assert.equal(validateSafeReturnTo('javascript:alert(1)'), '/portal/overview');

  // 4. Supabase Auth authority must not be silently retargeted by a generic
  // database/integration SUPABASE_URL injected into the server environment.
  const genericOnly = getSupabaseAuthConfig({
    SUPABASE_URL: 'https://wrong-data-project.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'wrong-data-project-key',
  });
  assert.equal(genericOnly.url, DEFAULT_AUTH_SUPABASE_URL);

  const browserAuthWins = getSupabaseAuthConfig({
    SUPABASE_URL: 'https://wrong-data-project.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'wrong-data-project-key',
    VITE_SUPABASE_URL: 'https://browser-auth-project.supabase.co/',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'browser-auth-key',
  });
  assert.equal(browserAuthWins.url, 'https://browser-auth-project.supabase.co');
  assert.equal(browserAuthWins.publishableKey, 'browser-auth-key');

  const explicitAuthWins = getSupabaseAuthConfig({
    AUTH_SUPABASE_URL: 'https://explicit-auth-project.supabase.co/',
    AUTH_SUPABASE_PUBLISHABLE_KEY: 'explicit-auth-key',
    VITE_SUPABASE_URL: 'https://browser-auth-project.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'browser-auth-key',
  });
  assert.equal(explicitAuthWins.url, 'https://explicit-auth-project.supabase.co');
  assert.equal(explicitAuthWins.publishableKey, 'explicit-auth-key');

  console.log('Identity provider strategy tests: PASS');
}

runIdentityStrategyTests().catch((err) => {
  console.error('FATAL: Identity strategy test failure:', err);
  process.exit(1);
});
