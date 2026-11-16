export function isAdmin(user) {
  return user?.role === "admin";
}

export function canAccessProject(user, project) {
  if (!user || !project) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  return project.owner === user.id || project.members?.includes(user.id);
}

export function canManageProject(user, project) {
  if (!user || !project) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  return project.owner === user.id;
}

export function canManageTasks(user, project) {
  return canAccessProject(user, project);
}
