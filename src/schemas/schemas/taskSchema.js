import { z } from "zod";
import { titleField } from "../projectSchema";

export const taskSchema = z.object({
  title: titleField,

  priority: z.enum(["low", "medium", "high"]),

  status: z.enum(["todo", "in-progress", "done"]),

  assignee: z
    .string()
    .trim()
    .max(40, "Assignee must be 40 characters or less."),

  // A task must belong to a project
  projectId: z.string().min(1, "Choose a project.").transform(Number),

  // Empty parentId means main task
  parentId: z
    .string()
    .transform((value) => (value === "" ? null : Number(value))),

  // Empty dueDate becomes null
  dueDate: z
    .string()
    .refine(
      (value) => value === "" || !Number.isNaN(Date.parse(value)),
      "Enter a valid date.",
    )
    .transform((value) => (value === "" ? null : value)),
});
