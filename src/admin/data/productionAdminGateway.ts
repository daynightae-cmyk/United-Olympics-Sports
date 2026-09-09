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

export class AdminGatewayError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AdminGatewayError';
    this.status = status;
    this.code = code;
  }
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token =
    localStorage.getItem('uos:auth:token') ||
    sessionStorage.getItem('uos:auth:token') ||
    localStorage.getItem('sb-access-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options?.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    let errorCode = `HTTP_${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) errorMsg = errJson.error.message;
      if (errJson?.error?.code) errorCode = errJson.error.code;
    } catch {
      // ignore
    }
    throw new AdminGatewayError(res.status, errorCode, errorMsg);
  }
  return res.json() as Promise<T>;
}

async function getOrNull<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AdminGatewayError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export const productionAdminGateway: AdminDataGateway = {
  mode: 'live',

  // --- 1. ORGANIZATION ---
  async getOrganization(): Promise<OrganizationViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; organization: OrganizationViewModel }>('/api/v1/admin/organization');
      return res.organization || null;
    });
  },

  // --- 2. COUNTRIES ---
  async listCountries(params?: ListQueryParams): Promise<ListResult<CountryViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<CountryViewModel>>(`/api/v1/admin/countries?${query}`);
  },

  async getCountry(id: string): Promise<CountryViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; country: CountryViewModel }>(`/api/v1/admin/countries/${id}`);
      return res.country || null;
    });
  },

  async createCountry(data: Partial<CountryViewModel>): Promise<CreateResult<CountryViewModel>> {
    const res = await apiRequest<{ ok: boolean; country: CountryViewModel }>('/api/v1/admin/countries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { item: res.country, message: 'Country created successfully' };
  },

  async updateCountry(id: string, data: Partial<CountryViewModel>): Promise<UpdateResult<CountryViewModel>> {
    const res = await apiRequest<{ ok: boolean; country: CountryViewModel }>(`/api/v1/admin/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { item: res.country, message: 'Country updated successfully' };
  },

  async deleteCountry(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Country deletion is disabled in production to preserve relational integrity');
  },

  // --- 3. BRANCHES ---
  async listBranches(params?: ListQueryParams): Promise<ListResult<BranchViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<BranchViewModel>>(`/api/v1/admin/branches?${query}`);
  },

  async getBranch(id: string): Promise<BranchViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; branch: BranchViewModel }>(`/api/v1/admin/branches/${id}`);
      return res.branch || null;
    });
  },

  async createBranch(data: Partial<BranchViewModel>): Promise<CreateResult<BranchViewModel>> {
    const res = await apiRequest<{ ok: boolean; branch: BranchViewModel }>('/api/v1/admin/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { item: res.branch, message: 'Branch created successfully' };
  },

  async updateBranch(id: string, data: Partial<BranchViewModel>): Promise<UpdateResult<BranchViewModel>> {
    const res = await apiRequest<{ ok: boolean; branch: BranchViewModel }>(`/api/v1/admin/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { item: res.branch, message: 'Branch updated successfully' };
  },

  async deleteBranch(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Branch deletion is disabled in production to preserve relational integrity');
  },

  // --- 4. SPORTS ---
  async listSports(params?: ListQueryParams): Promise<ListResult<SportViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<SportViewModel>>(`/api/v1/admin/sports?${query}`);
  },

  async getSport(id: string): Promise<SportViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; sport: SportViewModel }>(`/api/v1/admin/sports/${id}`);
      return res.sport || null;
    });
  },

  async createSport(_data: Partial<SportViewModel>): Promise<CreateResult<SportViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Sport creation is codified by Olympic curriculums and managed via migration');
  },

  async updateSport(_id: string, _data: Partial<SportViewModel>): Promise<UpdateResult<SportViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Sport updates are managed via system migration');
  },

  async deleteSport(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Sport deletion is not supported in production API');
  },

  // --- 5. PROGRAMS ---
  async listPrograms(params?: ListQueryParams): Promise<ListResult<ProgramViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<ProgramViewModel>>(`/api/v1/admin/programs?${query}`);
  },

  async getProgram(id: string): Promise<ProgramViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; program: ProgramViewModel }>(`/api/v1/admin/programs/${id}`);
      return res.program || null;
    });
  },

  async createProgram(_data: Partial<ProgramViewModel>): Promise<CreateResult<ProgramViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Program creation is managed via system migrations');
  },

  async updateProgram(_id: string, _data: Partial<ProgramViewModel>): Promise<UpdateResult<ProgramViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Program updates are managed via system migrations');
  },

  async deleteProgram(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Program deletion is not supported in production API');
  },

  // --- 6. TRAINING GROUPS ---
  async listGroups(params?: ListQueryParams): Promise<ListResult<TrainingGroupViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<TrainingGroupViewModel>>(`/api/v1/admin/groups?${query}`);
  },

  async getGroup(id: string): Promise<TrainingGroupViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; group: TrainingGroupViewModel }>(`/api/v1/admin/groups/${id}`);
      return res.group || null;
    });
  },

  async createGroup(_data: Partial<TrainingGroupViewModel>): Promise<CreateResult<TrainingGroupViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Training group creation is managed via system migrations');
  },

  async updateGroup(_id: string, _data: Partial<TrainingGroupViewModel>): Promise<UpdateResult<TrainingGroupViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Training group updates are managed via system migrations');
  },

  async deleteGroup(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Group deletion is not supported in production API');
  },

  // --- 7. PLAYERS ---
  async listPlayers(params?: ListQueryParams): Promise<ListResult<PlayerViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<PlayerViewModel>>(`/api/v1/admin/players?${query}`);
  },

  async getPlayer(id: string): Promise<PlayerViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; player: PlayerViewModel }>(`/api/v1/admin/players/${id}`);
      return res.player || null;
    });
  },

  async createPlayer(data: Partial<PlayerViewModel>): Promise<CreateResult<PlayerViewModel>> {
    const res = await apiRequest<{ ok: boolean; player: PlayerViewModel }>('/api/v1/admin/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { item: res.player, message: 'Player created successfully' };
  },

  async updatePlayer(id: string, data: Partial<PlayerViewModel>): Promise<UpdateResult<PlayerViewModel>> {
    const res = await apiRequest<{ ok: boolean; player: PlayerViewModel }>(`/api/v1/admin/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { item: res.player, message: 'Player updated successfully' };
  },

  async deletePlayer(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Player hard deletion is disabled; player archival must be used for compliance');
  },

  // --- 8. COACHES ---
  async listCoaches(params?: ListQueryParams): Promise<ListResult<CoachViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<CoachViewModel>>(`/api/v1/admin/coaches?${query}`);
  },

  async getCoach(id: string): Promise<CoachViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; coach: CoachViewModel }>(`/api/v1/admin/coaches/${id}`);
      return res.coach || null;
    });
  },

  async createCoach(_data: Partial<CoachViewModel>): Promise<CreateResult<CoachViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Coach onboarding is managed via staff administrative portal');
  },

  async updateCoach(_id: string, _data: Partial<CoachViewModel>): Promise<UpdateResult<CoachViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Coach updates are managed via staff administration');
  },

  async deleteCoach(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Coach deletion is not supported in production API');
  },

  // --- 9. PARENTS ---
  async listParents(params?: ListQueryParams): Promise<ListResult<ParentViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<ParentViewModel>>(`/api/v1/admin/parents?${query}`);
  },

  async getParent(id: string): Promise<ParentViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; parent: ParentViewModel }>(`/api/v1/admin/parents/${id}`);
      return res.parent || null;
    });
  },

  async createParent(_data: Partial<ParentViewModel>): Promise<CreateResult<ParentViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Parent onboarding is managed via guardian link or registration');
  },

  async updateParent(_id: string, _data: Partial<ParentViewModel>): Promise<UpdateResult<ParentViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Parent updates are managed via guardian portal');
  },

  async deleteParent(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Parent deletion is not supported in production API');
  },

  // --- 10. SESSIONS ---
  async listSessions(params?: ListQueryParams): Promise<ListResult<SessionViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<SessionViewModel>>(`/api/v1/admin/sessions?${query}`);
  },

  async getSession(id: string): Promise<SessionViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; session: SessionViewModel }>(`/api/v1/admin/sessions/${id}`);
      return res.session || null;
    });
  },

  async createSession(_data: Partial<SessionViewModel>): Promise<CreateResult<SessionViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Session scheduling is managed via operational timetable');
  },

  async updateSession(_id: string, _data: Partial<SessionViewModel>): Promise<UpdateResult<SessionViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Session updates are managed via operational timetable');
  },

  async deleteSession(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Session deletion is not supported in production API');
  },

  // --- 11. SUBSCRIPTIONS ---
  async listSubscriptions(_params?: ListQueryParams): Promise<ListResult<SubscriptionViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Subscriptions lifecycle requires integrated payment billing gateway');
  },

  async getSubscription(_id: string): Promise<SubscriptionViewModel | null> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Subscription retrieval requires integrated billing gateway');
  },

  async createSubscription(_data: Partial<SubscriptionViewModel>): Promise<CreateResult<SubscriptionViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Subscription creation requires integrated billing gateway');
  },

  async updateSubscription(_id: string, _data: Partial<SubscriptionViewModel>): Promise<UpdateResult<SubscriptionViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Subscription updates require integrated billing gateway');
  },

  async deleteSubscription(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Subscription deletion is not supported in production API');
  },

  // --- 12. PAYMENTS ---
  async listPayments(_params?: ListQueryParams): Promise<ListResult<PaymentViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Payments history requires payment provider webhook reconciliation');
  },

  async getPayment(_id: string): Promise<PaymentViewModel | null> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Payment retrieval requires payment provider boundary');
  },

  async createPayment(_data: Partial<PaymentViewModel>): Promise<CreateResult<PaymentViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Payment creation requires external checkout flow');
  },

  async updatePayment(_id: string, _data: Partial<PaymentViewModel>): Promise<UpdateResult<PaymentViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Payment mutations require payment provider webhooks');
  },

  async deletePayment(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Payment deletion is prohibited by financial compliance regulations');
  },

  // --- 13. REPORTS ---
  async listReports(_params?: ListQueryParams): Promise<ListResult<ReportViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Automated executive analytics reporting engine is scheduled for future release');
  },

  async getReport(_id: string): Promise<ReportViewModel | null> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Automated executive analytics reporting engine is scheduled for future release');
  },

  async generateReport(_type: string): Promise<CreateResult<ReportViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Report generation is not supported in current production tier');
  },

  // --- 14. CONTENT ---
  async listContent(_params?: ListQueryParams): Promise<ListResult<ContentViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Headless CMS content publishing pipeline is disabled in core production data tier');
  },

  async getContent(_id: string): Promise<ContentViewModel | null> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Headless CMS content publishing pipeline is disabled in core production data tier');
  },

  async createContent(_data: Partial<ContentViewModel>): Promise<CreateResult<ContentViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Content publishing is disabled in core production data tier');
  },

  async updateContent(_id: string, _data: Partial<ContentViewModel>): Promise<UpdateResult<ContentViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Content updates are disabled in core production data tier');
  },

  async deleteContent(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Content deletion is disabled in core production data tier');
  },

  // --- 15. USERS & ROLES ---
  async listUsers(_params?: ListQueryParams): Promise<ListResult<UserViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Identity user lifecycle requires Supabase Auth / Auth0 identity provider boundary');
  },

  async getUser(_id: string): Promise<UserViewModel | null> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'User retrieval requires identity provider boundary');
  },

  async createUser(_data: Partial<UserViewModel>): Promise<CreateResult<UserViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'User creation requires identity provider invitation flow');
  },

  async updateUser(_id: string, _data: Partial<UserViewModel>): Promise<UpdateResult<UserViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'User updates require identity provider admin API');
  },

  async deleteUser(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'User deletion requires identity provider boundary revocation');
  },

  // --- 16. REGISTRATIONS ---
  async listRegistrations(params?: ListQueryParams): Promise<ListResult<RegistrationViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<RegistrationViewModel>>(`/api/v1/admin/registrations?${query}`);
  },

  async getRegistration(id: string): Promise<RegistrationViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; registration: RegistrationViewModel }>(`/api/v1/admin/registrations/${id}`);
      return res.registration || null;
    });
  },

  async createRegistration(_data: Partial<RegistrationViewModel>): Promise<CreateResult<RegistrationViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Registrations are submitted via public enquiry forms or portal');
  },

  async updateRegistration(_id: string, _data: Partial<RegistrationViewModel>): Promise<UpdateResult<RegistrationViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Registration updates are managed via enquiry resolution workflows');
  },

  async deleteRegistration(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Registration deletion is not supported in production API');
  },

  // --- 17. ACHIEVEMENTS ---
  async listAchievements(params?: ListQueryParams): Promise<ListResult<AchievementViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<AchievementViewModel>>(`/api/v1/admin/achievements?${query}`);
  },

  async getAchievement(id: string): Promise<AchievementViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; achievement: AchievementViewModel }>(`/api/v1/admin/achievements/${id}`);
      return res.achievement || null;
    });
  },

  async createAchievement(_data: Partial<AchievementViewModel>): Promise<CreateResult<AchievementViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Achievement creation is managed via federation curriculums');
  },

  async updateAchievement(_id: string, _data: Partial<AchievementViewModel>): Promise<UpdateResult<AchievementViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Achievement updates are managed via system migrations');
  },

  async deleteAchievement(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Achievement deletion is not supported in production API');
  },

  // --- 18. EVENTS ---
  async listEvents(params?: ListQueryParams): Promise<ListResult<EventViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<EventViewModel>>(`/api/v1/admin/events?${query}`);
  },

  async getEvent(id: string): Promise<EventViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; event: EventViewModel }>(`/api/v1/admin/events/${id}`);
      return res.event || null;
    });
  },

  async createEvent(_data: Partial<EventViewModel>): Promise<CreateResult<EventViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Event creation is managed via tournament calendar');
  },

  async updateEvent(_id: string, _data: Partial<EventViewModel>): Promise<UpdateResult<EventViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Event updates are managed via tournament calendar');
  },

  async deleteEvent(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Event deletion is not supported in production API');
  },

  // --- 19. ANNOUNCEMENTS ---
  async listAnnouncements(params?: ListQueryParams): Promise<ListResult<AnnouncementViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<AnnouncementViewModel>>(`/api/v1/admin/announcements?${query}`);
  },

  async getAnnouncement(id: string): Promise<AnnouncementViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; announcement: AnnouncementViewModel }>(`/api/v1/admin/announcements/${id}`);
      return res.announcement || null;
    });
  },

  async createAnnouncement(_data: Partial<AnnouncementViewModel>): Promise<CreateResult<AnnouncementViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Announcement creation is managed via communications desk');
  },

  async updateAnnouncement(_id: string, _data: Partial<AnnouncementViewModel>): Promise<UpdateResult<AnnouncementViewModel>> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Announcement updates are managed via communications desk');
  },

  async deleteAnnouncement(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Announcement deletion is not supported in production API');
  },

  // --- 20. MESSAGES ---
  async listMessages(_params?: ListQueryParams): Promise<ListResult<MessageViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Messaging queries require communication gateway provider');
  },

  async getMessage(_id: string): Promise<MessageViewModel | null> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Message retrieval requires communication gateway provider');
  },

  async createMessage(_data: Partial<MessageViewModel>): Promise<CreateResult<MessageViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Message delivery requires external SMS/Email gateway provider');
  },

  async updateMessage(_id: string, _data: Partial<MessageViewModel>): Promise<UpdateResult<MessageViewModel>> {
    throw new AdminGatewayError(501, 'EXTERNAL_PROVIDER_REQUIRED', 'Message status updates require gateway webhooks');
  },

  async deleteMessage(_id: string): Promise<DeleteResult> {
    throw new AdminGatewayError(405, 'CAPABILITY_DISABLED', 'Message deletion is not supported in production API');
  },

  // --- 21. AUDIT ACTIVITY ---
  async listAuditActivity(params?: ListQueryParams): Promise<ListResult<AuditActivityViewModel>> {
    const query = new URLSearchParams({
      page: String(params?.page || 1),
      pageSize: String(params?.pageSize || 20),
    });
    return await apiRequest<ListResult<AuditActivityViewModel>>(`/api/v1/admin/audit?${query}`);
  },

  async getAuditActivity(id: string): Promise<AuditActivityViewModel | null> {
    return await getOrNull(async () => {
      const res = await apiRequest<{ ok: boolean; auditActivity: AuditActivityViewModel }>(`/api/v1/admin/audit/${id}`);
      return res.auditActivity || null;
    });
  },
};
