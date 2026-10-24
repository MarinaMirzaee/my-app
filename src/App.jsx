import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />

      {/* all dashboard pages use the same layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
