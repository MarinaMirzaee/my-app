import Link from "next/link";

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white px-8 py-4 shadow">
      <Link href="/" className="text-xl font-bold text-indigo-600">
        ProjectHub
      </Link>

      <div className="flex items-center gap-3">
        <Link href="/signup" className="text-sm text-indigo-600 hover:underline">
          Create account
        </Link>
        <Link
          href="/signin"
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
