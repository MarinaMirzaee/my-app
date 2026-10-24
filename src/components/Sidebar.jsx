import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Settings,
} from "lucide-react";

function Sidebar() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-3 rounded bg-indigo-600 px-4 py-2 text-white"
      : "flex items-center gap-3 rounded px-4 py-2 text-gray-300 hover:bg-gray-700";

  return (
    <aside className="w-56 bg-gray-900 p-4">
      <h2 className="mb-6 text-xl font-bold text-white">ProjectHub</h2>

      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard" end className={linkClass}>
          <LayoutDashboard size={20} />
          Overview
        </NavLink>

        <NavLink to="/dashboard/projects" className={linkClass}>
          <FolderKanban size={20} />
          Projects
        </NavLink>

        <NavLink to="/dashboard/tasks" className={linkClass}>
          <ListTodo size={20} />
          Tasks
        </NavLink>

        <NavLink to="/dashboard/team" className={linkClass}>
          <Users size={20} />
          Team
        </NavLink>

        <NavLink to="/dashboard/settings" className={linkClass}>
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
