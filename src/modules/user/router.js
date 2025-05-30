import express from "express";
import * as controller from "./controller.js"
import cloudinaryUpload from '../../utils/cloudinaryStorage.js';
import { validation } from "../../middlewares/validation.js";
import { bioSchema, forgotPasswordSchema, resetPasswordSchema, signinSchema, signupSchema, socialAuthSchema, updateEmailSchema, updateNameSchema, updatePasswordSchema, updateUsernameSchema, verifyAccountSchema } from "../../schemas/user.js";
import { IdSchema } from "../../schemas/id.js";
const router = express.Router();

router.get("/", controller.verifyToken, controller.search)
router.get("/me", controller.verifyToken, controller.me)
router.get("/profile/:id", validation(IdSchema), controller.verifyToken, controller.getUser)
router.post("/signup", validation(signupSchema), controller.signup)
router.post("/signin", validation(signinSchema), controller.signin)
router.post("/social-auth", validation(socialAuthSchema), controller.socialAuth)
router.get("/auth/exchange-token", controller.verifyTempToken, controller.exchangeToken)



router.post("/forgot-password", validation(forgotPasswordSchema), controller.forgotPassword)
router.post("/reset-password", validation(resetPasswordSchema), controller.resetPassword)
router.patch("/name", validation(updateNameSchema), controller.verifyToken, controller.verifyPassword, controller.updateName)
router.patch("/username", validation(updateUsernameSchema), controller.verifyToken, controller.verifyPassword, controller.updateUsername)
router.patch("/email", validation(updateEmailSchema), controller.verifyToken, controller.verifyPassword, controller.updateEmail)
router.patch("/bio", validation(bioSchema), controller.verifyToken, controller.updateBio)
router.patch("/password", validation(updatePasswordSchema), controller.verifyToken, controller.verifyPassword, controller.updatePassword)
router.post("/verify-email", validation(verifyAccountSchema), controller.verifyToken, controller.verifyPassword, controller.verifyEmail)
router.patch("/keep-alive", controller.verifyToken, controller.keepAlive)
router.patch("/upload-profile-pic", controller.verifyToken, cloudinaryUpload.single('profilePic'), controller.uploadProfileImage)
router.patch("/upload-cover-pic", controller.verifyToken, cloudinaryUpload.single('coverPic'), controller.uploadCoverImage)



export default router;