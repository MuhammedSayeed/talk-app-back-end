import { catchError } from "../../middlewares/CatchError.js"
import { extractUserData, generateToken, sendError } from "../../utils/index.js";
import { UserModel } from "../../../databases/models/user.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { BlockModel } from "../../../databases/models/block.js";
import { FriendShipModel } from "../../../databases/models/friendShip.js";
import { FriendRequestModel } from "../../../databases/models/friendRequest.js";
import pusher from "../../config/pusher.js";
import redisClient from "../../config/redis.js";


const search = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { search } = req.query;

        let searchFilter = {};
        if (search) {
            searchFilter = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
        }
        const query = {
            _id: { $ne: loggedInUser },
            ...searchFilter
        }
        const users = await UserModel.find(query).select('-password -createdAt -provider -__v');

        res.status(200).json({
            message: "success",
            results: {
                users
            }
        })
    }
)
const getUser = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const userId = req.params.id;

        // fetch user details
        const user = await UserModel.findById(userId).select('-password -createdAt -provider -__v');
        if (!user) return sendError(next, "User not found.", 404);

        // Fetch all relevant relationships in parallel
        const [blockStatus, friendship, friendRequest] = await Promise.all([
            BlockModel.findOne({
                $or: [
                    { blocker: userId, blocked: loggedInUser },
                    { blocker: loggedInUser, blocked: userId }
                ]
            }),
            FriendShipModel.findOne({
                $or: [
                    { friendA: loggedInUser, friendB: userId },
                    { friendA: userId, friendB: loggedInUser }
                ]
            }),
            FriendRequestModel.findOne({
                $or: [
                    { sender: userId, receiver: loggedInUser, status: "pending" },
                    { sender: loggedInUser, receiver: userId, status: "pending" }
                ]
            })
        ])


        //response data
        const response = {
            message: "success",
            results: {
                isBlocked: !!blockStatus,  // True if user is blocked
                blockDetails: blockStatus || null,  // Include details only if blocked
                isFriend: !!friendship,  // True if they are friends
                friendShipDetails: friendship || null,  // Include details if friends
                isPendingFriendRequest: !!friendRequest,
                pendingFriendRequest: friendRequest || null,  // Include friend request details if exist
                user
            }
        };

        res.status(200).json(response)
    }
)
const signup = catchError(
    async (req, res, next) => {
        const { username, name, email, password } = req.body;

        // check if username or email is unique
        const existingUser = await UserModel.findOne({
            $or: [{ username }, { email }]
        })
        if (existingUser) return sendError(next, "User already exists.", 400);

        // hash the password
        const hashedPassword = bcrypt.hashSync(password, Number(process.env.ROUND));

        // save user 
        const newUser = new UserModel({
            username,
            name,
            email,
            password: hashedPassword
        })
        await newUser.save();

        // generate token and send it back as a cookie
        const userData = extractUserData(newUser);
        const token = generateToken(userData);

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(201).json({
            message: "success",
            results: {
                user: userData
            }
        })
    }
)
const signIn = catchError(
    async (req, res, next) => {
        const { emailOrUsername, password } = req.body;

        const user = await UserModel.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) return sendError(next, "Invalid username/email or password", 401);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return sendError(next, 'invalid email or password', 401);

        // generate token and send it back as a cookie
        const userData = extractUserData(user);
        const token = generateToken(userData);

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
            message: "success",
            results: {
                user: userData
            }
        })

    }
)
const socialAuth = catchError(
    async (req, res, next) => {
        const { name, email, image, provider, providerId } = req.body;

        let user = await UserModel.findOne({ email });
        if (!user) {
            user = await UserModel.create({
                name,
                email,
                image,
                provider,
                providerId
            })
        }
        const userData = extractUserData(user);
        const token = generateToken(userData);

        res.status(200).json({
            message: "Success",
            results: {
                user: userData,
                token: token,
            }
        })
    }
)
const verifyToken = catchError(
    async (req, res, next) => {
        const { token } = req.cookies;

        if (!token) return sendError(next, 'Not authorized', 401);
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        req.user = decoded;
        next();
    }
)
const blockUser = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: blockedUserId } = req.body;

        // check if user is exist
        const user = await UserModel.findById(blockedUserId);
        if (!user) return sendError(next, "User not found.", 404);

        // check if user already blocked
        const blockedUser = await BlockModel.findOne({
            $or: [
                { blocker: loggedInUser, blocked: blockedUserId },
                { blocker: blockedUserId, blocked: loggedInUser }
            ]
        });
        if (blockedUser) return sendError(next, "Something went wrong.", 400);

        // delete pending friend request if existing
        await FriendRequestModel.findOneAndDelete({
            $or: [
                { sender: loggedInUser, receiver: blockedUserId, status: "pending" },
                { sender: blockedUserId, receiver: loggedInUser, status: "pending" }
            ]
        });


        // Delete friendship if exists
        await FriendShipModel.findOneAndDelete({
            $or: [
                { friendA: loggedInUser, friendB: blockedUserId },
                { friendA: blockedUserId, friendB: loggedInUser }
            ]
        });

        // block the user
        const newBlock = new BlockModel({
            blocker: loggedInUser,
            blocked: blockedUserId
        });
        await newBlock.save();

        return res.status(200).json({ message: "success" });

    }
)
const unblock = catchError(
    async (req, res, next) => {
        const loggedInUser = req.user._id;
        const { _id: blockedUserId } = req.body;

        // check if user is exist
        const user = await UserModel.findById(blockedUserId);
        if (!user) return sendError(next, "User not found.", 404);

        // delete block doc
        await BlockModel.deleteOne({
            $and: [
                { blocker: loggedInUser },
                { blocked: blockedUserId }
            ]
        });

        res.status(200).json({
            message: "success"
        })
    }
)
const keepAlive = catchError(
    async (req, res, next) => {
        const userId = req.user._id;
        console.log('🟢 Keepalive request for user:', userId);

        // Update user status in MongoDB
        const user = await UserModel.findByIdAndUpdate(
            userId, 
            { isOnline: true, lastSeen: null },
            { new: true } 
        )
        
        if (!user) return res.status(404).json({ message: "User not found" });

        await redisClient.set(`user:online:${userId}`, 'true');
        await redisClient.expire(`user:online:${userId}`, 60);
        

        await pusher.trigger(`user-status-${userId}`, `user-status-update`, {
            name: user.name,
            isOnline: true,
            lastSeen: null
        })
        console.log('✅ Pusher event triggered');

        res.status(200).json({ message: "success" });
    }
);
const listenForExpiry = async () => {
    console.log('🔵 Starting Redis expiry listener');
    const subscriber = redisClient.duplicate();
    
    try {
        await subscriber.connect();
        
        await subscriber.configSet('notify-keyspace-events', 'Ex');
        
        await subscriber.subscribe('__keyevent@0__:expired', async (key) => {
            
            if (key.startsWith('user:online:')) {
                const userId = key.split(':')[2];

                const date = new Date();
                const user = await UserModel.findByIdAndUpdate(
                    userId, 
                    { isOnline: false, lastSeen: date },
                    { new: true }
                )

                if (!user) return;

                await pusher.trigger(`user-status-${userId}`, `user-status-update`, {
                    name: user.name,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen
                });
                console.log('✅ Offline status Pusher event triggered');
            }
        });
        
    } catch (error) {
        console.error('❌ Error in expiry listener:', error);
    }
}


listenForExpiry();


export {
    socialAuth,
    signup,
    signIn,
    verifyToken,
    search,
    getUser,
    blockUser,
    unblock,
    keepAlive,
}