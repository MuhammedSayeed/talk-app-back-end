import express from "express"
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js";
import { checkMessageType } from "../../middlewares/checkMessageType.js";
import { validation } from "../../middlewares/validation.js";
import { IdSchema } from "../../schemas/id.js";
import { sendMessageSchema } from "../../schemas/message.js";
const router = express.Router();



router.get("/:id", validation(IdSchema), verifyToken, controller.getMessages)
router.post("/", validation(sendMessageSchema), verifyToken, checkMessageType, controller.sendMessage)
router.patch("/mark-seen/:chatId", verifyToken, controller.markMessagesAsSeen)

export default router;