import { useAuth } from "../context/useAuth";

function DashboardNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h1 className="font-semibold text-gray-800">
        Dashboard{user ? ` · ${user.name}` : ""}
      </h1>

      <button
        onClick={logout}
        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
      >
        Sign Out
      </button>
    </header>
  );
}

export default DashboardNavbar;
