const BASE_URL = "http://localhost:3001";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const users = await res.json();

  return users.map(publicUser);
}

export async function getUser(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`);

  if (!res.ok) {
    throw new Error("User not found");
  }

  const user = await res.json();

  return publicUser(user);
}
