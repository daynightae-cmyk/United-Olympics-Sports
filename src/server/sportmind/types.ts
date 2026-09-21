export type SportMindRole = 'admin' | 'coach' | 'player' | 'parent' | 'public';

export type SportMindModuleType =
  | 'INSIGHT'
  | 'COACH_BOARD'
  | 'TRAINING_IDEA'
  | 'NEXT_ACTION'
  | 'OBSERVATION'
  | 'COMPARISON'
  | 'EVIDENCE'
  | 'NEEDS_DATA'
  | 'ATTENTION'
  | 'SUMMARY'
  | 'RECOMMENDED_WORKFLOW';

export interface BilingualString {
  en: string;
  ar: string;
}

export interface CoachBoardData {
  objective: BilingualString;
  warmUp: {
    title: BilingualString;
    durationMinutes: number;
    notes?: BilingualString;
  };
  mainDrill: {
    title: BilingualString;
    durationMinutes: number;
    description: BilingualString;
    progression?: BilingualString;
  };
  coolDown: {
    title: BilingualString;
    durationMinutes: number;
  };
  coachNotes?: BilingualString;
}

export interface SportMindAction {
  label: BilingualString;
  to: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export interface SportMindModuleItem {
  label?: BilingualString;
  value?: BilingualString;
  actionTo?: string;
}

export interface SportMindModule {
  id: string;
  type: SportMindModuleType;
  title?: BilingualString;
  body?: BilingualString;
  items?: SportMindModuleItem[];
  coachBoard?: CoachBoardData;
  actions?: SportMindAction[];
  confidenceLabel?: BilingualString;
}

export interface SportMindEvidenceItem {
  type: 'session' | 'attendance' | 'player' | 'branch' | 'group' | 'system';
  description: BilingualString;
  recordCount?: number;
}

export interface SportMindRequest {
  message: string;
  conversationId?: string;
  locale?: 'en' | 'ar';
  currentRoute?: string;
  requestedContext?: {
    entityType?: 'player' | 'coach' | 'group' | 'branch' | 'session' | 'sport';
    entityId?: string;
  };
}

export type DataAvailability = 'verified' | 'unavailable' | 'none';

export interface SportMindRecordsSummary {
  upcomingSessions: number | null;
  attendanceRecords: number | null;
  hasActiveSubscription: boolean | null;
  recentNotesCount: number | null;
  dataAvailability: DataAvailability;
}

export interface SportMindHydratedContext {
  role: SportMindRole;
  userId: string;
  organizationId?: string;
  branchId?: string;
  branchName?: string;
  sport?: string;
  entity?: {
    type: string;
    id: string;
    name: string;
    summary?: string;
  };
  recordsSummary: SportMindRecordsSummary;
  evidence: SportMindEvidenceItem[];
  isMedicalInquiry?: boolean;
}

export interface SportMindStreamChunk {
  type: 'thinking' | 'delta' | 'module' | 'evidence' | 'done' | 'error';
  thinkingState?: BilingualString;
  delta?: string;
  module?: SportMindModule;
  evidence?: SportMindEvidenceItem[];
  error?: {
    code: string;
    message: string;
  };
}
