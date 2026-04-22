/**
 * Script to create a test booking for tomorrow (PST)
 * This allows testing the email reminder cron job
 * 
 * Usage: node --env-file=.env.local scripts/create-test-booking.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const { createClient } = require('redis');
const crypto = require('crypto');

async function createTestBooking() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.error('❌ REDIS_URL is not defined in .env.local');
    process.exit(1);
  }

  const client = createClient({ url: redisUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
    
    // Calculate tomorrow in PST timezone
    const date = new Date();
    date.setDate(date.getDate() + 1);
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const tomorrowPST = formatter.format(date); // YYYY-MM-DD
    
    console.log(`📅 Creating test booking for: ${tomorrowPST} (PST)`);
    
    // Create test booking
    const bookingId = crypto.randomUUID();
    const testBooking = {
      id: bookingId,
      name: 'Test User',
      email: process.env.TEST_EMAIL || 'test@example.com', // Use TEST_EMAIL from env or default
      daycareName: 'Test Daycare',
      daycareSlug: 'test-daycare',
      date: tomorrowPST,
      time: '10:00 AM - 11:00 AM',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    // Save booking to Redis
    const bookingKey = `booking:${bookingId}`;
    await client.set(bookingKey, JSON.stringify(testBooking));
    
    // Add to daily list (for reminders)
    await client.sAdd(`bookings:date:${tomorrowPST}`, bookingId);
    
    // Add to daycare list
    await client.sAdd(`daycare:${testBooking.daycareSlug}:bookings`, bookingId);
    
    // Mask email for PII protection
    function maskEmail(email) {
      const [local, domain] = email.split('@');
      if (!domain) return email;
      const maskedLocal = local.length > 1 ? `${local[0]}***` : local;
      return `${maskedLocal}@${domain}`;
    }
    
    console.log('✅ Test booking created successfully!');
    console.log('📧 Email will be sent to:', maskEmail(testBooking.email));
    console.log('🆔 Booking ID:', bookingId);
    console.log('\nℹ️ To test the reminder cron, run:');
    console.log('   node scripts/trigger-reminder-cron.js');
    
    await client.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    if (client.isOpen) await client.disconnect();
    process.exit(1);
  }
}

createTestBooking();
