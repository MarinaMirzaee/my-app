import { useNavigate } from "react-router-dom";

function DashboardNavbar() {
  const navigate = useNavigate();

  function handleSignOut() {
    // no real auth yet, just go back to the landing page
    navigate("/");
  }

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h1 className="font-semibold text-gray-800">Dashboard</h1>

      <button
        onClick={handleSignOut}
        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
      >
        Sign Out
      </button>
    </header>
  );
}

export default DashboardNavbar;
