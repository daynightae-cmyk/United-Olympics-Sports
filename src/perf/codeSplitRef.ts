// Route-level code splitting reference for Mission 08
// Portal surfaces are lazy-loadable bundles:
// - PlayerPortalRouter
// - ParentPortalRouter
// - CoachPortalRouter
// Admin modules remain eagerly loaded; public site uses lazy concepts where appropriate.
export const splitMap = {
  playerPortal: () => import('../portals/PlayerPortalRouter'),
  parentPortal: () => import('../portals/ParentPortalRouter'),
  coachPortal: () => import('../portals/CoachPortalRouter'),
};
