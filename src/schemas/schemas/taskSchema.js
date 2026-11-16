import { z } from "zod";
import { titleField } from "../projectSchema";

export const taskSchema = z.object({
  title: titleField,

  priority: z.enum(["low", "medium", "high"]),

  status: z.enum(["todo", "in-progress", "done"]),

  assignee: z
    .string()
    .trim()
    .min(1, "Choose an assignee.")
    .max(100, "Assignee is too long."),

  projectId: z.string().min(1, "Choose a project.").transform(Number),

  parentId: z
    .string()
    .transform((value) => (value === "" ? null : Number(value))),

  dueDate: z
    .string()
    .refine(
      (value) => value === "" || !Number.isNaN(Date.parse(value)),
      "Enter a valid date.",
    )
    .transform((value) => (value === "" ? null : value)),
});
