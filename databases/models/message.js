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
    content: String
}, {
    timestamps: true,
});

export const MessageModel = mongoose.model('Message', messageSchema);
