import mongoose from 'mongoose';
const { Schema } = mongoose;


const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
    },
    content: String,
    type : {
        type: String,
        enum: ['text', 'image'],
        default: 'text',
    },
    isRead : {
        type : Boolean,
        default : false
    }
}, {
    timestamps: true,
});

export const MessageModel = mongoose.model('Message', messageSchema);
