import mongoose from 'mongoose';
const { Schema } = mongoose;


const passwordResetTokenSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    token: {
        type: String,
    },
    expiresAt: {
        type: Date,
    }
}, {
    timestamps: true,
});

export const passwordResetTokenModel = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
