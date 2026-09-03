import type { AdminDataMode } from './queryTypes';
import type { AdminDataGateway } from './AdminDataGateway';
import type {
  OrganizationViewModel,
  CountryViewModel,
  BranchViewModel,
  SportViewModel,
  ProgramViewModel,
  TrainingGroupViewModel,
  PlayerViewModel,
  CoachViewModel,
  ParentViewModel,
  SessionViewModel,
  SubscriptionViewModel,
  PaymentViewModel,
  ReportViewModel,
  ContentViewModel,
  UserViewModel,
  RegistrationViewModel,
  AchievementViewModel,
  EventViewModel,
  AnnouncementViewModel,
  MessageViewModel,
  AuditActivityViewModel,
  ListResult,
  ListQueryParams,
  CreateResult,
  UpdateResult,
  DeleteResult,
} from './viewModels';
import { demoOrganization, demoCountries, demoBranches } from '../../data/demo/business';
import { demoCoaches } from '../../data/demo/coaches';
import { demoParents } from '../../data/demo/parents';
import { demoPlayers } from '../../data/demo/players';
import { demoSessions } from '../../data/demo/sessions';
import { demoSports } from '../../data/demo/sports';
import { demoPrograms } from '../../data/demo/programs';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';
import { getPlayerOverall, getGroup, getSport, getBranch, getCountry, getCoach, getParent, getProgram } from '../../data/demo/selectors';
import { previewAchievements, previewAnnouncements, previewAuditActivity, previewContent, previewEvents, previewMessages, previewPayments, previewRegistrations, previewReports, previewSubscriptions, previewUsers } from '../../data/demo/adminRecords';

let previewSessionData = {
  countries: [...demoCountries],
  branches: [...demoBranches],
  coaches: [...demoCoaches],
  parents: [...demoParents],
  players: [...demoPlayers],
  sessions: [...demoSessions],
  sports: [...demoSports],
  programs: [...demoPrograms],
  groups: [...demoTrainingGroups],
  subscriptions: [...previewSubscriptions],
  payments: [...previewPayments],
  reports: [...previewReports],
  content: [...previewContent],
  users: [...previewUsers],
  registrations: [...previewRegistrations],
  achievements: [...previewAchievements],
  events: [...previewEvents],
  announcements: [...previewAnnouncements],
  messages: [...previewMessages],
  auditActivity: [...previewAuditActivity],
};

const previewDelay = () => Promise.resolve();

function paginate<T>(items: T[], params?: ListQueryParams): ListResult<T> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

function filterAndSort<T extends Record<string, unknown>>(items: T[], params?: ListQueryParams): T[] {
  let result = [...items];
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && key !== 'page' && key !== 'pageSize' && key !== 'field' && key !== 'direction') {
        result = result.filter(item => String(item[key] ?? '').toLowerCase().includes(String(value).toLowerCase()));
      }
    }
    if (params.field) {
      result.sort((a, b) => {
        const aVal = a[params.field!];
        const bVal = b[params.field!];
        if (aVal === bVal) return 0;
        const dir = params.direction === 'desc' ? -1 : 1;
        return aVal > bVal ? dir : -dir;
      });
    }
  }
  return result;
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const previewAdminGateway: AdminDataGateway = {
  mode: 'preview',

  // Organization
  async getOrganization(): Promise<OrganizationViewModel | null> {
    await previewDelay();
    return {
      id: demoOrganization.id,
      name: demoOrganization.name,
      description: demoOrganization.description,
      countryCount: demoOrganization.countryIds.length,
      status: demoOrganization.status,
    };
  },

  // Countries
  async listCountries(params?: ListQueryParams): Promise<ListResult<CountryViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.countries.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      flag: c.flag,
      organizationId: c.organizationId,
      branchCount: demoBranches.filter(b => b.countryId === c.id).length,
      status: c.status,
    }))).map(c => ({ ...c, branchCount: previewSessionData.branches.filter(b => b.countryId === c.id).length }));
    return paginate(items, params);
  },

  async getCountry(id: string): Promise<CountryViewModel | null> {
    await previewDelay();
    const c = previewSessionData.countries.find(x => x.id === id);
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      flag: c.flag,
      organizationId: c.organizationId,
      branchCount: previewSessionData.branches.filter(b => b.countryId === c.id).length,
      status: c.status,
    };
  },

  async createCountry(data: Partial<CountryViewModel>): Promise<CreateResult<CountryViewModel>> {
    await previewDelay();
    const newCountry = {
      id: genId('country'),
      name: data.name ?? { en: 'New Country', ar: 'دولة جديدة' },
      code: (data.code as string) ?? 'NEW',
      flag: data.flag,
      organizationId: data.organizationId ?? demoOrganization.id,
      branchCount: 0,
      status: (data.status as 'active' | 'inactive') ?? 'active',
    };
    previewSessionData.countries.push(newCountry as any);
    return { item: newCountry, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateCountry(id: string, data: Partial<CountryViewModel>): Promise<UpdateResult<CountryViewModel>> {
    await previewDelay();
    const idx = previewSessionData.countries.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Country not found');
    previewSessionData.countries[idx] = { ...previewSessionData.countries[idx], ...data } as any;
    const updated = await this.getCountry(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteCountry(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.countries = previewSessionData.countries.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Branches
  async listBranches(params?: ListQueryParams): Promise<ListResult<BranchViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.branches.map(b => ({
      id: b.id,
      name: b.name,
      countryId: b.countryId,
      organizationId: b.organizationId,
      sportIds: b.sportIds,
      programIds: b.programIds,
      groupIds: b.groupIds,
      coachIds: b.coachIds,
      playerIds: b.playerIds,
      sportCount: b.sportIds.length,
      programCount: b.programIds.length,
      groupCount: b.groupIds.length,
      coachCount: b.coachIds.length,
      playerCount: b.playerIds.length,
      status: b.status,
      address: b.address,
      phone: b.phone,
      email: b.email,
    })));
    return paginate(items, params);
  },

  async getBranch(id: string): Promise<BranchViewModel | null> {
    await previewDelay();
    const b = previewSessionData.branches.find(x => x.id === id);
    if (!b) return null;
    return {
      id: b.id,
      name: b.name,
      countryId: b.countryId,
      organizationId: b.organizationId,
      sportIds: b.sportIds,
      programIds: b.programIds,
      groupIds: b.groupIds,
      coachIds: b.coachIds,
      playerIds: b.playerIds,
      sportCount: b.sportIds.length,
      programCount: b.programIds.length,
      groupCount: b.groupIds.length,
      coachCount: b.coachIds.length,
      playerCount: b.playerIds.length,
      status: b.status,
      address: b.address,
      phone: b.phone,
      email: b.email,
    };
  },

  async createBranch(data: Partial<BranchViewModel>): Promise<CreateResult<BranchViewModel>> {
    await previewDelay();
    const newBranch = {
      id: genId('branch'),
      name: data.name ?? { en: 'New Branch', ar: 'فرع جديد' },
      countryId: data.countryId ?? 'country-workspace-01',
      organizationId: data.organizationId ?? demoOrganization.id,
      sportIds: data.sportIds ?? [],
      programIds: data.programIds ?? [],
      groupIds: data.groupIds ?? [],
      coachIds: data.coachIds ?? [],
      playerIds: data.playerIds ?? [],
      sportCount: (data.sportIds?.length ?? 0),
      programCount: (data.programIds?.length ?? 0),
      groupCount: (data.groupIds?.length ?? 0),
      coachCount: (data.coachIds?.length ?? 0),
      playerCount: (data.playerIds?.length ?? 0),
      status: (data.status as 'active' | 'inactive') ?? 'active',
      address: data.address,
      phone: data.phone,
      email: data.email,
    };
    previewSessionData.branches.push(newBranch as any);
    return { item: newBranch, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateBranch(id: string, data: Partial<BranchViewModel>): Promise<UpdateResult<BranchViewModel>> {
    await previewDelay();
    const idx = previewSessionData.branches.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Branch not found');
    previewSessionData.branches[idx] = { ...previewSessionData.branches[idx], ...data } as any;
    const updated = await this.getBranch(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteBranch(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.branches = previewSessionData.branches.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Sports
  async listSports(params?: ListQueryParams): Promise<ListResult<SportViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.sports.map(s => ({ ...s })));
    return paginate(items, params);
  },

  async getSport(id: string): Promise<SportViewModel | null> {
    await previewDelay();
    return previewSessionData.sports.find(s => s.id === id) ?? null;
  },

  async createSport(data: Partial<SportViewModel>): Promise<CreateResult<SportViewModel>> {
    await previewDelay();
    const newSport = {
      id: genId('sport'),
      name: data.name ?? { en: 'New Sport', ar: 'رياضة جديدة' },
      description: data.description ?? { en: '', ar: '' },
      ageGroups: data.ageGroups ?? [],
      programIds: data.programIds ?? [],
      icon: data.icon ?? 'trophy',
      status: (data.status as 'active' | 'inactive') ?? 'active',
    };
    previewSessionData.sports.push(newSport as any);
    return { item: newSport, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateSport(id: string, data: Partial<SportViewModel>): Promise<UpdateResult<SportViewModel>> {
    await previewDelay();
    const idx = previewSessionData.sports.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Sport not found');
    previewSessionData.sports[idx] = { ...previewSessionData.sports[idx], ...data };
    const updated = await this.getSport(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteSport(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.sports = previewSessionData.sports.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Programs
  async listPrograms(params?: ListQueryParams): Promise<ListResult<ProgramViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.programs.map(p => ({
      id: p.id,
      name: p.name,
      sportId: p.sportId,
      description: p.description,
      ageGroups: [p.ageGroup],
      level: p.level,
      status: 'active' as const,
    })));
    return paginate(items, params);
  },

  async getProgram(id: string): Promise<ProgramViewModel | null> {
    await previewDelay();
    const p = previewSessionData.programs.find(x => x.id === id);
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      sportId: p.sportId,
      description: p.description,
      ageGroups: [p.ageGroup],
      level: p.level,
      status: 'active' as const,
    };
  },

  async createProgram(data: Partial<ProgramViewModel>): Promise<CreateResult<ProgramViewModel>> {
    await previewDelay();
    const newProgram = {
      id: genId('program'),
      name: data.name ?? { en: 'New Program', ar: 'برنامج جديد' },
      sportId: data.sportId ?? 'football',
      description: data.description ?? { en: '', ar: '' },
      ageGroups: data.ageGroups ?? [],
      level: data.level ?? { en: 'Foundation', ar: 'أساسي' },
      status: (data.status as 'active' | 'inactive') ?? 'active',
    };
    previewSessionData.programs.push(newProgram as any);
    return { item: newProgram, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateProgram(id: string, data: Partial<ProgramViewModel>): Promise<UpdateResult<ProgramViewModel>> {
    await previewDelay();
    const idx = previewSessionData.programs.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Program not found');
    previewSessionData.programs[idx] = { ...previewSessionData.programs[idx], ...data } as any;
    const updated = await this.getProgram(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteProgram(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.programs = previewSessionData.programs.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Training Groups
  async listGroups(params?: ListQueryParams): Promise<ListResult<TrainingGroupViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.groups.map(g => ({
      id: g.id,
      sportId: g.sportId,
      name: g.name,
      ageGroup: g.ageGroup,
      level: g.level,
      playerCount: demoPlayers.filter(p => p.groupId === g.id).length,
      coachCount: g.coachIds.length,
      programIds: g.programIds,
      status: g.status,
    })));
    return paginate(items, params);
  },

  async getGroup(id: string): Promise<TrainingGroupViewModel | null> {
    await previewDelay();
    const g = previewSessionData.groups.find(x => x.id === id);
    if (!g) return null;
    return {
      id: g.id,
      sportId: g.sportId,
      name: g.name,
      ageGroup: g.ageGroup,
      level: g.level,
      playerCount: demoPlayers.filter(p => p.groupId === g.id).length,
      coachCount: g.coachIds.length,
      programIds: g.programIds,
      status: g.status,
    };
  },

  async createGroup(data: Partial<TrainingGroupViewModel>): Promise<CreateResult<TrainingGroupViewModel>> {
    await previewDelay();
    const newGroup = {
      id: genId('group'),
      sportId: data.sportId ?? 'football',
      name: data.name ?? { en: 'New Group', ar: 'مجموعة جديدة' },
      ageGroup: data.ageGroup ?? { en: 'U12', ar: 'تحت 12' },
      level: data.level ?? { en: 'Foundation', ar: 'أساسي' },
      playerCount: 0,
      coachCount: 0,
      programIds: data.programIds ?? [],
      status: (data.status as 'active' | 'inactive') ?? 'active',
    };
    previewSessionData.groups.push(newGroup as any);
    return { item: newGroup, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateGroup(id: string, data: Partial<TrainingGroupViewModel>): Promise<UpdateResult<TrainingGroupViewModel>> {
    await previewDelay();
    const idx = previewSessionData.groups.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Group not found');
    previewSessionData.groups[idx] = { ...previewSessionData.groups[idx], ...data } as any;
    const updated = await this.getGroup(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteGroup(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.groups = previewSessionData.groups.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Players
  async listPlayers(params?: ListQueryParams): Promise<ListResult<PlayerViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.players.map(p => ({
      id: p.id,
      photo: p.photo,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      sportId: p.sportId,
      groupId: p.groupId,
      programId: p.programId,
      age: p.age,
      level: p.level,
      status: p.status,
      attendanceRate: Math.round(((p.attendanceSummary?.attended ?? 0) / (p.attendanceSummary?.scheduled || 1)) * 100),
      performanceScore: getPlayerOverall(p.id),
    })));
    return paginate(items, params);
  },

  async getPlayer(id: string): Promise<PlayerViewModel | null> {
    await previewDelay();
    const p = previewSessionData.players.find(x => x.id === id);
    if (!p) return null;
    return {
      id: p.id,
      photo: p.photo,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      sportId: p.sportId,
      groupId: p.groupId,
      programId: p.programId,
      age: p.age,
      level: p.level,
      status: p.status,
      attendanceRate: Math.round(((p.attendanceSummary?.attended ?? 0) / (p.attendanceSummary?.scheduled || 1)) * 100),
      performanceScore: getPlayerOverall(p.id),
    };
  },

  async createPlayer(data: Partial<PlayerViewModel>): Promise<CreateResult<PlayerViewModel>> {
    await previewDelay();
    const newPlayer = {
      id: genId('player'),
      photo: data.photo,
      nameEn: data.nameEn ?? 'New Player',
      nameAr: data.nameAr ?? 'لاعب جديد',
      sportId: data.sportId ?? 'football',
      groupId: data.groupId,
      programId: data.programId,
      age: data.age,
      level: data.level ?? { en: 'Beginner', ar: 'مبتدئ' },
      status: data.status ?? { en: 'Active', ar: 'نشط' },
      attendanceRate: 0,
      performanceScore: 0,
    };
    previewSessionData.players.push(newPlayer as any);
    return { item: newPlayer, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updatePlayer(id: string, data: Partial<PlayerViewModel>): Promise<UpdateResult<PlayerViewModel>> {
    await previewDelay();
    const idx = previewSessionData.players.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Player not found');
    previewSessionData.players[idx] = { ...previewSessionData.players[idx], ...data } as any;
    const updated = await this.getPlayer(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deletePlayer(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.players = previewSessionData.players.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Coaches
  async listCoaches(params?: ListQueryParams): Promise<ListResult<CoachViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.coaches.map(c => ({
      id: c.id,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      sportIds: c.sportIds,
      branchIds: c.branchIds,
      groupIds: c.groupIds,
      playerCount: demoPlayers.filter(p => c.playerIds.includes(p.id)).length,
      specializations: c.specializations,
      certifications: c.certifications,
      status: c.status,
    })));
    return paginate(items, params);
  },

  async getCoach(id: string): Promise<CoachViewModel | null> {
    await previewDelay();
    const c = previewSessionData.coaches.find(x => x.id === id);
    if (!c) return null;
    return {
      id: c.id,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      sportIds: c.sportIds,
      branchIds: c.branchIds,
      groupIds: c.groupIds,
      playerCount: demoPlayers.filter(p => c.playerIds.includes(p.id)).length,
      specializations: c.specializations,
      certifications: c.certifications,
      status: c.status,
    };
  },

  async createCoach(data: Partial<CoachViewModel>): Promise<CreateResult<CoachViewModel>> {
    await previewDelay();
    const newCoach = {
      id: genId('coach'),
      nameEn: data.nameEn ?? 'New Coach',
      nameAr: data.nameAr ?? 'مدرب جديد',
      sportIds: data.sportIds ?? [],
      branchIds: data.branchIds ?? [],
      groupIds: data.groupIds ?? [],
      playerCount: 0,
      specializations: data.specializations ?? [],
      certifications: data.certifications ?? [],
      status: (data.status as 'active' | 'inactive') ?? 'active',
    };
    previewSessionData.coaches.push(newCoach as any);
    return { item: newCoach, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateCoach(id: string, data: Partial<CoachViewModel>): Promise<UpdateResult<CoachViewModel>> {
    await previewDelay();
    const idx = previewSessionData.coaches.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Coach not found');
    previewSessionData.coaches[idx] = { ...previewSessionData.coaches[idx], ...data } as any;
    const updated = await this.getCoach(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteCoach(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.coaches = previewSessionData.coaches.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Parents
  async listParents(params?: ListQueryParams): Promise<ListResult<ParentViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.parents.map(p => ({
      id: p.id,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      playerIds: p.playerIds,
      playerCount: p.playerIds.length,
      preferredLanguage: p.preferredLanguage,
      status: p.status,
      phone: p.phone,
      email: p.email,
    })));
    return paginate(items, params);
  },

  async getParent(id: string): Promise<ParentViewModel | null> {
    await previewDelay();
    const p = previewSessionData.parents.find(x => x.id === id);
    if (!p) return null;
    return {
      id: p.id,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      playerIds: p.playerIds,
      playerCount: p.playerIds.length,
      preferredLanguage: p.preferredLanguage,
      status: p.status,
      phone: p.phone,
      email: p.email,
    };
  },

  async createParent(data: Partial<ParentViewModel>): Promise<CreateResult<ParentViewModel>> {
    await previewDelay();
    const newParent = {
      id: genId('parent'),
      nameEn: data.nameEn ?? 'New Parent',
      nameAr: data.nameAr ?? 'ولي أمر جديد',
      playerIds: data.playerIds ?? [],
      playerCount: (data.playerIds?.length ?? 0),
      preferredLanguage: data.preferredLanguage ?? 'en',
      status: (data.status as 'active' | 'inactive') ?? 'active',
      phone: data.phone,
      email: data.email,
    };
    previewSessionData.parents.push(newParent as any);
    return { item: newParent, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateParent(id: string, data: Partial<ParentViewModel>): Promise<UpdateResult<ParentViewModel>> {
    await previewDelay();
    const idx = previewSessionData.parents.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Parent not found');
    previewSessionData.parents[idx] = { ...previewSessionData.parents[idx], ...data } as any;
    const updated = await this.getParent(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteParent(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.parents = previewSessionData.parents.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Sessions
  async listSessions(params?: ListQueryParams): Promise<ListResult<SessionViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.sessions.map(s => ({ ...s, coachIds: [] })));
    return paginate(items, params);
  },

  async getSession(id: string): Promise<SessionViewModel | null> {
    await previewDelay();
    const s = previewSessionData.sessions.find(x => x.id === id);
    if (!s) return null;
    return { ...s, coachIds: [] };
  },

  async createSession(data: Partial<SessionViewModel>): Promise<CreateResult<SessionViewModel>> {
    await previewDelay();
    const newSession = {
      id: genId('session'),
      sportId: data.sportId ?? 'football',
      groupId: data.groupId ?? 'football-demo-u12',
      startsAt: data.startsAt ?? new Date().toISOString(),
      status: data.status ?? { en: 'Scheduled', ar: 'مجدول' },
      coachIds: data.coachIds ?? [],
    };
    previewSessionData.sessions.push(newSession as any);
    return { item: newSession, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateSession(id: string, data: Partial<SessionViewModel>): Promise<UpdateResult<SessionViewModel>> {
    await previewDelay();
    const idx = previewSessionData.sessions.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Session not found');
    previewSessionData.sessions[idx] = { ...previewSessionData.sessions[idx], ...data } as any;
    const updated = await this.getSession(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteSession(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.sessions = previewSessionData.sessions.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Subscriptions
  async listSubscriptions(params?: ListQueryParams): Promise<ListResult<SubscriptionViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.subscriptions);
    return paginate(items, params);
  },

  async getSubscription(id: string): Promise<SubscriptionViewModel | null> {
    await previewDelay();
    return previewSessionData.subscriptions.find(s => s.id === id) ?? null;
  },

  async createSubscription(data: Partial<SubscriptionViewModel>): Promise<CreateResult<SubscriptionViewModel>> {
    await previewDelay();
    const newSub = {
      id: genId('sub'),
      playerId: data.playerId ?? 'player-demo-001',
      programId: data.programId ?? 'program-demo-football-foundation',
      branchId: data.branchId ?? 'branch-workspace-01',
      plan: data.plan ?? { en: 'Monthly', ar: 'شهري' },
      status: (data.status as 'active' | 'pending' | 'expired' | 'cancelled') ?? 'active',
      startDate: data.startDate ?? new Date().toISOString().split('T')[0],
      endDate: data.endDate,
      amount: data.amount ?? 500,
      currency: data.currency ?? 'AED',
    };
    previewSessionData.subscriptions.push(newSub);
    return { item: newSub, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateSubscription(id: string, data: Partial<SubscriptionViewModel>): Promise<UpdateResult<SubscriptionViewModel>> {
    await previewDelay();
    const idx = previewSessionData.subscriptions.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Subscription not found');
    previewSessionData.subscriptions[idx] = { ...previewSessionData.subscriptions[idx], ...data };
    const updated = await this.getSubscription(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteSubscription(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.subscriptions = previewSessionData.subscriptions.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Payments
  async listPayments(params?: ListQueryParams): Promise<ListResult<PaymentViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.payments);
    return paginate(items, params);
  },

  async getPayment(id: string): Promise<PaymentViewModel | null> {
    await previewDelay();
    return previewSessionData.payments.find(p => p.id === id) ?? null;
  },

  async createPayment(data: Partial<PaymentViewModel>): Promise<CreateResult<PaymentViewModel>> {
    await previewDelay();
    const newPayment = {
      id: genId('pay'),
      subscriptionId: data.subscriptionId ?? 'sub-demo-001',
      playerId: data.playerId ?? 'player-demo-001',
      amount: data.amount ?? 500,
      currency: data.currency ?? 'AED',
      status: (data.status as 'completed' | 'pending' | 'failed' | 'refunded') ?? 'completed',
      paidAt: data.paidAt ?? new Date().toISOString(),
      method: data.method ?? { en: 'Card', ar: 'بطاقة' },
      reference: data.reference,
    };
    previewSessionData.payments.push(newPayment);
    return { item: newPayment, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updatePayment(id: string, data: Partial<PaymentViewModel>): Promise<UpdateResult<PaymentViewModel>> {
    await previewDelay();
    const idx = previewSessionData.payments.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Payment not found');
    previewSessionData.payments[idx] = { ...previewSessionData.payments[idx], ...data };
    const updated = await this.getPayment(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deletePayment(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.payments = previewSessionData.payments.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Reports
  async listReports(params?: ListQueryParams): Promise<ListResult<ReportViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.reports);
    return paginate(items, params);
  },

  async getReport(id: string): Promise<ReportViewModel | null> {
    await previewDelay();
    return previewSessionData.reports.find(r => r.id === id) ?? null;
  },

  async generateReport(type: string): Promise<CreateResult<ReportViewModel>> {
    await previewDelay();
    const newReport = {
      id: genId('report'),
      title: { en: `${type} Report`, ar: `تقرير ${type}` },
      type: { en: type, ar: type },
      generatedAt: new Date().toISOString(),
      status: 'ready' as const,
    };
    previewSessionData.reports.push(newReport);
    return { item: newReport, message: 'Report generated in preview. | تم إنشاء التقرير في المعاينة.' };
  },

  // Content
  async listContent(params?: ListQueryParams): Promise<ListResult<ContentViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.content);
    return paginate(items, params);
  },

  async getContent(id: string): Promise<ContentViewModel | null> {
    await previewDelay();
    return previewSessionData.content.find(c => c.id === id) ?? null;
  },

  async createContent(data: Partial<ContentViewModel>): Promise<CreateResult<ContentViewModel>> {
    await previewDelay();
    const newContent = {
      id: genId('content'),
      title: data.title ?? { en: 'New Content', ar: 'محتوى جديد' },
      type: data.type ?? { en: 'Article', ar: 'مقال' },
      status: (data.status as 'published' | 'draft' | 'archived') ?? 'draft',
      updatedAt: new Date().toISOString(),
    };
    previewSessionData.content.push(newContent);
    return { item: newContent, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateContent(id: string, data: Partial<ContentViewModel>): Promise<UpdateResult<ContentViewModel>> {
    await previewDelay();
    const idx = previewSessionData.content.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Content not found');
    previewSessionData.content[idx] = { ...previewSessionData.content[idx], ...data, updatedAt: new Date().toISOString() };
    const updated = await this.getContent(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteContent(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.content = previewSessionData.content.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Users & Roles
  async listUsers(params?: ListQueryParams): Promise<ListResult<UserViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.users);
    return paginate(items, params);
  },

  async getUser(id: string): Promise<UserViewModel | null> {
    await previewDelay();
    return previewSessionData.users.find(u => u.id === id) ?? null;
  },

  async createUser(data: Partial<UserViewModel>): Promise<CreateResult<UserViewModel>> {
    await previewDelay();
    const newUser = {
      id: genId('user'),
      name: data.name ?? { en: 'New User', ar: 'مستخدم جديد' },
      email: data.email ?? 'user@example.com',
      roles: data.roles ?? ['viewer'],
      status: (data.status as 'active' | 'inactive') ?? 'active',
      lastLogin: undefined,
    };
    previewSessionData.users.push(newUser);
    return { item: newUser, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateUser(id: string, data: Partial<UserViewModel>): Promise<UpdateResult<UserViewModel>> {
    await previewDelay();
    const idx = previewSessionData.users.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('User not found');
    previewSessionData.users[idx] = { ...previewSessionData.users[idx], ...data };
    const updated = await this.getUser(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteUser(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.users = previewSessionData.users.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Registrations
  async listRegistrations(params?: ListQueryParams): Promise<ListResult<RegistrationViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.registrations);
    return paginate(items, params);
  },

  async getRegistration(id: string): Promise<RegistrationViewModel | null> {
    await previewDelay();
    return previewSessionData.registrations.find(r => r.id === id) ?? null;
  },

  async createRegistration(data: Partial<RegistrationViewModel>): Promise<CreateResult<RegistrationViewModel>> {
    await previewDelay();
    const newReg = {
      id: genId('reg'),
      playerId: data.playerId ?? 'player-demo-001',
      programId: data.programId ?? 'program-demo-football-foundation',
      groupId: data.groupId,
      status: (data.status as 'pending' | 'confirmed' | 'cancelled' | 'waitlisted') ?? 'pending',
      requestedAt: data.requestedAt ?? new Date().toISOString(),
      confirmedAt: data.confirmedAt,
    };
    previewSessionData.registrations.push(newReg);
    return { item: newReg, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateRegistration(id: string, data: Partial<RegistrationViewModel>): Promise<UpdateResult<RegistrationViewModel>> {
    await previewDelay();
    const idx = previewSessionData.registrations.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Registration not found');
    previewSessionData.registrations[idx] = { ...previewSessionData.registrations[idx], ...data };
    const updated = await this.getRegistration(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteRegistration(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.registrations = previewSessionData.registrations.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Achievements
  async listAchievements(params?: ListQueryParams): Promise<ListResult<AchievementViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.achievements);
    return paginate(items, params);
  },

  async getAchievement(id: string): Promise<AchievementViewModel | null> {
    await previewDelay();
    return previewSessionData.achievements.find(a => a.id === id) ?? null;
  },

  async createAchievement(data: Partial<AchievementViewModel>): Promise<CreateResult<AchievementViewModel>> {
    await previewDelay();
    const newAch = {
      id: genId('ach'),
      title: data.title ?? { en: 'New Achievement', ar: 'إنجاز جديد' },
      description: data.description ?? { en: '', ar: '' },
      category: data.category ?? { en: 'General', ar: 'عام' },
      playerId: data.playerId,
      groupId: data.groupId,
      awardedAt: data.awardedAt ?? new Date().toISOString(),
      status: (data.status as 'awarded' | 'pending' | 'revoked') ?? 'pending',
    };
    previewSessionData.achievements.push(newAch);
    return { item: newAch, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateAchievement(id: string, data: Partial<AchievementViewModel>): Promise<UpdateResult<AchievementViewModel>> {
    await previewDelay();
    const idx = previewSessionData.achievements.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Achievement not found');
    previewSessionData.achievements[idx] = { ...previewSessionData.achievements[idx], ...data };
    const updated = await this.getAchievement(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteAchievement(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.achievements = previewSessionData.achievements.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Events
  async listEvents(params?: ListQueryParams): Promise<ListResult<EventViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.events);
    return paginate(items, params);
  },

  async getEvent(id: string): Promise<EventViewModel | null> {
    await previewDelay();
    return previewSessionData.events.find(e => e.id === id) ?? null;
  },

  async createEvent(data: Partial<EventViewModel>): Promise<CreateResult<EventViewModel>> {
    await previewDelay();
    const newEvent = {
      id: genId('event'),
      title: data.title ?? { en: 'New Event', ar: 'فعالية جديدة' },
      description: data.description ?? { en: '', ar: '' },
      type: data.type ?? { en: 'Tournament', ar: 'بطولة' },
      startDate: data.startDate ?? new Date().toISOString().split('T')[0],
      endDate: data.endDate ?? new Date().toISOString().split('T')[0],
      location: data.location,
      status: (data.status as 'scheduled' | 'ongoing' | 'completed' | 'cancelled') ?? 'scheduled',
    };
    previewSessionData.events.push(newEvent);
    return { item: newEvent, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateEvent(id: string, data: Partial<EventViewModel>): Promise<UpdateResult<EventViewModel>> {
    await previewDelay();
    const idx = previewSessionData.events.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Event not found');
    previewSessionData.events[idx] = { ...previewSessionData.events[idx], ...data };
    const updated = await this.getEvent(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteEvent(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.events = previewSessionData.events.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Announcements
  async listAnnouncements(params?: ListQueryParams): Promise<ListResult<AnnouncementViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.announcements);
    return paginate(items, params);
  },

  async getAnnouncement(id: string): Promise<AnnouncementViewModel | null> {
    await previewDelay();
    return previewSessionData.announcements.find(a => a.id === id) ?? null;
  },

  async createAnnouncement(data: Partial<AnnouncementViewModel>): Promise<CreateResult<AnnouncementViewModel>> {
    await previewDelay();
    const newAnn = {
      id: genId('ann'),
      title: data.title ?? { en: 'New Announcement', ar: 'إعلان جديد' },
      body: data.body ?? { en: '', ar: '' },
      audience: data.audience ?? { en: 'All', ar: 'الجميع' },
      priority: (data.priority as 'low' | 'normal' | 'high' | 'urgent') ?? 'normal',
      publishedAt: data.publishedAt,
      status: (data.status as 'draft' | 'published' | 'archived') ?? 'draft',
    };
    previewSessionData.announcements.push(newAnn);
    return { item: newAnn, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateAnnouncement(id: string, data: Partial<AnnouncementViewModel>): Promise<UpdateResult<AnnouncementViewModel>> {
    await previewDelay();
    const idx = previewSessionData.announcements.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Announcement not found');
    previewSessionData.announcements[idx] = { ...previewSessionData.announcements[idx], ...data };
    const updated = await this.getAnnouncement(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteAnnouncement(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.announcements = previewSessionData.announcements.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Messages
  async listMessages(params?: ListQueryParams): Promise<ListResult<MessageViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.messages);
    return paginate(items, params);
  },

  async getMessage(id: string): Promise<MessageViewModel | null> {
    await previewDelay();
    return previewSessionData.messages.find(m => m.id === id) ?? null;
  },

  async createMessage(data: Partial<MessageViewModel>): Promise<CreateResult<MessageViewModel>> {
    await previewDelay();
    const newMsg = {
      id: genId('msg'),
      fromId: data.fromId ?? 'admin',
      toIds: data.toIds ?? [],
      subject: data.subject ?? { en: 'New Message', ar: 'رسالة جديدة' },
      body: data.body ?? { en: '', ar: '' },
      sentAt: data.sentAt ?? new Date().toISOString(),
      readAt: data.readAt,
      status: (data.status as 'sent' | 'delivered' | 'read' | 'failed') ?? 'sent',
    };
    previewSessionData.messages.push(newMsg);
    return { item: newMsg, message: 'Created in preview session. | تم الإنشاء في جلسة المعاينة.' };
  },

  async updateMessage(id: string, data: Partial<MessageViewModel>): Promise<UpdateResult<MessageViewModel>> {
    await previewDelay();
    const idx = previewSessionData.messages.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Message not found');
    previewSessionData.messages[idx] = { ...previewSessionData.messages[idx], ...data };
    const updated = await this.getMessage(id);
    return { item: updated!, message: 'Updated in preview data. | تم التحديث في بيانات المعاينة.' };
  },

  async deleteMessage(id: string): Promise<DeleteResult> {
    await previewDelay();
    previewSessionData.messages = previewSessionData.messages.filter(x => x.id !== id);
    return { success: true, message: 'Archived in preview data. | تمت الأرشفة في بيانات المعاينة.' };
  },

  // Audit Activity
  async listAuditActivity(params?: ListQueryParams): Promise<ListResult<AuditActivityViewModel>> {
    await previewDelay();
    const items = filterAndSort(previewSessionData.auditActivity);
    return paginate(items, params);
  },

  async getAuditActivity(id: string): Promise<AuditActivityViewModel | null> {
    await previewDelay();
    return previewSessionData.auditActivity.find(a => a.id === id) ?? null;
  },
};

export function resetPreviewData() {
  previewSessionData = {
    countries: [...demoCountries],
    branches: [...demoBranches],
    coaches: [...demoCoaches],
    parents: [...demoParents],
    players: [...demoPlayers],
    sessions: [...demoSessions],
    sports: [...demoSports],
    programs: [...demoPrograms],
    groups: [...demoTrainingGroups],
    subscriptions: [...previewSubscriptions],
    payments: [...previewPayments],
    reports: [...previewReports],
    content: [...previewContent],
    users: [...previewUsers],
    registrations: [...previewRegistrations],
    achievements: [...previewAchievements],
    events: [...previewEvents],
    announcements: [...previewAnnouncements],
    messages: [...previewMessages],
    auditActivity: [...previewAuditActivity],
  };
}
