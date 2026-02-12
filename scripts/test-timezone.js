/**
 * Test script to verify timezone handling
 * Tests the getTimeZoneName function for both PST and PDT
 *
 * This implementation matches the logic in src/lib/utils-date.ts
 * to ensure consistent behavior between tests and production code.
 */

/**
 * Get the timezone abbreviation (PST or PDT) for a given date.
 * This mirrors the implementation in src/lib/utils-date.ts
 */
function getTimeZoneName(date) {
  let dateObj;

  if (!date) {
    // Use current date/time
    dateObj = new Date();
  } else if (typeof date === 'string') {
    // For YYYY-MM-DD strings, anchor at noon UTC to avoid date boundary issues
    const [year, month, day] = date.split('-').map(Number);
    if (year && month && day) {
      // Create date at noon UTC (12:00) to safely handle timezone conversions
      // This ensures we're solidly in the middle of the target calendar day
      dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    } else {
      // Fallback for malformed strings
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }

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

  // Parse the date string to create a Date at noon UTC (matching our implementation)
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

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
console.log('Note: This script mirrors the implementation in src/lib/utils-date.ts');

