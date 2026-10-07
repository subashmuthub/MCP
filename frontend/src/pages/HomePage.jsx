import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowRight, Bell, BellRing, Brain,
  CheckCircle2, ChevronRight, Cpu, Database, Factory, GitBranch,
  Globe, Lock, Menu, Monitor, Network, Server, ShieldCheck,
  Sparkles, TrendingUp, Users, Wrench, X, Zap, LayoutDashboard,
} from "lucide-react";
import logoImage from "../public/image/Logo.png";
import campusImage from "../public/image/Home.jpg";
import frontSliderImage from "../public/image/NEC-Front-Mobile-Slider-scaled.webp";
import achievementsImage from "../public/image/nec-achievements.png";

const heroSlides = [
  {
    image: achievementsImage,
    eyebrow: "AI-Powered Predictive Maintenance",
    title: "Excellence in placements",
    subtitle: "Make smarter decisions with data-driven equipment intelligence.",
  },
  {
    image: frontSliderImage,
    eyebrow: "Modern engineering campus",
    title: "Built for better operations",
    subtitle: "Bring your teams, assets, and maintenance workflows together.",
  },
  {
    image: campusImage,
    eyebrow: "National Engineering College",
    title: "A smarter way to protect uptime",
    subtitle: "Detect risk early, act faster, and keep critical operations moving.",
  },
];

const stats = [
  { value: "6+", label: "Assets Monitored", color: "text-cyan-400" },
  { value: "94%", label: "Prediction Accuracy", color: "text-emerald-400" },
  { value: "<2s", label: "Alert Response", color: "text-violet-400" },
  { value: "Rs.50K+", label: "Cost Savings", color: "text-amber-400" },
];

const features = [
  { icon: Database, title: "Centralised Equipment Registry", description: "Maintain a unified, searchable registry of all industrial assets with detailed metadata, location mapping, and lifecycle tracking.", accent: "cyan" },
  { icon: Brain, title: "Predictive Risk Scoring", description: "ML-powered failure-risk engine analyses sensor readings, usage patterns, and maintenance history to surface high-risk assets before they fail.", accent: "violet" },
  { icon: LayoutDashboard, title: "Colour-Coded Health Dashboard", description: "At-a-glance health overview with Healthy, Needs Attention, and Critical status bands so engineers know where to focus in seconds.", accent: "emerald" },
  { icon: BellRing, title: "Automated Maintenance Alerts", description: "Rule-based and AI-triggered notifications push automatically to assigned technicians when risk thresholds are breached.", accent: "amber" },
  { icon: TrendingUp, title: "Historical Trend Visualisation", description: "Interactive charts reveal long-term equipment degradation trends, helping planners schedule preventive work at the right intervals.", accent: "rose" },
  { icon: Users, title: "Role-Based Access Control", description: "Granular access for Administrators, Technicians, and Viewers ensures each team member sees exactly what they need.", accent: "sky" },
];

const steps = [
  { number: "01", icon: Cpu, title: "Data Collection", description: "Sensor telemetry, usage hours, and maintenance records are ingested in real time from equipment across your facility.", color: "cyan" },
  { number: "02", icon: GitBranch, title: "Feature Processing", description: "Raw signals are cleaned, normalised, and transformed into meaningful operational features by the Python/Flask data pipeline.", color: "violet" },
  { number: "03", icon: Activity, title: "Risk Prediction", description: "A trained classification model scores each asset failure probability and estimated days to next maintenance event.", color: "amber" },
  { number: "04", icon: Bell, title: "Classification and Alerting", description: "Results are classified into status tiers and surfaced as prioritised alerts, dashboard updates, and automated work-ticket creation.", color: "emerald" },
];

const problems = [
  {
    type: "problem", title: "Reactive Maintenance", icon: AlertTriangle,
    points: ["Equipment fails without warning", "Emergency repairs disrupt production", "Unplanned downtime costs accumulate", "Technicians respond to crises, not plans"],
  },
  {
    type: "solution", title: "AI-Driven Predictive Maintenance", icon: ShieldCheck,
    points: ["Failure risk scored before breakdowns occur", "Maintenance scheduled at optimal intervals", "Downtime reduced by up to 40%", "Teams act on data, not gut feeling"],
  },
];

const techStack = [
  { name: "React", icon: Globe, desc: "UI Layer" },
  { name: "Node.js / Express", icon: Server, desc: "REST API" },
  { name: "Python / Flask", icon: Cpu, desc: "ML Service" },
  { name: "MongoDB", icon: Database, desc: "Data Store" },
];

const accentMap = {
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    icon: "text-cyan-400",    glow: "group-hover:shadow-cyan-500/20"    },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  icon: "text-violet-400",  glow: "group-hover:shadow-violet-500/20"  },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", glow: "group-hover:shadow-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: "text-amber-400",   glow: "group-hover:shadow-amber-500/20"   },
  rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    icon: "text-rose-400",    glow: "group-hover:shadow-rose-500/20"    },
  sky:     { bg: "bg-sky-500/10",     border: "border-sky-500/20",     icon: "text-sky-400",     glow: "group-hover:shadow-sky-500/20"     },
};

const stepColorMap = {
  cyan:    { num: "text-cyan-400",    border: "border-cyan-500/30",    bg: "bg-cyan-500/10",    icon: "text-cyan-400"    },
  violet:  { num: "text-violet-400",  border: "border-violet-500/30",  bg: "bg-violet-500/10",  icon: "text-violet-400"  },
  amber:   { num: "text-amber-400",   border: "border-amber-500/30",   bg: "bg-amber-500/10",   icon: "text-amber-400"   },
  emerald: { num: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: "text-emerald-400" },
};

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Technology", href: "#technology" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-slate-200 bg-white/95 shadow-lg backdrop-blur-xl" : "bg-white/90"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <img src={logoImage} alt="NEC" className="h-9 w-9 rounded-full bg-white p-1 object-contain shadow-sm" />
            <span className="text-[15px] font-bold tracking-tight text-blue-700">EquipSense AI</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map(l => <a key={l.label} href={l.href} className="text-sm font-medium text-slate-600 transition hover:text-blue-700">{l.label}</a>)}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700">Log In</Link>
            <Link to="/signup" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Sign Up</Link>
          </div>
          <button className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="NEC" className="h-9 w-9 rounded-full bg-white p-1 object-contain" />
              <span className="text-[15px] font-bold text-blue-700">EquipSense AI</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="rounded-xl border border-slate-700 p-2 text-slate-300" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-2">
            {navLinks.map(l => <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-slate-800 hover:text-cyan-300">{l.label}</a>)}
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-xl border border-slate-700 py-3 text-center text-sm font-medium text-slate-200">Log In</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="rounded-xl bg-cyan-500 py-3 text-center text-sm font-semibold text-slate-950">Sign Up</Link>
          </div>
        </div>
      )}
    </>
  );
}

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  function handleTouchEnd(event) {
    if (touchStart === null) return;
    const distance = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(distance) > 45) {
      setActiveSlide((current) => (
        distance > 0
          ? (current + 1) % heroSlides.length
          : (current - 1 + heroSlides.length) % heroSlides.length
      ));
    }
    setTouchStart(null);
  }

  return (
    <section
      className="home-hero relative min-h-screen overflow-hidden bg-slate-200 pt-16"
      onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
    >
      {heroSlides.map((item, index) => (
        <img
          key={item.image}
          src={item.image}
          alt=""
          aria-hidden="true"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "low"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            activeSlide === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-blue-800/45 to-violet-900/65" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-5%] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.08] blur-[120px]" />
        <div className="absolute right-[-8%] top-[20%] h-[400px] w-[400px] rounded-full bg-blue-600/[0.08] blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[30%] h-[300px] w-[500px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              {slide.eyebrow}
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.5rem]">
              {slide.title}{" "}
              <span className="bg-gradient-to-r from-blue-200 to-violet-200 bg-clip-text text-transparent">with EquipSense AI.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-8 text-slate-300">
              {slide.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2.5 rounded-xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.35)] transition hover:bg-cyan-400">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-base font-semibold text-slate-100 transition hover:border-slate-500">
                See How It Works <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map(item => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center backdrop-blur-sm">
                  <div className={`text-3xl font-black ${item.color}`}>{item.value}</div>
                  <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute inset-0 rounded-[28px] bg-cyan-500/10 blur-[40px]" />
            <div className="relative rounded-[28px] border border-white/30 bg-white/95 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300">Live Risk View</span>
                </div>
              </div>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-[#0d1e30] p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Fleet Health</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">82%</div>
                  <div className="mt-2.5 h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 w-[82%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#0d1e30] p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Critical</span>
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  </div>
                  <div className="text-3xl font-black text-white">02</div>
                  <div className="mt-2.5 text-[11px] text-rose-300">Needs immediate action</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#0d1e30] p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Alerts</span>
                    <BellRing className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-white">04</div>
                  <div className="mt-2.5 text-[11px] text-amber-300">Active notifications</div>
                </div>
              </div>
              <div className="mb-4 rounded-2xl border border-slate-800 bg-[#0d1e30] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Maintenance Efficiency Trend</span>
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <div className="grid grid-cols-8 items-end gap-1.5">
                  {[38, 45, 42, 55, 60, 72, 80, 94].map((value, index) => (
                    <div key={index} className="flex flex-col items-center gap-1.5">
                      <div className={`w-full rounded-t-lg ${index >= 5 ? "bg-gradient-to-t from-cyan-600 to-cyan-300" : "bg-slate-700"}`} style={{ height: `${value}px` }} />
                      <span className="text-[8px] uppercase text-slate-600">W{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Hydraulic Press A1", risk: 12, status: "healthy", label: "Healthy" },
                  { name: "Conveyor Belt C3", risk: 68, status: "warning", label: "Attention" },
                  { name: "CNC Mill M2", risk: 91, status: "critical", label: "Critical" },
                ].map(eq => (
                  <div key={eq.name} className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0d1e30] px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Factory className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[11px] font-semibold text-slate-200">{eq.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 rounded-full bg-slate-800">
                        <div className={`h-1 rounded-full ${eq.status === "healthy" ? "bg-emerald-400" : eq.status === "warning" ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${eq.risk}%` }} />
                      </div>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${eq.status === "healthy" ? "bg-emerald-500/15 text-emerald-300" : eq.status === "warning" ? "bg-amber-500/15 text-amber-300" : "bg-rose-500/15 text-rose-300"}`}>
                        {eq.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  return (
    <section id="problem-solution" className="bg-[#020b17] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <Wrench className="h-3.5 w-3.5" /> The Maintenance Challenge
          </div>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">Why traditional maintenance fails</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">Industrial teams lose millions annually to unplanned downtime. The root cause is always the same: acting after failure, not before it.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {problems.map(item => {
            const Icon = item.icon;
            const isProblem = item.type === "problem";
            return (
              <div key={item.type} className={`relative overflow-hidden rounded-3xl border p-8 ${isProblem ? "border-rose-500/20 bg-rose-500/5" : "border-cyan-500/20 bg-cyan-500/5"}`}>
                <div className={`pointer-events-none absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full blur-[60px] ${isProblem ? "bg-rose-500/10" : "bg-cyan-500/10"}`} />
                <div className="relative">
                  <div className="mb-6 flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isProblem ? "bg-rose-500/15 text-rose-400" : "bg-cyan-500/15 text-cyan-400"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isProblem ? "text-rose-500" : "text-cyan-500"}`}>{isProblem ? "The Problem" : "The Solution"}</div>
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {item.points.map(point => (
                      <li key={point} className="flex items-start gap-3">
                        <div className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${isProblem ? "bg-rose-500/15" : "bg-cyan-500/15"}`}>
                          {isProblem ? <X className="h-3 w-3 text-rose-400" /> : <CheckCircle2 className="h-3 w-3 text-cyan-400" />}
                        </div>
                        <span className="text-sm leading-6 text-slate-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-[#030e1c] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <Zap className="h-3.5 w-3.5" /> Platform Capabilities
          </div>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">Everything your maintenance team needs</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">From equipment registry to AI-driven risk scoring, all in one integrated platform built for industrial operations.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(feat => {
            const Icon = feat.icon;
            const a = accentMap[feat.accent];
            return (
              <div key={feat.title} className={`group relative overflow-hidden rounded-3xl border ${a.border} bg-slate-900/40 p-7 transition hover:-translate-y-1 hover:shadow-[0_12px_40px] ${a.glow}`}>
                <div className={`pointer-events-none absolute right-[-30px] top-[-30px] h-32 w-32 rounded-full ${a.bg} blur-[50px]`} />
                <div className="relative">
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${a.bg} border ${a.border}`}>
                    <Icon className={`h-6 w-6 ${a.icon}`} />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-white">{feat.title}</h3>
                  <p className="text-sm leading-7 text-slate-400">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#020b17] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <Activity className="h-3.5 w-3.5" /> The Pipeline
          </div>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">How EquipSense AI works</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">A four-stage intelligence pipeline turns raw sensor data into actionable maintenance decisions in under two seconds.</p>
        </div>
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const c = stepColorMap[step.color];
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {idx < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+40px)] top-10 h-px w-[calc(100%-80px)] bg-gradient-to-r from-slate-600 to-slate-800" />
                )}
                <div className={`mb-6 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border ${c.border} ${c.bg} shadow-[0_8px_30px_rgba(0,0,0,0.3)]`}>
                  <Icon className={`h-9 w-9 ${c.icon}`} />
                </div>
                <div className={`mb-2 text-xs font-black uppercase tracking-[0.2em] ${c.num}`}>{step.number}</div>
                <h3 className="mb-3 text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-7 text-slate-400">{step.description}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-6 lg:hidden">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const c = stepColorMap[step.color];
            return (
              <div key={step.number} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border ${c.border} ${c.bg}`}>
                    <Icon className={`h-6 w-6 ${c.icon}`} />
                  </div>
                  {idx < steps.length - 1 && <div className="mt-3 h-full w-px bg-slate-800" />}
                </div>
                <div className="pb-6">
                  <div className={`mb-1 text-xs font-black uppercase tracking-[0.2em] ${c.num}`}>{step.number}</div>
                  <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-sm leading-7 text-slate-400">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Technology() {
  return (
    <section id="technology" className="bg-[#030e1c] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <Network className="h-3.5 w-3.5" /> Built On
          </div>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">Enterprise-grade technology stack</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">Modern, battle-tested technologies woven into a cohesive, high-performance system.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map(tech => {
            const Icon = tech.icon;
            return (
              <div key={tech.name} className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-7 text-center transition hover:border-cyan-500/30 hover:bg-slate-900">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 transition group-hover:border-cyan-500/30">
                  <Icon className="h-7 w-7 text-slate-300 transition group-hover:text-cyan-300" />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{tech.desc}</div>
                <div className="mt-1 text-lg font-bold text-white">{tech.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="bg-[#020b17] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-blue-950/60 p-12 text-center shadow-[0_20px_80px_rgba(34,211,238,0.1)]">
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="relative">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
              <Monitor className="h-7 w-7 text-cyan-400" />
            </div>
            <h2 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">Ready to eliminate unplanned downtime?</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-slate-300">Join the NEC community and make smarter use of books, resources, and library services.</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup" className="inline-flex items-center gap-2.5 rounded-xl bg-cyan-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.4)] transition hover:bg-cyan-400">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/60 px-8 py-4 text-base font-semibold text-slate-100 transition hover:border-slate-500">
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-800 bg-[#020b17] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <img src={logoImage} alt="NEC" className="h-10 w-10 rounded-full bg-white p-1 object-contain" />
              <span className="text-lg font-bold text-white">EquipSense AI</span>
            </div>
            <p className="max-w-sm text-sm leading-7 text-slate-400">An AI-powered predictive maintenance platform for National Engineering College, helping teams detect risk early and protect uptime.</p>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Academic Institution</div>
              <div className="mt-1 text-sm font-semibold text-slate-200">National Engineering College, Kovilpatti</div>
              <div className="mt-0.5 text-xs text-slate-500">Tamil Nadu, India</div>
            </div>
          </div>
          <div>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Links</div>
            <ul className="space-y-3">
              {[{ label: "Features", href: "#features" }, { label: "How It Works", href: "#how-it-works" }, { label: "Technology", href: "#technology" }].map(l => (
                <li key={l.label}><a href={l.href} className="text-sm text-slate-400 transition hover:text-cyan-300">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</div>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-sm text-slate-400 transition hover:text-cyan-300">Sign In</Link></li>
              <li><Link to="/signup" className="text-sm text-slate-400 transition hover:text-cyan-300">Create Account</Link></li>
            </ul>
            <div className="mt-8">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">System Status</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">2025 EquipSense AI - Mini Capstone Project, National Engineering College</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Lock className="h-3 w-3" /> Role-based access control
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="home-light min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <Technology />
      <CTABanner />
      <Footer />
    </div>
  );
}
