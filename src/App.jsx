import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingState from "./components/LoadingState";

const Landing = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/SignIn"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Overview = lazy(() => import("./pages/Overview"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Team = lazy(() => import("./pages/Team"));
const Settings = lazy(() => import("./pages/Settings"));

function loadingPage(Page, message) {
  return (
    <Suspense fallback={<LoadingState message={message} />}>
      <Page />
    </Suspense>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={loadingPage(Landing, "Loading home page...")} />
      <Route
        path="/signin"
        element={loadingPage(SignIn, "Loading sign in...")}
      />
      <Route
        path="/project/:id"
        element={loadingPage(ProjectDetail, "Loading project...")}
      />

      {/* all dashboard pages use the same layout */}
      <Route
        path="/dashboard"
        element={loadingPage(DashboardLayout, "Loading dashboard...")}
      >
        <Route
          index
          element={loadingPage(Overview, "Loading overview...")}
        />
        <Route
          path="projects"
          element={loadingPage(Projects, "Loading projects...")}
        />
        <Route
          path="projects/:id"
          element={loadingPage(ProjectDetail, "Loading project...")}
        />
        <Route path="tasks" element={loadingPage(Tasks, "Loading tasks...")} />
        <Route path="team" element={loadingPage(Team, "Loading team...")} />
        <Route
          path="settings"
          element={loadingPage(Settings, "Loading settings...")}
        />
      </Route>
    </Routes>
  );
}

export default App;
