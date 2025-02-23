import { ChatModel } from "../../../databases/models/chat.js";
import { MessageModel } from "../../../databases/models/message.js";
import pusher from "../../config/pusher.js";
import { catchError } from "../../middlewares/CatchError.js";
import { sendError } from "../../utils/index.js";



const getMessages = catchError(
    async (req, res, next) => {
        const { id } = req.params;

        // const check if chat exists
        const chat = await ChatModel.exists({ _id: id });
        if (!chat) return sendError(next, "chat does not exist", 404);

        const messages = await MessageModel.find({
            chat: id
        }).sort({ createdAt: 1 });
        const chatMesages = messages.length > 0 ? messages : [];

        res.status(200).json({ message: "success", results: { messages: chatMesages } });
    }
)

const sendMessage = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { chat : chatId, content } = req.body;

        // check if chat exists
        const chat = await ChatModel.findById({ _id: chatId });
        if (!chat) return sendError(next, "Chat does not exist", 404);

        const newMessage = new MessageModel({
            sender: loggedInUser,
            chat : chatId,
            content
        })
        await newMessage.save();

        pusher.trigger(`chat-${chatId}` , "new-message" , {
            content : newMessage.content,
            sender : newMessage.sender,
            _id : newMessage._id,
            chat: newMessage.chat,
            createdAt: newMessage.createdAt
        })

        // save latest message in message
        chat.lastMessage = newMessage;
        await chat.save();

        res.status(201).json({
            message: "success",
        })

    }
)


export {
    getMessages,
    sendMessage
}



