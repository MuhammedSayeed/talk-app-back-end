import express from "express"
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js"
import { validation } from "../../middlewares/validation.js"
import { notificationsSchema } from "../../schemas/notification.js"

const router = express.Router()

router.get("/:type", validation(notificationsSchema), verifyToken, controller.getNotifications)
router.get("/unread/:type", validation(notificationsSchema), verifyToken, controller.getUnreadNotifications)
router.patch("/:type", validation(notificationsSchema) , verifyToken, controller.markNotificationsAsRead)


export default router