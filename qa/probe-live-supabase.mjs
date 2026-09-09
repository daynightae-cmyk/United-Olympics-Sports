// Probe live Supabase PostgreSQL schema metadata via PostgREST
async function probeAllTables() {
  const url = 'https://olmbezzzqavgjwydlfey.supabase.co';
  const key = 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';
  const tables = [
    'organizations', 'countries', 'branches', 'sports', 'programs',
    'groups', 'players', 'guardians', 'player_guardians', 'coaches',
    'coach_groups', 'sessions', 'attendance', 'performance_evaluations',
    'subscriptions', 'payments', 'documents', 'public_enquiries',
    'service_requests', 'catalog_products', 'inventory', 'app_user_roles',
    'app_user_scopes', 'audit_logs', 'notifications', 'achievements',
    'events', 'announcements', 'messages', 'payment_intents',
    'payment_webhooks', 'orders'
  ];

  const results = {};
  for (const t of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${t}?select=*`, {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
      });
      const data = await res.json().catch(() => ({}));
      results[t] = { status: res.status, code: data.code, message: data.message, hint: data.hint };
    } catch (e) {
      results[t] = { error: e.message };
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

probeAllTables().catch(err => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
