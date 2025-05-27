import * as yup from 'yup';
import { IDValdation } from './id.js';




const sendMessageSchema = yup.object({
    chat: IDValdation.required("chatId is required"),
    type: yup.string().oneOf(['text', 'image']).required("type is required"),
    content: yup.string().min(1, "Message must be at least 1 characters")
        .max(500, "Message must be at most 500 characters")
        .required("content is required")
})


export{
    sendMessageSchema
}