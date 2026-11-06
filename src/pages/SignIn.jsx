import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInSchema } from "../schemas/signInSchema";
import { validate } from "../utils/validate";
import { useAuth } from "../context/useAuth";

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault(); 
    const { data, errors: validationErrors } = validate(
      signInSchema,
      Object.fromEntries(new FormData(e.currentTarget)),
    );
    setErrors(validationErrors);
    if (!data) return;

    try {
      await login(data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors({ form: error.message });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded bg-white p-8 shadow"
      >
        <h2 className="mb-6 text-2xl font-bold">Sign In</h2>

        <label htmlFor="email" className="mb-1 block text-sm text-gray-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`mb-1 w-full rounded border px-3 py-2 ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
        />
        <p id="email-error" className="mb-4 min-h-5 text-sm text-red-600">
          {errors.email}
        </p>
        <label htmlFor="password" className="mb-1 block text-sm text-gray-600">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={`mb-1 w-full rounded border px-3 py-2 ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
        />
        <p id="password-error" className="mb-4 min-h-5 text-sm text-red-600">
          {errors.password}
        </p>

        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Sign In
        </button>

        {errors.form && (
          <p role="alert" className="mt-3 text-center text-sm text-red-600">
            {errors.form}
          </p>
        )}

        <Link to="/signup" className="mt-4 block text-center text-sm text-indigo-600">
          Create an account
        </Link>
        <Link to="/" className="mt-4 block text-center text-sm text-gray-500">
          Back to home
        </Link>
      </form>
    </div>
  );
}

export default SignIn;
