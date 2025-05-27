import express from "express";
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js";
import { blockUserSchema, getBlockSchema } from "../../schemas/block.js";
import { validation } from "../../middlewares/validation.js";

const router = express.Router();
router.get("/:user", validation(getBlockSchema) , verifyToken, controller.getBlock)
router.post("/", validation(blockUserSchema) , verifyToken, controller.blockUser)
router.delete("/", validation(blockUserSchema) , verifyToken, controller.unblock)

export default router;