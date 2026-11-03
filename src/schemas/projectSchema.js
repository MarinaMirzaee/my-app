import { z } from "zod";

// shared by the project and task schemas
export const titleField = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .min(3, "Title must be at least 3 characters.")
  .max(60, "Title must be 60 characters or less.");

export const projectSchema = z.object({
  title: titleField,
  // "Sara, Marina" -> ["Sara", "Marina"]
  members: z.string().transform((value) =>
    value
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
  ),
  // an unchecked checkbox is missing from FormData a checked one is "on"
  completed: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});
