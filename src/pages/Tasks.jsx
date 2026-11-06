import { useState } from "react";

import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../hooks/useTasks";

import { useProjects } from "../hooks/useProjects";
import { getUserId } from "../utils/user";
import { validate } from "../utils/validate";
import { formatDate, formatDueDate, isOverdue } from "../utils/date";

import { taskSchema } from "../schemas/schemas/taskSchema";

import TaskModal from "../components/TaskModal";
import LoadingState from "../components/LoadingState";
import SearchFilter from "../components/SearchFilter";
import { filterBySearch } from "../utils/filter";

function Tasks() {
  const tasksQuery = useTasks();
  const projectsQuery = useProjects();

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

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

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const { data, errors: validationErrors } = validate(taskSchema, formData);

    setErrors(validationErrors);

    if (!data) return;

    const now = new Date().toISOString();
    const isDone = data.status === "done";

    try {
      if (taskData) {
        await updateMutation.mutateAsync({
          id: taskData.id,
          data: {
            ...data,
            updatedAt: now,
            completedAt: isDone ? taskData.completedAt || now : null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          createdBy: getUserId(),
          createdAt: now,
          updatedAt: now,
          completedAt: isDone ? now : null,
        });
      }

      closeModal();
    } catch {
      setErrors({
        form: "Could not save the task. Is the server running?",
      });
    }
  }

  async function handleDelete(id) {
    const subtasks = tasksQuery.data.filter((task) => task.parentId === id);

    const message = subtasks.length
      ? `Delete this task and its ${subtasks.length} subtask(s)?`
      : "Delete this task?";

    if (!window.confirm(message)) return;

    try {
      await Promise.all(
        subtasks.map((task) => deleteMutation.mutateAsync(task.id)),
      );

      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Could not delete the task.");
    }
  }

  if (tasksQuery.isPending || projectsQuery.isPending) {
    return <LoadingState message="Loading tasks..." />;
  }

  if (tasksQuery.isError || projectsQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load tasks. Is the server running?
      </p>
    );
  }

  const tasks = tasksQuery.data;
  const projects = projectsQuery.data;

  function projectName(id) {
    const project = projects.find((p) => p.id === id);
    return project ? project.title : "-";
  }

  function parentName(id) {
    if (id === null) return "-";

    const parent = tasks.find((task) => task.id === id);

    return parent ? parent.title : "-";
  }

  const searchableTasks = tasks.map((task) => ({
    ...task,
    projectTitle: projectName(task.projectId),
    parentTitle: parentName(task.parentId),
  }));
  const filteredTasks = filterBySearch(searchableTasks, search);
  const projectGroups = projects
    .map((project) => ({
      id: project.id,
      title: project.title,
      tasks: filteredTasks.filter((task) => task.projectId === project.id),
    }))
    .filter((group) => group.tasks.length > 0);
  const unlistedTasks = filteredTasks.filter(
    (task) => !projects.some((project) => project.id === task.projectId),
  );

  function renderTaskRows(groupTasks) {
    return groupTasks.map((task) => (
      <tr key={task.id} className="border-t">
        <td className="p-3 font-medium">{task.title}</td>
        <td className="p-3">{task.priority}</td>
        <td className="p-3">{task.status}</td>
        <td className="p-3">{task.assignee || "-"}</td>
        <td className="p-3">{projectName(task.projectId)}</td>
        <td className="p-3">{parentName(task.parentId)}</td>
        <td
          className={`p-3 ${
            isOverdue(task) ? "font-medium text-red-600" : ""
          }`}
        >
          {formatDueDate(task.dueDate)}
        </td>
        <td className="p-3">{task.createdBy}</td>
        <td className="p-3">{formatDate(task.createdAt)}</td>
        <td className="p-3">{formatDate(task.updatedAt)}</td>
        <td className="p-3">{formatDate(task.completedAt)}</td>
        <td className="p-3 whitespace-nowrap">
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
    ));
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

      <SearchFilter
        value={search}
        onSearchChange={setSearch}
        placeholder="Search all task fields..."
        resultCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      {filteredTasks.length === 0 ? (
        <p className="rounded bg-white p-6 text-center text-gray-500 shadow">
          {tasks.length
            ? "No tasks match your search."
            : 'No tasks yet. Click "New Task" to add one.'}
        </p>
      ) : (
        <div className="space-y-6">
          {[...projectGroups, ...(unlistedTasks.length
            ? [{ id: "unknown", title: "Unknown project", tasks: unlistedTasks }]
            : [])].map((group) => (
            <section key={group.id}>
              <h2 className="mb-2 text-lg font-semibold">
                {group.title} ({group.tasks.length})
              </h2>
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
                      <th className="p-3">Due date</th>
                      <th className="p-3">Created by</th>
                      <th className="p-3">Created</th>
                      <th className="p-3">Updated</th>
                      <th className="p-3">Completed</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>{renderTaskRows(group.tasks)}</tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TaskModal
          taskData={taskData}
          projects={projects}
          allTasks={tasks}
          errors={errors}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Tasks;
