import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
});