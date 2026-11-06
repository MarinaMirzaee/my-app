import { lazy, Suspense } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoadingState from "./components/LoadingState";
import { useAuth } from "./context/useAuth";

const Landing = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Overview = lazy(() => import("./pages/Overview"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Team = lazy(() => import("./pages/Team"));
const Settings = lazy(() => import("./pages/Settings"));

function ProtectedRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/signin" replace state={{ from: location }} />
  );
}

function GuestRoutes() {
  const { user } = useAuth();

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

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
      <Route element={<GuestRoutes />}>
        <Route
          path="/signin"
          element={loadingPage(SignIn, "Loading sign in...")}
        />
        <Route
          path="/signup"
          element={loadingPage(SignUp, "Loading sign up...")}
        />
      </Route>
      <Route element={<ProtectedRoutes />}>
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
          <Route
            path="tasks"
            element={loadingPage(Tasks, "Loading tasks...")}
          />
          <Route path="team" element={loadingPage(Team, "Loading team...")} />
          <Route
            path="settings"
            element={loadingPage(Settings, "Loading settings...")}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
