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

friendShipSchema.index({ friendA: 1 });
friendShipSchema.index({ friendB: 1 });

export const FriendShipModel = mongoose.model('FriendShip', friendShipSchema);
