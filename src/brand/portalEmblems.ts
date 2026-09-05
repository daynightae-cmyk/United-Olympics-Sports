export type PortalKind = 'player' | 'parent' | 'coach' | 'admin' | 'store';

export type PortalEmblemDefinition = {
  light: string;
  dark: string;
  altEn: string;
  altAr: string;
};

export const portalEmblems: Record<PortalKind, PortalEmblemDefinition> = {
  player: {
    light: '/brand/portals/player/player-portal-light.png',
    dark: '/brand/portals/player/player-portal-dark.png',
    altEn: 'United Olympics Sports Player Portal',
    altAr: 'شعار بوابة اللاعب — يونايتد أوليمبيكس سبورت',
  },
  parent: {
    light: '/brand/portals/parent/parent-portal-light.png',
    dark: '/brand/portals/parent/parent-portal-dark.png',
    altEn: 'United Olympics Sports Parent Portal',
    altAr: 'شعار بوابة ولي الأمر — يونايتد أوليمبيكس سبورت',
  },
  coach: {
    light: '/brand/portals/coach/coach-portal-light.png',
    dark: '/brand/portals/coach/coach-portal-dark.png',
    altEn: 'United Olympics Sports Coach Portal',
    altAr: 'شعار بوابة المدرب — يونايتد أوليمبيكس سبورت',
  },
  admin: {
    light: '/brand/portals/admin/admin-portal-light.png',
    dark: '/brand/portals/admin/admin-portal-dark.png',
    altEn: 'United Olympics Sports Admin Portal',
    altAr: 'شعار بوابة الإدارة — يونايتد أوليمبيكس سبورت',
  },
  store: {
    light: '/brand/portals/store/store-light.png',
    dark: '/brand/portals/store/store-dark.png',
    altEn: 'United Olympics Sports Store',
    altAr: 'شعار المتجر — يونايتد أوليمبيكس سبورت',
  },
};
