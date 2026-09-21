import assert from 'node:assert/strict';
import { detectMedicalInquiry } from '../src/server/sportmind/sportmind-context.js';
import { DeterministicSportsProvider } from '../src/server/sportmind/provider.js';
import type { SportMindHydratedContext, SportMindRequest } from '../src/server/sportmind/types.js';

async function runMedicalBoundaryTests() {
  console.log('=== RUNNING SPORTMIND MEDICAL BOUNDARY TESTS ===');

  // 1. Keyword detection in English
  assert.equal(detectMedicalInquiry('I have an ankle injury after the drill'), true);
  assert.equal(detectMedicalInquiry('My knee is experiencing sharp pain'), true);
  assert.equal(detectMedicalInquiry('Is this swelling normal after jumping?'), true);
  assert.equal(detectMedicalInquiry('What time is tomorrow practice?'), false);

  // 2. Keyword detection in Arabic
  assert.equal(detectMedicalInquiry('أشعر بألم شديد في العضلة الخلفية'), true);
  assert.equal(detectMedicalInquiry('حدثت إصابة للاعب أثناء الركض'), true);
  assert.equal(detectMedicalInquiry('هل يوجد تدريب غداً؟'), false);

  // 3. Provider emits medical notice and stops when isMedicalInquiry is true
  const medicalCtx: SportMindHydratedContext = {
    role: 'player',
    userId: 'athlete-1',
    recordsSummary: {
      upcomingSessions: 1,
      attendanceRecords: 5,
      hasActiveSubscription: true,
      recentNotesCount: 1,
      dataAvailability: 'verified',
    },
    evidence: [],
    isMedicalInquiry: true,
  };

  const req: SportMindRequest = {
    message: 'My ankle is swollen',
    locale: 'en',
  };

  const provider = new DeterministicSportsProvider();
  const chunks = [];
  for await (const chunk of provider.generateStream(medicalCtx, req)) {
    chunks.push(chunk);
  }

  const attentionModule = chunks.find((c) => c.type === 'module' && c.module?.type === 'ATTENTION');
  assert.ok(attentionModule, 'Must emit ATTENTION module for medical inquiry');
  assert.ok(
    attentionModule.module?.title?.en.includes('Medical & Health Safety Notice'),
    'Should contain medical safety title',
  );
  assert.ok(
    attentionModule.module?.body?.en.includes('does not diagnose injuries'),
    'Should explicitly disclaim injury diagnosis',
  );
  assert.ok(chunks.some((c) => c.type === 'done'), 'Must finish with done');

  console.log('SportMind medical boundary tests: PASS');
}

runMedicalBoundaryTests().catch((err) => {
  console.error('FATAL: SportMind medical boundary test failure:', err);
  process.exit(1);
});
