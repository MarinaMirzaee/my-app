import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";
import { useTasks, useDeleteTask } from "../hooks/useTasks";
import { getUserId } from "../utils/user";
import { validate } from "../utils/validate";
import { formatDate } from "../utils/date";
import { projectSchema } from "../schemas/projectSchema";
import ProjectModal from "../components/ProjectModal";
import LoadingState from "../components/LoadingState";

function Projects() {
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const deleteTaskMutation = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectData, setProjectData] = useState(null); // null = create mode
  const [errors, setErrors] = useState({});

  function openCreate() {
    setProjectData(null);
    setErrors({});
    setIsModalOpen(true);
  }

  function openEdit(project) {
    setProjectData(project);
    setErrors({});
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  // the only submit function: the form calls it directly
  async function handleSubmit(e) {
    e.preventDefault();

    const { data, errors: validationErrors } = validate(
      projectSchema,
      Object.fromEntries(new FormData(e.currentTarget)),
    );
    setErrors(validationErrors);
    if (!data) return;

    const now = new Date().toISOString();

    try {
      if (projectData) {
        await updateMutation.mutateAsync({
          id: projectData.id,
          data: {
            title: data.title,
            members: data.members,
            updatedAt: now,
            completedAt: data.completed ? projectData.completedAt || now : null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title: data.title,
          owner: getUserId(),
          members: data.members,
          createdAt: now,
          updatedAt: now,
          completedAt: data.completed ? now : null,
        });
      }
      closeModal();
    } catch {
      setErrors({ form: "Could not save the project. Is the server running?" });
    }
  }

  async function handleDelete(id) {
    if (!tasksQuery.isSuccess) {
      alert("Tasks are not loaded yet. Try again in a moment.");
      return;
    }

    const projectTasks = tasksQuery.data.filter((t) => t.projectId === id);
    const message = projectTasks.length
      ? `Delete this project and its ${projectTasks.length} task(s)?`
      : "Delete this project?";
    if (!window.confirm(message)) return;

    try {
      await Promise.all(
        projectTasks.map((t) => deleteTaskMutation.mutateAsync(t.id)),
      );
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Could not delete the project.");
    }
  }

  if (projectsQuery.isPending) {
    return <LoadingState message="Loading projects..." />;
  }

  if (projectsQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load projects. Is the server running?
      </p>
    );
  }

  const projects = projectsQuery.data;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={openCreate}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          New Project
        </button>
      </div>

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Members</th>
              <th className="p-3">Created</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Completed</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No projects yet. Click "New Project" to add one.
                </td>
              </tr>
            )}
            {projects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="p-3">
                  <Link
                    to={`/project/${project.id}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {project.title}
                  </Link>
                </td>
                <td className="p-3">{project.owner}</td>
                <td className="p-3">{project.members.join(", ") || "-"}</td>
                <td className="p-3">{formatDate(project.createdAt)}</td>
                <td className="p-3">{formatDate(project.updatedAt)}</td>
                <td className="p-3">{formatDate(project.completedAt)}</td>
                <td className="p-3">
                  <button
                    onClick={() => openEdit(project)}
                    className="mr-3 text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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
        <ProjectModal
          projectData={projectData}
          errors={errors}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Projects;
