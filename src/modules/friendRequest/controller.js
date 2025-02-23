import { FriendRequestModel } from "../../../databases/models/friendRequest.js";
import { FriendShipModel } from "../../../databases/models/friendShip.js";
import { UserModel } from "../../../databases/models/user.js";
import { NotificationModel } from "../../../databases/models/notification.js";
import { catchError } from "../../middlewares/CatchError.js";
import { sendError } from "../../utils/index.js";
import pusher from "../../config/pusher.js";

const sendFriendRequest = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: friendId } = req.body;

        // check if friend is already existing
        const existingFriend = await UserModel.exists({ _id: friendId });
        if (!existingFriend) return sendError(next, "Friend not exists", 404);

        // Check if friend request already exists
        const existingFriendRequest = await FriendRequestModel.findOne({
            sender: loggedInUser,
            recipient: friendId
        }).lean()

        if (existingFriendRequest) return sendError(next, "Friend request sent before", 400)

        const newFriendRequest = await FriendRequestModel.create({
            sender: loggedInUser,
            receiver: friendId
        })

        await NotificationModel.create({
            user: friendId,
            isRead: false,
            relatedId: newFriendRequest._id
        });

        pusher.trigger(`user-${friendId}`, "friend-request-notification", {
            message: "You received a new friend request",
            senderName: req.user.name,
        });

        res.status(201).json({ message: "success" });

    }
)

const cancelPendingFriendRequest = catchError(
    async (req, res, next) => {
        const { _id: pendingRequestId } = req.body;

        // searching for pending request
        const pendingRequest = await FriendRequestModel.findByIdAndDelete(pendingRequestId);
        if (!pendingRequest) return sendError(next, "Pending friend request not found", 404);

        res.status(200).json({ message: "success" });

    }
)

const getMyFriendRequests = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;

        // Get friend requests for the logged in user
        const friendRequests = await FriendRequestModel.find({
            receiver: loggedInUser,
            status: "pending"
        }).populate("sender", "name _id")

        res.status(200).json({ message: "success", results: { friendRequests } });
    }
)

const acceptFriendRequest = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: requestId } = req.body;

        // Check if friend request exists
        const friendRequest = await FriendRequestModel.findById(requestId).populate("sender receiver", "name _id");
        if (!friendRequest) return sendError(next, "Friend request not found", 404);

        // Update friend request status to accepted
        friendRequest.status = "accepted";
        await friendRequest.save();

        // Create new friendship
        const friendShip = new FriendShipModel({
            friendA: loggedInUser,
            friendB: friendRequest.sender
        })

        // save friendship
        await friendShip.save();

        // send notification to sender
        const newNotification = new NotificationModel({
            user: friendRequest.sender,
            relatedId: friendShip._id,
            type: "accept-friend-request",
            acceptedBy : friendRequest.receiver
        })
        await newNotification.save();


        // Trigger a Pusher event
        await pusher.trigger(`user-${friendRequest.sender._id}`, "accept-friend-request-notification", {
            message: "friend request is accepted",
            user: friendRequest.receiver.name,
        })

        res.status(200).json({ message: "success" });

    }
)

const declineFriendRequest = catchError(
    async (req, res, next) => {
        const { _id: friendRequestId } = req.body;

        console.log("friendRequestId : " + friendRequestId);


        // Check if friend request exists
        const friendRequest = await FriendRequestModel.findOneAndDelete(
            {
                _id: friendRequestId,
                status: "pending"
            }
        )

        if (!friendRequest) return sendError(next, "Friend request not found", 404);
        res.status(200).json({ message: "success" });
    }
)

export {
    getMyFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelPendingFriendRequest
}