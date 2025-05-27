import mongoose from 'mongoose';
const { Schema } = mongoose;


const userSchema = new Schema({
    username: String,
    name: String,
    email: String,
    verified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
    },
    passwordChangedAt: {
        type: Date
    },
    emailChangedAt :{
        type: Date
    },
    profilePic: {
        src: String,
        public_id: String,
    },
    coverPic: {
        src: String,
        public_id: String,
    },
    bio: String,
    verified: Boolean,
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: null
    },
    provider: {
        type: String,
        enum: ["credentials", "google", "github"],
        default: "credentials"
    },
    providerId: String
}, {
    timestamps: true,
});

userSchema.index({ username: 1 }, { background: true })
userSchema.index({ email: 1 }, { background: true })

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)
