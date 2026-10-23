import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: add real authentication later
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Sign In
        </button>

        <Link
          to="/"
          className="block text-center text-sm text-gray-500 hover:underline"
        >
          Back to home
        </Link>
      </form>
    </div>
  );
}
