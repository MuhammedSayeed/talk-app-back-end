import * as yup from "yup";
import { IDValdation } from "./id.js";




const FriendRequestSchema = yup.object({
    _id : IDValdation.required("id is required")
})



export {
    FriendRequestSchema
}