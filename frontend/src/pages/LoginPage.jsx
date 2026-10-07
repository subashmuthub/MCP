import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import buildingImage from "../public/image/nec-main-building.jpg";
import campusImage from "../public/image/Home.jpg";
import achievementsImage from "../public/image/nec-achievements.png";
import logoImage from "../public/image/Logo.png";

const backgroundImages = [buildingImage, campusImage, achievementsImage];

const demoCredentials = [
  { role: "Admin", email: "subash@gmail.com", pass: "Admin@123", color: "text-blue-700" },
  { role: "Technician", email: "arun@equipsense.com", pass: "Tech@123", color: "text-violet-700" },
  { role: "Viewer", email: "meena@equipsense.com", pass: "View@123", color: "text-emerald-700" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  useEffect(() => {
    document.title = "Login | NEC LibMS";
  }, []);

  useEffect(() => {
    backgroundImages.forEach((image) => {
      const preload = new Image();
      preload.src = image;
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBackgroundIndex((index) => (index + 1) % backgroundImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  function validate() {
    const nextErrors = {};
    if (!form.email) nextErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!form.password) nextErrors.password = "Password is required";
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const updateField = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-blue-950 text-slate-800"
      style={{ backgroundImage: `url("${backgroundImages[backgroundIndex]}")` }}
    >
      <div className="min-h-screen bg-blue-950/45">
        <header className="border-b border-white/10 bg-blue-950/90 shadow-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="NEC"
                className="h-11 w-11 rounded-full bg-white p-1 object-contain sm:h-12 sm:w-12"
              />
              <div>
                <strong className="block text-lg text-white sm:text-xl">NEC LibMS</strong>
                <span className="text-[10px] text-blue-200 sm:text-xs">
                  Library Management System
                </span>
              </div>
            </Link>
            <div className="hidden text-right md:block">
              <strong className="block text-xs text-amber-300 sm:text-sm">
                NATIONAL ENGINEERING COLLEGE
              </strong>
              <span className="text-[10px] text-blue-200 sm:text-xs">
                An Autonomous Institution · Kovilpatti
              </span>
            </div>
            <Link
              to="/"
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm"
            >
              Home
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
          <section className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-blue-600 sm:text-3xl">
                Welcome Back
              </h1>
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                Sign in to access NEC Library Management System
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Secure, role-based access for NEC library operations.</span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-slate-600">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="your.email@gmail.com"
                    className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                      errors.email
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"
                    }`}
                    value={form.email}
                    onChange={updateField("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                    <AlertTriangle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
                      errors.password
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"
                    }`}
                    value={form.password}
                    onChange={updateField("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-3.5 text-slate-400 transition hover:text-blue-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                    <AlertTriangle className="h-3 w-3" /> {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setServerError("Use your registered email and contact the library administrator to reset your password.")}
                  className="text-xs font-bold text-blue-700 transition hover:text-blue-900 sm:text-sm"
                >
                  Forgot password?
                </button>
              </div>

              {serverError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-xs text-slate-500 sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-bold text-blue-700 transition hover:text-blue-900">
                Create account
              </Link>
            </p>
            <Link to="/" className="mt-3 block text-center text-xs font-semibold text-slate-400 transition hover:text-blue-700">
              Back to Home
            </Link>

            <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <summary className="cursor-pointer font-bold text-slate-600">Demo access</summary>
              <div className="mt-2 space-y-1.5">
                {demoCredentials.map((credential) => (
                  <button
                    key={credential.role}
                    type="button"
                    onClick={() => setForm({ email: credential.email, password: credential.pass })}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition hover:bg-white"
                  >
                    <span className={`font-bold ${credential.color}`}>{credential.role}</span>
                    <span>{credential.email}</span>
                  </button>
                ))}
              </div>
            </details>
          </section>
        </main>
      </div>
    </div>
  );
}
