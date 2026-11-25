"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/useAuth";

function Sidebar() {
  const pathname = usePathname();
  const linkClass = (path, exact = false) =>
    `flex items-center gap-3 rounded px-4 py-2 ${
      (exact ? pathname === path : pathname.startsWith(path))
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100"
    }`;
  const { user } = useAuth();


  return (
    <aside className="w-56 bg-gray-900 p-4">
      <h2 className="mb-6 text-xl font-bold text-white">ProjectHub</h2>

      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className={linkClass("/dashboard", true)}>
          <LayoutDashboard size={20} />
          Overview
        </Link>

        <Link href="/dashboard/projects" className={linkClass("/dashboard/projects")}>
          <FolderKanban size={20} />
          Projects
        </Link>

        <Link href="/dashboard/tasks" className={linkClass("/dashboard/tasks")}>
          <ListTodo size={20} />
          Tasks
        </Link>

        <Link href="/dashboard/team" className={linkClass("/dashboard/team")}>
          <Users size={20} />
          Team
        </Link>

        <Link href="/dashboard/settings" className={linkClass("/dashboard/settings")}>
          <Settings size={20} />
          Settings
        </Link>

        {user?.role === "admin" && (
          <>
            <div className="my-2 border-t border-gray-700" />

            <Link href="/admin" className={linkClass("/admin")}>
              <ShieldCheck size={20} />
              Admin Dashboard
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
