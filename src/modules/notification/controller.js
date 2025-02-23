import { NotificationModel } from "../../../databases/models/notification.js";
import { catchError } from "../../middlewares/CatchError.js";




const getUnreadNotifications = catchError(
    async (req, res, next) => {
        const user = req.user._id
        const { type } = req.params;

        // Count unread notifications for this user
        const unreadCount = await NotificationModel.countDocuments({
            user,
            isRead: false,
            type: type
        });

        res.status(200).json({ unreadCount });
    }
);

const getNotifications = catchError(
    async (req, res, next) => {
        const user = req.user._id
        const { type } = req.params;

        const notifications = await NotificationModel.find({ user, type,}).populate("acceptedBy" , "_id name username")
        .sort({ createdAt: -1 })

        res.status(200).json({ message: "success", results: notifications });
    }
)

const markNotificationsAsRead = catchError(
    async (req, res, next) => {
        const user = req.user._id
        const { type } = req.params;

        await NotificationModel.updateMany(
            { user, isRead: false, type: type },
            { $set: { isRead: true } }
        )

        res.status(200).json({ message: "Success" });
    }
)
export {
    getUnreadNotifications,
    markNotificationsAsRead,
    getNotifications
}