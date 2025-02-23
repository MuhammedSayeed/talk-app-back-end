import userRouter from "./src/modules/user/router.js"
import chatRouter from "./src/modules/chat/router.js"
import friendRequestRouter from "./src/modules/friendRequest/router.js"
import friendshipRouter from "./src/modules/friendship/router.js"
import notificationRouter from "./src/modules/notification/router.js"
import messageRouter from "./src/modules/message/router.js"
import cookieParser from "cookie-parser";
import express from 'express';
import { corsOptions } from "./src/config/cors.js"
import { globalErrorMiddleware } from "./src/middlewares/globalErrorMiddleware.js"
import cors from 'cors';




const ENDPOINTBASE = "/api/v1";

export function init(app) {
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(cookieParser());
    app.use(`${ENDPOINTBASE}/users`, userRouter)
    app.use(`${ENDPOINTBASE}/chats`, chatRouter)
    app.use(`${ENDPOINTBASE}/friend-request`, friendRequestRouter)
    app.use(`${ENDPOINTBASE}/friendship`, friendshipRouter)
    app.use(`${ENDPOINTBASE}/notifications`, notificationRouter)
    app.use(`${ENDPOINTBASE}/messages`, messageRouter)
    app.use(globalErrorMiddleware)

}