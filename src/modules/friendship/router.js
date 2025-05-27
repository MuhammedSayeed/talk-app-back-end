import express from "express";
import { verifyToken } from "../user/controller.js";
import * as controller from "./controller.js"
import { validation } from "../../middlewares/validation.js";
import { deleteFriendSchema } from "../../schemas/friendship.js";


const router = express.Router();


router.get("/" , verifyToken , controller.getMyFriends);
router.delete("/" , validation(deleteFriendSchema) , verifyToken , controller.removeFriend);


export default router