import express from "express";
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js";

const router = express.Router();


router.post("/" , verifyToken , controller.sendFriendRequest)
router.delete("/cancel" , verifyToken , controller.cancelPendingFriendRequest)
router.get("/" , verifyToken , controller.getMyFriendRequests)
router.post("/accept" , verifyToken , controller.acceptFriendRequest)
router.delete("/decline" , verifyToken , controller.declineFriendRequest)


export default router