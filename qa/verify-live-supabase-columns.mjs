// Verify column existence across live Supabase PostgreSQL schema via PostgREST column resolution
async function verifyColumns() {
  const url = 'https://olmbezzzqavgjwydlfey.supabase.co';
  const key = 'sb_publishable_BU7Yk24M8ClMH_w1XL8Wgw_zSMbaXEA';

  const targetChecks = [
    { table: 'players', column: 'group_id' },
    { table: 'players', column: 'branch_id' },
    { table: 'players', column: 'user_uid' },
    { table: 'players', column: 'full_name' },
    { table: 'coach_groups', column: 'coach_id' },
    { table: 'coach_groups', column: 'group_id' },
    { table: 'coach_groups', column: 'active' },
    { table: 'organizations', column: 'name' },
    { table: 'organizations', column: 'name_ar' },
    { table: 'countries', column: 'iso_code' },
    { table: 'branches', column: 'country_id' },
    { table: 'sports', column: 'code' },
    { table: 'programs', column: 'sport_id' },
    { table: 'groups', column: 'program_id' },
    { table: 'coaches', column: 'full_name' },
    { table: 'guardians', column: 'full_name' },
    { table: 'player_guardians', column: 'player_id' },
    { table: 'player_guardians', column: 'guardian_id' },
    { table: 'sessions', column: 'group_id' },
    { table: 'sessions', column: 'starts_at' },
    { table: 'attendance', column: 'session_id' },
    { table: 'attendance', column: 'player_id' },
    { table: 'attendance', column: 'status' },
    { table: 'performance_evaluations', column: 'metric_key' },
    { table: 'performance_evaluations', column: 'score' },
    { table: 'subscriptions', column: 'amount_minor' },
    { table: 'subscriptions', column: 'currency' },
    { table: 'payments', column: 'amount_minor' },
    { table: 'documents', column: 'storage_key' },
    { table: 'audit_logs', column: 'entity_type' },
    { table: 'audit_logs', column: 'action' },
    { table: 'notifications', column: 'channel' },
    { table: 'achievements', column: 'badge' },
    { table: 'events', column: 'title' },
    { table: 'announcements', column: 'body' },
    { table: 'messages', column: 'recipient_uid' },
    { table: 'orders', column: 'total_minor' }
  ];

  const results = [];
  let allPassed = true;

  for (const check of targetChecks) {
    try {
      const res = await fetch(`${url}/rest/v1/${check.table}?select=${check.column}`, {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
      });
      const data = await res.json().catch(() => ({}));

      // If column exists, status is 200 (if anon has select) or 401 (permission denied on existing column)
      // If column does not exist, status is 400 with code 42703
      const exists = res.status === 200 || (res.status === 401 && data.code === '42501');
      if (!exists) {
        allPassed = false;
      }
      results.push({
        table: check.table,
        column: check.column,
        exists,
        statusCode: res.status,
        pgCode: data.code,
        message: data.message
      });
    } catch (e) {
      allPassed = false;
      results.push({ table: check.table, column: check.column, exists: false, error: e.message });
    }
  }

  console.log(JSON.stringify({ allPassed, results }, null, 2));
}

verifyColumns().catch(err => {
  console.error('Column verification fatal error:', err);
  process.exit(1);
});
