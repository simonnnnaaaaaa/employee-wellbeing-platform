import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { Check, Eye, EyeOff, Leaf, Sparkles, X } from "lucide-react";

function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordsMatch = password === confirmPassword;
  const hasConfirmPassword = confirmPassword.length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await register(firstName, lastName, email, password);
      navigate("/login");
    } catch {
      setErrorMessage("Registration failed. This email may already be used.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4faf2] p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-green-300/25 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-yellow-200/35 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-sky-200/20 blur-2xl" />
      </div>

      <Sparkles className="absolute right-20 top-20 hidden h-8 w-8 text-green-400/30 md:block" />
      <Leaf className="absolute bottom-32 left-20 hidden h-10 w-10 text-yellow-300/50 md:block" />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/70 bg-white/95 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Start your wellness journey today
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-center text-sm text-red-600">
              {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                className="h-12 w-full rounded-xl border-0 bg-[#eef4eb] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-green-200/60"
              />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                className="h-12 w-full rounded-xl border-0 bg-[#eef4eb] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-green-200/60"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="john.doe@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-12 w-full rounded-xl border-0 bg-[#eef4eb] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-green-200/60"
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
                placeholder="Create a strong password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-12 w-full rounded-xl border-0 bg-[#eef4eb] px-4 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-green-200/60"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className={`h-12 w-full rounded-xl border-0 bg-[#eef4eb] px-4 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                  hasConfirmPassword
                    ? passwordsMatch
                      ? "ring-2 ring-green-300 focus:ring-green-200/60"
                      : "ring-2 ring-red-300 focus:ring-red-200/60"
                    : "focus:ring-green-200/60"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {hasConfirmPassword && (
              <div
                className={`mt-2 flex items-center gap-2 text-sm ${
                  passwordsMatch ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordsMatch ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !passwordsMatch || !hasConfirmPassword}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#4caf58] text-base font-medium text-white shadow-lg shadow-green-500/25 transition hover:bg-[#43a04f] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-slate-400">
              Already have an account?
            </span>
          </div>
        </div>

        <Link
          to="/login"
          className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-green-200 font-medium text-green-600 transition hover:bg-green-50"
        >
          Sign in instead
        </Link>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
          By creating an account, you agree to our{" "}
          <span className="text-green-600">Terms of Service</span> and{" "}
          <span className="text-green-600">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;