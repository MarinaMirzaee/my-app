const BASE_URL = "http://localhost:3001";

export async function getProjects() {
  const res = await fetch(`${BASE_URL}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(data) {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json(); // the new project, including its id
}

export async function updateProject(id, data) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json(); // the full updated project
}

export async function deleteProject(id) {
  const res = await fetch(`${BASE_URL}/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}
