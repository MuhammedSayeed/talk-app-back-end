import * as dotenv from 'dotenv'
import { dbConnection } from './databases/connection.js';
import { init } from './index.routes.js';
import express from "express";
import http from 'http';
import { setupSocket } from './src/config/socket.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app)


// setup socket.io
setupSocket(server);


// Initialize routes and middlewares
init(app)


// Connect to the database
dbConnection()



server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});




