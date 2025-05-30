export const corsOptions = {
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' , 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie' , "token"],
    exposedHeaders: ['Set-Cookie']
}

