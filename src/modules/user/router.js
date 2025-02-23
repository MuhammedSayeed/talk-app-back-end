import express from "express";
import * as controller from "./controller.js"

const router = express.Router();


router.get("/", controller.verifyToken, controller.search)
router.get("/:id", controller.verifyToken , controller.getUser)
router.post("/signup", controller.signup)
router.post("/signin", controller.signIn)
router.post("/block", controller.verifyToken , controller.blockUser)
router.delete("/unblock", controller.verifyToken , controller.unblock)
router.post("/social-auth", controller.socialAuth)
router.patch("/keep-alive", controller.verifyToken , controller.keepAlive)




export default router;