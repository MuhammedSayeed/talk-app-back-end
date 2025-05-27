import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req) => {
        return {
            folder: req.query.folder,
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ width: 600, height: 600, crop: 'limit' }],
        }
    },
});
const cloudinaryUpload = multer({ storage });
export default cloudinaryUpload;