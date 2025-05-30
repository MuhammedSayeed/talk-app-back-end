import { ChatModel } from "../../../databases/models/chat.js"
import { catchError } from "../../middlewares/CatchError.js"
import { sendError } from "../../utils/index.js";
import { buildChatPipeline } from "../../pipelines/chat.js";
import { getAggregateService } from "../../services/getAggregateService.js";
import { io } from "../../config/socket.js";



const createChat = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: userId } = req.body;
        let chat = await ChatModel.findOne({
            users: { $all: [userId, loggedInUser] },
            isDeleted: false,
            deletedAt: null
        }).populate('users', '-password -updatedAt -provider -createdAt');

        if (!chat) {
            chat = await ChatModel.create({
                users: [loggedInUser, userId]
            });
            chat = await ChatModel.findById(chat._id).populate('users', '-password -updatedAt -provider -providerId -verified -bio -coverPic -createdAt');
        }

        res.status(200).json({
            message: "success",
            results: {
                chat: chat
            }
        });
    }
);
const getChat = catchError(
    async (req, res, next) => {
        const { id } = req.params;
        const chat = await ChatModel.findById(id).populate('users lastMessage', '-password -updatedAt -provider -providerId -verified -bio -coverPic -createdAt');
        if (!chat) return sendError(next, "Chat does not exist", 404);
        res.status(200).json({
            message: "success",
            results: {
                chat
            }
        })
    }
)
const getChats = catchError(
    async (req, res, next) => {
        const { data, metadata } = await getAggregateService(req.user._id, req.query, ChatModel, buildChatPipeline);

        res.status(200).json({
            message: "success",
            metadata,
            results: data.length > 0 ? data : []
        })
    }
)
const updateTypingStatus = catchError(
    async (req, res, next) => {
        const { chatId, isTyping, userId } = req.body;


        // check is chat exists
        const chat = await ChatModel.exists({ _id: chatId });
        if (!chat) return sendError(next, "Chat does not exist", 404);


        io.to(`chat-${chatId}`).emit("typing-indicator", {
            isTyping,
            userId
        })

        res.status(200).json({
            message: "success"
        });
    }
)
const deleteChat = catchError(
    async (req, res, next) => {
        const { _id: chatId } = req.body;
        const loggedInUser = req.user._id;
        const chatDoc = await ChatModel.findOneAndUpdate({ _id: chatId, users: loggedInUser, isDeleted: false }, { isDeleted: true, deletedAt: new Date() });
        if (!chatDoc) return sendError(next, "someting went wrong", 400);

        chatDoc.users.forEach((_id) => {
            io.to(`user-${_id}`).emit("chat-deleted", chatId)
        })

        res.status(200).json({
            message: "success",
        })
    }
)


export {
    createChat,
    getChats,
    getChat,
    updateTypingStatus,
    deleteChat
}
