import type { AttendanceRecord, Player } from '../../domain/contracts';
import { demoCoachFeedback } from './coachFeedback';
import { demoPerformanceRecords } from './performance';

const attendance = (seed: number): AttendanceRecord[] => [
  { id: `attendance-${seed}-1`, date: '2026-08-17', status: 'present' },
  { id: `attendance-${seed}-2`, date: '2026-08-20', status: seed % 4 === 0 ? 'late' : 'present' },
  { id: `attendance-${seed}-3`, date: '2026-08-24', status: seed % 5 === 0 ? 'excused' : 'present' },
  { id: `attendance-${seed}-4`, date: '2026-08-27', status: seed % 6 === 0 ? 'absent' : 'present' },
];

type PlayerSeed = Pick<Player, 'id' | 'nameEn' | 'nameAr' | 'sportId' | 'groupId' | 'coachIds' | 'age' | 'level' | 'status'>;

const makePlayer = (seed: PlayerSeed, index: number): Player => {
  const records = attendance(index);
  const attended = records.filter(record => record.status !== 'absent').length;
  return {
    ...seed,
    achievements: [],
    attendanceRecords: records,
    attendanceSummary: { attended, scheduled: records.length },
    performanceHistory: demoPerformanceRecords.filter(record => record.playerId === seed.id),
    coachFeedback: demoCoachFeedback.filter(item => item.playerId === seed.id),
  };
};

export const demoPlayers: Player[] = [
  makePlayer({ id: 'player-demo-001', nameEn: 'Player Demo 001', nameAr: 'لاعب تجريبي 001', sportId: 'football', groupId: 'football-demo-u12', coachIds: ['coach-preview-01'], age: 11, level: { en: 'Development', ar: 'تطويري' }, status: { en: 'Active', ar: 'نشط' } }, 1),
  makePlayer({ id: 'player-demo-002', nameEn: 'Player Demo 002', nameAr: 'لاعب تجريبي 002', sportId: 'football', groupId: 'football-demo-u12', coachIds: ['coach-preview-01'], age: 10, level: { en: 'Foundation', ar: 'تأسيسي' }, status: { en: 'Active', ar: 'نشط' } }, 2),
  makePlayer({ id: 'player-demo-003', nameEn: 'Player Demo 003', nameAr: 'لاعب تجريبي 003', sportId: 'swimming', groupId: 'swimming-demo-beginners', coachIds: ['coach-preview-03'], age: 10, level: { en: 'Development', ar: 'تطويري' }, status: { en: 'Active', ar: 'نشط' } }, 3),
  makePlayer({ id: 'player-demo-004', nameEn: 'Player Demo 004', nameAr: 'لاعب تجريبي 004', sportId: 'swimming', groupId: 'swimming-demo-beginners', coachIds: ['coach-preview-03'], age: 9, level: { en: 'Foundation', ar: 'تأسيسي' }, status: { en: 'Active', ar: 'نشط' } }, 4),
  makePlayer({ id: 'player-demo-005', nameEn: 'Player Demo 005', nameAr: 'لاعب تجريبي 005', sportId: 'basketball', groupId: 'basketball-demo-u14', coachIds: ['coach-preview-05'], age: 13, level: { en: 'Development', ar: 'تطويري' }, status: { en: 'Active', ar: 'نشط' } }, 5),
  makePlayer({ id: 'player-demo-006', nameEn: 'Player Demo 006', nameAr: 'لاعب تجريبي 006', sportId: 'basketball', groupId: 'basketball-demo-u14', coachIds: ['coach-preview-05'], age: 12, level: { en: 'Foundation', ar: 'تأسيسي' }, status: { en: 'Active', ar: 'نشط' } }, 6),
  makePlayer({ id: 'player-demo-007', nameEn: 'Player Demo 007', nameAr: 'لاعب تجريبي 007', sportId: 'tennis', groupId: 'tennis-demo-youth', coachIds: ['coach-preview-06'], age: 14, level: { en: 'Development', ar: 'تطويري' }, status: { en: 'Active', ar: 'نشط' } }, 7),
  makePlayer({ id: 'player-demo-008', nameEn: 'Player Demo 008', nameAr: 'لاعب تجريبي 008', sportId: 'tennis', groupId: 'tennis-demo-youth', coachIds: ['coach-preview-06'], age: 11, level: { en: 'Foundation', ar: 'تأسيسي' }, status: { en: 'Active', ar: 'نشط' } }, 8),
  makePlayer({ id: 'player-demo-009', nameEn: 'Player Demo 009', nameAr: 'لاعب تجريبي 009', sportId: 'gymnastics', groupId: 'gymnastics-demo-foundation', coachIds: ['coach-preview-07'], age: 10, level: { en: 'Development', ar: 'تطويري' }, status: { en: 'Active', ar: 'نشط' } }, 9),
  makePlayer({ id: 'player-demo-010', nameEn: 'Player Demo 010', nameAr: 'لاعب تجريبي 010', sportId: 'gymnastics', groupId: 'gymnastics-demo-foundation', coachIds: ['coach-preview-07'], age: 8, level: { en: 'Foundation', ar: 'تأسيسي' }, status: { en: 'Active', ar: 'نشط' } }, 10),
  makePlayer({ id: 'player-demo-011', nameEn: 'Player Demo 011', nameAr: 'لاعب تجريبي 011', sportId: 'martial-arts', groupId: 'martial-arts-demo-youth', coachIds: ['coach-preview-08'], age: 13, level: { en: 'Development', ar: 'تطويري' }, status: { en: 'Active', ar: 'نشط' } }, 11),
  makePlayer({ id: 'player-demo-012', nameEn: 'Player Demo 012', nameAr: 'لاعب تجريبي 012', sportId: 'martial-arts', groupId: 'martial-arts-demo-youth', coachIds: ['coach-preview-08'], age: 12, level: { en: 'Foundation', ar: 'تأسيسي' }, status: { en: 'Active', ar: 'نشط' } }, 12),
];