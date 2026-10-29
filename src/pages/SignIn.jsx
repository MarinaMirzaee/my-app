import { useNavigate, Link } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault(); 
    // TODO: check email and password when we add authentication
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded bg-white p-8 shadow"
      >
        <h2 className="mb-6 text-2xl font-bold">Sign In</h2>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
        />

        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Sign In
        </button>

        <Link to="/" className="mt-4 block text-center text-sm text-gray-500">
          Back to home
        </Link>
      </form>
    </div>
  );
}

export default SignIn;
