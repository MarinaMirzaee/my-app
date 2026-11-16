import { canAccessProject, canManageProject } from "../utils/permissions";
import { apiFetch, readApiError } from "./client.js";

export async function getProjects(user) {
  const res = await apiFetch("/projects");

  if (!res.ok) {
    throw await readApiError(res, "Failed to fetch projects.");
  }

  const projects = await res.json();

  if (user?.role === "admin") {
    return projects;
  }

  return projects.filter((project) => canAccessProject(user, project));
}

export async function getProject(id, user) {
  const res = await apiFetch(`/projects/${id}`);

  if (!res.ok) {
    throw await readApiError(res, "Project not found.");
  }

  const project = await res.json();

  if (!canAccessProject(user, project)) {
    throw new Error("You do not have permission to view this project.");
  }

  return project;
}

export async function createProject(data, user) {
  if (!user) {
    throw new Error("You must be signed in.");
  }

  const project = {
    ...data,
    owner: user.id,
  };

  const res = await apiFetch("/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    throw await readApiError(res, "Failed to create project.");
  }

  return res.json();
}

export async function updateProject(id, data, user) {
  const currentRes = await apiFetch(`/projects/${id}`);

  if (!currentRes.ok) {
    throw await readApiError(currentRes, "Project not found.");
  }

  const currentProject = await currentRes.json();

  if (!canManageProject(user, currentProject)) {
    throw new Error("You do not have permission to edit this project.");
  }

  const res = await apiFetch(`/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw await readApiError(res, "Failed to update project.");
  }

  return res.json();
}

export async function deleteProject(id, user) {
  const projectRes = await apiFetch(`/projects/${id}`);

  if (!projectRes.ok) {
    throw await readApiError(projectRes, "Project not found.");
  }

  const project = await projectRes.json();

  if (!canManageProject(user, project)) {
    throw new Error("You do not have permission to delete this project.");
  }

  const res = await apiFetch(`/projects/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw await readApiError(res, "Failed to delete project.");
  }
}
