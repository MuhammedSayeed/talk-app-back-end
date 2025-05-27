import { Server } from "socket.io";
import { sendError } from "../utils/index.js";
import { parse } from "cookie";
import jwt from 'jsonwebtoken'

let io;

const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    io.use((socket, next) => {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) return sendError(next, "Unauthorized", 400);

        const cookies = parse(cookieHeader);
        const token = cookies.token;

        if (!token) return sendError(next, "Unauthorized", 400);

        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            socket.userId = decoded._id;
            next();
        } catch (error) {
            return sendError(next, "Unauthorized", 400);
        }
    })

    io.on("connection", (socket) => {
        // Join personal room for direct events
        socket.join(`user-${socket.userId}`);
    
        // ✅ Join any custom room (مثل user-status)
        socket.on("join-room", (roomName) => {
            socket.join(roomName);
        });
    
        // ✅ Leave room if needed
        socket.on("leave-room", (roomName) => {
            socket.leave(roomName);
        });
    });
}
export {
    io,
    setupSocket
}

