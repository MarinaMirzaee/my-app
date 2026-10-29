export function getUserId() {
  let id = localStorage.getItem("userId");

  if (!id) {
    id = "user-" + crypto.randomUUID();
    localStorage.setItem("userId", id);
  }

  return id;
}
