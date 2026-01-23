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
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["admin", "user"]).optional().default("user"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(18, "User must be at least 18 years old")
    .max(120, "Age must be realistic")
    .optional(),
});

export const loginSchema = z.object({
  email: sanitizedString(
    z.string().email("Invalid email address").toLowerCase()
  ),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
