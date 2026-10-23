import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />

      {/* Dashboard routes share one layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        {/* later: <Route path="settings" element={<Settings />} /> */}
      </Route>
    </Routes>
  );
}
