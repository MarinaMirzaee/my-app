import { z } from "zod";

export const titleField = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .min(3, "Title must be at least 3 characters.")
  .max(60, "Title must be 60 characters or less.");

export const projectSchema = z.object({
  title: titleField,

  members: z.array(z.string()),

  completed: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});
