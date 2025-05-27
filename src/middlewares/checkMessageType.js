import cloudinaryUpload from "../utils/cloudinaryStorage.js";
import { sendError } from "../utils/index.js";
import { catchError } from "./CatchError.js";


export const checkMessageType = catchError(
    async (req, res, next) => {
        if (!req.is("multipart/form-data")) return next();

        const upload = cloudinaryUpload.single("chatMedia");

        upload(req, res, (err) => {
            if (err) return sendError(next, "File upload failed", 400);
            return next();
        });

    }
)