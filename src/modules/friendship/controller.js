import { catchError } from "../../middlewares/CatchError.js";
import { FriendShipModel } from "../../../databases/models/friendShip.js"
import { FriendRequestModel } from "../../../databases/models/friendRequest.js";
import { sendError } from "../../utils/index.js";


const getMyFriends = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const friends = await FriendShipModel.find({
            $or: [
                { friendA: loggedInUser },
                { friendB: loggedInUser }
            ]
        }).populate("friendA friendB", "name _id");

        res.status(200).json({
            message: "success",
            results: {
                friends
            }
        })

    }
)

const removeFriend = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { friendshipId, friendId } = req.body;
        console.log(friendshipId);
        

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