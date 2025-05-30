import { catchError } from "../../middlewares/CatchError.js"
import { extractUserData, generateToken, generateUniqueUsername, generateVerificationCode, getImageInHighRes, sendError } from "../../utils/index.js";
import { UserModel } from "../../../databases/models/user.js"
import { AuthService } from "../../services/auth-service.js";
import { RelationshipService } from "../../services/relationship-service.js";
import { MediaService } from "../../services/media-service.js";
// import { StatusService } from "../../services/status-service.js";
import { passwordResetTokenModel } from "../../../databases/models/PasswordResetTokens.js";
import { sendResetPasswordLink, sendVerifyEmail } from "../../config/email.js";
import { ApiFeatures } from "../../utils/apiFeatures.js";
import crypto from "crypto";
import { VerificationCodeModel } from "../../../databases/models/code.js";

const search = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        // build base query
        const rawQuery = UserModel.find({ _id: { $ne: loggedInUser } }).select(
            "-password -createdAt -provider -__v -coverPic -email -isOnline -lastSeen -updatedAt",
        )
        // apply api features
        const features = ApiFeatures.create(rawQuery, req.query, "regular")
        features.search().paginate()
        // execute api features
        const { data, metadata } = await features.execute()
        res.status(200).json({
            success: true,
            metadata,
            results: data
        })
    }
)
const getUser = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const userId = req.params.id;

        // fetch user details
        const user = await UserModel.findById(userId).select("-password -__v -provider -providerId -isOnline")
        if (!user) return sendError(next, "User not found.", 404);

        // Fetch all relevant relationships in parallel
        const relationships = await RelationshipService.getRelationships(loggedInUser, userId);
        const userData = extractUserData(user);

        const response = {
            message: "success",
            results: {
                ...relationships,
                user: userData
            }
        }

        res.status(200).json(response)

    }
)
const verifyPassword = catchError(
    async (req, res, next) => {
        // check if user is not using social user
        if (req.user.provider !== "credentials") return next();
        const userId = req.user._id;
        const { password } = req.body;
        // matching user password
        const user = await UserModel.findById(userId).select('password');
        const isMatch = await AuthService.verifyPassword(password, user.password);
        if (!isMatch) return sendError(next, "Invalid password.", 401);
        next();
    }
)
const verifyEmail = catchError(
    async (req, res, next) => {
        const { _id: userId, verified } = req.user;
        // check if user is already verified
        if (verified) return sendError(next, "Account already verified.", 400);

        // make sure the token is valid and not expired
        const { code } = req.body;
        const existingCode = await VerificationCodeModel.findOne({ code, user: userId, isUsed: false, expireDate: { $gt: new Date() } });
        if (!existingCode) return sendError(next, "invalid/expired code", 404);

        // get user
        const user = await UserModel.findByIdAndUpdate(userId, { verified: true }, { new: true }).select("-password -__v -provider -providerId -isOnline -lastSeen -updatedAt").lean()
        // delete code
        await VerificationCodeModel.findByIdAndDelete(existingCode._id).lean()

        // generate token
        const userDataToken = extractUserData(user, true)
        const token = generateToken(userDataToken);

        res.status(200).json({
            message: "success",
            results: {
                verified: true,
                token
            }
        })


    }
)
const verifyToken = catchError(
    async (req, res, next) => {
        // Extract token
        const token = req.headers.authorization.split(" ")[1];

        if (!token) return sendError(next, 'Not authorized', 401);
        // Verify token
        const decoded = AuthService.verifyToken(token);
        if (!decoded?._id) return sendError(next, 'Invalid token', 401);
        // get user
        const user = await UserModel.findById(decoded._id).select("passwordChangedAt").lean();
        if (!user) return sendError(next, 'User not found', 401);
        // check if token is old
        if (user.passwordChangedAt) {
            const changePasswordTimestamp = ~~(user.passwordChangedAt.getTime() / 1000);
            if (changePasswordTimestamp > decoded.iat) {
                return sendError(next, "Token expired", 401);
            }
        }
        // pass user
        req.user = decoded;
        next();
    }
)
const verifyTempToken = catchError(
    async (req, res, next) => {
        const token = req.query.token;
        if (!token) return sendError(next, 'Not authorized', 401);

        const decoded = AuthService.verifyToken(token);
        if (!decoded?._id) return sendError(next, 'Invalid token', 401);

        req.user = decoded;
        next();
    }
)
const signup = catchError(
    async (req, res, next) => {
        const { username, name, email, password } = req.body;
        // Create user
        const result = await AuthService.signup({ username, name, email, password });
        // if error return it
        if (result && result.error) return sendError(next, result.message, result.code);
        // generate verification code and send to email
        const newCode = generateVerificationCode();
        await VerificationCodeModel.create({
            user: result._id,
            code: newCode
        })
        // send email with code
        await sendVerifyEmail(email, newCode)

        // Generate token
        const userDataToken = extractUserData(result, true)
        const token = generateToken(userDataToken);
        const userData = extractUserData(result);

        res.status(201).json({
            message: "success",
            results: {
                user: userData,
                token
            },
        })

    }
)
const signin = catchError(
    async (req, res, next) => {
        const { emailOrUsername, password } = req.body;

        const results = await AuthService.signIn(emailOrUsername, password);
        if (results && results.error) return sendError(next, results.message, results.code);

        const userDataToken = extractUserData(results, true)
        const token = generateToken(userDataToken)
        const userData = extractUserData(results);

        res.status(200).json({
            message: "success",
            results: {
                user: userData,
                token
            },
        })

    }
)
const socialAuth = catchError(
    async (req, res, next) => {
        const { name, email, image, provider, providerId } = req.body;
        // increase dimension of image
        const highResImage = getImageInHighRes(image, provider);
        // generate unique username
        const username = generateUniqueUsername(name, providerId)
        // search for user
        let user = await UserModel.findOne({ email });
        if (user && (user.provider !== provider || user.providerId !== providerId)) {
            return sendError(next, "Account already exists with different provider.", 400);
        }
        // register user if not exists
        if (!user) {
            user = await UserModel.create({
                name: name,
                email: email,
                profilePic: {
                    src: highResImage
                },
                provider: provider,
                providerId: providerId,
                verified: true,
                username: username
            })
        }
        // generate temp token for exchabge
        const tempToken = generateToken({
            _id: user._id
        }, "1m")

        res.status(200).json({
            message: "success",
            tempToken
        })
    }
)
const exchangeToken = catchError(
    async (req, res, next) => {
        const userId = req.user._id;
        // search for user
        const user = await UserModel.findById(userId);
        if (!user) return sendError(next, "someting went wrong", 400);
        // generate token and extract user data
        const tokenData = extractUserData(user, true);
        const token = generateToken(tokenData);
        const userData = extractUserData(user);


        res.status(200).json({
            message: "success",
            results: {
                user: userData,
                token
            }
        })

    }
)
const me = catchError(
    async (req, res, next) => {
        const userId = req.user._id;
        // get logged in user profile
        const user = await UserModel.findById(userId).select("-password -__v")
        if (!user) return sendError(next, "User not found.", 404);
        // extract user data
        const userData = extractUserData(user);

        res.status(200).json({
            message: "success",
            results: {
                user: userData,
            },
        })

    }
)
const uploadProfileImage = catchError(
    async (req, res, next) => {
        const userId = req.user._id;
        const file = req.file;
        // upload profile image
        const user = await MediaService.uploadProfileImage(userId, file);
        if (!user) return sendError(next, "User not found.", 404);

        res.status(200).json({
            message: "success",
            results: {
                profilePic: user.profilePic,
            },
        })

    }
)
const uploadCoverImage = catchError(
    async (req, res, next) => {
        const userId = req.user._id
        const file = req.file
        // upload cover image
        const user = await MediaService.uploadCoverImage(userId, file);
        if (!user) return sendError(next, "User not found.", 404);

        res.status(200).json({
            message: "success",
            results: {
                coverPic: user.coverPic,
            },
        })

    }
)
const updateBio = catchError(
    async (req, res, next) => {
        const userId = req.user._id
        const { bio } = req.body
        // update bio
        const user = await UserModel.findByIdAndUpdate(userId, { bio }, { new: true }).select("bio _id").lean()
        if (!user) return sendError(next, "User not found.", 404);

        res.status(200).json({
            message: "success",
            results: {
                bio: user.bio,
            },
        })
    }
)
const updateName = catchError(
    async (req, res, next) => {
        const userId = req.user._id
        const { name } = req.body
        // update name
        const user = await UserModel.findByIdAndUpdate(userId, { name }, { new: true }).select("name _id").lean()
        if (!user) return sendError(next, "User not found.", 404);

        // Generate token and send it back as a cookie
        const userData = extractUserData(user);
        const token = generateToken(userData)

        res.status(200).json({
            message: "success",
            results: {
                name: user.name,
                token
            },
        })

    }
)
const updateUsername = catchError(
    async (req, res, next) => {
        const userId = req.user._id
        const { username } = req.body

        // update username
        const user = await UserModel.findByIdAndUpdate(userId, { username }, { new: true }).select("username _id").lean()
        if (!user) return sendError(next, "Username already the same or user not found.", 400)
        // Generate token and send it back as a cookie
        const userData = extractUserData(user)
        const token = generateToken(userData)


        res.status(200).json({
            message: "success",
            results: {
                username: user.username,
                token
            },
        })

    }
)
const updateEmail = catchError(
    async (req, res, next) => {
        const { _id: userId } = req.user;
        const { email } = req.body

        // check if email is already in use
        const existingUser = await UserModel.findOne({ email }).lean();
        if (existingUser) return sendError(next, "Email already exists.", 400);
        // get user
        const user = await UserModel.findById(userId).select("email emailChangedAt verified _id");
        // check if 7 days passed
        if (user.emailChangedAt) {
            const lastEmailChangeDate = new Date(user.emailChangedAt);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (lastEmailChangeDate > sevenDaysAgo) return sendError(next, "try change email later", 403);
        }
        const emailInLowerCaseForm = email.toLowerCase();
        // update email
        user.email = emailInLowerCaseForm
        user.emailChangedAt = Date.now();
        user.verified = false;
        await user.save();

        // generate new code & send email with code
        const newCode = generateVerificationCode();
        Promise.all([
            VerificationCodeModel.create({ user: userId, code: newCode }),
            sendVerifyEmail(emailInLowerCaseForm, newCode)
        ])

        // generate new token 
        const userData = extractUserData(user, true);
        const token = generateToken(userData);


        res.status(200).json({
            message: "success",
            results: {
                email: user.email,
                verified: user.verified,
                emailChangedAt: user.emailChangedAt,
                token
            },
        })

    }
)
const updatePassword = catchError(
    async (req, res, next) => {
        const userId = req.user._id
        const { newPassword } = req.body
        // find user
        const user = await UserModel.findById(userId).select("password passwordChangedAt");
        if (!user) return sendError(next, "User not found.", 404);
        // check if 7 days passed
        if (user.passwordChangedAt) {
            const lastPasswordChangeDate = new Date(user.passwordChangedAt);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (lastPasswordChangeDate > sevenDaysAgo) {
                return sendError(next, "try change password later", 403);
            }
        }
        // hash password
        const hashedPassword = await AuthService.hashPassword(newPassword);
        const passwordChangedAt = Date.now()
        // update user password
        user.password = hashedPassword;
        user.passwordChangedAt = passwordChangedAt;
        await user.save();
        // Generate token and send it back as a cookie
        const userData = extractUserData(user)
        const token = generateToken(userData)
        res.status(200).json({
            message: "success",
            results: {
                passwordChangedAt: passwordChangedAt,
                token
            }
        })
    }
)
const forgotPassword = catchError(
    async (req, res, next) => {
        const { email } = req.body;
        // check if user exists
        const user = await UserModel.findOne({ email, provider: "credentials" }).select('_id').lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        // check if there are prev token
        const existingToken = await passwordResetTokenModel.findOne({
            user: user._id,
            expiresAt: { $gt: new Date() }
        }).select('_id').lean();
        if (existingToken) return sendError(next, "A reset link was already sent", 400);
        // generate new token
        const newToken = generateToken({ user: user._id }, "15m");
        const hashedToken = crypto.createHash("sha256").update(newToken).digest('hex');
        const expiredTime = new Date(Date.now() + 15 * 60 * 1000);
        // save token and send email with link
        await Promise.all([
            passwordResetTokenModel.create({
                user: user._id,
                token: hashedToken,
                expiresAt: expiredTime
            }),
            sendResetPasswordLink(email, newToken)
        ])
        res.status(200).json({
            message: "success"
        })

    }
)
const resetPassword = catchError(
    async (req, res, next) => {
        const { token, newPassword } = req.body;
        // check if token exists
        const hashedToken = crypto.createHash("sha256").update(token).digest('hex');
        const resetToken = await passwordResetTokenModel.findOne({
            token: hashedToken,
            expiresAt: { $gt: new Date() }
        }).populate('user', '_id').lean();
        if (!resetToken) return sendError(next, "Invalid or expired token.", 400);
        if (!resetToken.user) return sendError(next, "User not found.", 404);
        // hash password
        const hashedPassword = await AuthService.hashPassword(newPassword);
        const passwordChangedAt = Date.now()
        // update password amd delete token
        await Promise.all([
            UserModel.findOneAndUpdate({ _id: resetToken.user._id }, { password: hashedPassword, passwordChangedAt }),
            passwordResetTokenModel.deleteOne({ _id: resetToken._id })
        ]);
        res.status(200).json({
            message: "success"
        })
    }
)
const keepAlive = catchError(
    async (req, res, next) => {
        // const userId = req.user._id;
        // await StatusService.keepAlive(userId);
        res.status(200).json({ message: "success" })

    }
)
// const setupRedisListener = async () => {
//     await StatusService.setupExpiryListener();
// }
// await setupRedisListener();


export {
    search,
    verifyToken,
    verifyTempToken,
    getUser,
    verifyEmail,
    verifyPassword,
    signup,
    signin,
    me,
    uploadProfileImage,
    uploadCoverImage,
    updateBio,
    updateName,
    updateUsername,
    updateEmail,
    updatePassword,
    keepAlive,
    socialAuth,
    exchangeToken,
    forgotPassword,
    resetPassword
}
