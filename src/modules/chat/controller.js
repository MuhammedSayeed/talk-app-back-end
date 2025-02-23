import { ChatModel } from "../../../databases/models/chat.js"
import pusher from "../../config/pusher.js";
import { catchError } from "../../middlewares/CatchError.js"

const createChat = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: userId } = req.body;

        let chat = await ChatModel.findOne({
            isGroup: false,
            users: { $all: [loggedInUser, userId] }
        }).populate('users', '-password -updatedAt -provider -createdAt');

        if (!chat) {
            chat = await ChatModel.create({
                users: [loggedInUser, userId]
            });
            chat = await ChatModel.findById(chat._id).populate('users', '-password -updatedAt -provider -createdAt');
            pusher.trigger(`user-${userId}`, "new-chat-created", {
                message: `${req.user.name} started new chat with you`,
            });
        }

        res.status(200).json({
            message: "success",
            results: {
                chat: chat
            }
        })
    }
)
const getuserChats = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;

        const chats = await ChatModel.find({ users: loggedInUser })
            .populate("users", "-password -updatedAt -provider -createdAt")
            .populate({
                path: "lastMessage",
                select: "-chat",
            })
            .sort({ "createdAt": -1 })


        res.status(200).json({
            message: "success",
            results: {
                chats: chats
            }
        })

    }
)



export {
    createChat,
    getuserChats,
}