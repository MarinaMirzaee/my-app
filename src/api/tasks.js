import { canAccessProject } from "../utils/permissions";

const BASE_URL = "http://localhost:3001";

async function getProject(projectId) {
  const res = await fetch(`${BASE_URL}/projects/${projectId}`);

  if (!res.ok) {
    throw new Error("Project not found");
  }

  return res.json();
}

async function userExists(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);

  return res.ok;
}

export async function getTasks(projectIds) {
  const res = await fetch(`${BASE_URL}/tasks`);

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
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

  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create task");
  }

  return res.json();
}

export async function updateTask(id, data, user) {
  const taskRes = await fetch(`${BASE_URL}/tasks/${id}`);

  if (!taskRes.ok) {
    throw new Error("Task not found");
  }

  const currentTask = await taskRes.json();

  const project = await getProject(data.projectId ?? currentTask.projectId);

  if (!canAccessProject(user, project)) {
    throw new Error("You do not have permission to edit this task.");
  }

  if (!(await userExists(data.assignee))) {
    throw new Error("The selected assignee does not exist.");
  }

  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update task");
  }

  return res.json();
}

export async function deleteTask(id, user) {
  const tasksRes = await fetch(`${BASE_URL}/tasks`);

  if (!tasksRes.ok) {
    throw new Error("Could not load tasks.");
  }

  const tasks = await tasksRes.json();

  const rootTask = tasks.find((task) => task.id === id);

  if (!rootTask) {
    throw new Error("Task not found");
  }

  const project = await getProject(rootTask.projectId);

  if (!canAccessProject(user, project)) {
    throw new Error("You do not have permission to delete this task.");
  }

  const idsToDelete = [];

  function collectChildren(parentId) {
    const children = tasks.filter((task) => task.parentId === parentId);

    for (const child of children) {
      collectChildren(child.id);
      idsToDelete.push(child.id);
    }
  }

  collectChildren(id);

  idsToDelete.push(id);

  await Promise.all(
    idsToDelete.map((taskId) =>
      fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
      }),
    ),
  );
}
