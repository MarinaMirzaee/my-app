export function validate(schema, values) {
  const result = schema.safeParse(values);

  if (result.success) {
    return { data: result.data, errors: {} };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (!errors[field]) errors[field] = issue.message;
  }
  return { data: null, errors };
}
