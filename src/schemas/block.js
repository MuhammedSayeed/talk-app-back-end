import * as yup from 'yup';
import { IDValdation } from './id.js';



const getBlockSchema = yup.object({
    user : IDValdation.required("User id is required")
})

const blockUserSchema = yup.object({
    _id : IDValdation.required("User id is required")
})


export {
    getBlockSchema,
    blockUserSchema
}