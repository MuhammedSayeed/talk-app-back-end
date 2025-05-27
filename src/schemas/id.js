import * as yup from 'yup';


const IDValdation = yup.string()
    .required("ID is required")
    .matches(/^[0-9a-fA-F]{24}$/, "Invalid Id format")

const IdSchema = yup.object({
    id: yup.string()
        .required("ID is required")
        .matches(/^[0-9a-fA-F]{24}$/, "Invalid Id format")
});

export {
    IdSchema,
    IDValdation
}