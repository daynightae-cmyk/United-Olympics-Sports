import { ApiError, isUuid, type ApiRequest } from '../http.js';
import { verifyBearerIdentity, type VerifiedIdentity } from '../auth.js';
import {
  resolveAuthorizationContext,
  isSuperAdmin,
  canManagePlayer,
  canAccessBranch,
  canManageCoach,
  type AuthorizationContext,
} from '../authorization-context.js';
import { PortalDomainRepository } from '../repositories/portal-repository.js';
import type {
  DataAvailability,
  SportMindEvidenceItem,
  SportMindHydratedContext,
  SportMindRequest,
  SportMindRole,
} from './types.js';

const MEDICAL_KEYWORDS = [
  'injury',
  'injured',
  'pain',
  'hurt',
  'swelling',
  'sprain',
  'strain',
  'tear',
  'concussion',
  'fracture',
  'broken',
  'bleeding',
  'إصابة',
  'مصاب',
  'ألم',
  'وجع',
  'تورم',
  'التواء',
  'تمزق',
  'ارتجاج',
  'كسر',
  'نزيف',
];

export function detectMedicalInquiry(message: string): boolean {
  const normalized = message.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => normalized.includes(kw));
}

export function resolveRoleFromContext(ctx: AuthorizationContext, currentRoute?: string): SportMindRole {
  const hasAdmin = isSuperAdmin(ctx) || ctx.roles.includes('admin') || ctx.roles.includes('branch_admin');
  const hasCoach = ctx.roles.includes('coach') || ctx.bindings.coachIds.length > 0;
  const hasParent = ctx.roles.includes('guardian') || ctx.bindings.guardianIds.length > 0;
  const hasPlayer = ctx.roles.includes('player') || ctx.bindings.playerIds.length > 0;

  // Disambiguate multi-role users based on current portal route
  if (currentRoute) {
    if (currentRoute.startsWith('/admin') && hasAdmin) return 'admin';
    if (currentRoute.startsWith('/coach') && hasCoach) return 'coach';
    if (currentRoute.startsWith('/parent') && hasParent) return 'parent';
    if (currentRoute.startsWith('/player') && hasPlayer) return 'player';
  }

  if (hasAdmin) return 'admin';
  if (hasCoach) return 'coach';
  if (hasParent) return 'parent';
  if (hasPlayer) return 'player';

  return 'public';
}

function getPreviewIdentity(currentRoute?: string): VerifiedIdentity {
  const isCoach = currentRoute?.startsWith('/coach');
  const isParent = currentRoute?.startsWith('/parent');
  const isAdmin = currentRoute?.startsWith('/admin');

  if (isAdmin) {
    return {
      provider: 'supabase',
      subject: 'preview-admin',
      uid: 'preview-admin',
      email: 'admin@unitedolympics.ae',
      roles: ['admin', 'super_admin'],
      scopes: ['*'],
    };
  }

  if (isCoach) {
    return {
      provider: 'supabase',
      subject: 'preview-coach-1',
      uid: 'preview-coach-1',
      email: 'coach@unitedolympics.ae',
      roles: ['coach'],
      scopes: ['coach:*'],
    };
  }

  if (isParent) {
    return {
      provider: 'supabase',
      subject: 'preview-parent-1',
      uid: 'preview-parent-1',
      email: 'parent@unitedolympics.ae',
      roles: ['guardian'],
      scopes: ['parent:*'],
    };
  }

  return {
    provider: 'supabase',
    subject: 'preview-athlete-1',
    uid: 'preview-athlete-1',
    email: 'athlete@unitedolympics.ae',
    roles: ['player'],
    scopes: ['player:*'],
  };
}

export async function hydrateSportMindContext(
  req: ApiRequest,
  input: SportMindRequest,
): Promise<SportMindHydratedContext> {
  const isMedical = detectMedicalInquiry(input.message);

  let identity: VerifiedIdentity | null;
  try {
    identity = await verifyBearerIdentity(req);
  } catch {
    // In preview / development environment, allow fallback to preview identity if in a portal route
    if (
      process.env.NODE_ENV !== 'production' &&
      input.currentRoute &&
      (input.currentRoute.startsWith('/admin') ||
        input.currentRoute.startsWith('/coach') ||
        input.currentRoute.startsWith('/parent') ||
        input.currentRoute.startsWith('/player'))
    ) {
      identity = getPreviewIdentity(input.currentRoute);
    } else {
      identity = null;
    }
  }

  // Unauthenticated / public access: enforce neutral public scope with no private data access
  if (!identity) {
    return {
      role: 'public',
      userId: 'anonymous',
      recordsSummary: {
        upcomingSessions: null,
        attendanceRecords: null,
        hasActiveSubscription: null,
        recentNotesCount: null,
        dataAvailability: 'none',
      },
      evidence: [
        {
          type: 'system',
          description: {
            en: 'Public sports intelligence session',
            ar: 'جلسة ذكاء رياضي عامة',
          },
        },
      ],
      isMedicalInquiry: isMedical,
    };
  }

  const authCtx = await resolveAuthorizationContext(identity);
  const role = resolveRoleFromContext(authCtx, input.currentRoute);

  // If authenticated identity has no authorized roles, maintain public boundaries
  if (role === 'public') {
    return {
      role: 'public',
      userId: authCtx.uid,
      recordsSummary: {
        upcomingSessions: null,
        attendanceRecords: null,
        hasActiveSubscription: null,
        recentNotesCount: null,
        dataAvailability: 'none',
      },
      evidence: [
        {
          type: 'system',
          description: {
            en: 'Public sports intelligence session',
            ar: 'جلسة ذكاء رياضي عامة',
          },
        },
      ],
      isMedicalInquiry: isMedical,
    };
  }

  const evidence: SportMindEvidenceItem[] = [
    {
      type: 'system',
      description: {
        en: `Role-authorized intelligence session (${role.toUpperCase()})`,
        ar: `جلسة ذكاء مصرح بها بحسب الدور (${role === 'admin' ? 'الإدارة' : role === 'coach' ? 'المدرب' : role === 'player' ? 'الرياضي' : 'ولي الأمر'})`,
      },
    },
  ];

  let entity: SportMindHydratedContext['entity'];
  let upcomingSessions: number | null = null;
  let attendanceRecords: number | null = null;
  let hasActiveSubscription: boolean | null = null;
  let recentNotesCount: number | null = null;
  let dataAvailability: DataAvailability = 'none';

  let sport: string | undefined;
  let branchId: string | undefined = authCtx.tenant.branchIds[0];
  let branchName: string | undefined;

  const requested = input.requestedContext;

  // Resolve target player ID safely based on authorized role & bindings
  const targetPlayerId =
    requested?.entityType === 'player' && requested.entityId && isUuid(requested.entityId)
      ? requested.entityId
      : role === 'player' && authCtx.bindings.playerIds[0] && isUuid(authCtx.bindings.playerIds[0])
        ? authCtx.bindings.playerIds[0]
        : undefined;

  if (targetPlayerId) {
    if (canManagePlayer(authCtx, targetPlayerId)) {
      try {
        const portalRepo = new PortalDomainRepository();
        const playerData = await portalRepo.getPlayerData(authCtx, targetPlayerId);
        entity = {
          type: 'player',
          id: playerData.player.id,
          name: playerData.player.fullName,
          summary: `${playerData.relations.sport?.name || 'Multi-Sport'} • ${playerData.relations.branch?.name || 'General Branch'}`,
        };
        sport = playerData.relations.sport?.name || undefined;
        branchName = playerData.relations.branch?.name || undefined;
        upcomingSessions = playerData.schedule.filter((s) => s.status === 'scheduled').length;
        attendanceRecords = playerData.attendance.length;
        hasActiveSubscription = playerData.subscriptions.some((s) => s.status === 'active');
        recentNotesCount = playerData.performance.length;
        dataAvailability = 'verified';

        evidence.push({
          type: 'player',
          description: {
            en: `Player profile verified: ${playerData.player.fullName}`,
            ar: `تم التحقق من ملف الرياضي: ${playerData.player.fullName}`,
          },
        });
        if (upcomingSessions > 0) {
          evidence.push({
            type: 'session',
            description: {
              en: `${upcomingSessions} scheduled training sessions`,
              ar: `${upcomingSessions} حصص تدريبية مجدولة`,
            },
            recordCount: upcomingSessions,
          });
        }
      } catch (err) {
        if (!(err instanceof ApiError)) {
          console.warn('SportMind context hydration warning:', err);
        }
        upcomingSessions = null;
        attendanceRecords = null;
        hasActiveSubscription = null;
        recentNotesCount = null;
        dataAvailability = 'unavailable';
      }
    }
  } else if (requested?.entityType === 'coach' && requested.entityId && isUuid(requested.entityId)) {
    if (canManageCoach(authCtx, requested.entityId)) {
      entity = {
        type: 'coach',
        id: requested.entityId,
        name: 'Assigned Coach',
      };
      evidence.push({
        type: 'player',
        description: {
          en: 'Coach scope verified',
          ar: 'تم التحقق من نطاق المدرب',
        },
      });
    }
  } else if (requested?.entityType === 'branch' && requested.entityId && isUuid(requested.entityId)) {
    if (canAccessBranch(authCtx, requested.entityId)) {
      branchId = requested.entityId;
      entity = {
        type: 'branch',
        id: requested.entityId,
        name: 'Selected Branch',
      };
      evidence.push({
        type: 'branch',
        description: {
          en: 'Branch operational scope verified',
          ar: 'تم التحقق من النطاق التشغيلي للفرع',
        },
      });
    }
  }

  return {
    role,
    userId: authCtx.uid,
    organizationId: authCtx.tenant.organizationIds[0],
    branchId,
    branchName,
    sport,
    entity,
    recordsSummary: {
      upcomingSessions,
      attendanceRecords,
      hasActiveSubscription,
      recentNotesCount,
      dataAvailability,
    },
    evidence,
    isMedicalInquiry: isMedical,
  };
}
