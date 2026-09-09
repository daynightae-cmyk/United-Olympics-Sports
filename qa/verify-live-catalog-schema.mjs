// Comprehensive Live Supabase Catalog Verification
const url = 'https://olmbezzzqavgjwydlfey.supabase.co';
const key = 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';

export const expectedTables = {
  organizations: ['id', 'name', 'name_ar', 'status', 'created_at', 'updated_at'],
  countries: ['id', 'organization_id', 'iso_code', 'name', 'name_ar', 'status', 'created_at', 'updated_at'],
  branches: ['id', 'country_id', 'name', 'name_ar', 'status', 'created_at', 'updated_at'],
  sports: ['id', 'code', 'name', 'name_ar', 'status', 'created_at', 'updated_at'],
  programs: ['id', 'branch_id', 'sport_id', 'name', 'name_ar', 'status', 'created_at', 'updated_at'],
  groups: ['id', 'branch_id', 'program_id', 'name', 'status', 'created_at', 'updated_at'],
  players: ['id', 'user_uid', 'branch_id', 'group_id', 'full_name', 'archived_at', 'created_at', 'updated_at'],
  guardians: ['id', 'user_uid', 'full_name', 'created_at', 'updated_at'],
  player_guardians: ['id', 'player_id', 'guardian_id', 'relationship', 'active', 'created_at', 'updated_at'],
  coaches: ['id', 'user_uid', 'branch_id', 'full_name', 'created_at', 'updated_at'],
  coach_groups: ['id', 'coach_id', 'group_id', 'active', 'created_at', 'updated_at'],
  sessions: ['id', 'group_id', 'starts_at', 'ends_at', 'status', 'created_at', 'updated_at'],
  attendance: ['id', 'session_id', 'player_id', 'status', 'recorded_by_uid', 'created_at', 'updated_at'],
  performance_evaluations: ['id', 'player_id', 'session_id', 'coach_id', 'metric_key', 'score', 'notes', 'created_at', 'updated_at'],
  subscriptions: ['id', 'player_id', 'program_id', 'status', 'currency', 'amount_minor', 'starts_at', 'ends_at', 'created_at', 'updated_at'],
  payments: ['id', 'subscription_id', 'player_id', 'provider', 'provider_reference', 'status', 'currency', 'amount_minor', 'created_at', 'updated_at'],
  documents: ['id', 'owner_type', 'owner_id', 'storage_key', 'mime_type', 'status', 'created_at', 'updated_at'],
  public_enquiries: ['id', 'reference', 'name', 'email', 'phone', 'message', 'sport', 'guardian_relationship', 'status', 'created_at', 'updated_at'],
  service_requests: ['id', 'reference', 'requester_uid', 'player_id', 'kind', 'status', 'payload', 'quoted_amount_minor', 'currency', 'created_at', 'updated_at'],
  catalog_products: ['id', 'sku', 'name', 'name_ar', 'status', 'price_minor', 'currency', 'created_at', 'updated_at'],
  inventory: ['id', 'product_id', 'available_quantity', 'created_at', 'updated_at'],
  app_user_roles: ['id', 'uid', 'role', 'active', 'organization_id', 'country_id', 'branch_id', 'created_at', 'updated_at'],
  app_user_scopes: ['id', 'uid', 'scope', 'active', 'created_at', 'updated_at'],
  audit_logs: ['id', 'actor_uid', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at'],
  notifications: ['id', 'recipient_uid', 'channel', 'status', 'template', 'locale', 'title', 'title_ar', 'body', 'body_ar', 'provider_reference', 'attempt_count', 'last_error', 'payload', 'dispatched_at', 'created_at', 'updated_at'],
  achievements: ['id', 'player_id', 'title', 'title_ar', 'description', 'description_ar', 'badge', 'category', 'earned_at', 'created_at', 'updated_at'],
  events: ['id', 'organization_id', 'branch_id', 'sport_id', 'title', 'title_ar', 'description', 'starts_at', 'ends_at', 'location', 'status', 'created_at', 'updated_at'],
  announcements: ['id', 'organization_id', 'branch_id', 'title', 'title_ar', 'body', 'body_ar', 'target_role', 'status', 'created_at', 'updated_at'],
  messages: ['id', 'sender_uid', 'recipient_uid', 'thread_id', 'content', 'read_at', 'created_at', 'updated_at'],
  payment_intents: ['id', 'idempotency_key', 'player_id', 'subscription_id', 'amount_minor', 'currency', 'status', 'provider', 'provider_intent_id', 'metadata', 'created_at', 'updated_at'],
  payment_webhooks: ['id', 'event_id', 'provider', 'event_type', 'status', 'payload', 'processed_at', 'error', 'created_at', 'updated_at'],
  orders: ['id', 'order_number', 'customer_uid', 'status', 'total_minor', 'currency', 'items', 'shipping_address', 'created_at', 'updated_at'],
  app_user_profiles: ['user_id', 'email', 'display_name', 'avatar_url', 'created_at', 'updated_at']
};

async function verifyAll() {
  let passedTables = 0;
  let passedColumns = 0;
  let totalColumns = 0;
  const errors = [];
  const tableStatus = {};

  for (const [table, cols] of Object.entries(expectedTables)) {
    const tableRes = await fetch(`${url}/rest/v1/${table}?select=id`, {
      headers: { apikey: key, Authorization: 'Bearer ' + key }
    });
    const tableData = await tableRes.json().catch(() => ({}));
    if (tableRes.status === 404) {
      errors.push({ table, error: 'Table does not exist (404)' });
      continue;
    }
    passedTables++;
    tableStatus[table] = {
      status: tableRes.status,
      code: tableData.code || null,
      message: tableData.message || null,
      columnsChecked: cols.length,
      columnsVerified: 0
    };

    for (const col of cols) {
      totalColumns++;
      const colRes = await fetch(`${url}/rest/v1/${table}?select=${col}`, {
        headers: { apikey: key, Authorization: 'Bearer ' + key }
      });
      const data = await colRes.json().catch(() => ({}));
      if (colRes.status === 400 && data.code === '42703') {
        errors.push({ table, col, error: 'Column does not exist (42703)' });
      } else {
        passedColumns++;
        tableStatus[table].columnsVerified++;
      }
    }
  }

  const result = {
    totalExpectedTables: Object.keys(expectedTables).length,
    passedTables,
    totalColumns,
    passedColumns,
    errorsCount: errors.length,
    errors,
    tableStatus
  };

  console.log(JSON.stringify(result, null, 2));
}

verifyAll().catch(e => {
  console.error(e);
  process.exit(1);
});
