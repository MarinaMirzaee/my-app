import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projects";
import { getUserId } from "../utils/user";
import ProjectModal from "../components/ProjectModal";

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await getProjects();
    setProjects(data);
  }

  function openCreate() {
    setEditingProject(null);
    setIsModalOpen(true);
  }

  function openEdit(project) {
    setEditingProject(project);
    setIsModalOpen(true);
  }

  async function handleSave(formData) {
    const now = new Date().toISOString();

    if (editingProject) {
      await updateProject(editingProject.id, {
        title: formData.title,
        members: formData.members,
        updatedAt: now,
        completedAt: formData.completed
          ? editingProject.completedAt || now
          : null,
      });
    } else {
      await createProject({
        title: formData.title,
        owner: getUserId(),
        members: formData.members,
        createdAt: now,
        updatedAt: now,
        completedAt: formData.completed ? now : null,
      });
    }

    setIsModalOpen(false);
    loadProjects();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project?")) return;
    await deleteProject(id);
    loadProjects();
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
          project={editingProject}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Projects;
