export type BilingualText = { en: string; ar: string };

export type Sport = {
  id: string;
  name: BilingualText;
  description: BilingualText;
  ageGroups: BilingualText[];
  programIds: string[];
  icon: string;
  status: EntityStatus;
};

export type TrainingGroup = {
  id: string;
  sportId: string;
  name: BilingualText;
  ageGroup: BilingualText;
  level: BilingualText;
  playerIds: string[];
  coachIds: string[];
  programIds: string[];
  status: EntityStatus;
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
  attendanceRecords: AttendanceRecord[];
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
  sportId: string;
  groupId: string;
  summary: BilingualText;
  strengths: BilingualText[];
  focusAreas: BilingualText[];
  metricChanges: MetricChange[];
  createdAt: string;
};

export type AttendanceSummary = { attended: number; scheduled: number };
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AttendanceRecord = { id: string; date: string; status: AttendanceStatus };
export type Session = { id: string; sportId: string; groupId: string; startsAt: string; status: BilingualText };
export type MetricChange = { metricId: string; previousValue: number; currentValue: number };
export type CoachEvaluation = {
  id: string;
  playerId: string;
  coachId: string;
  sportId: string;
  groupId: string;
  createdAt: string;
  summaryEn: string;
  summaryAr: string;
  strengths: BilingualText[];
  focusAreas: BilingualText[];
  metricRecords: PerformanceRecord[];
};

export type EntityStatus = 'active' | 'inactive';
export type SportMediaUsage =
  | 'hero'
  | 'coach-child'
  | 'children'
  | 'youth-boys'
  | 'youth-girls'
  | 'women'
  | 'technique'
  | 'underwater'
  | 'group'
  | 'performance'
  | 'gallery';
export type SportMediaSourceStatus = 'verified-user-asset';
export type SportMediaAsset = {
  id: string;
  sportId: string;
  url: string;
  altEn: string;
  altAr: string;
  usage: SportMediaUsage;
  order: number;
  sourceStatus: SportMediaSourceStatus;
};

export type ProductPortal = 'player' | 'parent' | 'coach' | 'admin';
