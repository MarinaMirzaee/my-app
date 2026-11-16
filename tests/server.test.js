import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createApiServer } from "../server.js";

const ITERATIONS = 210_000;
const PASSWORD = "test-password";
const SECRET = "test-session-secret";

function storedUser(id, email, role = "user") {
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = pbkdf2Sync(
    PASSWORD,
    Buffer.from(passwordSalt, "hex"),
    ITERATIONS,
    32,
    "sha256",
  ).toString("hex");

  return {
    id,
    name: id,
    email,
    role,
    passwordSalt,
    passwordHash,
  };
}

test("API enforces roles, project membership, registered assignees, and cascaded deletes", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "projecthub-api-"));
  const databasePath = join(directory, "db.json");
  const owner = storedUser("owner", "owner@example.com");
  const member = storedUser("member", "member@example.com");
  const outsider = storedUser("outsider", "outsider@example.com");
  const admin = storedUser("admin", "admin@example.com", "admin");
  const initialDatabase = {
    users: [owner, member, outsider, admin],
    projects: [
      { id: 1, title: "Shared", owner: owner.id, members: [member.id] },
      { id: 2, title: "Private", owner: outsider.id, members: [] },
    ],
    tasks: [
      { id: 1, title: "Root", projectId: 1, parentId: null, assignee: member.id },
      { id: 2, title: "Child", projectId: 1, parentId: 1, assignee: member.id },
      { id: 3, title: "Grandchild", projectId: 1, parentId: 2, assignee: member.id },
      { id: 4, title: "Private task", projectId: 2, parentId: null, assignee: outsider.id },
    ],
  };
  writeFileSync(databasePath, JSON.stringify(initialDatabase));

  const server = createApiServer({ databasePath, sessionSecret: SECRET });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    rmSync(directory, { recursive: true, force: true });
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  async function request(path, { token, ...options } = {}) {
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${baseUrl}${path}`, { ...options, headers });
  }
  async function signIn(email) {
    const response = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: PASSWORD }),
    });
    assert.equal(response.status, 200);
    return response.json();
  }

  assert.equal((await request("/projects")).status, 401);

  const ownerSession = await signIn(owner.email);
  const memberSession = await signIn(member.email);
  const outsiderSession = await signIn(outsider.email);
  const adminSession = await signIn(admin.email);

  const ownerProjects = await request("/projects", { token: ownerSession.token });
  assert.deepEqual((await ownerProjects.json()).map((project) => project.id), [1]);

  const memberProjects = await request("/projects", { token: memberSession.token });
  assert.deepEqual((await memberProjects.json()).map((project) => project.id), [1]);

  assert.equal((await request("/projects/1", { token: outsiderSession.token })).status, 403);
  assert.deepEqual(
    (await (await request("/projects", { token: outsiderSession.token })).json()).map((project) => project.id),
    [2],
  );

  const listedUsers = await request("/users", { token: ownerSession.token });
  assert.equal((await listedUsers.json())[0].passwordHash, undefined);

  const profileChange = await request(`/users/${owner.id}`, {
    token: ownerSession.token,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "admin" }),
  });
  assert.equal(profileChange.status, 400);

  const createdProjectResponse = await request("/projects", {
    token: ownerSession.token,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Owned", owner: outsider.id, members: [] }),
  });
  assert.equal(createdProjectResponse.status, 201);
  assert.equal((await createdProjectResponse.json()).owner, owner.id);

  const createdTaskResponse = await request("/tasks", {
    token: ownerSession.token,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Assigned",
      priority: "low",
      status: "todo",
      projectId: 1,
      parentId: null,
      assignee: member.id,
      createdBy: outsider.id,
    }),
  });
  assert.equal(createdTaskResponse.status, 201);
  const createdTask = await createdTaskResponse.json();
  assert.equal(createdTask.createdBy, owner.id);

  const invalidAssignee = await request("/tasks", {
    token: ownerSession.token,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Invalid assignment",
      priority: "low",
      status: "todo",
      projectId: 1,
      parentId: null,
      assignee: "not-a-user",
    }),
  });
  assert.equal(invalidAssignee.status, 400);

  assert.equal((await request("/projects/1", {
    token: outsiderSession.token,
    method: "DELETE",
  })).status, 403);

  assert.equal((await request("/tasks/1", {
    token: ownerSession.token,
    method: "DELETE",
  })).status, 200);
  let persisted = JSON.parse(readFileSync(databasePath, "utf8"));
  assert.equal(persisted.tasks.some((task) => [1, 2, 3].includes(task.id)), false);

  const adminProjects = await request("/projects", { token: adminSession.token });
  assert.equal((await adminProjects.json()).length, 3);

  assert.equal((await request("/projects/2", {
    token: adminSession.token,
    method: "DELETE",
  })).status, 200);
  persisted = JSON.parse(readFileSync(databasePath, "utf8"));
  assert.equal(persisted.projects.some((project) => project.id === 2), false);
  assert.equal(persisted.tasks.some((task) => task.projectId === 2), false);

  const registration = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "New user",
      email: "new@example.com",
      password: "new-password",
    }),
  });
  assert.equal(registration.status, 200);
  assert.equal((await registration.json()).user.role, "user");
});
