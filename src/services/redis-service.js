import redisClient from "../config/redis.js"

export class RedisService {
    constructor() {
        this.ONLINE_EXPIRY = 60
    }

    async setUserOnline(userId) {
        await redisClient.set(`user:online:${userId}`, "true");
        await redisClient.expire(`user:online:${userId}`, this.ONLINE_EXPIRY);
    }
    async setupExpiryListener(callback) {
        const subscriber = redisClient.duplicate();

        try {
            await subscriber.connect();
            await subscriber.configSet("notify-keyspace-events", "Ex");
            await subscriber.subscribe("__keyevent@0__:expired", async (key) => {
                if (key.startsWith("user:online:")) {
                    const userId = key.split(":")[2]
                    await callback(userId)
                }
            })
        } catch (error) {
            console.error("❌ Error in expiry listener:", error)
        }
    }

}