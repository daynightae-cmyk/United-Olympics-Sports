import type { AchievementViewModel, AnnouncementViewModel, AuditActivityViewModel, ContentViewModel, EventViewModel, MessageViewModel, PaymentViewModel, RegistrationViewModel, ReportViewModel, SubscriptionViewModel, UserViewModel } from '../../admin/data/viewModels';

export const previewSubscriptions: SubscriptionViewModel[] = [
  { id: 'subscription-preview-001', playerId: 'player-demo-001', programId: 'program-demo-football-foundation', branchId: 'branch-workspace-01', plan: { en: 'Foundation Football', ar: 'أساس كرة القدم' }, status: 'active', startDate: '2026-08-01', endDate: '2026-09-30', amount: 450, currency: 'AED' },
  { id: 'subscription-preview-002', playerId: 'player-demo-003', programId: 'program-demo-swimming-progressive', branchId: 'branch-workspace-01', plan: { en: 'Progressive Swim Track', ar: 'المسار المتدرج للسباحة' }, status: 'pending', startDate: '2026-08-15', endDate: '2026-10-15', amount: 600, currency: 'AED' },
  { id: 'subscription-preview-003', playerId: 'player-demo-007', programId: 'program-demo-tennis-skills', branchId: 'branch-workspace-02', plan: { en: 'Individual Skills Studio', ar: 'استوديو المهارات الفردية' }, status: 'expired', startDate: '2026-05-01', endDate: '2026-07-31', amount: 520, currency: 'AED' },
];

export const previewPayments: PaymentViewModel[] = [
  { id: 'payment-preview-001', subscriptionId: 'subscription-preview-001', playerId: 'player-demo-001', amount: 450, currency: 'AED', status: 'completed', paidAt: '2026-08-05', method: { en: 'Card', ar: 'بطاقة' }, reference: 'PREVIEW-CARD-001' },
  { id: 'payment-preview-002', subscriptionId: 'subscription-preview-002', playerId: 'player-demo-003', amount: 600, currency: 'AED', status: 'pending', paidAt: '2026-08-16', method: { en: 'Transfer', ar: 'تحويل' }, reference: 'PREVIEW-TRANSFER-002' },
  { id: 'payment-preview-003', subscriptionId: 'subscription-preview-003', playerId: 'player-demo-007', amount: 520, currency: 'AED', status: 'failed', paidAt: '2026-07-01', method: { en: 'Card', ar: 'بطاقة' }, reference: 'PREVIEW-CARD-003' },
];

export const previewReports: ReportViewModel[] = [
  { id: 'report-preview-001', title: { en: 'Organization pulse', ar: 'نبض المؤسسة' }, type: { en: 'Organization', ar: 'المؤسسة' }, generatedAt: '2026-08-28T08:20:00Z', status: 'ready' },
  { id: 'report-preview-002', title: { en: 'Attendance review', ar: 'مراجعة الحضور' }, type: { en: 'Attendance', ar: 'الحضور' }, generatedAt: '2026-08-27T12:00:00Z', status: 'ready' },
];

export const previewContent: ContentViewModel[] = [
  { id: 'content-preview-001', title: { en: 'Football training direction', ar: 'اتجاه تدريب كرة القدم' }, type: { en: 'Sport media', ar: 'وسائط رياضية' }, status: 'published', updatedAt: '2026-08-28' },
  { id: 'content-preview-002', title: { en: 'Swimming progressive track', ar: 'المسار المتدرج للسباحة' }, type: { en: 'Program', ar: 'برنامج' }, status: 'draft', updatedAt: '2026-08-25' },
  { id: 'content-preview-003', title: { en: 'Player portal welcome', ar: 'ترحيب بوابة اللاعب' }, type: { en: 'Public section', ar: 'قسم عام' }, status: 'published', updatedAt: '2026-08-20' },
];

export const previewUsers: UserViewModel[] = [
  { id: 'user-preview-001', name: { en: 'Operations Preview', ar: 'معاينة العمليات' }, email: 'operations.preview@example.invalid', roles: ['super-admin'], status: 'active', lastLogin: '2026-08-28T09:00:00Z' },
  { id: 'user-preview-002', name: { en: 'Coach Preview', ar: 'مدرب تجريبي' }, email: 'coach.preview@example.invalid', roles: ['coach'], status: 'active', lastLogin: '2026-08-27T15:30:00Z' },
  { id: 'user-preview-003', name: { en: 'Read Only Preview', ar: 'معاينة للقراءة فقط' }, email: 'viewer.preview@example.invalid', roles: ['viewer'], status: 'inactive', lastLogin: '2026-08-12T10:10:00Z' },
];

export const previewRegistrations: RegistrationViewModel[] = [
  { id: 'registration-preview-001', playerId: 'player-demo-002', programId: 'program-demo-football-foundation', groupId: 'football-demo-u12', status: 'pending', requestedAt: '2026-08-27T10:00:00Z' },
  { id: 'registration-preview-002', playerId: 'player-demo-004', programId: 'program-demo-swimming-progressive', groupId: 'swimming-demo-beginners', status: 'confirmed', requestedAt: '2026-08-20T10:00:00Z', confirmedAt: '2026-08-21T09:00:00Z' },
  { id: 'registration-preview-003', playerId: 'player-demo-008', programId: 'program-demo-tennis-skills', status: 'waitlisted', requestedAt: '2026-08-18T10:00:00Z' },
];

export const previewAchievements: AchievementViewModel[] = [
  { id: 'achievement-preview-001', title: { en: 'Training consistency', ar: 'الانتظام في التدريب' }, description: { en: 'Preview recognition for consistent session participation.', ar: 'تقدير تجريبي للانتظام في المشاركة بالحصة.' }, category: { en: 'Development', ar: 'تطوير' }, playerId: 'player-demo-001', groupId: 'football-demo-u12', awardedAt: '2026-08-28', status: 'awarded' },
  { id: 'achievement-preview-002', title: { en: 'Technique milestone', ar: 'مرحلة تقنية' }, description: { en: 'Preview recognition for a recent skill milestone.', ar: 'تقدير تجريبي لمرحلة مهارية حديثة.' }, category: { en: 'Skill', ar: 'مهارة' }, playerId: 'player-demo-003', groupId: 'swimming-demo-beginners', awardedAt: '2026-08-26', status: 'pending' },
];

export const previewEvents: EventViewModel[] = [
  { id: 'event-preview-001', title: { en: 'Autumn skills day', ar: 'يوم مهارات الخريف' }, description: { en: 'Preview multi-sport skills gathering.', ar: 'تجمع مهارات رياضية متعدد تجريبي.' }, type: { en: 'Skills day', ar: 'يوم مهارات' }, startDate: '2026-09-12', endDate: '2026-09-12', location: { en: 'Preview venue', ar: 'موقع تجريبي' }, status: 'scheduled' },
  { id: 'event-preview-002', title: { en: 'Coach review circle', ar: 'حلقة مراجعة المدربين' }, description: { en: 'Preview coaching review session.', ar: 'جلسة مراجعة تدريبية تجريبية.' }, type: { en: 'Workshop', ar: 'ورشة' }, startDate: '2026-09-18', endDate: '2026-09-18', location: { en: 'Training workspace', ar: 'مساحة التدريب' }, status: 'scheduled' },
];

export const previewAnnouncements: AnnouncementViewModel[] = [
  { id: 'announcement-preview-001', title: { en: 'September schedule review', ar: 'مراجعة جدول سبتمبر' }, body: { en: 'Please review the upcoming preview sessions.', ar: 'يرجى مراجعة حصص المعاينة القادمة.' }, audience: { en: 'Coaches and parents', ar: 'المدربون وأولياء الأمور' }, priority: 'high', publishedAt: '2026-08-28', status: 'published' },
  { id: 'announcement-preview-002', title: { en: 'Media review queue', ar: 'قائمة مراجعة الوسائط' }, body: { en: 'New verified sport media is ready for review.', ar: 'وسائط رياضية موثقة جديدة جاهزة للمراجعة.' }, audience: { en: 'Operations', ar: 'العمليات' }, priority: 'normal', status: 'draft' },
];

export const previewMessages: MessageViewModel[] = [
  { id: 'message-preview-001', fromId: 'user-preview-001', toIds: ['user-preview-002'], subject: { en: 'Training review ready', ar: 'مراجعة التدريب جاهزة' }, body: { en: 'The next coaching review is available in preview.', ar: 'مراجعة التدريب القادمة متاحة في المعاينة.' }, sentAt: '2026-08-28T09:20:00Z', readAt: '2026-08-28T10:00:00Z', status: 'read' },
  { id: 'message-preview-002', fromId: 'user-preview-002', toIds: ['user-preview-001'], subject: { en: 'Roster question', ar: 'سؤال حول القائمة' }, body: { en: 'Please review the local attendance queue.', ar: 'يرجى مراجعة قائمة الحضور المحلية.' }, sentAt: '2026-08-28T11:20:00Z', status: 'delivered' },
];

export const previewAuditActivity: AuditActivityViewModel[] = [
  { id: 'audit-preview-001', actorId: 'user-preview-001', actorName: { en: 'Operations Preview', ar: 'معاينة العمليات' }, action: { en: 'Reviewed roster', ar: 'راجع القائمة' }, entityType: { en: 'Player', ar: 'لاعب' }, entityId: 'player-demo-001', details: { en: 'Local preview inspection', ar: 'فحص معاينة محلي' }, timestamp: '2026-08-28T09:20:00Z' },
  { id: 'audit-preview-002', actorId: 'user-preview-002', actorName: { en: 'Coach Preview', ar: 'مدرب تجريبي' }, action: { en: 'Updated attendance mark', ar: 'حدث علامة الحضور' }, entityType: { en: 'Session', ar: 'جلسة' }, entityId: 'session-demo-001', details: { en: 'Preview-only local state', ar: 'حالة محلية تجريبية فقط' }, timestamp: '2026-08-28T10:40:00Z' },
];
