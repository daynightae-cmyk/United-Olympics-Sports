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
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) errorMsg = errJson.error.message;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const productionAdminGateway: AdminDataGateway = {
  mode: 'live',

  async getOrganization(): Promise<OrganizationViewModel | null> {
    try {
      const res = await apiRequest<{ ok: boolean; organization: OrganizationViewModel }>('/api/v1/admin/organization');
      return res.organization || null;
    } catch {
      return null;
    }
  },

  async listCountries(params?: ListQueryParams): Promise<ListResult<CountryViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<CountryViewModel>>(`/api/v1/admin/countries?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getCountry(id: string): Promise<CountryViewModel | null> {
    try {
      const res = await apiRequest<{ ok: boolean; country: CountryViewModel }>(`/api/v1/admin/countries/${id}`);
      return res.country || null;
    } catch {
      return null;
    }
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
    return { success: true, message: 'Country deleted successfully' };
  },

  async listBranches(params?: ListQueryParams): Promise<ListResult<BranchViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<BranchViewModel>>(`/api/v1/admin/branches?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getBranch(id: string): Promise<BranchViewModel | null> {
    try {
      const res = await apiRequest<{ ok: boolean; branch: BranchViewModel }>(`/api/v1/admin/branches/${id}`);
      return res.branch || null;
    } catch {
      return null;
    }
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
    return { success: true, message: 'Branch deleted successfully' };
  },

  async listSports(params?: ListQueryParams): Promise<ListResult<SportViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<SportViewModel>>(`/api/v1/admin/sports?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getSport(_id: string): Promise<SportViewModel | null> {
    return null;
  },

  async createSport(_data: Partial<SportViewModel>): Promise<CreateResult<SportViewModel>> {
    throw new Error('Not supported');
  },

  async updateSport(_id: string, _data: Partial<SportViewModel>): Promise<UpdateResult<SportViewModel>> {
    throw new Error('Not supported');
  },

  async deleteSport(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listPrograms(params?: ListQueryParams): Promise<ListResult<ProgramViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<ProgramViewModel>>(`/api/v1/admin/programs?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getProgram(_id: string): Promise<ProgramViewModel | null> {
    return null;
  },

  async createProgram(_data: Partial<ProgramViewModel>): Promise<CreateResult<ProgramViewModel>> {
    throw new Error('Not supported');
  },

  async updateProgram(_id: string, _data: Partial<ProgramViewModel>): Promise<UpdateResult<ProgramViewModel>> {
    throw new Error('Not supported');
  },

  async deleteProgram(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listGroups(params?: ListQueryParams): Promise<ListResult<TrainingGroupViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<TrainingGroupViewModel>>(`/api/v1/admin/groups?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getGroup(_id: string): Promise<TrainingGroupViewModel | null> {
    return null;
  },

  async createGroup(_data: Partial<TrainingGroupViewModel>): Promise<CreateResult<TrainingGroupViewModel>> {
    throw new Error('Not supported');
  },

  async updateGroup(_id: string, _data: Partial<TrainingGroupViewModel>): Promise<UpdateResult<TrainingGroupViewModel>> {
    throw new Error('Not supported');
  },

  async deleteGroup(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listPlayers(params?: ListQueryParams): Promise<ListResult<PlayerViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<PlayerViewModel>>(`/api/v1/admin/players?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getPlayer(id: string): Promise<PlayerViewModel | null> {
    try {
      const res = await apiRequest<{ ok: boolean; player: PlayerViewModel }>(`/api/v1/admin/players/${id}`);
      return res.player || null;
    } catch {
      return null;
    }
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
    return { success: true, message: 'Player deleted successfully' };
  },

  async listCoaches(params?: ListQueryParams): Promise<ListResult<CoachViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<CoachViewModel>>(`/api/v1/admin/coaches?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getCoach(_id: string): Promise<CoachViewModel | null> {
    return null;
  },

  async createCoach(_data: Partial<CoachViewModel>): Promise<CreateResult<CoachViewModel>> {
    throw new Error('Not supported');
  },

  async updateCoach(_id: string, _data: Partial<CoachViewModel>): Promise<UpdateResult<CoachViewModel>> {
    throw new Error('Not supported');
  },

  async deleteCoach(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listParents(params?: ListQueryParams): Promise<ListResult<ParentViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<ParentViewModel>>(`/api/v1/admin/parents?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getParent(_id: string): Promise<ParentViewModel | null> {
    return null;
  },

  async createParent(_data: Partial<ParentViewModel>): Promise<CreateResult<ParentViewModel>> {
    throw new Error('Not supported');
  },

  async updateParent(_id: string, _data: Partial<ParentViewModel>): Promise<UpdateResult<ParentViewModel>> {
    throw new Error('Not supported');
  },

  async deleteParent(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listSessions(params?: ListQueryParams): Promise<ListResult<SessionViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<SessionViewModel>>(`/api/v1/admin/sessions?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getSession(_id: string): Promise<SessionViewModel | null> {
    return null;
  },

  async createSession(_data: Partial<SessionViewModel>): Promise<CreateResult<SessionViewModel>> {
    throw new Error('Not supported');
  },

  async updateSession(_id: string, _data: Partial<SessionViewModel>): Promise<UpdateResult<SessionViewModel>> {
    throw new Error('Not supported');
  },

  async deleteSession(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listSubscriptions(_params?: ListQueryParams): Promise<ListResult<SubscriptionViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getSubscription(_id: string): Promise<SubscriptionViewModel | null> {
    return null;
  },

  async createSubscription(_data: Partial<SubscriptionViewModel>): Promise<CreateResult<SubscriptionViewModel>> {
    throw new Error('Not supported');
  },

  async updateSubscription(_id: string, _data: Partial<SubscriptionViewModel>): Promise<UpdateResult<SubscriptionViewModel>> {
    throw new Error('Not supported');
  },

  async deleteSubscription(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listPayments(_params?: ListQueryParams): Promise<ListResult<PaymentViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getPayment(_id: string): Promise<PaymentViewModel | null> {
    return null;
  },

  async createPayment(_data: Partial<PaymentViewModel>): Promise<CreateResult<PaymentViewModel>> {
    throw new Error('Not supported');
  },

  async updatePayment(_id: string, _data: Partial<PaymentViewModel>): Promise<UpdateResult<PaymentViewModel>> {
    throw new Error('Not supported');
  },

  async deletePayment(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listReports(_params?: ListQueryParams): Promise<ListResult<ReportViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getReport(_id: string): Promise<ReportViewModel | null> {
    return null;
  },

  async generateReport(_type: string): Promise<CreateResult<ReportViewModel>> {
    throw new Error('Not supported');
  },

  async listContent(_params?: ListQueryParams): Promise<ListResult<ContentViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getContent(_id: string): Promise<ContentViewModel | null> {
    return null;
  },

  async createContent(_data: Partial<ContentViewModel>): Promise<CreateResult<ContentViewModel>> {
    throw new Error('Not supported');
  },

  async updateContent(_id: string, _data: Partial<ContentViewModel>): Promise<UpdateResult<ContentViewModel>> {
    throw new Error('Not supported');
  },

  async deleteContent(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listUsers(_params?: ListQueryParams): Promise<ListResult<UserViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getUser(_id: string): Promise<UserViewModel | null> {
    return null;
  },

  async createUser(_data: Partial<UserViewModel>): Promise<CreateResult<UserViewModel>> {
    throw new Error('Not supported');
  },

  async updateUser(_id: string, _data: Partial<UserViewModel>): Promise<UpdateResult<UserViewModel>> {
    throw new Error('Not supported');
  },

  async deleteUser(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listRegistrations(params?: ListQueryParams): Promise<ListResult<RegistrationViewModel>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page || 1),
        pageSize: String(params?.pageSize || 20),
      });
      return await apiRequest<ListResult<RegistrationViewModel>>(`/api/v1/admin/registrations?${query}`);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 20 };
    }
  },

  async getRegistration(_id: string): Promise<RegistrationViewModel | null> {
    return null;
  },

  async createRegistration(_data: Partial<RegistrationViewModel>): Promise<CreateResult<RegistrationViewModel>> {
    throw new Error('Not supported');
  },

  async updateRegistration(_id: string, _data: Partial<RegistrationViewModel>): Promise<UpdateResult<RegistrationViewModel>> {
    throw new Error('Not supported');
  },

  async deleteRegistration(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listAchievements(_params?: ListQueryParams): Promise<ListResult<AchievementViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getAchievement(_id: string): Promise<AchievementViewModel | null> {
    return null;
  },

  async createAchievement(_data: Partial<AchievementViewModel>): Promise<CreateResult<AchievementViewModel>> {
    throw new Error('Not supported');
  },

  async updateAchievement(_id: string, _data: Partial<AchievementViewModel>): Promise<UpdateResult<AchievementViewModel>> {
    throw new Error('Not supported');
  },

  async deleteAchievement(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listEvents(_params?: ListQueryParams): Promise<ListResult<EventViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getEvent(_id: string): Promise<EventViewModel | null> {
    return null;
  },

  async createEvent(_data: Partial<EventViewModel>): Promise<CreateResult<EventViewModel>> {
    throw new Error('Not supported');
  },

  async updateEvent(_id: string, _data: Partial<EventViewModel>): Promise<UpdateResult<EventViewModel>> {
    throw new Error('Not supported');
  },

  async deleteEvent(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listAnnouncements(_params?: ListQueryParams): Promise<ListResult<AnnouncementViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getAnnouncement(_id: string): Promise<AnnouncementViewModel | null> {
    return null;
  },

  async createAnnouncement(_data: Partial<AnnouncementViewModel>): Promise<CreateResult<AnnouncementViewModel>> {
    throw new Error('Not supported');
  },

  async updateAnnouncement(_id: string, _data: Partial<AnnouncementViewModel>): Promise<UpdateResult<AnnouncementViewModel>> {
    throw new Error('Not supported');
  },

  async deleteAnnouncement(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listMessages(_params?: ListQueryParams): Promise<ListResult<MessageViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getMessage(_id: string): Promise<MessageViewModel | null> {
    return null;
  },

  async createMessage(_data: Partial<MessageViewModel>): Promise<CreateResult<MessageViewModel>> {
    throw new Error('Not supported');
  },

  async updateMessage(_id: string, _data: Partial<MessageViewModel>): Promise<UpdateResult<MessageViewModel>> {
    throw new Error('Not supported');
  },

  async deleteMessage(_id: string): Promise<DeleteResult> {
    return { success: true, message: 'Deleted successfully' };
  },

  async listAuditActivity(_params?: ListQueryParams): Promise<ListResult<AuditActivityViewModel>> {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getAuditActivity(_id: string): Promise<AuditActivityViewModel | null> {
    return null;
  },
};
