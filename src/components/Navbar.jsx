import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link to="/" style={{ fontWeight: "bold" }}>
        MyApp
      </Link>
      <Link to="/signin">
        <button>Sign In</button>
      </Link>
    </nav>
  );
}
