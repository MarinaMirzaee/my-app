import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <DashboardNavbar />

        {/* the current page shows up here */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
