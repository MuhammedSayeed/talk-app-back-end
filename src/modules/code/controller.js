import { VerificationCodeModel } from "../../../databases/models/code.js";
import { sendVerifyEmail } from "../../config/email.js";
import { catchError } from "../../middlewares/CatchError.js"
import { generateVerificationCode, sendError } from "../../utils/index.js";

const sendCode = catchError(
    async (req, res, next) => {
        const { email, _id: userId } = req.user;

        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

        const existingCode = await VerificationCodeModel.findOne({
            user: userId,
            isUsed: false,
            expireDate: { $gt: now }
        }).sort({ createdAt: -1 });

        if (existingCode) {
            if (existingCode.createdAt > oneMinuteAgo) {
                return sendError(next, "Please wait before requesting a new code.", 429);
            }
            await VerificationCodeModel.deleteOne({ _id: existingCode._id });
        }

        const newCode = generateVerificationCode();
        const expireDate = new Date(now.getTime() + 15 * 60 * 1000);
        await VerificationCodeModel.create({
            user: userId,
            code: newCode,
            expireDate,
            isUsed: false
        });

        sendVerifyEmail(email, newCode)

        res.status(200).json({ success: true });


    }
)

export {
    sendCode
}
