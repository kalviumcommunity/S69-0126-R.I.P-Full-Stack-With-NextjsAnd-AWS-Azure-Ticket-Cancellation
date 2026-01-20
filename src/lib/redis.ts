import Redis from "ioredis";

/**
 * Redis Client Instance
 * Connects to Redis using the REDIS_URL environment variable
 * Falls back to local Redis instance at localhost:6379 if not set
 */
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  // Retry strategy for connection resilience
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Enable automatic reconnection
  enableReadyCheck: true,
  enableOfflineQueue: true,
  // Connection timeout
  connectTimeout: 10000,
  // Command timeout
  commandTimeout: 30000,
});

// Connection event handlers
redis.on("connect", () => {
  console.log("✓ Redis client connected");
});

redis.on("error", (err: Error) => {
  console.error("✗ Redis client error:", err);
});

redis.on("close", () => {
  console.log("✗ Redis client connection closed");
});

export default redis;
