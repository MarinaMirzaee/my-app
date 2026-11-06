import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProject } from "../hooks/useProjects";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../hooks/useTasks";
import { formatDate, formatDueDate, isOverdue } from "../utils/date";
import LoadingState from "../components/LoadingState";
import TaskModal from "../components/TaskModal";
import SearchFilter from "../components/SearchFilter";
import { filterBySearch } from "../utils/filter";
import { getUserId } from "../utils/user";
import { validate } from "../utils/validate";
import { taskSchema } from "../schemas/schemas/taskSchema";

function ProjectDetail() {
  const { id } = useParams(); // the id from the URL
  const projectQuery = useProject(id);
  const tasksQuery = useTasks();
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

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget));
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
      setIsModalOpen(false);
    } catch {
      setErrors({ form: "Could not save the task. Is the server running?" });
    }
  }

  async function handleDelete(taskId) {
    const subtasks = projectTasks.filter((task) => task.parentId === taskId);
    const message = subtasks.length
      ? `Delete this task and its ${subtasks.length} subtask(s)?`
      : "Delete this task?";
    if (!window.confirm(message)) return;

    try {
      await Promise.all(
        subtasks.map((task) => deleteMutation.mutateAsync(task.id)),
      );
      await deleteMutation.mutateAsync(taskId);
    } catch {
      alert("Could not delete the task.");
    }
  }

  if (projectQuery.isPending || tasksQuery.isPending) {
    return <LoadingState message="Loading project..." />;
  }

  if (projectQuery.isError) {
    return (
      <div>
        <p className="mb-4 text-red-600">Project not found.</p>
        <Link
          to="/dashboard/projects"
          className="text-indigo-600 hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load tasks. Is the server running?
      </p>
    );
  }

  const project = projectQuery.data;

  // only the tasks that belong to this project
  const projectTasks = tasksQuery.data.filter(
    (t) => t.projectId === project.id,
  );

  const tasksWithSearchFields = projectTasks.map((task) => ({
    ...task,
    projectTitle: project.title,
    parentTitle:
      projectTasks.find((candidate) => candidate.id === task.parentId)?.title ??
      "",
  }));
  const filteredTasks = filterBySearch(tasksWithSearchFields, search);

  function parentName(parentId) {
    if (parentId === null) return "-";
    const parent = projectTasks.find((t) => t.id === parentId);
    return parent ? parent.title : "-";
  }

  return (
    <div>
      <Link
        to="/dashboard/projects"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← Back to projects
      </Link>

      <div className="mb-6 mt-3 rounded bg-white p-5 shadow">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Members: {project.members.join(", ") || "-"} · Created:{" "}
          {formatDate(project.createdAt)} · Completed:{" "}
          {formatDate(project.completedAt)}
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold">
        Tasks ({projectTasks.length})
      </h2>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchFilter
          value={search}
          onSearchChange={setSearch}
          placeholder="Search all task fields..."
          resultCount={filteredTasks.length}
          totalCount={projectTasks.length}
        />
        <button
          onClick={openCreate}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          New Task
        </button>
      </div>

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assignee</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Due date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  {projectTasks.length
                    ? "No tasks match your search."
                    : "This project has no tasks yet."}
                </td>
              </tr>
            )}
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-t">
                <td className="p-3 font-medium">{task.title}</td>
                <td className="p-3">{task.priority}</td>
                <td className="p-3">{task.status}</td>
                <td className="p-3">{task.assignee || "-"}</td>
                <td className="p-3">{parentName(task.parentId)}</td>
                <td
                  className={`p-3 ${
                    isOverdue(task) ? "font-medium text-red-600" : ""
                  }`}
                >
                  {formatDueDate(task.dueDate)}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <TaskModal
          taskData={taskData}
          projects={[project]}
          allTasks={projectTasks}
          errors={errors}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ProjectDetail;
