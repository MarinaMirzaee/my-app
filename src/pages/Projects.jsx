import { useState } from "react";
import { Link } from "react-router-dom";

import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";

import { useUsers } from "../hooks/useUsers";

import { useAuth } from "../context/useAuth";

import { validate } from "../utils/validate";
import { formatDate } from "../utils/date";
import { projectSchema } from "../schemas/projectSchema";
import { canManageProject } from "../utils/permissions";

import ProjectModal from "../components/ProjectModal";
import LoadingState from "../components/LoadingState";
import SearchFilter from "../components/SearchFilter";

import { filterBySearch } from "../utils/filter";

function Projects() {
  const { user } = useAuth();

  const projectsQuery = useProjects();
  const usersQuery = useUsers();

  const createMutation = useCreateProject();

  const updateMutation = useUpdateProject();

  const deleteMutation = useDeleteProject();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [projectData, setProjectData] = useState(null);

  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");

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

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const values = Object.fromEntries(formData.entries());

    values.members = formData.getAll("members");

    const { data, errors: validationErrors } = validate(projectSchema, values);

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
          members: data.members,
          createdAt: now,
          updatedAt: now,
          completedAt: data.completed ? now : null,
        });
      }

      closeModal();
    } catch (error) {
      setErrors({
        form: error.message || "Could not save the project.",
      });
    }
  }

  async function handleDelete(project) {
    if (!canManageProject(user, project)) {
      return;
    }

    const message = "Delete this project and all of its tasks?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(project.id);
    } catch (error) {
      alert(error.message || "Could not delete the project.");
    }
  }

  if (projectsQuery.isPending || usersQuery.isPending) {
    return <LoadingState message="Loading projects..." />;
  }

  if (projectsQuery.isError || usersQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load projects or users. Is the server running?
      </p>
    );
  }

  const projects = projectsQuery.data;

  const users = usersQuery.data;

  const filteredProjects = filterBySearch(projects, search);

  function userName(id) {
    const found = users.find((user) => user.id === id);

    return found ? found.name : "Unknown user";
  }

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

      <SearchFilter
        value={search}
        onSearchChange={setSearch}
        placeholder="Search all project fields..."
        resultCount={filteredProjects.length}
        totalCount={projects.length}
      />

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
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  {projects.length === 0
                    ? 'No projects yet. Click "New Project" to add one.'
                    : "No projects match your search."}
                </td>
              </tr>
            )}

            {filteredProjects.map((project) => {
              const canManage = canManageProject(user, project);

              return (
                <tr key={project.id} className="border-t">
                  <td className="p-3">
                    <Link
                      to={`/dashboard/projects/${project.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {project.title}
                    </Link>
                  </td>

                  <td className="p-3">{userName(project.owner)}</td>

                  <td className="p-3">
                    {project.members.map(userName).join(", ") || "-"}
                  </td>

                  <td className="p-3">{formatDate(project.createdAt)}</td>

                  <td className="p-3">{formatDate(project.updatedAt)}</td>

                  <td className="p-3">{formatDate(project.completedAt)}</td>

                  <td className="p-3">
                    {canManage ? (
                      <>
                        <button
                          onClick={() => openEdit(project)}
                          className="mr-3 text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(project)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">View only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProjectModal
          projectData={projectData}
          users={users}
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
