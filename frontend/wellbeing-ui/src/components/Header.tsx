import { useNavigate, Link } from "react-router-dom";
import { Leaf } from "lucide-react";

function Header() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] border-b border-white/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>

          <span className="text-lg font-semibold text-slate-900">
            Wellbeing
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 md:block">
            {firstName ? `${firstName} ${lastName}` : "User"}
          </span>

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="rounded-xl px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Profile
          </button>

          {role === "HR" && (
            <button
              onClick={() => navigate("/hr-dashboard")}
              className="rounded-xl px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              HR
            </button>
          )}

          {role === "Admin" && (
            <button
              onClick={() => navigate("/admin/users")}
              className="rounded-xl px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Admin
            </button>
          )}

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;