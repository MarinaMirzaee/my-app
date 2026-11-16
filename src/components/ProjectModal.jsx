function ProjectModal({
  projectData,
  users,
  errors,
  isSaving,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <form
        noValidate
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="max-h-screen w-full max-w-md overflow-y-auto rounded bg-white p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-bold">
          {projectData ? "Edit Project" : "New Project"}
        </h2>

        <label className="mb-1 block text-sm text-gray-600">Title</label>

        <input
          name="title"
          defaultValue={projectData?.title ?? ""}
          className={`w-full rounded border px-3 py-2 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
        />

        <p className="mb-4 mt-1 min-h-5 text-sm text-red-600">{errors.title}</p>

        <label className="mb-1 block text-sm text-gray-600">Members</label>

        <select
          name="members"
          multiple
          defaultValue={projectData?.members ?? []}
          className="mb-2 h-40 w-full rounded border border-gray-300 px-3 py-2"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} — {user.email}
            </option>
          ))}
        </select>

        <p className="mb-4 text-xs text-gray-500">
          Hold Ctrl on Windows or Command on Mac to select multiple members.
        </p>

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
            disabled={isSaving}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectModal;
