import type { CoachFeedback } from '../../domain/contracts';

const feedback = (id: string, playerId: string, coachId: string, sportId: string, groupId: string, metricId: string): CoachFeedback => ({
  id, playerId, coachId, sportId, groupId, createdAt: '2026-08-28',
  summary: { en: 'Preview evaluation showing steady development through consistent practice.', ar: 'تقييم تجريبي يظهر تطورًا ثابتًا من خلال التدريب المنتظم.' },
  strengths: [{ en: 'Training consistency', ar: 'الانتظام في التدريب' }, { en: 'Technical focus', ar: 'التركيز الفني' }],
  focusAreas: [{ en: 'Decision speed', ar: 'سرعة اتخاذ القرار' }, { en: 'End-of-session control', ar: 'التحكم في نهاية الحصة' }],
  metricChanges: [{ metricId, previousValue: 72, currentValue: 76 }],
});

export const demoCoachFeedback: CoachFeedback[] = [
  feedback('feedback-demo-001', 'player-demo-001', 'coach-preview-01', 'football', 'football-demo-u12', 'football-passing'),
  feedback('feedback-demo-002', 'player-demo-003', 'coach-preview-03', 'swimming', 'swimming-demo-beginners', 'swimming-technique'),
  feedback('feedback-demo-003', 'player-demo-005', 'coach-preview-05', 'basketball', 'basketball-demo-u14', 'basketball-decisions'),
  feedback('feedback-demo-004', 'player-demo-007', 'coach-preview-06', 'tennis', 'tennis-demo-youth', 'tennis-control'),
  feedback('feedback-demo-005', 'player-demo-009', 'coach-preview-07', 'gymnastics', 'gymnastics-demo-foundation', 'gymnastics-execution'),
  feedback('feedback-demo-006', 'player-demo-011', 'coach-preview-08', 'martial-arts', 'martial-arts-demo-youth', 'martial-arts-control'),
];