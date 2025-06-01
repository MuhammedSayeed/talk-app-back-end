import { BlockModel } from "../../../databases/models/block.js";
import { FriendRequestModel } from "../../../databases/models/friendRequest.js";
import { FriendShipModel } from "../../../databases/models/friendShip.js";
import { UserModel } from "../../../databases/models/user.js";
import { catchError } from "../../middlewares/CatchError.js";
import { io } from "../../config/socket.js";
import { sendError } from "../../utils/index.js";



const getBlock = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { user } = req.params;

        const blockDoc = await BlockModel.findOne({
            $or: [
                { blocker: loggedInUser, blocked: user },
                { blocker: user, blocked: loggedInUser }
            ]
        });
        return res.status(200).json({ message: "success", results: blockDoc ? blockDoc : null });
    }
)
const blockUser = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: blockedUserId } = req.body;

        // check if user is exist
        const user = await UserModel.findById(blockedUserId);
        if (!user) return sendError(next, "User not found.", 404);

        // check if user already blocked
        const blockDoc = await BlockModel.findOne({
            $or: [
                { blocker: loggedInUser, blocked: blockedUserId },
                { blocker: blockedUserId, blocked: loggedInUser }
            ]
        });
        if (blockDoc) return sendError(next, "Something went wrong.", 400);

        // delete pending friend request if existing
        await FriendRequestModel.findOneAndDelete({
            $or: [
                { sender: loggedInUser, receiver: blockedUserId, status: "pending" },
                { sender: blockedUserId, receiver: loggedInUser, status: "pending" }
            ]
        });


        // Delete friendship if exists
        await FriendShipModel.findOneAndDelete({
            $or: [
                { friendA: loggedInUser, friendB: blockedUserId },
                { friendA: blockedUserId, friendB: loggedInUser }
            ]
        });

        // block the user
        const newBlock = new BlockModel({
            blocker: loggedInUser,
            blocked: blockedUserId
        });
        await newBlock.save();

        const blockDocUsers = [loggedInUser, blockedUserId];



        blockDocUsers.forEach(user => {
            io.to(`user-${user}`).emit("block", {
                blockStatus: true,
                blockInfo: {
                    _id: newBlock._id,
                    blocker: loggedInUser,
                    blocked: blockedUserId
                }
            })
        })

        return res.status(200).json({ message: "success" });

    }
)
const unblock = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: blockedUserId } = req.body;

        // check if user is exist
        const user = await UserModel.findById(blockedUserId);
        if (!user) return sendError(next, "User not found.", 404);

        // get block doc
        const blockDoc = await BlockModel.findOne({
            $and: [
                { blocker: loggedInUser },
                { blocked: blockedUserId }
            ]
        });
        if (!blockDoc) return sendError(next, "Something went wrong.", 400);
        // delete block doc
        await blockDoc.deleteOne();

        const blockDocUsers = [loggedInUser, blockedUserId];


        blockDocUsers.forEach(user => {
            io.to(`user-${user}`).emit("block", {
                blockStatus: false,
            })
        })

        res.status(200).json({
            message: "success"
        })
    }
)

export { blockUser, unblock, getBlock }