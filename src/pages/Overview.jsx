import { useProjects } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";
import LoadingState from "../components/LoadingState";

function Overview() {
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();

  if (projectsQuery.isPending || tasksQuery.isPending) {
    return <LoadingState message="Loading overview..." />;
  }

  if (projectsQuery.isError || tasksQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load the overview. Is the server running?
      </p>
    );
  }

  const tasks = tasksQuery.data;
  const stats = [
    { label: "Projects", value: projectsQuery.data.length },
    {
      label: "Open tasks",
      value: tasks.filter((t) => t.status !== "done").length,
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "done").length,
    },
    {
      label: "Assignees",
      value: new Set(tasks.map((t) => t.assignee).filter(Boolean)).size,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;
