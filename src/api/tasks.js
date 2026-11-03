const BASE_URL = "http://localhost:3001";

// query: only reads data
export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

// mutation: returns the new task with its id
export async function createTask(data) {
  // last safety net: the form and the Zod schema already check this
  if (!Number.isInteger(data.projectId)) {
    throw new Error("A task must belong to a project");
  }

  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

// mutation: returns the full updated task
export async function updateTask(id, data) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

// mutation: nothing to return
export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}
