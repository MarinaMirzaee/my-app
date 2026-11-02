import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import { getProjects } from "../api/projects";
import { getUserId } from "../utils/user";
import { validateTask } from "../utils/validation";
import TaskModal from "../components/TaskModal";

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState(null); // null = create mode
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState("");

  // queries: tasks and projects are fetched together, once
  useEffect(() => {
    Promise.all([getTasks(), getProjects()])
      .then(([tasksData, projectsData]) => {
        setTasks(tasksData);
        setProjects(projectsData);
      })
      .catch(() =>
        setLoadError("Could not load tasks. Is the server running?"),
      );
  }, []);

  function projectName(id) {
    const project = projects.find((p) => p.id === id);
    return project ? project.title : "-";
  }

  function parentName(id) {
    if (id === null) return "-";
    const parent = tasks.find((t) => t.id === id);
    return parent ? parent.title : "-";
  }

  function openCreate() {
    setTaskData(null);
    setErrors({});
    setIsModalOpen(true);
  }

  function openEdit(task) {
    setTaskData(task);
    setErrors({});
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  // the only submit function: the form calls it directly
  async function handleSubmit(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const parentId = form.get("parentId");
    const values = {
      title: form.get("title").trim(),
      priority: form.get("priority"),
      status: form.get("status"),
      assignee: form.get("assignee").trim(),
      projectId: Number(form.get("projectId")),
      parentId: parentId === "" ? null : Number(parentId),
    };

    const validationErrors = validateTask(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const now = new Date().toISOString();
    const isDone = values.status === "done";

    try {
      if (taskData) {
        const updated = await updateTask(taskData.id, {
          ...values,
          updatedAt: now,
          completedAt: isDone ? taskData.completedAt || now : null,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
      } else {
        const created = await createTask({
          ...values,
          createdBy: getUserId(),
          createdAt: now,
          updatedAt: now,
          completedAt: isDone ? now : null,
        });
        setTasks((prev) => [...prev, created]);
      }
      closeModal();
    } catch {
      setErrors({ form: "Could not save the task. Is the server running?" });
    }
  }

  async function handleDelete(id) {
    const subtasks = tasks.filter((t) => t.parentId === id);

    const message = subtasks.length
      ? `Delete this task and its ${subtasks.length} subtask(s)?`
      : "Delete this task?";
    if (!window.confirm(message)) return;

    try {
      // delete the subtasks first, then the task itself
      await Promise.all(subtasks.map((t) => deleteTask(t.id)));
      await deleteTask(id);

      const removedIds = [id, ...subtasks.map((t) => t.id)];
      setTasks((prev) => prev.filter((t) => !removedIds.includes(t.id)));
    } catch {
      alert("Could not delete the task.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={openCreate}
          disabled={projects.length === 0}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-300"
        >
          New Task
        </button>
      </div>

      {loadError && <p className="mb-4 text-sm text-red-600">{loadError}</p>}

      {!loadError && projects.length === 0 && (
        <p className="mb-4 text-sm text-gray-500">
          Create a project first. Every task belongs to a project.
        </p>
      )}

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assignee</th>
              <th className="p-3">Project</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Created by</th>
              <th className="p-3">Created</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Completed</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan="11" className="p-6 text-center text-gray-500">
                  No tasks yet. Click "New Task" to add one.
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id} className="border-t">
                <td className="p-3 font-medium">{task.title}</td>
                <td className="p-3">{task.priority}</td>
                <td className="p-3">{task.status}</td>
                <td className="p-3">{task.assignee || "-"}</td>
                <td className="p-3">{projectName(task.projectId)}</td>
                <td className="p-3">{parentName(task.parentId)}</td>
                <td className="p-3">{task.createdBy}</td>
                <td className="p-3">{formatDate(task.createdAt)}</td>
                <td className="p-3">{formatDate(task.updatedAt)}</td>
                <td className="p-3">{formatDate(task.completedAt)}</td>
                <td className="p-3">
                  <button
                    onClick={() => openEdit(task)}
                    className="mr-3 text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <TaskModal
          taskData={taskData}
          projects={projects}
          allTasks={tasks}
          errors={errors}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Tasks;
