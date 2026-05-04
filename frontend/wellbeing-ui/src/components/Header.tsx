import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();

    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    function handleLogout() {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <div style={{ marginBottom: "20px" }}>
            <span>Logged in as: {email}</span>

            {role === "HR" && (
                <button onClick={() => navigate("/hr-dashboard")}>
                    HR Dashboard
                </button>
            )}

            <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
                Logout
            </button>
        </div>
    );
}

export default Header;