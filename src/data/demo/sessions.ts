import type { Session } from '../../domain/contracts';

export const demoSessions: Session[] = [
  { id: 'session-demo-001', sportId: 'football', groupId: 'football-demo-u12', startsAt: '2026-09-03T16:00:00Z', status: { en: 'Scheduled · Preview', ar: 'مجدولة · تجريبي' } },
  { id: 'session-demo-002', sportId: 'swimming', groupId: 'swimming-demo-beginners', startsAt: '2026-09-03T17:30:00Z', status: { en: 'Scheduled · Preview', ar: 'مجدولة · تجريبي' } },
  { id: 'session-demo-003', sportId: 'basketball', groupId: 'basketball-demo-u14', startsAt: '2026-09-04T15:00:00Z', status: { en: 'Scheduled · Preview', ar: 'مجدولة · تجريبي' } },
];

export const demoActivity = [
  { id: 'activity-demo-001', title: { en: 'Preview player records reviewed', ar: 'تمت مراجعة سجلات اللاعبين التجريبية' }, time: { en: 'Demo timeline', ar: 'خط زمني تجريبي' } },
  { id: 'activity-demo-002', title: { en: 'Sport metric definitions prepared', ar: 'تم إعداد تعريفات مؤشرات الرياضة' }, time: { en: 'Demo timeline', ar: 'خط زمني تجريبي' } },
  { id: 'activity-demo-003', title: { en: 'Training group structure validated', ar: 'تم التحقق من هيكل مجموعات التدريب' }, time: { en: 'Demo timeline', ar: 'خط زمني تجريبي' } },
];
