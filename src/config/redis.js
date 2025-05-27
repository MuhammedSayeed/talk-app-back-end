import { createClient } from 'redis';
const redisClient = createClient({
    url: process.env.REDIS_URL ,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000) // Auto-reconnect logic
    }
});



redisClient.connect()
    .then(() => console.log('✅ Connected to Redis'))
    .catch(err => console.error('❌ Redis Connection Error:', err));


redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});


export default redisClient;