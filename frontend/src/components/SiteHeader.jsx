import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    (isAuthenticated && location.pathname.startsWith('/dashboard'))
  ) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-sm">
            ES
          </div>
          <span className="text-[15px] font-bold tracking-tight text-slate-800">
            EquipSense AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-slate-900' : 'hover:text-slate-900'}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-slate-900' : 'hover:text-slate-900'}>
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
