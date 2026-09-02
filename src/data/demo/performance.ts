import type { MetricDefinition, PerformanceRecord } from '../../domain/contracts';

const metricSet = (sportId: string, values: Array<[string, string, string]>) => values.map(([id, en, ar]) => ({ id: `${sportId}-${id}`, sportId, name: { en, ar }, unit: { en: 'score', ar: 'درجة' } }));

export const metricDefinitions: MetricDefinition[] = [
  ...metricSet('football', [['speed', 'Speed', 'السرعة'], ['passing', 'Passing', 'التمرير'], ['shooting', 'Shooting', 'التسديد'], ['positioning', 'Positioning', 'التمركز'], ['fitness', 'Fitness', 'اللياقة']]),
  ...metricSet('swimming', [['time', 'Time', 'الزمن'], ['technique', 'Technique', 'التقنية'], ['endurance', 'Endurance', 'التحمل'], ['starts', 'Starts', 'الانطلاق'], ['turns', 'Turns', 'الدوران']]),
  ...metricSet('basketball', [['shooting', 'Shooting', 'التصويب'], ['passing', 'Passing', 'التمرير'], ['speed', 'Speed', 'السرعة'], ['decisions', 'Decision Making', 'اتخاذ القرار'], ['endurance', 'Endurance', 'التحمل']]),
  ...metricSet('tennis', [['serve', 'Serve', 'الإرسال'], ['control', 'Control', 'التحكم'], ['footwork', 'Footwork', 'حركة القدمين'], ['consistency', 'Consistency', 'الثبات'], ['awareness', 'Match Awareness', 'وعي المباراة']]),
  ...metricSet('gymnastics', [['technique', 'Technique', 'التقنية'], ['flexibility', 'Flexibility', 'المرونة'], ['balance', 'Balance', 'التوازن'], ['strength', 'Strength', 'القوة'], ['execution', 'Execution', 'التنفيذ']]),
  ...metricSet('martial-arts', [['technique', 'Technique', 'التقنية'], ['control', 'Control', 'التحكم'], ['balance', 'Balance', 'التوازن'], ['discipline', 'Discipline', 'الانضباط'], ['fitness', 'Fitness', 'اللياقة']]),
];

const profiles: Record<string, { sportId: string; base: number }> = {
  'player-demo-001': { sportId: 'football', base: 76 }, 'player-demo-002': { sportId: 'football', base: 69 },
  'player-demo-003': { sportId: 'swimming', base: 81 }, 'player-demo-004': { sportId: 'swimming', base: 72 },
  'player-demo-005': { sportId: 'basketball', base: 74 }, 'player-demo-006': { sportId: 'basketball', base: 68 },
  'player-demo-007': { sportId: 'tennis', base: 79 }, 'player-demo-008': { sportId: 'tennis', base: 71 },
  'player-demo-009': { sportId: 'gymnastics', base: 83 }, 'player-demo-010': { sportId: 'gymnastics', base: 73 },
  'player-demo-011': { sportId: 'martial-arts', base: 77 }, 'player-demo-012': { sportId: 'martial-arts', base: 70 },
};

export const demoPerformanceRecords: PerformanceRecord[] = Object.entries(profiles).flatMap(([playerId, profile], playerIndex) =>
  metricDefinitions.filter(metric => metric.sportId === profile.sportId).flatMap((metric, metricIndex) => {
    const current = Math.min(96, profile.base + ((metricIndex * 3 + playerIndex) % 9));
    return [
      { id: `${playerId}-${metric.id}-previous`, playerId, metricId: metric.id, value: current - 4, recordedAt: '2026-07-15', coachId: `coach-demo-${String(playerIndex + 1).padStart(2, '0')}` },
      { id: `${playerId}-${metric.id}-latest`, playerId, metricId: metric.id, value: current, recordedAt: '2026-08-28', coachId: `coach-demo-${String(playerIndex + 1).padStart(2, '0')}` },
    ];
  }),
);
