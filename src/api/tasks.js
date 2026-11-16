import { canAccessProject } from "../utils/permissions";
import { apiFetch, readApiError } from "./client.js";

async function getProject(projectId) {
  const res = await apiFetch(`/projects/${projectId}`);

  if (!res.ok) {
    throw await readApiError(res, "Project not found.");
  }

  return res.json();
}

async function userExists(userId) {
  const res = await apiFetch(`/users/${encodeURIComponent(userId)}`);

  return res.ok;
}

export async function getTasks(projectIds) {
  const res = await apiFetch("/tasks");

  if (!res.ok) {
    throw await readApiError(res, "Failed to fetch tasks.");
  }

  const tasks = await res.json();

  if (!Array.isArray(projectIds)) {
    return tasks;
  }

  return tasks.filter((task) => projectIds.includes(task.projectId));
}

export async function createTask(data, user) {
  if (!Number.isInteger(data.projectId)) {
    throw new Error("A task must belong to a project");
  }

  const project = await getProject(data.projectId);

  if (!canAccessProject(user, project)) {
    throw new Error("You do not have permission to add tasks to this project.");
  }

  if (!(await userExists(data.assignee))) {
    throw new Error("The selected assignee does not exist.");
  }

  const res = await apiFetch("/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw await readApiError(res, "Failed to create task.");
  }

  return res.json();
}

export async function updateTask(id, data, user) {
  const taskRes = await apiFetch(`/tasks/${id}`);

  if (!taskRes.ok) {
    throw await readApiError(taskRes, "Task not found.");
  }

  const currentTask = await taskRes.json();

  const project = await getProject(data.projectId ?? currentTask.projectId);

  if (!canAccessProject(user, project)) {
    throw new Error("You do not have permission to edit this task.");
  }

  if (!(await userExists(data.assignee))) {
    throw new Error("The selected assignee does not exist.");
  }

  const res = await apiFetch(`/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw await readApiError(res, "Failed to update task.");
  }

  return res.json();
}

export async function deleteTask(id, user) {
  const projectRes = await apiFetch(`/tasks/${id}`);
  if (!projectRes.ok) throw await readApiError(projectRes, "Task not found.");

  const task = await projectRes.json();
  const project = await getProject(task.projectId);
  if (!canAccessProject(user, project)) {
    throw new Error("You do not have permission to delete this task.");
  }

  const res = await apiFetch(`/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw await readApiError(res, "Could not delete task.");
}
