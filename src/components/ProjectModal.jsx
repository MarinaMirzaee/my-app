import { useState } from "react";

function ProjectModal({ project, onSave, onClose }) {
  const [title, setTitle] = useState(project ? project.title : "");
  const [membersText, setMembersText] = useState(
    project ? project.members.join(", ") : "",
  );
  const [completed, setCompleted] = useState(
    project ? project.completedAt !== null : false,
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const members = membersText
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    onSave({ title: title.trim(), members, completed });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-bold">
          {project ? "Edit Project" : "New Project"}
        </h2>

        <label className="mb-1 block text-sm text-gray-600">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
        />

        <label className="mb-1 block text-sm text-gray-600">
          Members (comma separated)
        </label>
        <input
          value={membersText}
          onChange={(e) => setMembersText(e.target.value)}
          placeholder="Sara, Marina"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
        />

        <label className="mb-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          Mark as completed
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectModal;
