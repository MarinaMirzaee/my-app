import { useState } from "react";

function TaskModal({
  taskData,
  projects,
  allTasks,
  users,
  errors,
  isSaving,
  onSubmit,
  onClose,
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    taskData ? taskData.projectId : projects[0]?.id,
  );

  const parentOptions = allTasks.filter(
    (task) =>
      task.projectId === Number(selectedProjectId) &&
      task.parentId === null &&
      (!taskData || task.id !== taskData.id),
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
          defaultValue={taskData?.title ?? ""}
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

        <select
          name="assignee"
          defaultValue={taskData?.assignee ?? ""}
          className={`${fieldClass} ${errors.assignee ? "border-red-500" : ""}`}
        >
          <option value="">Select a user</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} — {user.email}
            </option>
          ))}
        </select>

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
          onChange={(event) => setSelectedProjectId(event.target.value)}
          className={fieldClass}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>

        <p className={errorClass}>{errors.projectId}</p>

        <label className={labelClass}>Parent task (optional)</label>

        <select
          key={selectedProjectId}
          name="parentId"
          defaultValue={taskData?.parentId ?? ""}
          className="mb-6 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="">None (main task)</option>

          {parentOptions.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
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
