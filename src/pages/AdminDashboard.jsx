import { useState } from "react";

import { useProjects, useDeleteProject } from "../hooks/useProjects";

import { useTasks } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";

import LoadingState from "../components/LoadingState";
import SearchFilter from "../components/SearchFilter";

import { filterBySearch } from "../utils/filter";
import { formatDate } from "../utils/date";

function AdminDashboard() {
  const projectsQuery = useProjects();

  const usersQuery = useUsers();

  const projectIds = projectsQuery.data?.map((project) => project.id);

  const tasksQuery = useTasks(projectIds);

  const deleteMutation = useDeleteProject();

  const [search, setSearch] = useState("");

  if (projectsQuery.isPending || usersQuery.isPending || tasksQuery.isPending) {
    return <LoadingState message="Loading admin dashboard..." />;
  }

  if (projectsQuery.isError || usersQuery.isError || tasksQuery.isError) {
    return (
      <p className="text-sm text-red-600">Could not load admin dashboard.</p>
    );
  }

  const projects = projectsQuery.data;

  const users = usersQuery.data;

  const tasks = tasksQuery.data;

  const filteredProjects = filterBySearch(projects, search);

  function userName(id) {
    const user = users.find((item) => item.id === id);

    return user ? user.name : "Unknown user";
  }

  async function handleDelete(project) {
    if (!window.confirm("Delete this project and all of its tasks?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(project.id);
    } catch (error) {
      alert(error.message || "Could not delete project.");
    }
  }

  const stats = [
    {
      label: "Users",
      value: users.length,
    },
    {
      label: "Projects",
      value: projects.length,
    },
    {
      label: "Tasks",
      value: tasks.length,
    },
    {
      label: "Completed tasks",
      value: tasks.filter((task) => task.status === "done").length,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-indigo-600">ADMIN AREA</p>

        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <p className="mt-1 text-gray-500">
          Manage all users, projects and tasks.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{stat.label}</p>

            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">All Projects</h2>
      </div>

      <SearchFilter
        value={search}
        onSearchChange={setSearch}
        placeholder="Search all projects..."
        resultCount={filteredProjects.length}
        totalCount={projects.length}
      />

      <div className="overflow-x-auto rounded bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Project</th>

              <th className="p-3">Owner</th>

              <th className="p-3">Members</th>

              <th className="p-3">Created</th>

              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="p-3 font-medium">{project.title}</td>

                <td className="p-3">{userName(project.owner)}</td>

                <td className="p-3">
                  {project.members.map(userName).join(", ") || "-"}
                </td>

                <td className="p-3">{formatDate(project.createdAt)}</td>

                <td className="p-3">
                  <button
                    onClick={() => handleDelete(project)}
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
    </div>
  );
}

export default AdminDashboard;
