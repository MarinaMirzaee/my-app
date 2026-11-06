import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { signUpSchema } from "../schemas/signUpSchema";
import { validate } from "../utils/validate";

function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const { data, errors: validationErrors } = validate(
      signUpSchema,
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    setErrors(validationErrors);
    if (!data) return;

    setIsSaving(true);
    try {
      await signUp(data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-2xl font-bold">Create account</h1>
        <label htmlFor="name" className="mb-1 block text-sm text-gray-600">
          Name
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          className="mb-1 w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mb-3 min-h-5 text-sm text-red-600">{errors.name}</p>

        <label htmlFor="email" className="mb-1 block text-sm text-gray-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="mb-1 w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mb-3 min-h-5 text-sm text-red-600">{errors.email}</p>

        <label htmlFor="password" className="mb-1 block text-sm text-gray-600">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="mb-1 w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mb-3 min-h-5 text-sm text-red-600">{errors.password}</p>

        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm text-gray-600"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="mb-1 w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mb-4 min-h-5 text-sm text-red-600">
          {errors.confirmPassword}
        </p>

        {errors.form && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? "Creating account..." : "Create account"}
        </button>
        <Link to="/signin" className="mt-4 block text-center text-sm text-indigo-600">
          Already have an account? Sign in
        </Link>
      </form>
    </div>
  );
}

export default SignUp;