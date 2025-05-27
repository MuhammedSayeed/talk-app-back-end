import express from "express";
import * as controller from "./controller.js"
import { verifyToken } from "../user/controller.js";

const router = express.Router();

router.post("/" , verifyToken , controller.sendCode)


export default router;