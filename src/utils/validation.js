function validateTitle(title) {
  if (!title) return "Title is required.";
  if (title.length < 3) return "Title must be at least 3 characters.";
  if (title.length > 60) return "Title must be 60 characters or less.";
  return null;
}

export function validateProject(values) {
  const errors = {};

  const titleError = validateTitle(values.title);
  if (titleError) errors.title = titleError;

  return errors;
}

export function validateTask(values) {
  const errors = {};

  const titleError = validateTitle(values.title);
  if (titleError) errors.title = titleError;

  if (values.assignee.length > 40) {
    errors.assignee = "Assignee must be 40 characters or less.";
  }

  if (!values.projectId) {
    errors.projectId = "Choose a project.";
  }

  return errors;
}
