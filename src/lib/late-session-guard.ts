// Pure late-session cleanup decision for non-cancellable auth attempts.
//
// Dependency-free on purpose: imported by auth-client AND by node executable
// tests, so this module must never import firebase, supabase, react, or CSS.

/**
 * Decides whether a late (post-timeout) successful auth response may clear
 * the currently persisted browser session.
 *
 * Cleanup is allowed only when BOTH hold:
 * - no newer password attempt started after the expired one (a retry
 *   supersedes the stale attempt and owns whatever session it created), and
 * - the persisted session token is the late response's own token (the stray
 *   session is still in storage; a newer/different session must never be
 *   touched).
 */
export function shouldClearLateSession(
  attemptId: number,
  latestAttemptId: number,
  lateAccessToken: string | null | undefined,
  currentAccessToken: string | null | undefined,
): boolean {
  if (attemptId !== latestAttemptId) return false;
  if (!lateAccessToken) return false;
  return currentAccessToken === lateAccessToken;
}
