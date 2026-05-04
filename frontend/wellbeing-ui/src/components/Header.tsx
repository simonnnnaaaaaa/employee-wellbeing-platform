import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <span>Logged in as: {email}</span>

      <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
        Logout
      </button>
    </div>
  );
}

export default Header;