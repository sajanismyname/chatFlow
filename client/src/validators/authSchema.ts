import { z } from "zod";


/* =========================
   REGISTER
========================= */

export const registerSchema = z.object({

    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters"),

});


/* =========================
   LOGIN
========================= */

export const loginSchema = z.object({

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),

});


/* =========================
   FORGOT PASSWORD
========================= */

export const forgotPasswordSchema = z.object({

    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),

});


/* =========================
   RESET PASSWORD
========================= */

export const resetPasswordSchema = z
    .object({

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password must be less than 100 characters"),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),

    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );


/* =========================
   TYPES
========================= */

export type RegisterForm = z.infer<
    typeof registerSchema
>;

export type LoginForm = z.infer<
    typeof loginSchema
>;

export type ForgotPasswordForm = z.infer<
    typeof forgotPasswordSchema
>;

export type ResetPasswordForm = z.infer<
    typeof resetPasswordSchema
>;