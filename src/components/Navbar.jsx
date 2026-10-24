import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white px-8 py-4 shadow">
      <Link to="/" className="text-xl font-bold text-indigo-600">
        ProjectHub
      </Link>

      <Link
        to="/signin"
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Sign In
      </Link>
    </nav>
  );
}

export default Navbar;
