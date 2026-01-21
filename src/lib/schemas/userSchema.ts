import { z } from "zod";

/**
 * User Schema for POST and PUT requests
 * Validates complete user data with all required fields
 */
export const userSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase(),
  age: z.number()
    .int("Age must be a whole number")
    .min(18, "User must be at least 18 years old")
    .max(120, "Age must be realistic")
    .optional(),
});

/**
 * User Schema for PATCH requests
 * Allows partial updates - all fields are optional
 */
export const userUpdateSchema = userSchema.partial();

/**
 * TypeScript type inferred from the schema
 * Can be used throughout the application for type safety
 */
export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
