/**
 * Test script to verify timezone handling
 * Tests the getTimeZoneName function for both PST and PDT
 */

// Simulate the getTimeZoneName function from utils-date.ts
function getTimeZoneName(date) {
  const dateObj = date
    ? typeof date === 'string'
      ? new Date(date)
      : date
    : new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short'
  });

  const parts = formatter.formatToParts(dateObj);
  const tzPart = parts.find(part => part.type === 'timeZoneName');

  return tzPart?.value || 'PT';
}

// Test dates in different parts of the year
const testDates = [
  '2026-01-15', // Winter - should be PST
  '2026-02-15', // Winter - should be PST
  '2026-03-15', // Spring - could be PST or PDT depending on DST transition
  '2026-07-15', // Summer - should be PDT
  '2026-08-15', // Summer - should be PDT
  '2026-11-15', // Fall - could be PST or PDT depending on DST transition
  '2026-12-15', // Winter - should be PST
];

console.log('=== Timezone Test Results ===\n');

testDates.forEach(dateStr => {
  const tz = getTimeZoneName(dateStr);
  const date = new Date(dateStr);
  const pstDate = date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  console.log(`Date: ${dateStr}`);
  console.log(`  Timezone: ${tz}`);
  console.log(`  PST/PDT Time: ${pstDate}`);
  console.log('');
});

console.log('=== Current Date Test ===\n');
const currentTZ = getTimeZoneName();
const currentDate = new Date();
const currentPSTDate = currentDate.toLocaleString('en-US', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short'
});

console.log(`Current UTC Time: ${currentDate.toISOString()}`);
console.log(`Current PST/PDT Time: ${currentPSTDate}`);
console.log(`Timezone: ${currentTZ}`);

console.log('\n✅ Timezone test completed!');
