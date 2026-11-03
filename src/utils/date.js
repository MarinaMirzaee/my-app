export function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

// dueDate is saved as "2026-11-10" (a date without a time)
export function formatDueDate(date) {
  return date ? new Date(date + "T00:00").toLocaleDateString() : "-";
}

export function isOverdue(task) {
  const today = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time
  return (
    Boolean(task.dueDate) && task.status !== "done" && task.dueDate < today
  );
}
