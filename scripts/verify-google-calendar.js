/**
 * Check the Google Calendar auto-sync credentials without making a real booking.
 *
 * Shows which calendar the refresh token writes to, and with --write creates a short test
 * event tomorrow and deletes it again, which proves the whole round trip works.
 *
 * Usage:
 *   node --env-file=.env.local scripts/verify-google-calendar.js
 *   node --env-file=.env.local scripts/verify-google-calendar.js --write
 */

const TIMEOUT_MS = 10_000;
const WRITE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
];

const HINTS = {
  invalid_grant:
    'The refresh token was revoked or has expired. If the OAuth consent screen is still in "Testing", ' +
    'Google expires tokens after 7 days: set it to Internal or publish it, then generate a new token.',
  invalid_client: 'GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are wrong or belong to different clients.',
  unauthorized_client: 'The refresh token was created with a different OAuth client than GOOGLE_OAUTH_CLIENT_ID.',
};

function fail(message, hint) {
  console.error(`❌ ${message}`);
  if (hint) console.error(`   → ${hint}`);
  process.exit(1);
}

/** Tomorrow's date in California, as YYYY-MM-DD. */
function tomorrowInCalifornia() {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [year, month, day] = today.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary';

  const missing = [
    ['GOOGLE_OAUTH_CLIENT_ID', clientId],
    ['GOOGLE_OAUTH_CLIENT_SECRET', clientSecret],
    ['GOOGLE_CALENDAR_REFRESH_TOKEN', refreshToken],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) fail(`Missing env vars: ${missing.join(', ')}`);

  // 1. Refresh token -> access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const token = await tokenResponse.json().catch(() => ({}));

  if (!tokenResponse.ok || !token.access_token) {
    fail(
      `Token refresh failed: HTTP ${tokenResponse.status} ${token.error || ''} ${token.error_description || ''}`,
      HINTS[token.error]
    );
  }

  const scopes = String(token.scope || '').split(' ');
  console.log('✅ Refresh token works');
  console.log(`   Scopes: ${token.scope || '(not reported)'}`);

  if (!scopes.some((scope) => WRITE_SCOPES.includes(scope))) {
    fail('The token cannot write events.', `Generate a new one with the scope ${WRITE_SCOPES[0]}`);
  }

  const headers = { Authorization: `Bearer ${token.access_token}` };
  const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

  // 2. Which calendar do the events go to? (For the main calendar this is the account email.)
  const listResponse = await fetch(`${eventsUrl}?maxResults=1`, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const list = await listResponse.json().catch(() => ({}));

  if (!listResponse.ok) {
    fail(`Cannot open calendar "${calendarId}": HTTP ${listResponse.status} ${list.error?.message || ''}`);
  }

  console.log(`✅ Tours will be added to calendar: ${list.summary} (time zone ${list.timeZone})`);

  if (!process.argv.includes('--write')) {
    console.log('\nℹ️  Run again with --write to create and delete a test event.');
    return;
  }

  // 3. Round trip: create a 15-minute event tomorrow morning, then delete it
  const date = tomorrowInCalifornia();
  const createResponse = await fetch(`${eventsUrl}?sendUpdates=none`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: 'Waymaker calendar sync test (safe to delete)',
      start: { dateTime: `${date}T09:00:00`, timeZone: 'America/Los_Angeles' },
      end: { dateTime: `${date}T09:15:00`, timeZone: 'America/Los_Angeles' },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const created = await createResponse.json().catch(() => ({}));

  if (!createResponse.ok || !created.id) {
    fail(`Could not create the test event: HTTP ${createResponse.status} ${created.error?.message || ''}`);
  }
  console.log(`✅ Test event created on ${date} 9:00 AM`);

  const deleteResponse = await fetch(`${eventsUrl}/${created.id}?sendUpdates=none`, {
    method: 'DELETE',
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!deleteResponse.ok) {
    fail(
      `Could not delete the test event: HTTP ${deleteResponse.status}`,
      `Delete "Waymaker calendar sync test" on ${date} by hand.`
    );
  }
  console.log('✅ Test event deleted — the calendar sync is ready');
}

main().catch((error) => {
  const reason = error?.name === 'TimeoutError' ? 'Google did not answer in time' : error?.message || error;
  fail(`Unexpected error: ${reason}`);
});
