import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projects";
import { getUserId } from "../utils/user";
import { validateProject } from "../utils/validation";
import ProjectModal from "../components/ProjectModal";

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectData, setProjectData] = useState(null); // null = create mode
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState("");

  // query: runs once when the page opens
  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() =>
        setLoadError("Could not load projects. Is the server running?"),
      );
  }, []);

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

    const form = new FormData(e.currentTarget);
    const values = {
      title: form.get("title").trim(),
      members: form
        .get("members")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      completed: form.get("completed") === "on",
    };

    const validationErrors = validateProject(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const now = new Date().toISOString();

    try {
      if (projectData) {
        const updated = await updateProject(projectData.id, {
          title: values.title,
          members: values.members,
          updatedAt: now,
          completedAt: values.completed ? projectData.completedAt || now : null,
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const created = await createProject({
          title: values.title,
          owner: getUserId(),
          members: values.members,
          createdAt: now,
          updatedAt: now,
          completedAt: values.completed ? now : null,
        });
        setProjects((prev) => [...prev, created]);
      }
      closeModal();
    } catch {
      setErrors({ form: "Could not save the project. Is the server running?" });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project?")) return;

    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Could not delete the project.");
    }
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

      {loadError && <p className="mb-4 text-sm text-red-600">{loadError}</p>}

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
                <td className="p-3 font-medium">{project.title}</td>
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
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Projects;
