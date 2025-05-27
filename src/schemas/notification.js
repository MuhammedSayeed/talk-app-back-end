import * as yup from 'yup';

const typeOfNotification = yup
    .string()
    .oneOf(["friend-request", "accept-friend-request"])

const notificationsSchema = yup.object({
    type: typeOfNotification.required("Type is required")
})




export {
    notificationsSchema
}