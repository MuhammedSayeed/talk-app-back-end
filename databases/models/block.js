import mongoose from 'mongoose';
const { Schema } = mongoose;


const blockSchema = new Schema({
    blocker : {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    blocked : {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
});

export const BlockModel = mongoose.model('Block', blockSchema);
