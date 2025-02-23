import express from "express"
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js"

const router = express.Router()

router.get("/:type" , verifyToken , controller.getNotifications)
router.get("/unread/:type" , verifyToken , controller.getUnreadNotifications)
router.patch("/:type" , verifyToken , controller.markNotificationsAsRead)


export default router