import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, CheckCircle2, Eye, EyeOff,
  LockKeyhole, ShieldCheck, Sparkles, User, UserCheck,
  Eye as EyeIcon, Settings, BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import buildingImage from "../public/image/nec-main-building.jpg";
import logoImage from "../public/image/Logo.png";

const roleOptions = [
  {
    value: "viewer",
    label: "Viewer",
    detail: "Read-only dashboards and reports",
    icon: EyeIcon,
    color: "emerald",
  },
  {
    value: "technician",
    label: "Technician",
    detail: "Manage maintenance tickets and records",
    icon: Settings,
    color: "violet",
  },
  {
    value: "admin",
    label: "Administrator",
    detail: "Full platform access and user control",
    icon: ShieldCheck,
    color: "cyan",
  },
];

const roleColorMap = {
  emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", icon: "text-emerald-400", badge: "text-emerald-300" },
  violet:  { border: "border-violet-500/40", bg: "bg-violet-500/10", icon: "text-violet-400", badge: "text-violet-300" },
  cyan:    { border: "border-cyan-500/40", bg: "bg-cyan-500/10", icon: "text-cyan-400", badge: "text-cyan-300" },
};

function getPasswordStrength(password) {
  if (!password) return { label: "", score: 0, color: "" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { label: "Weak", score: 1, color: "bg-rose-500", text: "text-rose-400" };
  if (score === 2) return { label: "Fair", score: 2, color: "bg-amber-500", text: "text-amber-400" };
  if (score === 3) return { label: "Good", score: 3, color: "bg-cyan-500", text: "text-cyan-400" };
  return { label: "Strong", score: 4, color: "bg-emerald-500", text: "text-emerald-400" };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "viewer" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    if (!agreed) e.agreement = "You must accept the terms and conditions to proceed";
    return e;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      await register({ ...form, name: form.name.trim() });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm(cur => ({ ...cur, [name]: e.target.value })),
  });

  const inputClass = (err) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 ${err ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"}`;

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat text-slate-800" style={{ backgroundImage: `url("${buildingImage}")` }}>
      <div className="min-h-screen bg-blue-950/45">
        <header className="border-b border-white/10 bg-blue-950/90 shadow-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImage} alt="NEC" className="h-11 w-11 rounded-full bg-white p-1 object-contain sm:h-12 sm:w-12" />
              <div>
                <strong className="block text-lg text-white sm:text-xl">NEC LibMS</strong>
                <span className="text-[10px] text-blue-200 sm:text-xs">Library Management System</span>
              </div>
            </Link>
            <div className="hidden text-right md:block">
              <strong className="block text-xs text-amber-300 sm:text-sm">NATIONAL ENGINEERING COLLEGE</strong>
              <span className="text-[10px] text-blue-200 sm:text-xs">An Autonomous Institution · Kovilpatti</span>
            </div>
            <Link to="/" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm">Home</Link>
          </div>
        </header>
        <div className="mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:py-10">

        {/* ── Left branding panel ── */}
        <div className="relative hidden max-w-md overflow-hidden rounded-3xl bg-blue-950/75 p-10 text-white shadow-2xl backdrop-blur-md lg:flex lg:flex-col lg:justify-between">
          {/* Glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.06] blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-15%] h-[400px] w-[400px] rounded-full bg-cyan-600/[0.05] blur-[90px]" />
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
          </div>

          <div className="relative z-10">
            <Link to="/" className="mb-12 flex items-center gap-3">
              <img src={logoImage} alt="NEC" className="h-11 w-11 rounded-full bg-white p-1 object-contain" />
              <div>
                <div className="text-lg font-bold text-white">NEC LibMS</div>
                <div className="text-xs text-blue-200">Library Management System</div>
              </div>
            </Link>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              <Sparkles className="h-3.5 w-3.5" /> New Workspace
            </div>
            <h1 className="max-w-md text-4xl font-black leading-tight tracking-tight text-white">
              Join the NEC library community.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-8 text-slate-400">
              Create your account to access books, records, reservations, and intelligent library services.
            </p>
          </div>

          {/* Capability list */}
          <div className="relative z-10 my-10">
            <div className="space-y-3">
              {[
                { icon: ShieldCheck, label: "Secure role-based access for library members" },
                { icon: BarChart3, label: "Search books and manage your library activity" },
                { icon: UserCheck, label: "Personalised services for the NEC community" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                    <Icon className="h-4 w-4 text-cyan-400" />
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="relative z-10 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
            <div className="mb-2 flex items-center gap-2 text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-[0.12em]">Security First</span>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              Your account is protected with secure access and clear library permissions.
            </p>
          </div>
        </div>

        {/* ── Right: signup form ── */}
        <div className="flex w-full items-start justify-center overflow-y-auto p-1 sm:p-4 lg:max-w-lg lg:p-8">
          <div className="w-full max-w-md py-4">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <img src={logoImage} alt="NEC" className="h-10 w-10 rounded-full bg-white p-1 object-contain" />
              <span className="text-[15px] font-bold text-white">NEC LibMS</span>
            </div>

            <div className="mb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-blue-700">Create Account</h2>
              <p className="mt-2 text-sm text-slate-500">Join NEC Library Management System</p>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Full name */}
                <div>
                  <label htmlFor="signup-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Full name</label>
                  <input id="signup-name" type="text" autoComplete="name" placeholder="Jane Engineer" className={inputClass(errors.name)} {...field("name")} />
                  {errors.name && <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-400"><AlertTriangle className="h-3 w-3" /> {errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="signup-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Email address</label>
                  <input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass(errors.email)} {...field("email")} />
                  {errors.email && <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-400"><AlertTriangle className="h-3 w-3" /> {errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="signup-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Password</label>
                  <div className="relative">
                    <input id="signup-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a secure password" className={inputClass(errors.password) + " pr-11"} {...field("password")} />
                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-200">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {form.password && (
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-slate-600">Password strength</span>
                        <span className={`text-[10px] font-semibold ${strength.text}`}>{strength.label}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(step => (
                          <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step <= strength.score ? strength.color : "bg-slate-800"}`} />
                        ))}
                      </div>
                      <div className="mt-2 space-y-1">
                        {[
                          { test: form.password.length >= 8, label: "At least 8 characters" },
                          { test: /[A-Z]/.test(form.password), label: "One uppercase letter" },
                          { test: /[0-9]/.test(form.password), label: "One number" },
                          { test: /[^A-Za-z0-9]/.test(form.password), label: "One special character" },
                        ].map(({ test, label }) => (
                          <div key={label} className="flex items-center gap-1.5">
                            <CheckCircle2 className={`h-3 w-3 ${test ? "text-emerald-400" : "text-slate-700"}`} />
                            <span className={`text-[10px] ${test ? "text-slate-400" : "text-slate-600"}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-400"><AlertTriangle className="h-3 w-3" /> {errors.password}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="signup-confirm" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Confirm password</label>
                  <div className="relative">
                    <input id="signup-confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter your password" className={inputClass(errors.confirmPassword) + " pr-11"} {...field("confirmPassword")} />
                    <button type="button" aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowConfirm(v => !v)} className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-200">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!errors.confirmPassword && form.confirmPassword && form.confirmPassword === form.password && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Passwords match</p>
                  )}
                  {errors.confirmPassword && <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-400"><AlertTriangle className="h-3 w-3" /> {errors.confirmPassword}</p>}
                </div>

                {/* Role selection */}
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Access role</div>
                  <div className="grid gap-2">
                    {roleOptions.map(opt => {
                      const Icon = opt.icon;
                      const c = roleColorMap[opt.color];
                      const selected = form.role === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm(cur => ({ ...cur, role: opt.value }))}
                          className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${selected ? `${c.border} ${c.bg}` : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}
                        >
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${selected ? c.bg : "bg-slate-900"} border ${selected ? c.border : "border-slate-800"}`}>
                            <Icon className={`h-4 w-4 ${selected ? c.icon : "text-slate-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold ${selected ? c.badge : "text-slate-300"}`}>{opt.label}</div>
                            <div className="text-[11px] text-slate-500">{opt.detail}</div>
                          </div>
                          {selected && <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${c.icon}`} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/8 px-4 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                    <p className="text-sm text-rose-300">{serverError}</p>
                  </div>
                )}

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm transition hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-slate-600">
                    I agree to the{" "}
                    <span className="font-medium text-cyan-400">terms and conditions</span>{" "}
                    and the processing of equipment monitoring data in accordance with operational security policies.
                  </span>
                </label>
                {errors.agreement && <p className="-mt-2 flex items-center gap-1.5 text-xs text-rose-400"><AlertTriangle className="h-3 w-3" /> {errors.agreement}</p>}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  id="signup-submit-btn"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Account"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-700 transition hover:text-blue-900">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
