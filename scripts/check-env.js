/**
 * Script to check required environment variables
 * Run this before deploying to production
 * 
 * Usage: node --env-file=.env.local scripts/check-env.js
 */

const REQUIRED_VARS = [
  'REDIS_URL',
  'DAYCARE_EMAIL_USER',
  'DAYCARE_EMAIL_PASSWORD',
  'CRON_SECRET',
  'NEXT_PUBLIC_BASE_URL'
];

const OPTIONAL_VARS = [
  'TEST_EMAIL',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_CALENDAR_REFRESH_TOKEN',
  'GOOGLE_CALENDAR_ID'
];

/** Values that must never be printed. */
const isSensitive = (varName) => /PASSWORD|SECRET|TOKEN/.test(varName);

console.log('🔍 Checking environment variables...\n');

let allValid = true;

// Check required variables
console.log('📋 Required Variables:');
REQUIRED_VARS.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = isSensitive(varName) ? '***' : value;
    console.log(`   ✅ ${varName} = ${displayValue}`);
  } else {
    console.log(`   ❌ ${varName} = (not set)`);
    allValid = false;
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
OPTIONAL_VARS.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = isSensitive(varName) ? '***' : value;
    console.log(`   ✅ ${varName} = ${displayValue}`);
  } else {
    console.log(`   ℹ️  ${varName} = (not set - optional)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('✅ All required environment variables are set!');
  console.log('\nℹ️  Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Test: node scripts/verify-redis.js');
  console.log('   3. Create test booking: node scripts/create-test-booking.js');
  console.log('   4. Trigger cron: node scripts/trigger-reminder-cron.js');
  process.exit(0);
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('\nℹ️  Please check .env.local and ensure all required variables are set.');
  console.log('   See README-EMAIL-REMINDER.md for setup instructions.');
  process.exit(1);
}
