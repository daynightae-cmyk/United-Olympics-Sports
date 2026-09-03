import type { BilingualText } from '../../domain/contracts';
import type { ListResult, ListQueryParams, CreateResult, UpdateResult, DeleteResult } from './queryTypes';

export type { ListResult, ListQueryParams, CreateResult, UpdateResult, DeleteResult };

export type OrganizationViewModel = {
  id: string;
  name: BilingualText;
  description: BilingualText;
  countryCount: number;
  status: 'active' | 'inactive';
};

export type CountryViewModel = {
  id: string;
  name: BilingualText;
  code: string;
  flag?: string;
  organizationId: string;
  branchCount: number;
  status: 'active' | 'inactive';
};

export type BranchViewModel = {
  id: string;
  name: BilingualText;
  countryId: string;
  organizationId: string;
  sportIds: string[];
  programIds: string[];
  groupIds: string[];
  coachIds: string[];
  playerIds: string[];
  sportCount: number;
  programCount: number;
  groupCount: number;
  coachCount: number;
  playerCount: number;
  status: 'active' | 'inactive';
  address?: BilingualText;
  phone?: string;
  email?: string;
};

export type SportViewModel = {
  id: string;
  name: BilingualText;
  description: BilingualText;
  ageGroups: BilingualText[];
  programIds: string[];
  icon: string;
  status: 'active' | 'inactive';
};

export type ProgramViewModel = {
  id: string;
  name: BilingualText;
  sportId: string;
  description: BilingualText;
  ageGroups: BilingualText[];
  level: BilingualText;
  status: 'active' | 'inactive';
};

export type TrainingGroupViewModel = {
  id: string;
  sportId: string;
  name: BilingualText;
  ageGroup: BilingualText;
  level: BilingualText;
  playerCount: number;
  coachCount: number;
  programIds: string[];
  status: 'active' | 'inactive';
};

export type PlayerViewModel = {
  id: string;
  photo?: string;
  nameEn: string;
  nameAr: string;
  sportId: string;
  groupId?: string;
  programId?: string;
  age?: number;
  level: BilingualText;
  status: BilingualText;
  attendanceRate: number;
  performanceScore: number | null;
};

export type CoachViewModel = {
  id: string;
  nameEn: string;
  nameAr: string;
  sportIds: string[];
  branchIds: string[];
  groupIds: string[];
  playerCount: number;
  specializations: BilingualText[];
  certifications: BilingualText[];
  status: 'active' | 'inactive';
};

export type ParentViewModel = {
  id: string;
  nameEn: string;
  nameAr: string;
  playerIds: string[];
  playerCount: number;
  preferredLanguage: 'en' | 'ar';
  status: 'active' | 'inactive';
  phone?: string;
  email?: string;
};

export type SessionViewModel = {
  id: string;
  sportId: string;
  groupId: string;
  startsAt: string;
  status: BilingualText;
  coachIds: string[];
};

export type SubscriptionViewModel = {
  id: string;
  playerId: string;
  programId: string;
  branchId: string;
  plan: BilingualText;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string;
};

export type PaymentViewModel = {
  id: string;
  subscriptionId: string;
  playerId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paidAt: string;
  method: BilingualText;
  reference?: string;
};

export type ReportViewModel = {
  id: string;
  title: BilingualText;
  type: BilingualText;
  generatedAt: string;
  status: 'ready' | 'generating' | 'failed';
};

export type ContentViewModel = {
  id: string;
  title: BilingualText;
  type: BilingualText;
  status: 'published' | 'draft' | 'archived';
  updatedAt: string;
};

export type UserViewModel = {
  id: string;
  name: BilingualText;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
  lastLogin?: string;
};

export type RegistrationViewModel = {
  id: string;
  playerId: string;
  programId: string;
  groupId?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlisted';
  requestedAt: string;
  confirmedAt?: string;
};

export type AchievementViewModel = {
  id: string;
  title: BilingualText;
  description: BilingualText;
  category: BilingualText;
  playerId?: string;
  groupId?: string;
  awardedAt: string;
  status: 'awarded' | 'pending' | 'revoked';
};

export type EventViewModel = {
  id: string;
  title: BilingualText;
  description: BilingualText;
  type: BilingualText;
  startDate: string;
  endDate: string;
  location?: BilingualText;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
};

export type AnnouncementViewModel = {
  id: string;
  title: BilingualText;
  body: BilingualText;
  audience: BilingualText;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
};

export type MessageViewModel = {
  id: string;
  fromId: string;
  toIds: string[];
  subject: BilingualText;
  body: BilingualText;
  sentAt: string;
  readAt?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
};

export type AuditActivityViewModel = {
  id: string;
  actorId: string;
  actorName: BilingualText;
  action: BilingualText;
  entityType: BilingualText;
  entityId: string;
  details: BilingualText;
  timestamp: string;
  ip?: string;
};