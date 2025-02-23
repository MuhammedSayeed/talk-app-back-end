import rateLimit from "express-rate-limit";

const typingLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 seconds
    max: 5, // Max 5 requests per window
    message: { error: "Too many typing events, slow down!" },
    standardHeaders: true,
    legacyHeaders: false,
});

export default typingLimiter;