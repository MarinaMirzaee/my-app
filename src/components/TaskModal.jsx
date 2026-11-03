import { useState } from "react";

// No submit function here: the form uses onSubmit from the page directly.
function TaskModal({
  taskData,
  projects,
  allTasks,
  errors,
  isSaving,
  onSubmit,
  onClose,
}) {
  // the only state in this modal: the parent list depends on the chosen project
  const [selectedProjectId, setSelectedProjectId] = useState(
    taskData ? taskData.projectId : projects[0].id,
  );

  // a parent must be a main task of the same project, and not the task itself
  const parentOptions = allTasks.filter(
    (t) =>
      t.projectId === Number(selectedProjectId) &&
      t.parentId === null &&
      (!taskData || t.id !== taskData.id),
  );

  const fieldClass = "w-full rounded border border-gray-300 px-3 py-2";
  const labelClass = "mb-1 block text-sm text-gray-600";
  const errorClass = "mb-3 mt-1 min-h-5 text-sm text-red-600";

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
          {taskData ? "Edit Task" : "New Task"}
        </h2>

        <label className={labelClass}>Title</label>
        <input
          name="title"
          defaultValue={taskData?.title}
          className={`${fieldClass} ${errors.title ? "border-red-500" : ""}`}
        />
        <p className={errorClass}>{errors.title}</p>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Priority</label>
            <select
              name="priority"
              defaultValue={taskData?.priority ?? "medium"}
              className={fieldClass}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              name="status"
              defaultValue={taskData?.status ?? "todo"}
              className={fieldClass}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <label className={labelClass}>Assignee</label>
        <input
          name="assignee"
          defaultValue={taskData?.assignee}
          placeholder="Sara"
          className={`${fieldClass} ${errors.assignee ? "border-red-500" : ""}`}
        />
        <p className={errorClass}>{errors.assignee}</p>

        <label className={labelClass}>Due date (optional)</label>
        <input
          type="date"
          name="dueDate"
          defaultValue={taskData?.dueDate ?? ""}
          className={`${fieldClass} ${errors.dueDate ? "border-red-500" : ""}`}
        />
        <p className={errorClass}>{errors.dueDate}</p>

        <label className={labelClass}>Project</label>
        <select
          name="projectId"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className={fieldClass}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <p className={errorClass}>{errors.projectId}</p>

        <label className={labelClass}>Parent task (optional)</label>
        <select
          key={selectedProjectId} // resets the choice when the project changes
          name="parentId"
          defaultValue={taskData?.parentId ?? ""}
          className="mb-6 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="">None (main task)</option>
          {parentOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

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

export default TaskModal;
