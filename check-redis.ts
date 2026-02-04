import "dotenv/config";
import Redis from "ioredis";

async function checkRedis() {
    console.log("Checking Redis connection...");
    console.log("REDIS_URL:", process.env.REDIS_URL || "Not set (defaulting to localhost)");

    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
        connectTimeout: 5000,
        maxRetriesPerRequest: 1,
    });

    redis.on("error", (err) => {
        console.error("Redis connection error:", err.message);
        process.exit(1);
    });

    try {
        await redis.set("test-key", "it works");
        const value = await redis.get("test-key");
        console.log("Redis Test Result:", value);

        if (value === "it works") {
            console.log("✓ Redis is working correctly!");
        } else {
            console.error("✗ Redis read/write failed.");
        }
    } catch (error) {
        console.error("Redis operation failed:", error);
    } finally {
        redis.disconnect();
    }
}

checkRedis();
