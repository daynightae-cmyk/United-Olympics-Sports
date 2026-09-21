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

function resolveRoleFromContext(ctx: AuthorizationContext, currentRoute?: string): SportMindRole {
  if (isSuperAdmin(ctx) || ctx.roles.includes('admin') || ctx.roles.includes('branch_admin')) {
    return 'admin';
  }
  if (ctx.roles.includes('coach') || ctx.bindings.coachIds.length > 0) {
    return 'coach';
  }
  if (ctx.roles.includes('guardian') || ctx.bindings.guardianIds.length > 0) {
    return 'parent';
  }
  if (ctx.roles.includes('player') || ctx.bindings.playerIds.length > 0) {
    return 'player';
  }

  if (currentRoute) {
    if (currentRoute.startsWith('/admin')) return 'admin';
    if (currentRoute.startsWith('/coach')) return 'coach';
    if (currentRoute.startsWith('/parent')) return 'parent';
    if (currentRoute.startsWith('/player')) return 'player';
  }

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
  let identity: VerifiedIdentity;
  try {
    identity = await verifyBearerIdentity(req);
  } catch (err) {
    // In preview / development environment, allow fallback to preview identity
    if (process.env.NODE_ENV !== 'production') {
      identity = getPreviewIdentity(input.currentRoute);
    } else {
      throw err;
    }
  }

  const authCtx = await resolveAuthorizationContext(identity);
  const role = resolveRoleFromContext(authCtx, input.currentRoute);
  const isMedical = detectMedicalInquiry(input.message);

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
  let upcomingSessions = 0;
  let attendanceRecords = 0;
  let hasActiveSubscription = false;
  let recentNotesCount = 0;
  let sport: string | undefined;
  let branchId: string | undefined = authCtx.tenant.branchIds[0];
  let branchName: string | undefined;

  const requested = input.requestedContext;

  if (requested?.entityType === 'player' && requested.entityId && isUuid(requested.entityId)) {
    if (canManagePlayer(authCtx, requested.entityId)) {
      try {
        const portalRepo = new PortalDomainRepository();
        const playerData = await portalRepo.getPlayerData(authCtx, requested.entityId);
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
    },
    evidence,
    isMedicalInquiry: isMedical,
  };
}
