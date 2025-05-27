import mongoose from "mongoose";


export function dbConnection (){
    mongoose.connect(process.env.DB_CONNECTION_ONLINE , {serverSelectionTimeoutMS : 30000}).then(()=>{
        console.log("database connection established");
    })
}