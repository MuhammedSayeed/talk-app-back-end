import * as dotenv from 'dotenv'
import { dbConnection } from './databases/connection.js';
import { init } from './index.routes.js';
import express from "express";

dotenv.config();
const app = express();
const port = 3001;
dbConnection()
init(app)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

