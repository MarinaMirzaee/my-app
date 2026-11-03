import { Link, useParams } from "react-router-dom";
import { useProject } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";
import { formatDate, formatDueDate, isOverdue } from "../utils/date";
import LoadingState from "../components/LoadingState";

function ProjectDetail() {
  const { id } = useParams(); // the :id from the URL
  const projectQuery = useProject(id);
  const tasksQuery = useTasks();

  if (projectQuery.isPending || tasksQuery.isPending) {
    return <LoadingState message="Loading project..." />;
  }

  if (projectQuery.isError) {
    return (
      <div>
        <p className="mb-4 text-red-600">Project not found.</p>
        <Link
          to="/dashboard/projects"
          className="text-indigo-600 hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load tasks. Is the server running?
      </p>
    );
  }

  const project = projectQuery.data;

  // only the tasks that belong to this project
  const projectTasks = tasksQuery.data.filter(
    (t) => t.projectId === project.id,
  );

  function parentName(parentId) {
    if (parentId === null) return "-";
    const parent = projectTasks.find((t) => t.id === parentId);
    return parent ? parent.title : "-";
  }

  return (
    <div>
      <Link
        to="/dashboard/projects"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← Back to projects
      </Link>

      <div className="mb-6 mt-3 rounded bg-white p-5 shadow">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Members: {project.members.join(", ") || "-"} · Created:{" "}
          {formatDate(project.createdAt)} · Completed:{" "}
          {formatDate(project.completedAt)}
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold">
        Tasks ({projectTasks.length})
      </h2>

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assignee</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Due date</th>
            </tr>
          </thead>
          <tbody>
            {projectTasks.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  This project has no tasks yet.
                </td>
              </tr>
            )}
            {projectTasks.map((task) => (
              <tr key={task.id} className="border-t">
                <td className="p-3 font-medium">{task.title}</td>
                <td className="p-3">{task.priority}</td>
                <td className="p-3">{task.status}</td>
                <td className="p-3">{task.assignee || "-"}</td>
                <td className="p-3">{parentName(task.parentId)}</td>
                <td
                  className={`p-3 ${
                    isOverdue(task) ? "font-medium text-red-600" : ""
                  }`}
                >
                  {formatDueDate(task.dueDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjectDetail;
