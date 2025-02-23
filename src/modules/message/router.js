import express from "express"
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js";
const router = express.Router();


router.get("/:id" , verifyToken , controller.getMessages)
router.post("/" , verifyToken , controller.sendMessage)

export default router;