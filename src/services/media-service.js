import { UserModel } from "../../databases/models/user.js";
import cloudinary from "../config/cloudinary.js";

export class MediaService {
    static async uploadProfileImage(userId, file) {
        const user = await UserModel.findById(userId);
        if (!user) return null;
        // Delete previous image if exists
        if (user.profilePic.public_id) {
            await cloudinary.uploader.destroy(user.profilePic.public_id);
        }
        // Update with new image
        user.profilePic = {
            src: file.path,
            public_id: file.filename,
        }
        return await user.save();
    }
    static async uploadCoverImage(userId, file) {
        const user = await UserModel.findById(userId);
        if (!user) return null
        // Delete previous image if exists
        if (user.coverPic?.public_id) {
            await cloudinary.uploader.destroy(user.coverPic.public_id)
        }
        // Update with new image
        user.coverPic = {
            src: file.path,
            public_id: file.filename,
        }
        return await user.save()
    }
}