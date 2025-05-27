export const corsOptions = {
    origin: "https://talk-chat-rho.vercel.app",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}