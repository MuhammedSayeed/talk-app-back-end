import mongoose from "mongoose";


export function dbConnection (){
    mongoose.connect(process.env.DB_CONNECTION_ONLINE).then(()=>{
        console.log("database connection established");
    })
}