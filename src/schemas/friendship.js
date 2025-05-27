import * as yup from 'yup';
import { IDValdation } from './id.js';



const deleteFriendSchema = yup.object({
    friendshipId : IDValdation.required("friendship id is required"),
    friendId : IDValdation.required("Friend id is required")
})



export{
    deleteFriendSchema
}

