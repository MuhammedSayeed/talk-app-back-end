import { RedisService } from "./redis-service.js";
import { io } from "../config/socket.js"
import { UserModel } from "../../databases/models/user.js";



export class StatusService {

    static async updateUserOnlineStatus(userId, isOnline) {
        const updateData = isOnline ? { isOnline: true, lastSeen: null } : { isOnline: false, lastSeen: new Date() };

        const user = await UserModel.findByIdAndUpdate(userId, updateData , { new: true});

        if (!user) return

        if (isOnline) {
            const redisService = new RedisService();
            await redisService.setUserOnline(userId);
        }
        await io.to(`status-${userId}`).emit("friend-status", {
            name: user.name,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
        })

    }

    static async keepAlive(userId) {
        await this.updateUserOnlineStatus(userId, true)
    }

    static async setupExpiryListener() {
        const redisService = new RedisService();
        await redisService.setupExpiryListener(async (userId) => {
            const date = new Date();
            const user = await UserModel.findByIdAndUpdate(userId, { isOnline: false, lastSeen: date }, { new: true });
            if (!user) return;

            await io.to(`status-${userId}`).emit("friend-status", {
                name: user.name,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
            })
        })
    }


}