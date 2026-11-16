export function getSessionUser() {
  const session = localStorage.getItem("projectHubSession");

  if (!session) {
    return null;
  }

  return JSON.parse(session);
}

export function getUserId() {
  return getSessionUser()?.id ?? null;
}
