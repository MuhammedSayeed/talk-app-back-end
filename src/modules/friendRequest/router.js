import express from "express";
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js";
import { validation } from "../../middlewares/validation.js";
import { FriendRequestSchema } from "../../schemas/friendRequest.js";

const router = express.Router();

router.post("/" , validation(FriendRequestSchema) , verifyToken , controller.sendFriendRequest)
router.delete("/cancel" , validation(FriendRequestSchema) , verifyToken , controller.cancelPendingFriendRequest)
router.get("/" , verifyToken , controller.getMyFriendRequests)
router.post("/accept" , validation(FriendRequestSchema) , verifyToken , controller.acceptFriendRequest)
router.delete("/decline" , validation(FriendRequestSchema) , verifyToken , controller.declineFriendRequest)


export default router