import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    title: "Everything in one place",
    text: "Manage your data, activity and settings from a single, simple dashboard.",
  },
  {
    title: "Fast and responsive",
    text: "Move between pages instantly, without reloading, on any device.",
  },
  {
    title: "Easy to get started",
    text: "Sign in and start using the app in seconds, with no complicated setup.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Manage everything in one simple dashboard
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          MyApp is a modern web application that helps you organize your work,
          track your activity and stay in control, all from one clean and
          easy-to-use dashboard.
        </p>
        <Link
          to="/signin"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Get Started
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
