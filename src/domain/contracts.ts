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
  | 'youth'
  | 'youth-boys'
  | 'youth-girls'
  | 'women'
  | 'training'
  | 'technique'
  | 'underwater'
  | 'teamwork'
  | 'coaching'
  | 'group'
  | 'match'
  | 'goalkeeper'
  | 'brand'
  | 'performance'
  | 'gallery';
export type SportMediaSourceStatus = 'verified-user-asset';
export type SportMediaAsset = {
  id: string;
  sportId: string;
  /** Normal website rendering source. Prefer a local /public asset when localized. */
  url: string;
  /** Original user-supplied source retained for provenance and Admin traceability. */
  sourceUrl?: string;
  altEn: string;
  altAr: string;
  usage: SportMediaUsage;
  order: number;
  sourceStatus: SportMediaSourceStatus;
};

export type ProductPortal = 'player' | 'parent' | 'coach' | 'admin';

/* ── Organisation / Country / Branch ── */
export type Organization = {
  id: string;
  name: BilingualText;
  description: BilingualText;
  countryIds: string[];
  status: EntityStatus;
};

export type Country = {
  id: string;
  name: BilingualText;
  code: string;
  flag?: string;
  organizationId: string;
  branchIds: string[];
  status: EntityStatus;
};

export type Branch = {
  id: string;
  name: BilingualText;
  countryId: string;
  organizationId: string;
  sportIds: string[];
  programIds: string[];
  groupIds: string[];
  coachIds: string[];
  playerIds: string[];
  status: EntityStatus;
  address?: BilingualText;
  phone?: string;
  email?: string;
};

/* ── Coach ── */
export type Coach = {
  id: string;
  nameEn: string;
  nameAr: string;
  sportIds: string[];
  branchIds: string[];
  groupIds: string[];
  playerIds: string[];
  specializations: BilingualText[];
  certifications: BilingualText[];
  status: EntityStatus;
  yearsOfExperience?: number;
  bio?: BilingualText;
};

/* ── Parent ── */
export type Parent = {
  id: string;
  nameEn: string;
  nameAr: string;
  playerIds: string[];
  preferredLanguage: 'en' | 'ar';
  status: EntityStatus;
  phone?: string;
  email?: string;
};

/* ── Subscription ── */
export type Subscription = {
  id: string;
  playerId: string;
  programId: string;
  branchId: string;
  plan: BilingualText;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string;
};

export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled';

/* ── Payment ── */
export type Payment = {
  id: string;
  subscriptionId: string;
  playerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string;
  method: BilingualText;
  reference?: string;
};

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
