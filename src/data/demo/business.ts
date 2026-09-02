import type { Branch, Country, Organization } from '../../domain/contracts';

export const demoOrganization: Organization = {
  id: 'org-united-olympics',
  name: { en: 'United Olympics Sports', ar: 'يونايتد أوليمبيكس سبورت' },
  description: { en: 'Structural preview organization for architecture demonstration.', ar: 'منظمة تجريبية هيكلية لعرض الهندسة المعمارية.' },
  countryIds: ['country-workspace-01', 'country-workspace-02'],
  status: 'active',
};

export const demoCountries: Country[] = [
  {
    id: 'country-workspace-01',
    name: { en: 'Country Workspace 01', ar: 'مساحة الدولة 01' },
    code: 'WS01',
    organizationId: 'org-united-olympics',
    branchIds: ['branch-workspace-01', 'branch-workspace-02'],
    status: 'active',
  },
  {
    id: 'country-workspace-02',
    name: { en: 'Country Workspace 02', ar: 'مساحة الدولة 02' },
    code: 'WS02',
    organizationId: 'org-united-olympics',
    branchIds: ['branch-workspace-03', 'branch-workspace-04'],
    status: 'active',
  },
];

export const demoBranches: Branch[] = [
  {
    id: 'branch-workspace-01',
    name: { en: 'Branch Workspace 01', ar: 'مساحة الفرع 01' },
    countryId: 'country-workspace-01',
    organizationId: 'org-united-olympics',
    sportIds: ['football', 'swimming', 'basketball', 'tennis'],
    programIds: ['program-demo-football-foundation', 'program-demo-swimming-progressive', 'program-demo-basketball-team'],
    groupIds: ['football-demo-u12', 'swimming-demo-beginners', 'basketball-demo-u14'],
    coachIds: ['coach-preview-01', 'coach-preview-02', 'coach-preview-03'],
    playerIds: ['player-demo-001', 'player-demo-002', 'player-demo-003', 'player-demo-004'],
    status: 'active',
    address: { en: '-', ar: '-' },
  },
  {
    id: 'branch-workspace-02',
    name: { en: 'Branch Workspace 02', ar: 'مساحة الفرع 02' },
    countryId: 'country-workspace-01',
    organizationId: 'org-united-olympics',
    sportIds: ['football', 'swimming', 'tennis'],
    programIds: ['program-demo-football-foundation', 'program-demo-tennis-skills'],
    groupIds: ['football-demo-u14', 'tennis-demo-youth'],
    coachIds: ['coach-preview-04', 'coach-preview-06'],
    playerIds: ['player-demo-005', 'player-demo-006', 'player-demo-007'],
    status: 'active',
    address: { en: '-', ar: '-' },
  },
  {
    id: 'branch-workspace-03',
    name: { en: 'Branch Workspace 03', ar: 'مساحة الفرع 03' },
    countryId: 'country-workspace-02',
    organizationId: 'org-united-olympics',
    sportIds: ['football', 'basketball', 'gymnastics'],
    programIds: ['program-demo-basketball-team'],
    groupIds: ['basketball-demo-u16', 'gymnastics-demo-foundation'],
    coachIds: ['coach-preview-05', 'coach-preview-07'],
    playerIds: ['player-demo-008', 'player-demo-009', 'player-demo-010'],
    status: 'active',
    address: { en: '-', ar: '-' },
  },
  {
    id: 'branch-workspace-04',
    name: { en: 'Branch Workspace 04', ar: 'مساحة الفرع 04' },
    countryId: 'country-workspace-02',
    organizationId: 'org-united-olympics',
    sportIds: ['swimming'],
    programIds: ['program-demo-swimming-progressive'],
    groupIds: ['swimming-demo-intermediate'],
    coachIds: ['coach-preview-09'],
    playerIds: ['player-demo-011', 'player-demo-012'],
    status: 'active',
    address: { en: '-', ar: '-' },
  },
];
