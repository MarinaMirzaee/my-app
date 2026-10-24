import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Manage your projects in one place
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          ProjectHub is a project management app. You can create projects,
          assign tasks to your team, and track the progress until the deadline.
        </p>
        <Link
          to="/signin"
          className="mt-8 inline-block rounded bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
        >
          Get Started
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-20 md:grid-cols-3">
        <div className="rounded bg-white p-6 shadow">
          <h3 className="font-semibold">Projects</h3>
          <p className="mt-2 text-sm text-gray-600">
            Keep all your projects and deadlines organized.
          </p>
        </div>
        <div className="rounded bg-white p-6 shadow">
          <h3 className="font-semibold">Tasks</h3>
          <p className="mt-2 text-sm text-gray-600">
            See what is to do, in progress and done.
          </p>
        </div>
        <div className="rounded bg-white p-6 shadow">
          <h3 className="font-semibold">Team</h3>
          <p className="mt-2 text-sm text-gray-600">
            Add team members and give them work to do.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Landing;
