import { ChatModel } from "../../../databases/models/chat.js";
import { MessageModel } from "../../../databases/models/message.js";
import { catchError } from "../../middlewares/CatchError.js";
import { io } from "../../config/socket.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import { sendError } from "../../utils/index.js";



const getMessages = catchError(
    async (req, res, next) => {
        const { id } = req.params;
        const loggedInUser = req.user._id;
        // const check if chat exists
        const chat = await ChatModel.exists({
            _id: id,
            users: { $in: [loggedInUser] },
            isDeleted: false,
            deletedAt: null
        });
        if (!chat) return sendError(next, "chat does not exist", 404);
        // apply pagination
        const rawQuery = MessageModel.find({ chat: id }).sort({ createdAt: -1 });
        const features = ApiFeatures.create(rawQuery, req.query, "regular");
        features.paginate();
        const { data, metadata } = await features.execute();

        res.status(200).json({
            message: "success",
            metadata,
            results: data
        })
    }
)
const sendMessage = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { chat: chatId, type, content } = req.body;
        // check if chat exists
        const chat = await ChatModel.findOne({
            _id: chatId,
            isDeleted: false
        });
        if (!chat) return sendError(next, "chat does not exist", 404);
        // check type of message
        let messageContent;
        if (type === "text") {
            messageContent = content;
        } else if (type === "image") {
            messageContent = req.file.path;
        }
        //save message
        const newMessage = new MessageModel({
            sender: loggedInUser,
            chat: chatId,
            content: messageContent,
            type: type
        })
        await newMessage.save();
        chat.lastMessage = newMessage
        await chat.save();
        // send message as real time
        chat.users.forEach(user => {
            io.to(`user-${user._id}`).emit("new-message", {
                content: newMessage.content,
                sender: newMessage.sender,
                _id: newMessage._id,
                chat: newMessage.chat,
                createdAt: newMessage.createdAt,
                type: newMessage.type,
                isRead: newMessage.isRead
            })
        })

        res.status(201).json({
            message: "success",
        })

    }
)
const markMessagesAsSeen = catchError(
    async (req, res, next) => {
        const { chatId } = req.params;
        const loggedInUser = req.user._id;
        // check if chat exists
        const chat = await ChatModel.findOne({
            _id: chatId,
            users: { $in: [loggedInUser] },
            isDeleted: false
        })
        if (!chat) return sendError(next, "chat does not exist", 404);

        const otherUsers = chat.users.filter(userId => userId.toString() !== loggedInUser.toString());

        // mark all messages seen
        await MessageModel.updateMany(
            {
                chat: chatId,
                sender: { $in: otherUsers },
                isRead: false
            },
            {
                isRead: true
            }
        )

        res.status(200).json({
            success: true
        })
    }
)



export {
    getMessages,
    sendMessage,
    markMessagesAsSeen
}

