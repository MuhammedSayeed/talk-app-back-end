import * as yup from 'yup';

const usernameValidation = yup.string()
    .min(3, "Username must be at least 3 characters long")
    .max(16, "Username must be at most 16 characters long");

const emailValidation = yup.string().email("Invalid email format").trim();
const passwordValidation = yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password must be at most 32 characters")
    .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain lowercase, uppercase, and digit"
    )

const nameValidation = yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(32, "Name must be at most 32 characters")

// Define allowed social providers
const ALLOWED_PROVIDERS = ['google', 'github'];

const signupSchema = yup.object({
    name: nameValidation.required("Name is required"),
    username: usernameValidation.required("Username is required"),
    email: emailValidation.required("Email is required"),
    password: passwordValidation.required("Password is required")
});
const signinSchema = yup.object({
    emailOrUsername: yup.string()
        .required("Email or username is required")
        .test("email-or-username", "Invalid email or username format", function (value) {
            if (!value) return false;

            try {
                // Try validating as email
                const isEmail = emailValidation.isValidSync(value);

                // Try validating as username
                const isUsername = usernameValidation.isValidSync(value);

                return isEmail || isUsername;
            } catch {
                return false;
            }
        }),
    password: passwordValidation.required("Password is required")
});
const socialAuthSchema = yup.object({
    // Name validation
    name: yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .trim(),

    email: emailValidation.required("Email is required"),

    // Image URL validation
    image: yup.string()
        .required("Profile image URL is required")
        .url("Invalid image URL format"),

    // Provider validation - restrict to known providers
    provider: yup.string()
        .required("Provider is required")
        .oneOf(ALLOWED_PROVIDERS, `Provider must be one of: ${ALLOWED_PROVIDERS.join(', ')}`),

    // Provider ID validation
    providerId: yup.string()
        .required("Provider ID is required")
        .min(1, "Provider ID cannot be empty")
        .max(255, "Provider ID is too long")
});

const bioSchema = yup.object({
    bio: yup.string().min(1, "Bio must be at least 1 character long").max(139, "Bio must be at most 139 characters long").required("Bio is required")
})

const updateNameSchema = yup.object({
    name: nameValidation.required("Name is required"),
    password: passwordValidation.optional()
})

const updateUsernameSchema = yup.object({
    username: usernameValidation.required("Username is required"),
    password: passwordValidation.optional()
})

const updateEmailSchema = yup.object({
    email: emailValidation.required("Email is required"),
    password: passwordValidation.required("Password is required")
})

const updatePasswordSchema = yup.object({
    password: passwordValidation.required("Password is required"),
    newPassword: passwordValidation.required("New password is required")
})

const verifyAccountSchema = yup.object({
    code: yup.string().required("Code is required"),
    password: passwordValidation.required("Password is required")
})

const forgotPasswordSchema = yup.object({
    email: emailValidation.required("Email is required.")
})

const resetPasswordSchema = yup.object({
    newPassword: passwordValidation.required("Password is required"),
    token: yup.string()
        .required("Reset token is required")
        .trim()
        .min(6, "Invalid token format")
})



export {
    signupSchema,
    signinSchema,
    socialAuthSchema,
    bioSchema,
    updateNameSchema,
    updateUsernameSchema,
    updateEmailSchema,
    updatePasswordSchema,
    verifyAccountSchema,
    forgotPasswordSchema,
    resetPasswordSchema
}