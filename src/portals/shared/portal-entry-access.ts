import type { PortalIdentity, ServerAuthSession } from '../../lib/auth-client';

export type OpenPortalKind = 'player' | 'parent' | 'coach';
export type UnlinkedPortalReason = 'not-linked' | 'ambiguous' | 'data-unavailable';

export type UnlinkedPortalAccess = {
  portal: OpenPortalKind;
  provider: ServerAuthSession['provider'];
  uid?: string;
  email?: string;
  reason: UnlinkedPortalReason;
  createdAt: string;
};

export type PortalBindingPersistenceResult =
  | { linked: true; portal: OpenPortalKind; recordId: string }
  | { linked: false; portal: OpenPortalKind; reason: 'not-linked' | 'ambiguous' };

function unlinkedKey(portal: OpenPortalKind): string {
  return `uos:${portal}-portal:unlinked-access:v1`;
}

export function portalKindFromDestination(destination: string): OpenPortalKind | null {
  if (/^\/player(\/|$)/.test(destination)) return 'player';
  if (/^\/parent(\/|$)/.test(destination)) return 'parent';
  if (/^\/coach(\/|$)/.test(destination)) return 'coach';
  return null;
}

export function clearLinkedPortalSession(portal: OpenPortalKind): void {
  if (typeof window === 'undefined') return;
  try {
    if (portal === 'player') {
      window.localStorage.removeItem('uos:player-portal:session');
      window.localStorage.removeItem('uos:player-portal:active-id');
      window.localStorage.removeItem('uos:player-portal:auth');
      return;
    }
    if (portal === 'parent') {
      window.localStorage.removeItem('uos:parent-portal:session:v1');
      return;
    }
    window.localStorage.removeItem('uos:coach-portal:session:v1');
    window.sessionStorage.removeItem('uos:coach-portal:preview-session:v1');
    window.localStorage.removeItem('uos:coach-portal:auth');
    window.localStorage.removeItem('uos:coach-portal:active-id');
  } catch {
    // Storage may be unavailable in privacy modes. The server still protects all private data.
  }
}

export function clearUnlinkedPortalAccess(portal: OpenPortalKind): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(unlinkedKey(portal));
  } catch {
    // Session storage may be unavailable; no private data is granted by this marker.
  }
}

export function readUnlinkedPortalAccess(portal: OpenPortalKind): UnlinkedPortalAccess | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(unlinkedKey(portal));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<UnlinkedPortalAccess>;
    if (
      value.portal !== portal
      || (value.provider !== 'supabase' && value.provider !== 'firebase')
      || (value.reason !== 'not-linked' && value.reason !== 'ambiguous' && value.reason !== 'data-unavailable')
    ) {
      window.sessionStorage.removeItem(unlinkedKey(portal));
      return null;
    }
    return {
      portal,
      provider: value.provider,
      ...(typeof value.uid === 'string' && value.uid ? { uid: value.uid } : {}),
      ...(typeof value.email === 'string' && value.email ? { email: value.email } : {}),
      reason: value.reason,
      createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    };
  } catch {
    return null;
  }
}

export function persistUnlinkedPortalAccess(
  portal: OpenPortalKind,
  identity: Pick<ServerAuthSession, 'provider' | 'uid' | 'email'> | { provider: 'supabase'; uid?: string; email?: string },
  reason: UnlinkedPortalReason,
): UnlinkedPortalAccess {
  clearLinkedPortalSession(portal);
  const access: UnlinkedPortalAccess = {
    portal,
    provider: identity.provider,
    ...(identity.uid ? { uid: identity.uid } : {}),
    ...(identity.email ? { email: identity.email } : {}),
    reason,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(unlinkedKey(portal), JSON.stringify(access));
    } catch {
      // The marker only unlocks a zero-private-data shell; server APIs remain authoritative.
    }
  }
  return access;
}

export function bindingStateForPortal(portal: OpenPortalKind, identity: PortalIdentity): PortalBindingPersistenceResult {
  const ids = portal === 'player'
    ? identity.bindings.playerIds
    : portal === 'parent'
      ? identity.bindings.guardianIds
      : identity.bindings.coachIds;

  if (ids.length === 1) return { linked: true, portal, recordId: ids[0] };
  return { linked: false, portal, reason: ids.length === 0 ? 'not-linked' : 'ambiguous' };
}

export function persistLinkedPortalBinding(destination: string, identity: PortalIdentity): PortalBindingPersistenceResult {
  const portal = portalKindFromDestination(destination);
  if (!portal) throw new Error('UNSUPPORTED_OPEN_PORTAL');

  const state = bindingStateForPortal(portal, identity);
  if (!state.linked) {
    persistUnlinkedPortalAccess(portal, identity.identity, state.reason);
    return state;
  }

  clearUnlinkedPortalAccess(portal);
  const now = new Date().toISOString();

  if (portal === 'player') {
    window.localStorage.setItem('uos:player-portal:session', JSON.stringify({
      userId: identity.identity.uid,
      playerId: state.recordId,
      ...(identity.identity.email ? { email: identity.identity.email } : {}),
      provider: 'production',
      createdAt: now,
    }));
    window.localStorage.setItem('uos:player-portal:active-id', state.recordId);
    window.localStorage.setItem('uos:player-portal:auth', 'true');
    return state;
  }

  if (portal === 'parent') {
    window.localStorage.setItem('uos:parent-portal:session:v1', JSON.stringify({
      parentId: state.recordId,
      provider: 'production',
      createdAt: now,
      authorizedPlayerIds: identity.bindings.guardianPlayerIds,
    }));
    return state;
  }

  window.localStorage.setItem('uos:coach-portal:session:v1', JSON.stringify({
    coachId: state.recordId,
    provider: 'production',
    createdAt: now,
  }));
  window.sessionStorage.removeItem('uos:coach-portal:preview-session:v1');
  return state;
}
