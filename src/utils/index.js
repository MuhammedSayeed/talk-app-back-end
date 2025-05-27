import jwt from 'jsonwebtoken'
import { AppError } from "./AppError.js"

const extractUserData = (user, forToken = false) => {
    if (forToken) {
        return {
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            provider: user.provider,
            passwordChangedAt: user.passwordChangedAt,
            verified: user.verified,
            emailChangedAt: user.emailChangedAt
        }
    }
    return {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        bio: user.bio,
        verified: user.verified,
        createdAt: user.createdAt,
        provider: user.provider,
        passwordChangedAt: user.passwordChangedAt,
        emailChangedAt: user.emailChangedAt
    }
}
const generateToken = (paylaod, time) => {
    if (time) {
        return jwt.sign(paylaod, process.env.JWT_KEY, { expiresIn: `${time}` })
    }
    return jwt.sign(paylaod, process.env.JWT_KEY)
}
const sendError = (next, message, statusCode) => {
    return next(new AppError(message, statusCode))
}
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function generateUniqueUsername(str, unqiueIdentifier) {
    const noSpaces = str.replace(/\s+/g, '');
    const onLowerCase = noSpaces.toLowerCase();
    return `${onLowerCase}-${unqiueIdentifier}`;
}

function getImageInHighRes(imageSrc, provider) {
    if (provider === 'google') {
        return imageSrc?.replace(/=s96-c/, '=s400-c');
    }
    if (provider === 'github') {
        if (!imageSrc?.includes('size=')) {
            return imageSrc + '&size=400';
        }
        return imageSrc?.replace(/size=\d+/, 'size=400');
    }

}

export {
    extractUserData,
    generateToken,
    sendError,
    generateVerificationCode,
    generateUniqueUsername,
    getImageInHighRes
}