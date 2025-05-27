import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'
import { UserModel } from "../../databases/models/user.js";

export class AuthService {
    static async hashPassword(password) {
        return bcrypt.hashSync(password, Number(process.env.ROUND))
    }
    static async signup(userData) {
        const { username, name, email, password } = userData;

        // First check if user exists with ANY provider
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            if (existingUser.provider !== "credentials") {
                return {
                    error: true,
                    message: `Account already exists with other provider`,
                    code: 400
                };
            }
            return {
                error: true,
                message: "User already exists.",
                code: 400
            };
        }

        const hashedPassword = await this.hashPassword(password);

        const newUser = new UserModel({
            username: username,
            name: name,
            email: email.toLowerCase(),
            password: hashedPassword,
            profilePic: {
                src: "https://res.cloudinary.com/dndjbkrcv/image/upload/v1744827248/ChatGPT-Image-Apr-16_-2025_-08_12_29-PM_fd12kf.png",
            },
            coverPic: {
                src: "https://res.cloudinary.com/dndjbkrcv/image/upload/v1744850910/cover_default_ah8ps7.png",
            },
            provider: "credentials"
        })

        return await newUser.save();

    }
    static async signIn(emailOrUsername, password) {
        const user = await UserModel.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        })

        if (!user) return {
            error: true,
            message: `Invalid username/email or password`,
            code: 400
        };

        if (user.provider !== "credentials") {
            return {
                error: true,
                message: `Account already exists with other provider`,
                code: 400
            };
        }

        const isMatch = await this.verifyPassword(password, user.password);

        if (!isMatch) return {
            error: true,
            message: `Invalid username/email or password`,
            code: 400
        };

        return user;
    }
    static verifyToken(token) {
        return jwt.verify(token, process.env.JWT_KEY)
    }
    static async verifyPassword(password, savedPassword) {
        return await bcrypt.compare(password, savedPassword);
    }
    static setAuthToken(res, token) {
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, 
            sameSite: "None", 
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
    }
    static clearAuthToken(res) {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });
    }
}