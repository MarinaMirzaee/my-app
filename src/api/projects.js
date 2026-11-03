const BASE_URL = "http://localhost:3001";

// query: all projects
export async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

// query: one project by its id (used by the project details page)
export async function getProject(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}`);
  if (!res.ok) throw new Error("Project not found");
  return res.json();
}

// mutation: returns the new project, including its id
export async function createProject(data) {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

// mutation: returns the full updated project
export async function updateProject(id, data) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

// mutation: nothing to return
export async function deleteProject(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}
