import type { AdminDataMode } from './queryTypes';
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

export interface AdminDataGateway {
  readonly mode: AdminDataMode;

  // Organization
  getOrganization(): Promise<OrganizationViewModel | null>;

  // Countries
  listCountries(params?: ListQueryParams): Promise<ListResult<CountryViewModel>>;
  getCountry(id: string): Promise<CountryViewModel | null>;
  createCountry(data: Partial<CountryViewModel>): Promise<CreateResult<CountryViewModel>>;
  updateCountry(id: string, data: Partial<CountryViewModel>): Promise<UpdateResult<CountryViewModel>>;
  deleteCountry(id: string): Promise<DeleteResult>;

  // Branches
  listBranches(params?: ListQueryParams): Promise<ListResult<BranchViewModel>>;
  getBranch(id: string): Promise<BranchViewModel | null>;
  createBranch(data: Partial<BranchViewModel>): Promise<CreateResult<BranchViewModel>>;
  updateBranch(id: string, data: Partial<BranchViewModel>): Promise<UpdateResult<BranchViewModel>>;
  deleteBranch(id: string): Promise<DeleteResult>;

  // Sports
  listSports(params?: ListQueryParams): Promise<ListResult<SportViewModel>>;
  getSport(id: string): Promise<SportViewModel | null>;
  createSport(data: Partial<SportViewModel>): Promise<CreateResult<SportViewModel>>;
  updateSport(id: string, data: Partial<SportViewModel>): Promise<UpdateResult<SportViewModel>>;
  deleteSport(id: string): Promise<DeleteResult>;

  // Programs
  listPrograms(params?: ListQueryParams): Promise<ListResult<ProgramViewModel>>;
  getProgram(id: string): Promise<ProgramViewModel | null>;
  createProgram(data: Partial<ProgramViewModel>): Promise<CreateResult<ProgramViewModel>>;
  updateProgram(id: string, data: Partial<ProgramViewModel>): Promise<UpdateResult<ProgramViewModel>>;
  deleteProgram(id: string): Promise<DeleteResult>;

  // Training Groups
  listGroups(params?: ListQueryParams): Promise<ListResult<TrainingGroupViewModel>>;
  getGroup(id: string): Promise<TrainingGroupViewModel | null>;
  createGroup(data: Partial<TrainingGroupViewModel>): Promise<CreateResult<TrainingGroupViewModel>>;
  updateGroup(id: string, data: Partial<TrainingGroupViewModel>): Promise<UpdateResult<TrainingGroupViewModel>>;
  deleteGroup(id: string): Promise<DeleteResult>;

  // Players
  listPlayers(params?: ListQueryParams): Promise<ListResult<PlayerViewModel>>;
  getPlayer(id: string): Promise<PlayerViewModel | null>;
  createPlayer(data: Partial<PlayerViewModel>): Promise<CreateResult<PlayerViewModel>>;
  updatePlayer(id: string, data: Partial<PlayerViewModel>): Promise<UpdateResult<PlayerViewModel>>;
  deletePlayer(id: string): Promise<DeleteResult>;

  // Coaches
  listCoaches(params?: ListQueryParams): Promise<ListResult<CoachViewModel>>;
  getCoach(id: string): Promise<CoachViewModel | null>;
  createCoach(data: Partial<CoachViewModel>): Promise<CreateResult<CoachViewModel>>;
  updateCoach(id: string, data: Partial<CoachViewModel>): Promise<UpdateResult<CoachViewModel>>;
  deleteCoach(id: string): Promise<DeleteResult>;

  // Parents
  listParents(params?: ListQueryParams): Promise<ListResult<ParentViewModel>>;
  getParent(id: string): Promise<ParentViewModel | null>;
  createParent(data: Partial<ParentViewModel>): Promise<CreateResult<ParentViewModel>>;
  updateParent(id: string, data: Partial<ParentViewModel>): Promise<UpdateResult<ParentViewModel>>;
  deleteParent(id: string): Promise<DeleteResult>;

  // Sessions / Schedules
  listSessions(params?: ListQueryParams): Promise<ListResult<SessionViewModel>>;
  getSession(id: string): Promise<SessionViewModel | null>;
  createSession(data: Partial<SessionViewModel>): Promise<CreateResult<SessionViewModel>>;
  updateSession(id: string, data: Partial<SessionViewModel>): Promise<UpdateResult<SessionViewModel>>;
  deleteSession(id: string): Promise<DeleteResult>;

  // Subscriptions
  listSubscriptions(params?: ListQueryParams): Promise<ListResult<SubscriptionViewModel>>;
  getSubscription(id: string): Promise<SubscriptionViewModel | null>;
  createSubscription(data: Partial<SubscriptionViewModel>): Promise<CreateResult<SubscriptionViewModel>>;
  updateSubscription(id: string, data: Partial<SubscriptionViewModel>): Promise<UpdateResult<SubscriptionViewModel>>;
  deleteSubscription(id: string): Promise<DeleteResult>;

  // Payments
  listPayments(params?: ListQueryParams): Promise<ListResult<PaymentViewModel>>;
  getPayment(id: string): Promise<PaymentViewModel | null>;
  createPayment(data: Partial<PaymentViewModel>): Promise<CreateResult<PaymentViewModel>>;
  updatePayment(id: string, data: Partial<PaymentViewModel>): Promise<UpdateResult<PaymentViewModel>>;
  deletePayment(id: string): Promise<DeleteResult>;

  // Reports
  listReports(params?: ListQueryParams): Promise<ListResult<ReportViewModel>>;
  getReport(id: string): Promise<ReportViewModel | null>;
  generateReport(type: string): Promise<CreateResult<ReportViewModel>>;

  // Content
  listContent(params?: ListQueryParams): Promise<ListResult<ContentViewModel>>;
  getContent(id: string): Promise<ContentViewModel | null>;
  createContent(data: Partial<ContentViewModel>): Promise<CreateResult<ContentViewModel>>;
  updateContent(id: string, data: Partial<ContentViewModel>): Promise<UpdateResult<ContentViewModel>>;
  deleteContent(id: string): Promise<DeleteResult>;

  // Users & Roles
  listUsers(params?: ListQueryParams): Promise<ListResult<UserViewModel>>;
  getUser(id: string): Promise<UserViewModel | null>;
  createUser(data: Partial<UserViewModel>): Promise<CreateResult<UserViewModel>>;
  updateUser(id: string, data: Partial<UserViewModel>): Promise<UpdateResult<UserViewModel>>;
  deleteUser(id: string): Promise<DeleteResult>;

  // Registrations
  listRegistrations(params?: ListQueryParams): Promise<ListResult<RegistrationViewModel>>;
  getRegistration(id: string): Promise<RegistrationViewModel | null>;
  createRegistration(data: Partial<RegistrationViewModel>): Promise<CreateResult<RegistrationViewModel>>;
  updateRegistration(id: string, data: Partial<RegistrationViewModel>): Promise<UpdateResult<RegistrationViewModel>>;
  deleteRegistration(id: string): Promise<DeleteResult>;

  // Achievements
  listAchievements(params?: ListQueryParams): Promise<ListResult<AchievementViewModel>>;
  getAchievement(id: string): Promise<AchievementViewModel | null>;
  createAchievement(data: Partial<AchievementViewModel>): Promise<CreateResult<AchievementViewModel>>;
  updateAchievement(id: string, data: Partial<AchievementViewModel>): Promise<UpdateResult<AchievementViewModel>>;
  deleteAchievement(id: string): Promise<DeleteResult>;

  // Events
  listEvents(params?: ListQueryParams): Promise<ListResult<EventViewModel>>;
  getEvent(id: string): Promise<EventViewModel | null>;
  createEvent(data: Partial<EventViewModel>): Promise<CreateResult<EventViewModel>>;
  updateEvent(id: string, data: Partial<EventViewModel>): Promise<UpdateResult<EventViewModel>>;
  deleteEvent(id: string): Promise<DeleteResult>;

  // Announcements
  listAnnouncements(params?: ListQueryParams): Promise<ListResult<AnnouncementViewModel>>;
  getAnnouncement(id: string): Promise<AnnouncementViewModel | null>;
  createAnnouncement(data: Partial<AnnouncementViewModel>): Promise<CreateResult<AnnouncementViewModel>>;
  updateAnnouncement(id: string, data: Partial<AnnouncementViewModel>): Promise<UpdateResult<AnnouncementViewModel>>;
  deleteAnnouncement(id: string): Promise<DeleteResult>;

  // Messages
  listMessages(params?: ListQueryParams): Promise<ListResult<MessageViewModel>>;
  getMessage(id: string): Promise<MessageViewModel | null>;
  createMessage(data: Partial<MessageViewModel>): Promise<CreateResult<MessageViewModel>>;
  updateMessage(id: string, data: Partial<MessageViewModel>): Promise<UpdateResult<MessageViewModel>>;
  deleteMessage(id: string): Promise<DeleteResult>;

  // Audit Activity
  listAuditActivity(params?: ListQueryParams): Promise<ListResult<AuditActivityViewModel>>;
  getAuditActivity(id: string): Promise<AuditActivityViewModel | null>;
}