import jwt from 'jsonwebtoken'
import { AppError } from "./AppError.js"

const extractUserData = (user) => {
    return {
        _id: user._id,
        username : user.username,
        name: user.name,
        email: user.email,
        image: user.image
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


export {
    extractUserData,
    generateToken,
    sendError
}