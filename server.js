import { createHmac, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { createServer } from "node:http";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATABASE_PATH = resolve(ROOT, "db.json");
const HASH_ITERATIONS = 210_000;
const TOKEN_LIFETIME_MS = 12 * 60 * 60 * 1000;
const VALID_PRIORITIES = new Set(["low", "medium", "high"]);
const VALID_STATUSES = new Set(["todo", "in-progress", "done"]);

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function readBody(request) {
  return new Promise((resolveBody, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(Object.assign(new Error("Request body is too large."), { status: 413 }));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!body) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 }));
      }
    });

    request.on("error", reject);
  });
}

function makeToken(userId, secret) {
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: Date.now() + TOKEN_LIFETIME_MS }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");

  return `${payload}.${signature}`;
}

function readToken(token, secret) {
  if (!token) {
    return null;
  }

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.sub === "string" && data.exp > Date.now() ? data.sub : null;
  } catch {
    return null;
  }
}

function createPasswordHash(password, salt) {
  return pbkdf2Sync(password, Buffer.from(salt, "hex"), HASH_ITERATIONS, 32, "sha256").toString("hex");
}

function verifyPassword(password, user) {
  const stored = Buffer.from(user.passwordHash || "", "hex");
  const calculated = Buffer.from(createPasswordHash(password, user.passwordSalt || ""), "hex");

  return stored.length === calculated.length && timingSafeEqual(stored, calculated);
}

function getId(records) {
  return records.reduce(
    (max, record) => (Number.isInteger(record.id) ? Math.max(max, record.id) : max),
    0,
  ) + 1;
}

function isValidName(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function createApiServer({
  databasePath = DEFAULT_DATABASE_PATH,
  sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
} = {}) {
  if (!existsSync(databasePath)) {
    throw new Error(`Database file not found: ${databasePath}`);
  }

  const database = JSON.parse(readFileSync(databasePath, "utf8"));
  if (!Array.isArray(database.users) || !Array.isArray(database.projects) || !Array.isArray(database.tasks)) {
    throw new Error("Database must contain users, projects, and tasks arrays.");
  }

  function persist() {
    writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
  }

  function getUserById(id) {
    return database.users.find((user) => user.id === id);
  }

  function getProjectById(id) {
    return database.projects.find((project) => String(project.id) === id);
  }

  function canAccessProject(user, project) {
    return user.role === "admin" ||
      project.owner === user.id ||
      (Array.isArray(project.members) && project.members.includes(user.id));
  }

  function canManageProject(user, project) {
    return user.role === "admin" || project.owner === user.id;
  }

  function validateMembers(members) {
    if (!Array.isArray(members) || members.some((id) => !database.users.some((user) => user.id === id))) {
      fail(400, "Every project member must be a registered user.");
    }

    return members;
  }

  function validateTask(data, currentTask = null) {
    const projectId = Number(data.projectId ?? currentTask?.projectId);
    const project = database.projects.find((item) => item.id === projectId);

    if (!Number.isInteger(projectId) || !project) {
      fail(400, "A valid project is required.");
    }

    if (typeof data.title === "string" && !data.title.trim()) {
      fail(400, "Task title cannot be empty.");
    }

    const priority = data.priority ?? currentTask?.priority;
    const status = data.status ?? currentTask?.status;
    if (!VALID_PRIORITIES.has(priority) || !VALID_STATUSES.has(status)) {
      fail(400, "Task priority or status is invalid.");
    }

    const assignee = data.assignee ?? currentTask?.assignee;
    if (!database.users.some((user) => user.id === assignee)) {
      fail(400, "The selected assignee is not a registered user.");
    }

    const parentId = data.parentId === undefined ? currentTask?.parentId : data.parentId;
    let normalizedParentId = null;
    if (parentId !== null && parentId !== undefined) {
      const parent = database.tasks.find((task) => String(task.id) === String(parentId));
      if (!parent || parent.projectId !== projectId || parent.parentId !== null) {
        fail(400, "A parent task must be a main task in the same project.");
      }
      normalizedParentId = parent.id;
    }

    return { project, projectId, assignee, parentId: normalizedParentId };
  }

  async function handle(request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    const url = new URL(request.url, "http://localhost");
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const method = request.method;

    if (method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (method === "POST" && (url.pathname === "/auth/register" || url.pathname === "/auth/login")) {
      const body = await readBody(request);
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";

      if (!email || !password) {
        fail(400, "Email and password are required.");
      }

      let user;
      if (url.pathname === "/auth/register") {
        if (!isValidName(body.name) || password.length < 8) {
          fail(400, "A name and a password of at least 8 characters are required.");
        }
        if (database.users.some((item) => item.email.toLowerCase() === email)) {
          fail(409, "An account with this email already exists.");
        }

        const passwordSalt = randomBytes(16).toString("hex");
        user = {
          id: randomUUID(),
          name: body.name.trim(),
          email,
          role: "user",
          passwordSalt,
          passwordHash: createPasswordHash(password, passwordSalt),
        };
        database.users.push(user);
        persist();
      } else {
        user = database.users.find((item) => item.email.toLowerCase() === email);
        if (!user || !verifyPassword(password, user)) {
          fail(401, "Invalid email or password.");
        }
      }

      sendJson(response, 200, { user: publicUser(user), token: makeToken(user.id, sessionSecret) });
      return;
    }

    const token = request.headers.authorization?.startsWith("Bearer ")
      ? request.headers.authorization.slice(7)
      : null;
    const userId = readToken(token, sessionSecret);
    const user = userId ? getUserById(userId) : null;
    if (!user) {
      fail(401, "Sign in is required.");
    }

    if (method === "GET" && url.pathname === "/auth/me") {
      sendJson(response, 200, publicUser(user));
      return;
    }

    if (parts[0] === "users") {
      if (method === "GET" && parts.length === 1) {
        sendJson(response, 200, database.users.map(publicUser));
        return;
      }
      if (method === "GET" && parts.length === 2) {
        const found = getUserById(parts[1]);
        if (!found) fail(404, "User not found.");
        sendJson(response, 200, publicUser(found));
        return;
      }
      if (method === "PATCH" && parts.length === 2) {
        if (parts[1] !== user.id) fail(403, "You can only update your own account.");
        const body = await readBody(request);
        if (body.role !== undefined || body.passwordHash !== undefined || body.passwordSalt !== undefined || body.id !== undefined) {
          fail(400, "Account role and credentials cannot be changed here.");
        }
        if (body.name !== undefined && typeof body.name !== "string") fail(400, "Name must be text.");
        if (body.email !== undefined && typeof body.email !== "string") fail(400, "Email must be text.");
        const name = body.name === undefined ? user.name : body.name.trim();
        const email = body.email === undefined ? user.email : body.email.trim().toLowerCase();
        if (!isValidName(name) || !email) fail(400, "Name and email are required.");
        if (database.users.some((item) => item.id !== user.id && item.email.toLowerCase() === email)) {
          fail(409, "An account with this email already exists.");
        }
        user.name = name;
        user.email = email;
        persist();
        sendJson(response, 200, publicUser(user));
        return;
      }
      fail(404, "Not found.");
    }

    if (parts[0] === "projects") {
      if (method === "GET" && parts.length === 1) {
        const projects = user.role === "admin"
          ? database.projects
          : database.projects.filter((project) => canAccessProject(user, project));
        sendJson(response, 200, projects);
        return;
      }

      if (parts.length === 2 && method === "GET") {
        const project = getProjectById(parts[1]);
        if (!project) fail(404, "Project not found.");
        if (!canAccessProject(user, project)) fail(403, "You do not have permission to view this project.");
        sendJson(response, 200, project);
        return;
      }

      if (parts.length === 1 && method === "POST") {
        const body = await readBody(request);
        if (!isValidName(body.title)) fail(400, "Project title is required.");
        const project = {
          id: getId(database.projects),
          title: body.title.trim(),
          owner: user.id,
          members: validateMembers(body.members ?? []),
          createdAt: body.createdAt || new Date().toISOString(),
          updatedAt: body.updatedAt || new Date().toISOString(),
          completedAt: body.completedAt ?? null,
        };
        database.projects.push(project);
        persist();
        sendJson(response, 201, project);
        return;
      }

      if (parts.length === 2 && (method === "PATCH" || method === "DELETE")) {
        const project = getProjectById(parts[1]);
        if (!project) fail(404, "Project not found.");
        if (!canManageProject(user, project)) fail(403, "You do not have permission to manage this project.");

        if (method === "PATCH") {
          const body = await readBody(request);
          if (body.owner !== undefined || body.id !== undefined) fail(400, "Project ownership cannot be changed.");
          if (body.title !== undefined) {
            if (!isValidName(body.title)) fail(400, "Project title is required.");
            project.title = body.title.trim();
          }
          if (body.members !== undefined) project.members = validateMembers(body.members);
          if (body.updatedAt !== undefined) project.updatedAt = body.updatedAt;
          if (body.completedAt !== undefined) project.completedAt = body.completedAt;
          persist();
          sendJson(response, 200, project);
          return;
        }

        database.tasks = database.tasks.filter((task) => task.projectId !== project.id);
        database.projects = database.projects.filter((item) => item.id !== project.id);
        persist();
        sendJson(response, 200, {});
        return;
      }

      fail(404, "Not found.");
    }

    if (parts[0] === "tasks") {
      if (method === "GET" && parts.length === 1) {
        const projects = database.projects.filter((project) => canAccessProject(user, project));
        const projectIds = new Set(projects.map((project) => project.id));
        sendJson(response, 200, database.tasks.filter((task) => projectIds.has(task.projectId)));
        return;
      }

      if (parts.length === 2 && method === "GET") {
        const task = database.tasks.find((item) => String(item.id) === parts[1]);
        if (!task) fail(404, "Task not found.");
        const project = database.projects.find((item) => item.id === task.projectId);
        if (!project || !canAccessProject(user, project)) fail(403, "You do not have permission to view this task.");
        sendJson(response, 200, task);
        return;
      }

      if (parts.length === 1 && method === "POST") {
        const body = await readBody(request);
        const { project, projectId, assignee, parentId } = validateTask(body);
        if (!canAccessProject(user, project)) fail(403, "You do not have permission to add tasks to this project.");
        if (!isValidName(body.title)) fail(400, "Task title is required.");
        const task = {
          id: getId(database.tasks),
          title: body.title.trim(),
          priority: body.priority,
          status: body.status,
          projectId,
          assignee,
          parentId,
          createdBy: user.id,
          dueDate: body.dueDate ?? null,
          createdAt: body.createdAt || new Date().toISOString(),
          updatedAt: body.updatedAt || new Date().toISOString(),
          completedAt: body.completedAt ?? null,
        };
        database.tasks.push(task);
        persist();
        sendJson(response, 201, task);
        return;
      }

      if (parts.length === 2 && method === "PATCH") {
        const task = database.tasks.find((item) => String(item.id) === parts[1]);
        if (!task) fail(404, "Task not found.");
        const currentProject = database.projects.find((item) => item.id === task.projectId);
        if (!currentProject || !canAccessProject(user, currentProject)) fail(403, "You do not have permission to edit this task.");
        const body = await readBody(request);
        if (body.id !== undefined || body.createdBy !== undefined) fail(400, "Task identity and creator cannot be changed.");
        const { project, projectId, assignee, parentId } = validateTask(body, task);
        if (!canAccessProject(user, project)) fail(403, "You do not have permission to move tasks to this project.");
        if (body.title !== undefined) {
          if (!isValidName(body.title)) fail(400, "Task title is required.");
          task.title = body.title.trim();
        }
        for (const key of ["priority", "status", "dueDate", "createdAt", "updatedAt", "completedAt"]) {
          if (body[key] !== undefined) task[key] = body[key];
        }
        task.projectId = projectId;
        task.assignee = assignee;
        task.parentId = parentId;
        persist();
        sendJson(response, 200, task);
        return;
      }

      if (parts.length === 2 && method === "DELETE") {
        const task = database.tasks.find((item) => String(item.id) === parts[1]);
        if (!task) fail(404, "Task not found.");
        const project = database.projects.find((item) => item.id === task.projectId);
        if (!project || !canAccessProject(user, project)) fail(403, "You do not have permission to delete this task.");

        const idsToDelete = new Set([task.id]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const child of database.tasks) {
            if (idsToDelete.has(child.parentId) && !idsToDelete.has(child.id)) {
              idsToDelete.add(child.id);
              changed = true;
            }
          }
        }
        database.tasks = database.tasks.filter((item) => !idsToDelete.has(item.id));
        persist();
        sendJson(response, 200, {});
        return;
      }

      fail(404, "Not found.");
    }

    fail(404, "Not found.");
  }

  return createServer((request, response) => {
    handle(request, response).catch((error) => {
      if (response.headersSent || response.destroyed) {
        console.error(error);
        return;
      }
      const status = Number.isInteger(error.status) ? error.status : 500;
      if (status === 500) console.error(error);
      sendJson(response, status, { error: status === 500 ? "Internal server error." : error.message });
    });
  });
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3001);
  createApiServer().listen(port, () => {
    console.log(`ProjectHub API listening on http://localhost:${port}`);
  });
}
