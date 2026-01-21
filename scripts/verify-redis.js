/**
 * Script to verify Redis connection and list all bookings
 * Useful for debugging and checking current state
 * 
 * Usage: node --env-file=.env.local scripts/verify-redis.js
 */

const { createClient } = require('redis');

async function verifyRedis() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.error('❌ REDIS_URL is not defined in .env.local');
    process.exit(1);
  }

  const client = createClient({ url: redisUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to Redis successfully!');
    
    // Get today and tomorrow in PST
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const todayPST = formatter.format(today);
    const tomorrowPST = formatter.format(tomorrow);
    
    console.log('\n📅 Date Info (PST):');
    console.log(`   Today: ${todayPST}`);
    console.log(`   Tomorrow: ${tomorrowPST}`);
    
    // Check bookings for tomorrow
    const bookingIds = await client.sMembers(`bookings:date:${tomorrowPST}`);
    
    console.log(`\n📋 Bookings for tomorrow (${tomorrowPST}): ${bookingIds.length}`);
    
    // Mask email for PII protection
    function maskEmail(email) {
      const [local, domain] = email.split('@');
      if (!domain) return email;
      const maskedLocal = local.length > 1 ? `${local[0]}***` : local;
      return `${maskedLocal}@${domain}`;
    }
    
    if (bookingIds.length > 0) {
      for (const id of bookingIds) {
        const bookingData = await client.get(`booking:${id}`);
        if (bookingData) {
          const booking = JSON.parse(bookingData);
          console.log(`\n   🎫 Booking ID: ${id}`);
          console.log(`      Name: ${booking.name}`);
          console.log(`      Email: ${maskEmail(booking.email)}`);
          console.log(`      Daycare: ${booking.daycareName}`);
          console.log(`      Date: ${booking.date}`);
          console.log(`      Time: ${booking.time}`);
          console.log(`      Status: ${booking.status}`);
        }
      }
    } else {
      console.log('   ℹ️ No bookings found for tomorrow');
    }
    
    await client.disconnect();
    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    if (client.isOpen) await client.disconnect();
    process.exit(1);
  }
}

verifyRedis();
