import mongoose from 'mongoose';
const { Schema } = mongoose;


const friendRequestSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["pending", "rejected" , "accepted"],
        default: "pending"
    }
}, {
    timestamps: true,
});

export const FriendRequestModel = mongoose.model('FriendRequest', friendRequestSchema);
