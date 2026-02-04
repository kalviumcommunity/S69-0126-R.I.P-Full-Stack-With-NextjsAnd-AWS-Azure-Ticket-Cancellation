import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitizer";

const sanitizedString = <T extends z.ZodString>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === "string" ? sanitizeInput(value) : value),
    schema
  );

export const signupSchema = z.object({
  name: sanitizedString(
    z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must not exceed 100 characters")
  ),
  email: sanitizedString(
    z.string().email("Invalid email address").toLowerCase()
  ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  role: z.enum(["admin", "user"]).optional().default("user"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(18, "User must be at least 18 years old")
    .max(120, "Age must be realistic")
    .optional(),
  otp: z.string().length(6, "OTP must be exactly 6 digits").optional(),
});

export const loginSchema = z.object({
  email: sanitizedString(
    z.string().email("Invalid email address").toLowerCase()
  ),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
