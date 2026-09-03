import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdminData } from './AdminDataProvider';
import type { ListResult, ListQueryParams } from './queryTypes';
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
  CreateResult,
  UpdateResult,
  DeleteResult,
} from './viewModels';

function useList<T>(fetch: (params?: ListQueryParams) => Promise<ListResult<T>>, initialParams?: ListQueryParams) {
  const fetchRef = useRef(fetch);
  const requestRef = useRef(0);
  const [data, setData] = useState<ListResult<T>>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<ListQueryParams>(initialParams ?? { page: 1, pageSize: 20 });

  useEffect(() => {
    fetchRef.current = fetch;
  }, [fetch]);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setError(null);

    try {
      const result = await fetchRef.current(params);
      if (requestRef.current === requestId) {
        setData(result);
      }
    } catch (e) {
      if (requestRef.current === requestId) {
        setError(e as Error);
      }
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [params]);

  useEffect(() => {
    void load();
    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  return { data, loading, error, params, setParams, refetch: load };
}

function useDetail<T>(fetch: (id: string) => Promise<T | null>, id?: string) {
  const fetchRef = useRef(fetch);
  const requestRef = useRef(0);
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchRef.current = fetch;
  }, [fetch]);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;

    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const result = await fetchRef.current(id);
      if (requestRef.current === requestId) {
        setItem(result);
      }
    } catch (e) {
      if (requestRef.current === requestId) {
        setError(e as Error);
      }
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    void load();
    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  return { item, loading, error, refetch: load };
}

export function useAdminGateway() {
  const { gateway } = useAdminData();
  return gateway;
}

export function useOrganization() {
  const gateway = useAdminGateway();
  return useDetail(gateway.getOrganization.bind(gateway), 'org-united-olympics');
}

export function useCountries(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<CountryViewModel>(gateway.listCountries.bind(gateway), params);
}

export function useCountry(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<CountryViewModel>(gateway.getCountry.bind(gateway), id);
}

export function useCreateCountry() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<CountryViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createCountry(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateCountry() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<CountryViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateCountry(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteCountry() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteCountry(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useBranches(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<BranchViewModel>(gateway.listBranches.bind(gateway), params);
}

export function useBranch(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<BranchViewModel>(gateway.getBranch.bind(gateway), id);
}

export function useCreateBranch() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<BranchViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createBranch(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateBranch() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<BranchViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateBranch(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteBranch() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteBranch(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useSports(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<SportViewModel>(gateway.listSports.bind(gateway), params);
}

export function useSport(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<SportViewModel>(gateway.getSport.bind(gateway), id);
}

export function useCreateSport() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<SportViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createSport(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateSport() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<SportViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateSport(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteSport() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteSport(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function usePrograms(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<ProgramViewModel>(gateway.listPrograms.bind(gateway), params);
}

export function useProgram(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<ProgramViewModel>(gateway.getProgram.bind(gateway), id);
}

export function useCreateProgram() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<ProgramViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createProgram(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateProgram() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<ProgramViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateProgram(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteProgram() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteProgram(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useGroups(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<TrainingGroupViewModel>(gateway.listGroups.bind(gateway), params);
}

export function useGroup(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<TrainingGroupViewModel>(gateway.getGroup.bind(gateway), id);
}

export function useCreateGroup() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<TrainingGroupViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createGroup(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateGroup() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<TrainingGroupViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateGroup(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteGroup() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteGroup(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function usePlayers(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<PlayerViewModel>(gateway.listPlayers.bind(gateway), params);
}

export function usePlayer(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<PlayerViewModel>(gateway.getPlayer.bind(gateway), id);
}

export function useCreatePlayer() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<PlayerViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createPlayer(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdatePlayer() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<PlayerViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updatePlayer(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeletePlayer() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deletePlayer(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useCoaches(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<CoachViewModel>(gateway.listCoaches.bind(gateway), params);
}

export function useCoach(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<CoachViewModel>(gateway.getCoach.bind(gateway), id);
}

export function useCreateCoach() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<CoachViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createCoach(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateCoach() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<CoachViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateCoach(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteCoach() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteCoach(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useParents(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<ParentViewModel>(gateway.listParents.bind(gateway), params);
}

export function useParent(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<ParentViewModel>(gateway.getParent.bind(gateway), id);
}

export function useCreateParent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<ParentViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createParent(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateParent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<ParentViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateParent(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteParent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteParent(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useSessions(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<SessionViewModel>(gateway.listSessions.bind(gateway), params);
}

export function useSession(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<SessionViewModel>(gateway.getSession.bind(gateway), id);
}

export function useCreateSession() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<SessionViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createSession(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateSession() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<SessionViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateSession(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteSession() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteSession(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useSubscriptions(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<SubscriptionViewModel>(gateway.listSubscriptions.bind(gateway), params);
}

export function useSubscription(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<SubscriptionViewModel>(gateway.getSubscription.bind(gateway), id);
}

export function useCreateSubscription() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<SubscriptionViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createSubscription(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateSubscription() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<SubscriptionViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateSubscription(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteSubscription() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteSubscription(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function usePayments(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<PaymentViewModel>(gateway.listPayments.bind(gateway), params);
}

export function usePayment(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<PaymentViewModel>(gateway.getPayment.bind(gateway), id);
}

export function useCreatePayment() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<PaymentViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createPayment(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdatePayment() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<PaymentViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updatePayment(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeletePayment() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deletePayment(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useReports(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<ReportViewModel>(gateway.listReports.bind(gateway), params);
}

export function useReport(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<ReportViewModel>(gateway.getReport.bind(gateway), id);
}

export function useGenerateReport() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const generate = useCallback(async (type: string) => {
    setLoading(true);
    try {
      return await gateway.generateReport(type);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { generate, loading };
}

export function useContent(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<ContentViewModel>(gateway.listContent.bind(gateway), params);
}

export function useContentItem(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<ContentViewModel>(gateway.getContent.bind(gateway), id);
}

export function useCreateContent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<ContentViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createContent(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateContent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<ContentViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateContent(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteContent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteContent(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useUsers(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<UserViewModel>(gateway.listUsers.bind(gateway), params);
}

export function useUser(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<UserViewModel>(gateway.getUser.bind(gateway), id);
}

export function useCreateUser() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<UserViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createUser(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateUser() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<UserViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateUser(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteUser() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteUser(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useRegistrations(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<RegistrationViewModel>(gateway.listRegistrations.bind(gateway), params);
}

export function useRegistration(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<RegistrationViewModel>(gateway.getRegistration.bind(gateway), id);
}

export function useCreateRegistration() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<RegistrationViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createRegistration(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateRegistration() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<RegistrationViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateRegistration(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteRegistration() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteRegistration(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useAchievements(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<AchievementViewModel>(gateway.listAchievements.bind(gateway), params);
}

export function useAchievement(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<AchievementViewModel>(gateway.getAchievement.bind(gateway), id);
}

export function useCreateAchievement() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<AchievementViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createAchievement(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateAchievement() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<AchievementViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateAchievement(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteAchievement() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteAchievement(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useEvents(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<EventViewModel>(gateway.listEvents.bind(gateway), params);
}

export function useEvent(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<EventViewModel>(gateway.getEvent.bind(gateway), id);
}

export function useCreateEvent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<EventViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createEvent(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateEvent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<EventViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateEvent(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteEvent() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteEvent(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useAnnouncements(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<AnnouncementViewModel>(gateway.listAnnouncements.bind(gateway), params);
}

export function useAnnouncement(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<AnnouncementViewModel>(gateway.getAnnouncement.bind(gateway), id);
}

export function useCreateAnnouncement() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<AnnouncementViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createAnnouncement(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateAnnouncement() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<AnnouncementViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateAnnouncement(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteAnnouncement() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteAnnouncement(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useMessages(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<MessageViewModel>(gateway.listMessages.bind(gateway), params);
}

export function useMessage(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<MessageViewModel>(gateway.getMessage.bind(gateway), id);
}

export function useCreateMessage() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (data: Partial<MessageViewModel>) => {
    setLoading(true);
    try {
      return await gateway.createMessage(data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { create, loading };
}

export function useUpdateMessage() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, data: Partial<MessageViewModel>) => {
    setLoading(true);
    try {
      return await gateway.updateMessage(id, data);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { update, loading };
}

export function useDeleteMessage() {
  const gateway = useAdminGateway();
  const [loading, setLoading] = useState(false);
  const deleteFn = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await gateway.deleteMessage(id);
    } finally {
      setLoading(false);
    }
  }, [gateway]);
  return { delete: deleteFn, loading };
}

export function useAuditActivity(params?: ListQueryParams) {
  const gateway = useAdminGateway();
  return useList<AuditActivityViewModel>(gateway.listAuditActivity.bind(gateway), params);
}

export function useAuditActivityItem(id?: string) {
  const gateway = useAdminGateway();
  return useDetail<AuditActivityViewModel>(gateway.getAuditActivity.bind(gateway), id);
}