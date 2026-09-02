export type BilingualText = { en: string; ar: string };

export type Sport = {
  id: string;
  name: BilingualText;
  description: BilingualText;
  ageGroups: BilingualText[];
  programIds: string[];
};

export type TrainingGroup = {
  id: string;
  sportId: string;
  name: BilingualText;
  playerIds: string[];
  coachIds: string[];
};

export type Player = {
  id: string;
  photo?: string;
  nameEn: string;
  nameAr: string;
  sportId: string;
  teamId?: string;
  groupId?: string;
  programId?: string;
  coachIds: string[];
  age?: number;
  dateOfBirth?: string;
  position?: BilingualText;
  level: BilingualText;
  status: BilingualText;
  attendanceSummary?: AttendanceSummary;
  performanceHistory: PerformanceRecord[];
  coachFeedback: CoachFeedback[];
  achievements: BilingualText[];
};

export type MetricDefinition = {
  id: string;
  sportId: string;
  name: BilingualText;
  unit?: BilingualText;
  description?: BilingualText;
};

export type PerformanceRecord = {
  id: string;
  playerId: string;
  metricId: string;
  value: number;
  recordedAt: string;
  coachId?: string;
};

export type CoachFeedback = {
  id: string;
  playerId: string;
  coachId: string;
  summary: BilingualText;
  createdAt: string;
};

export type AttendanceSummary = { attended: number; scheduled: number };
export type Session = { id: string; sportId: string; groupId: string; startsAt: string; status: BilingualText };
export type CoachEvaluation = { id: string; coachId: string; playerId: string; metrics: PerformanceRecord[]; feedback: CoachFeedback };

export const metricDefinitions: MetricDefinition[] = [
  ...['Speed|السرعة', 'Passing|التمرير', 'Shooting|التسديد', 'Positioning|التمركز', 'Fitness|اللياقة'].map((label, i) => { const [en, ar] = label.split('|'); return { id: `football-${i}`, sportId: 'football', name: { en, ar } }; }),
  ...['Time|الزمن', 'Technique|التقنية', 'Speed|السرعة', 'Endurance|التحمل'].map((label, i) => { const [en, ar] = label.split('|'); return { id: `swimming-${i}`, sportId: 'swimming', name: { en, ar } }; }),
  ...['Technique|التقنية', 'Flexibility|المرونة', 'Balance|التوازن', 'Strength|القوة'].map((label, i) => { const [en, ar] = label.split('|'); return { id: `gymnastics-${i}`, sportId: 'gymnastics', name: { en, ar } }; }),
  ...['Shooting|التصويب', 'Passing|التمرير', 'Speed|السرعة', 'Endurance|التحمل'].map((label, i) => { const [en, ar] = label.split('|'); return { id: `basketball-${i}`, sportId: 'basketball', name: { en, ar } }; }),
];

export type ProductPortal = 'player' | 'parent' | 'coach' | 'admin';
