import express from "express";
import { verifyToken } from "../user/controller.js";
import * as controller from "./controller.js"


const router = express.Router();


router.get("/" , verifyToken , controller.getMyFriends);
router.delete("/" , verifyToken , controller.removeFriend);


export default router