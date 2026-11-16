import { canAccessProject, canManageProject } from "../utils/permissions";

const BASE_URL = "http://localhost:3001";

export async function getProjects(user) {
  const res = await fetch(`${BASE_URL}/projects`);

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  const projects = await res.json();

  if (user?.role === "admin") {
    return projects;
  }

  return projects.filter((project) => canAccessProject(user, project));
}

export async function getProject(id, user) {
  const res = await fetch(`${BASE_URL}/projects/${id}`);

  if (!res.ok) {
    throw new Error("Project not found");
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

  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    throw new Error("Failed to create project");
  }

  return res.json();
}

export async function updateProject(id, data, user) {
  const currentRes = await fetch(`${BASE_URL}/projects/${id}`);

  if (!currentRes.ok) {
    throw new Error("Project not found");
  }

  const currentProject = await currentRes.json();

  if (!canManageProject(user, currentProject)) {
    throw new Error("You do not have permission to edit this project.");
  }

  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update project");
  }

  return res.json();
}

export async function deleteProject(id, user) {
  const projectRes = await fetch(`${BASE_URL}/projects/${id}`);

  if (!projectRes.ok) {
    throw new Error("Project not found");
  }

  const project = await projectRes.json();

  if (!canManageProject(user, project)) {
    throw new Error("You do not have permission to delete this project.");
  }

  const tasksRes = await fetch(`${BASE_URL}/tasks`);

  if (!tasksRes.ok) {
    throw new Error("Could not load project tasks.");
  }

  const tasks = await tasksRes.json();

  const projectTasks = tasks.filter((task) => task.projectId === project.id);

  await Promise.all(
    projectTasks.map((task) =>
      fetch(`${BASE_URL}/tasks/${task.id}`, {
        method: "DELETE",
      }),
    ),
  );

  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete project");
  }
}
