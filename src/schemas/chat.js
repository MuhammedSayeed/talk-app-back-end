import * as yup from "yup";
import { IDValdation } from "./id.js";


const ChatSchema = yup.object({
    _id : IDValdation.required("id is required")
})

const getChatSchema = yup.object({
    id : IDValdation.required("id is required")
})

const updateTypingStatusSchema = yup.object({
    chatId : IDValdation.required("chatId is required"),
    isTyping : yup.boolean().required("isTyping is required"),
    userId : IDValdation.required("userId is required")
})


export{
    ChatSchema,
    getChatSchema,
    updateTypingStatusSchema
}
