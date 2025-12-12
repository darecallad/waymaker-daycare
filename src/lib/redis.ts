import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL is not defined');
}

const client = createClient({
  url: redisUrl,
});

client.on('error', (err) => console.error('Redis Client Error', err));

// Singleton pattern for Next.js development to avoid multiple connections
declare global {
  var redis: ReturnType<typeof createClient> | undefined;
}

let redisClient: ReturnType<typeof createClient>;

if (process.env.NODE_ENV === 'production') {
  redisClient = client;
  redisClient.connect();
} else {
  if (!global.redis) {
    global.redis = client;
    global.redis.connect();
  }
  redisClient = global.redis;
}

export default redisClient;
