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

/**
 * Whether an error means a WATCH/MULTI transaction lost its race.
 *
 * `instanceof WatchError` is unreliable here: Next bundles server chunks separately, so the
 * class identity of the thrown error does not always match the imported one. node-redis also
 * leaves `name` as "Error", hence the message check.
 *
 * @param error - Error thrown by `multi().exec()`
 */
export function isWatchConflict(error: unknown): boolean {
  return (
    error instanceof Error && /one \(or more\) of the watched keys/i.test(error.message)
  );
}
