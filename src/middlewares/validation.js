import { AppError } from "../utils/AppError.js";

export const validation = (schema) => {
  return async (req, res, next) => {
    try {
      const inputs = { ...req.body, ...req.params, ...req.query };
      
      await schema.validate(inputs, { abortEarly: true });
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = error.errors;
        return next(new AppError(errors, 400)); 
      }
      return next(new AppError("Validation error", 500));
    }
  };
};