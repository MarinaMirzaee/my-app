function ProjectModal({ projectData, errors, onSubmit, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <form
        noValidate
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-bold">
          {projectData ? "Edit Project" : "New Project"}
        </h2>

        <label className="mb-1 block text-sm text-gray-600">Title</label>
        <input
          name="title"
          defaultValue={projectData?.title}
          className={`w-full rounded border px-3 py-2 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
        />
        <p className="mb-4 mt-1 min-h-5 text-sm text-red-600">{errors.title}</p>

        <label className="mb-1 block text-sm text-gray-600">
          Members (comma separated)
        </label>
        <input
          name="members"
          defaultValue={projectData?.members.join(", ")}
          placeholder="Sara, Marina"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
        />

        <label className="mb-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="completed"
            defaultChecked={Boolean(projectData?.completedAt)}
          />
          Mark as completed
        </label>

        {errors.form && (
          <p className="mb-4 text-sm text-red-600">{errors.form}</p>
        )}

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
