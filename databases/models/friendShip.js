import mongoose from 'mongoose';
const { Schema } = mongoose;


const friendShipSchema = new Schema({
    friendA: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    friendB: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, {
    timestamps: true,
});

export const FriendShipModel = mongoose.model('FriendShip', friendShipSchema);
