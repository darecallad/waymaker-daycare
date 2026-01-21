/**
 * Script to manually trigger the reminder cron job
 * This simulates what Vercel Cron does automatically
 * 
 * Usage: node --env-file=.env.local scripts/trigger-reminder-cron.js
 */

async function triggerReminderCron() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ CRON_SECRET is not defined in .env.local');
    process.exit(1);
  }

  const url = `${baseUrl}/api/cron/reminder`;

  console.log(`🔔 Triggering reminder cron at: ${url}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Reminder cron executed successfully!');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Cron execution failed');
      console.error('Status:', response.status);
      console.error('Error:', result);
    }
  } catch (error) {
    console.error('❌ Error triggering cron:', error);
    process.exit(1);
  }
}

triggerReminderCron();
