import mongoose from 'mongoose';
const { Schema } = mongoose;


const userSchema = new Schema({
    username : String,
    name: String,
    email: String,
    password: {
        type: String,
    },
    image: String,
    bio : String,
    verified: Boolean,
    isOnline : {
        type: Boolean,
        default: false
    },
    lastSeen : {
        type: Date,
        default: null
    },
    provider: {
        type: String,
        enum: ["credentials", "google", "github"],
        default: "credentials"
    },
    providerId : String,
}, {
    timestamps: true,
});

export const UserModel = mongoose.model('User', userSchema);
