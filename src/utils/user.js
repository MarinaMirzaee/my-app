export function getUserId() {
  const session = localStorage.getItem("projectHubSession");
  if (session) return JSON.parse(session).id;

  let id = localStorage.getItem("userId");

  if (!id) {
    id = "user-" + crypto.randomUUID();
    localStorage.setItem("userId", id);
  }

  return id;
}
