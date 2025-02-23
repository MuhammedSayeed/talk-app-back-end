import mongoose from 'mongoose';
const { Schema } = mongoose;


const chatSchema = new Schema({
    name: String,
    isGroup: {
        type: Boolean,
        default: false
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
    users: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        required: true,
    }
}, {
    timestamps: true,
});

export const ChatModel = mongoose.model('Chat', chatSchema);
