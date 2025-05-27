import { catchError } from "../../middlewares/CatchError.js";
import { FriendShipModel } from "../../../databases/models/friendShip.js"
import { FriendRequestModel } from "../../../databases/models/friendRequest.js";
import { sendError } from "../../utils/index.js";
import { getAggregateService } from "../../services/getAggregateService.js";
import { buildFriendshipPipeline } from "../../pipelines/friendShip.js";


const getMyFriends = catchError(
    async (req, res, next) => {
        const {data , metadata} = await getAggregateService(req.user._id, req.query , FriendShipModel , buildFriendshipPipeline);
        res.status(200).json({
            message: "success",
            metadata,
            results: {
                friends: data
            }
        })
    }
)

const removeFriend = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { friendshipId, friendId } = req.body;

        const friendShip = await FriendShipModel.findByIdAndDelete(friendshipId);
        if (!friendShip) return sendError(next, "Friendship not found", 404);

        // remove friend request
        await FriendRequestModel.deleteOne({
            $or: [
                { sender: loggedInUser, receiver: friendId },
                { sender: friendId, receiver: loggedInUser }
            ]
        });
        res.status(200).json({ message: "success" });
    }
)

export {
    getMyFriends,
    removeFriend
}