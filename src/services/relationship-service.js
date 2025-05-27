import { BlockModel } from "../../databases/models/block.js"
import { FriendShipModel } from "../../databases/models/friendShip.js"
import { FriendRequestModel } from "../../databases/models/friendRequest.js"

export class RelationshipService {
    static async getRelationships(userId, otherUserId) {
        const [blockStatus, friendship, friendRequest] = await Promise.all([
            BlockModel.findOne({
                $or: [
                    { blocker: otherUserId, blocked: userId },
                    { blocker: userId, blocked: otherUserId },
                ],
            }),
            FriendShipModel.findOne({
                $or: [
                    { friendA: userId, friendB: otherUserId },
                    { friendA: otherUserId, friendB: userId },
                ],
            }),
            FriendRequestModel.findOne({
                $or: [
                    { sender: otherUserId, receiver: userId, status: "pending" },
                    { sender: userId, receiver: otherUserId, status: "pending" },
                ],
            }),
        ])

        return {
            isBlocked: !!blockStatus,
            blockDetails: blockStatus || null,
            isFriend: !!friendship,
            friendShipDetails: friendship || null,
            isPendingFriendRequest: !!friendRequest,
            pendingFriendRequest: friendRequest || null,
        }
    }
}