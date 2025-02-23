import mongoose from "mongoose";

const { Schema } = mongoose;

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ["friend-request", "accept-friend-request"],
        default: "friend-request"
    },
    acceptedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const NotificationModel = mongoose.model("Notification", NotificationSchema);
