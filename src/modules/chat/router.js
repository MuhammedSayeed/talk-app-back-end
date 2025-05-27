import express from "express";
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js";
import { validation } from "../../middlewares/validation.js";
import { ChatSchema, getChatSchema, updateTypingStatusSchema } from "../../schemas/chat.js";

const router = express.Router();

router.post("/", validation(ChatSchema), verifyToken, controller.createChat);
router.get("/", verifyToken, controller.getChats);
router.get("/:id", validation(getChatSchema), verifyToken, controller.getChat);
router.patch("/typing", validation(updateTypingStatusSchema) , verifyToken, controller.updateTypingStatus);
router.patch("/delete", validation(ChatSchema) , verifyToken, controller.deleteChat);




export default router;