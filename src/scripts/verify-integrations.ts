
import { verifyEmailConfig } from "../lib/email";
import redis from "../lib/redis";

async function main() {
  console.log("🔍 Starting Integration Verification...");

  // 1. Verify Email
  console.log("\n📧 Testing Email Configuration...");
  const emailStatus = await verifyEmailConfig();
  if (emailStatus) {
    console.log("✅ Email configuration is valid.");
  } else {
    console.error("❌ Email configuration failed.");
  }

  // 2. Verify Redis
  console.log("\n🗄️ Testing Redis Connection...");
  try {
    // Redis client in lib/redis.ts connects automatically in non-production or if global is set.
    // We can try a simple ping.
    const pong = await redis.ping();
    console.log(`✅ Redis Connected! Response: ${pong}`);
    
    // Test Write/Read
    await redis.set("test-key", "hello-waymaker");
    const val = await redis.get("test-key");
    if (val === "hello-waymaker") {
        console.log("✅ Redis Write/Read Test Passed.");
        await redis.del("test-key");
    } else {
        console.error("❌ Redis Write/Read Test Failed.");
    }

  } catch (error) {
    console.error("❌ Redis Connection Error:", error);
  } finally {
    // Close redis connection to allow script to exit
    if (redis.isOpen) {
        await redis.quit();
    }
  }

  console.log("\n🏁 Verification Complete.");
}

main().catch(console.error);
