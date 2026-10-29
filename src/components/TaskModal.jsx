import { useState } from "react";

function TaskModal({ task, projects, tasks, onSave, onClose }) {
  const [title, setTitle] = useState(task ? task.title : "");
  const [priority, setPriority] = useState(task ? task.priority : "medium");
  const [status, setStatus] = useState(task ? task.status : "todo");
  const [assignee, setAssignee] = useState(task ? task.assignee : "");
  const [projectId, setProjectId] = useState(
    task ? task.projectId : projects[0].id,
  );
  const [parentId, setParentId] = useState(
    task && task.parentId !== null ? task.parentId : "",
  );

  // a parent must be a main task of the same project, and not the task itself
  const parentOptions = tasks.filter(
    (t) =>
      t.projectId === Number(projectId) &&
      t.parentId === null &&
      (!task || t.id !== task.id),
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      priority,
      status,
      assignee: assignee.trim(),
      projectId: Number(projectId),
      parentId: parentId === "" ? null : Number(parentId),
    });
  }

  const inputClass = "mb-4 w-full rounded border border-gray-300 px-3 py-2";
  const labelClass = "mb-1 block text-sm text-gray-600";

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
          {task ? "Edit Task" : "New Task"}
        </h2>

        <label className={labelClass}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={inputClass}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <label className={labelClass}>Assignee</label>
        <input
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="Sara"
          className={inputClass}
        />

        <label className={labelClass}>Project</label>
        <select
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            setParentId(""); // the old parent belongs to another project
          }}
          className={inputClass}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <label className={labelClass}>Parent task (optional)</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mb-6 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="">None (main task)</option>
          {parentOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

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

export default TaskModal;
