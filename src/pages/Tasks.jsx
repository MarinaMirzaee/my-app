import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import { getProjects } from "../api/projects";
import { getUserId } from "../utils/user";
import TaskModal from "../components/TaskModal";

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // tasks need the projects list too (for the project name and the dropdown)
  async function loadData() {
    const [tasksData, projectsData] = await Promise.all([
      getTasks(),
      getProjects(),
    ]);
    setTasks(tasksData);
    setProjects(projectsData);
  }

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
    setEditingTask(null);
    setIsModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setIsModalOpen(true);
  }

  async function handleSave(formData) {
    const now = new Date().toISOString();
    const isDone = formData.status === "done";

    if (editingTask) {
      await updateTask(editingTask.id, {
        ...formData,
        updatedAt: now,
        completedAt: isDone ? editingTask.completedAt || now : null,
      });
    } else {
      await createTask({
        ...formData,
        createdBy: getUserId(),
        createdAt: now,
        updatedAt: now,
        completedAt: isDone ? now : null,
      });
    }

    setIsModalOpen(false);
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(id);
    loadData();
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

      {projects.length === 0 && (
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
          task={editingTask}
          projects={projects}
          tasks={tasks}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Tasks;
