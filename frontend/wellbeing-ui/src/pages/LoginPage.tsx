import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Heart, Leaf, Sparkles } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      localStorage.setItem("token", result.token);
      localStorage.setItem("email", result.email);
      localStorage.setItem("role", result.role);
      localStorage.setItem("firstName", result.firstName);
      localStorage.setItem("lastName", result.lastName);

      if (result.role === "Admin") {
        navigate("/admin/users");
      } else if (result.role === "HR") {
        navigate("/hr-dashboard");
      } else {
        navigate("/dashboard");
      }
      
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4faf2] p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-green-300/25 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-yellow-200/35 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      <Sparkles className="absolute right-16 top-16 hidden h-10 w-10 text-green-400/30 md:block" />
      <Heart className="absolute bottom-24 left-16 hidden h-8 w-8 text-yellow-300/50 md:block" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4caf58] shadow-lg shadow-green-500/30">
            <Leaf className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Wellbeing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Employee Wellness Platform
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/95 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome back! 👋
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue your wellness journey
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@mail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-12 w-full rounded-xl border border-green-100 bg-[#eef4eb] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-200/60"
              />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-green-100 bg-[#eef4eb] px-4 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-200/60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-green-600"
                />
                Remember me
              </label>

              <button
                type="button"
                className="font-medium text-green-600 transition hover:text-green-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#4caf58] font-semibold text-white shadow-lg shadow-green-500/25 transition hover:bg-[#43a04f] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400">Or</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-green-600 transition hover:text-green-700"
            >
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Nurturing employee wellness, one step at a time 🌱
        </p>
      </div>
    </div>
  );
}

export default LoginPage;