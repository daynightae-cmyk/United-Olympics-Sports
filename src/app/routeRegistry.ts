export const publicRouteRegistry = {
  home: { path: "/", label: { en: "Home", ar: "الرئيسية" } },
  about: { path: "/about", label: { en: "About", ar: "من نحن" } },
  sports: { path: "/sports", label: { en: "Sports", ar: "الرياضات" } },
  programs: { path: "/programs", label: { en: "Programs", ar: "البرامج" } },
  coaches: { path: "/coaches", label: { en: "Coaches", ar: "المدربون" } },
  contact: { path: "/contact", label: { en: "Contact", ar: "تواصل معنا" } },
} as const;

export const adminRouteRegistry = {
  dashboard: { path: "/admin", label: { en: "Dashboard", ar: "لوحة التحكم" } },
  countries: { path: "/admin/countries", label: { en: "Countries", ar: "الدول" } },
  branches: { path: "/admin/branches", label: { en: "Branches", ar: "الفروع" } },
  sports: { path: "/admin/sports", label: { en: "Sports", ar: "الرياضات" } },
  programs: { path: "/admin/programs", label: { en: "Programs", ar: "البرامج" } },
  players: { path: "/admin/players", label: { en: "Players", ar: "اللاعبون" } },
  parents: { path: "/admin/parents", label: { en: "Parents", ar: "أولياء الأمور" } },
  coaches: { path: "/admin/coaches", label: { en: "Coaches", ar: "المدربون" } },
  groups: { path: "/admin/groups", label: { en: "Training Groups / Teams", ar: "الفرق / مجموعات التدريب" } },
  schedules: { path: "/admin/schedules", label: { en: "Schedules", ar: "الجداول" } },
  attendance: { path: "/admin/attendance", label: { en: "Attendance", ar: "الحضور" } },
  registrations: { path: "/admin/registrations", label: { en: "Registrations", ar: "التسجيلات" } },
  performance: { path: "/admin/performance", label: { en: "Performance", ar: "الأداء" } },
  achievements: { path: "/admin/achievements", label: { en: "Achievements", ar: "الإنجازات" } },
  events: { path: "/admin/events", label: { en: "Events", ar: "الفعاليات" } },
  subscriptions: { path: "/admin/subscriptions", label: { en: "Subscriptions", ar: "الاشتراكات" } },
  payments: { path: "/admin/payments", label: { en: "Payments", ar: "المدفوعات" } },
  reports: { path: "/admin/reports", label: { en: "Reports", ar: "التقارير" } },
  announcements: { path: "/admin/announcements", label: { en: "Announcements", ar: "الإعلانات" } },
  messages: { path: "/admin/messages", label: { en: "Messages", ar: "الرسائل" } },
  content: { path: "/admin/content", label: { en: "Content", ar: "المحتوى" } },
  users: { path: "/admin/users", label: { en: "Users & Roles", ar: "المستخدمون والصلاحيات" } },
  settings: { path: "/admin/settings", label: { en: "Settings", ar: "الإعدادات" } },
  auditActivity: { path: "/admin/audit-activity", label: { en: "Audit Activity", ar: "سجل النشاط" } },
} as const;

export type AdminRouteKey = keyof typeof adminRouteRegistry;

export const portalRouteRegistry = {
  player: { path: "/player", label: { en: "Player", ar: "اللاعب" } },
  parent: { path: "/parent", label: { en: "Parent", ar: "ولي الأمر" } },
  coach: { path: "/coach", label: { en: "Coach", ar: "المدرب" } },
  admin: { path: "/admin", label: { en: "Admin", ar: "الإدارة" } },
} as const;