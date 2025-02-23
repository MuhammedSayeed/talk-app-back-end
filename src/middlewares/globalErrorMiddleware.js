export const globalErrorMiddleware = (err, req, res, next) => {
    const { message } = err;
    const code = err.statusCode || 500;
    res.status(code).json({ message: message, statusCode: code })
}