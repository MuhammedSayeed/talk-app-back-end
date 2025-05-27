import mongoose from 'mongoose';
const { Schema } = mongoose;


const chatSchema = new Schema({
    name: String,
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
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
});

export const ChatModel = mongoose.model('Chat', chatSchema);

ChatModel.collection.createIndex({
    users: 1, isDeleted: 1, deletedAt: 1
})
ChatModel.collection.createIndex({ "lastMessage.createdAt": -1 });