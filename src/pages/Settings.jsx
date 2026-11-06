import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { accountSchema } from "../schemas/accountSchema";
import { validate } from "../utils/validate";

function Settings() {
  const { user, updateAccount } = useAuth();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const { data, errors: validationErrors } = validate(
      accountSchema,
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    setErrors(validationErrors);
    setMessage("");
    if (!data) return;

    try {
      updateAccount(data);
      setMessage("Account details updated.");
    } catch (error) {
      setErrors({ form: error.message });
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Account settings</h1>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="max-w-lg rounded bg-white p-6 shadow"
      >
        <label htmlFor="name" className="mb-1 block text-sm text-gray-600">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={user.name}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mb-4 mt-1 min-h-5 text-sm text-red-600">{errors.name}</p>

        <label htmlFor="email" className="mb-1 block text-sm text-gray-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <p className="mb-4 mt-1 min-h-5 text-sm text-red-600">{errors.email}</p>

        {errors.form && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {errors.form}
          </p>
        )}
        {message && (
          <p role="status" className="mb-3 text-sm text-green-700">
            {message}
          </p>
        )}
        <button className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Save changes
        </button>
      </form>
    </div>
  );
}

export default Settings;
