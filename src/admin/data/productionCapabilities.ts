/**
 * United Olympics Sports - Admin Production Capabilities Registry
 *
 * Truthful classification of every Admin entity capability in production mode.
 * Eliminates silent fallbacks, unverified mocks, and false readiness.
 */

export type CapabilityStatus =
  | 'LIVE_READ_WRITE'
  | 'LIVE_READ_ONLY'
  | 'DISABLED'
  | 'EXTERNAL_PROVIDER_REQUIRED';

export type AdminCapabilityKey =
  | 'organization'
  | 'countries'
  | 'branches'
  | 'sports'
  | 'programs'
  | 'groups'
  | 'players'
  | 'coaches'
  | 'parents'
  | 'sessions'
  | 'performance'
  | 'registrations'
  | 'subscriptions'
  | 'payments'
  | 'reports'
  | 'content'
  | 'users'
  | 'achievements'
  | 'events'
  | 'announcements'
  | 'messages'
  | 'auditActivity';

export interface AdminCapabilityRecord {
  readonly entity: AdminCapabilityKey;
  readonly readStatus: CapabilityStatus;
  readonly writeStatus: CapabilityStatus;
  readonly deleteStatus: CapabilityStatus;
  readonly liveEndpoint?: string;
  readonly rationale: string;
}

export const ADMIN_PRODUCTION_CAPABILITIES: Record<AdminCapabilityKey, AdminCapabilityRecord> = {
  organization: {
    entity: 'organization',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/organization',
    rationale: 'Organization metadata is backed by live database with system migration governance.',
  },
  countries: {
    entity: 'countries',
    readStatus: 'LIVE_READ_WRITE',
    writeStatus: 'LIVE_READ_WRITE',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/countries',
    rationale: 'Live tenant-scoped country management backed by live database.',
  },
  branches: {
    entity: 'branches',
    readStatus: 'LIVE_READ_WRITE',
    writeStatus: 'LIVE_READ_WRITE',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/branches',
    rationale: 'Live branch management scoped to tenant organizations.',
  },
  sports: {
    entity: 'sports',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/sports',
    rationale: 'Olympic sports catalog is codified and backed by live database queries.',
  },
  programs: {
    entity: 'programs',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/programs',
    rationale: 'Programs are structured developmental paths queried from live database.',
  },
  groups: {
    entity: 'groups',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/groups',
    rationale: 'Training groups are assigned and queried from live database.',
  },
  players: {
    entity: 'players',
    readStatus: 'LIVE_READ_WRITE',
    writeStatus: 'LIVE_READ_WRITE',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/players',
    rationale: 'Full lifecycle player management backed by live database with regulatory archival compliance.',
  },
  coaches: {
    entity: 'coaches',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/coaches',
    rationale: 'Coach rosters are staff profiles queried from live database.',
  },
  parents: {
    entity: 'parents',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/parents',
    rationale: 'Parent/guardian accounts are linked to players and queried from live database.',
  },
  sessions: {
    entity: 'sessions',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/sessions',
    rationale: 'Training schedules and sessions are live queried.',
  },
  performance: {
    entity: 'performance',
    readStatus: 'LIVE_READ_WRITE',
    writeStatus: 'LIVE_READ_WRITE',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/performance',
    rationale: 'Real-time performance evaluation recording with strict authorization checks.',
  },
  registrations: {
    entity: 'registrations',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/registrations',
    rationale: 'Registration inquiries and service requests from public forms queried from live database.',
  },
  subscriptions: {
    entity: 'subscriptions',
    readStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    writeStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    deleteStatus: 'DISABLED',
    rationale: 'Subscription billing lifecycle requires integrated payment provider gateway.',
  },
  payments: {
    entity: 'payments',
    readStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    writeStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/payments/intent',
    rationale: 'Payment transactions require external payment gateway (Stripe/Checkout) webhook reconciliation.',
  },
  reports: {
    entity: 'reports',
    readStatus: 'DISABLED',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    rationale: 'Automated executive analytics reporting engine is scheduled for future release.',
  },
  content: {
    entity: 'content',
    readStatus: 'DISABLED',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    rationale: 'Headless CMS content publishing pipeline is disabled in core production data tier.',
  },
  users: {
    entity: 'users',
    readStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    writeStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    deleteStatus: 'DISABLED',
    rationale: 'Identity user lifecycle requires Supabase Auth / Auth0 identity provider boundary.',
  },
  achievements: {
    entity: 'achievements',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/achievements',
    rationale: 'Achievements catalog queried from live database.',
  },
  events: {
    entity: 'events',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/events',
    rationale: 'Olympic tournaments and academy events queried from live database.',
  },
  announcements: {
    entity: 'announcements',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/announcements',
    rationale: 'Public and academy announcements queried from live database.',
  },
  messages: {
    entity: 'messages',
    readStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    writeStatus: 'EXTERNAL_PROVIDER_REQUIRED',
    deleteStatus: 'DISABLED',
    rationale: 'In-app and SMS/Email messaging requires external communication gateway.',
  },
  auditActivity: {
    entity: 'auditActivity',
    readStatus: 'LIVE_READ_ONLY',
    writeStatus: 'DISABLED',
    deleteStatus: 'DISABLED',
    liveEndpoint: '/api/v1/admin/audit',
    rationale: 'Immutable security audit trail queried from live database; modifications prohibited.',
  },
};

export function getAdminCapability(key: AdminCapabilityKey): AdminCapabilityRecord {
  const cap = ADMIN_PRODUCTION_CAPABILITIES[key];
  if (!cap) {
    throw new Error(`Unknown admin capability key: ${key}`);
  }
  return cap;
}

export function isCapabilityEnabled(key: AdminCapabilityKey, operation: 'read' | 'write' | 'delete'): boolean {
  const cap = getAdminCapability(key);
  const status = operation === 'read' ? cap.readStatus : operation === 'write' ? cap.writeStatus : cap.deleteStatus;
  return status === 'LIVE_READ_WRITE' || (operation === 'read' && status === 'LIVE_READ_ONLY');
}
