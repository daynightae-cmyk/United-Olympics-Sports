import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

const timestamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const countries = pgTable('countries', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  isoCode: text('iso_code').notNull(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const branches = pgTable('branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  countryId: uuid('country_id').references(() => countries.id).notNull(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const sports = pgTable('sports', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').references(() => branches.id).notNull(),
  sportId: uuid('sport_id').references(() => sports.id).notNull(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').references(() => branches.id).notNull(),
  programId: uuid('program_id').references(() => programs.id).notNull(),
  name: text('name').notNull(),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const players = pgTable('players', {
  id: uuid('id').defaultRandom().primaryKey(),
  userUid: text('user_uid').unique(),
  branchId: uuid('branch_id').references(() => branches.id),
  fullName: text('full_name').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  ...timestamps(),
});

export const guardians = pgTable('guardians', {
  id: uuid('id').defaultRandom().primaryKey(),
  userUid: text('user_uid').notNull().unique(),
  fullName: text('full_name').notNull(),
  ...timestamps(),
});

export const playerGuardians = pgTable('player_guardians', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  guardianId: uuid('guardian_id').references(() => guardians.id).notNull(),
  relationship: text('relationship'),
  active: boolean('active').default(true).notNull(),
  ...timestamps(),
});

export const coaches = pgTable('coaches', {
  id: uuid('id').defaultRandom().primaryKey(),
  userUid: text('user_uid').unique(),
  branchId: uuid('branch_id').references(() => branches.id),
  fullName: text('full_name').notNull(),
  ...timestamps(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => groups.id).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  status: text('status').default('scheduled').notNull(),
  ...timestamps(),
});

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  status: text('status').notNull(),
  recordedByUid: text('recorded_by_uid'),
  ...timestamps(),
});

export const performanceEvaluations = pgTable('performance_evaluations', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  sessionId: uuid('session_id').references(() => sessions.id),
  coachId: uuid('coach_id').references(() => coaches.id),
  metricKey: text('metric_key').notNull(),
  score: integer('score'),
  notes: text('notes'),
  ...timestamps(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  programId: uuid('program_id').references(() => programs.id).notNull(),
  status: text('status').default('pending').notNull(),
  currency: text('currency'),
  amountMinor: integer('amount_minor'),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  ...timestamps(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  playerId: uuid('player_id').references(() => players.id),
  provider: text('provider'),
  providerReference: text('provider_reference'),
  status: text('status').default('pending').notNull(),
  currency: text('currency'),
  amountMinor: integer('amount_minor'),
  ...timestamps(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerType: text('owner_type').notNull(),
  ownerId: uuid('owner_id').notNull(),
  storageKey: text('storage_key').notNull(),
  mimeType: text('mime_type'),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const publicEnquiries = pgTable('public_enquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  reference: text('reference').notNull().unique(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  message: text('message'),
  sport: text('sport'),
  guardianRelationship: text('guardian_relationship'),
  status: text('status').default('new').notNull(),
  ...timestamps(),
});

export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  reference: text('reference').notNull().unique(),
  requesterUid: text('requester_uid').notNull(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  kind: text('kind').notNull(),
  status: text('status').default('requested').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}).notNull(),
  quotedAmountMinor: integer('quoted_amount_minor'),
  currency: text('currency'),
  ...timestamps(),
});

export const catalogProducts = pgTable('catalog_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  status: text('status').default('draft').notNull(),
  priceMinor: integer('price_minor'),
  currency: text('currency'),
  ...timestamps(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => catalogProducts.id).notNull().unique(),
  availableQuantity: integer('available_quantity').default(0).notNull(),
  ...timestamps(),
});

export const appUserRoles = pgTable('app_user_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: text('uid').notNull(),
  role: text('role').notNull(),
  active: boolean('active').default(true).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  countryId: uuid('country_id').references(() => countries.id),
  branchId: uuid('branch_id').references(() => branches.id),
  ...timestamps(),
});

export const appUserScopes = pgTable('app_user_scopes', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: text('uid').notNull(),
  scope: text('scope').notNull(),
  active: boolean('active').default(true).notNull(),
  ...timestamps(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorUid: text('actor_uid'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientUid: text('recipient_uid').notNull(),
  channel: text('channel').default('in_app').notNull(),
  status: text('status').default('queued').notNull(),
  template: text('template'),
  locale: text('locale').default('ar').notNull(),
  title: text('title').notNull(),
  titleAr: text('title_ar'),
  body: text('body').notNull(),
  bodyAr: text('body_ar'),
  providerReference: text('provider_reference'),
  attemptCount: integer('attempt_count').default(0).notNull(),
  lastError: text('last_error'),
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}).notNull(),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
  ...timestamps(),
});

export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  title: text('title').notNull(),
  titleAr: text('title_ar'),
  description: text('description'),
  descriptionAr: text('description_ar'),
  badge: text('badge'),
  category: text('category').default('general').notNull(),
  earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow().notNull(),
  ...timestamps(),
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  branchId: uuid('branch_id').references(() => branches.id),
  sportId: uuid('sport_id').references(() => sports.id),
  title: text('title').notNull(),
  titleAr: text('title_ar'),
  description: text('description'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  location: text('location'),
  status: text('status').default('scheduled').notNull(),
  ...timestamps(),
});

export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  branchId: uuid('branch_id').references(() => branches.id),
  title: text('title').notNull(),
  titleAr: text('title_ar'),
  body: text('body').notNull(),
  bodyAr: text('body_ar'),
  targetRole: text('target_role').default('all').notNull(),
  status: text('status').default('active').notNull(),
  ...timestamps(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderUid: text('sender_uid').notNull(),
  recipientUid: text('recipient_uid').notNull(),
  threadId: text('thread_id').notNull(),
  content: text('content').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  ...timestamps(),
});

export const paymentIntents = pgTable('payment_intents', {
  id: uuid('id').defaultRandom().primaryKey(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  playerId: uuid('player_id').references(() => players.id),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').default('AED').notNull(),
  status: text('status').default('requires_payment_method').notNull(),
  provider: text('provider').default('stripe').notNull(),
  providerIntentId: text('provider_intent_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
});

export const paymentWebhooks = pgTable('payment_webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: text('event_id').notNull().unique(),
  provider: text('provider').notNull(),
  eventType: text('event_type').notNull(),
  status: text('status').default('received').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  error: text('error'),
  ...timestamps(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerUid: text('customer_uid').notNull(),
  status: text('status').default('pending').notNull(),
  totalMinor: integer('total_minor').notNull(),
  currency: text('currency').default('AED').notNull(),
  items: jsonb('items').$type<Array<{ productId: string; sku: string; name: string; quantity: number; unitPriceMinor: number }>>().notNull(),
  shippingAddress: jsonb('shipping_address').$type<Record<string, unknown>>(),
  ...timestamps(),
});
