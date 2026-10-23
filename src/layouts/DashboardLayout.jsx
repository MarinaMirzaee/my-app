import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Home", end: true },
  { to: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-gray-900 p-5 text-white">
        <h2 className="mb-8 text-xl font-bold">MyApp</h2>
        <nav className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive ? "bg-indigo-600" : "text-gray-300 hover:bg-gray-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <span className="font-semibold text-gray-800">Dashboard</span>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Sign Out
          </button>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
