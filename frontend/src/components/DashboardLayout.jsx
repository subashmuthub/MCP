import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ActivitySquare, Bell, BrainCircuit, ClipboardList, ChevronDown,
  FlaskConical, LayoutDashboard, LogOut, Menu, MessageCircle,
  Search, Settings, Ticket, TriangleAlert, UserRound, Users,
  Wrench, X, FolderArchive,
} from 'lucide-react';

/* ── Nav Groups ──────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin','technician','viewer'] },
    ],
  },
  {
    label: 'Equipment',
    items: [
      { to: '/dashboard/equipment', label: 'Equipment Registry', icon: FlaskConical, roles: ['admin','technician','viewer'] },
      { to: '/dashboard/usage-logs', label: 'Usage Logs', icon: ClipboardList, roles: ['admin','technician'] },
    ],
  },
  {
    label: 'Maintenance',
    items: [
      { to: '/dashboard/alerts',      label: 'Alerts',          icon: TriangleAlert, roles: ['admin','technician','viewer'] },
      { to: '/dashboard/tickets',     label: 'Tickets',         icon: Ticket,        roles: ['admin','technician'] },
      { to: '/dashboard/maintenance', label: 'Maintenance Log', icon: Wrench,        roles: ['admin','technician'] },
      { to: '/dashboard/risk',        label: 'Risk Prediction', icon: BrainCircuit,  roles: ['admin','technician'] },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/dashboard/records',  label: 'Records',  icon: FolderArchive,   roles: ['admin','technician','viewer'] },
      { to: '/dashboard/feedback', label: 'Feedback', icon: MessageCircle,   roles: ['admin','technician','viewer'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/dashboard/users',   label: 'Users',             icon: Users,    roles: ['admin'] },
      { to: '/dashboard/profile', label: 'Profile & Settings', icon: Settings, roles: ['admin','technician','viewer'] },
    ],
  },
];

const ROLE_CONFIG = {
  admin:      { label: 'Admin',      color: '#67e8f9', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.25)' },
  technician: { label: 'Technician', color: '#93c5fd', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' },
  viewer:     { label: 'Viewer',     color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.20)' },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.viewer;
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(user?.role)),
  })).filter(group => group.items.length > 0);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-5 py-5 dashboard-sidebar-border">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="dashboard-brand-mark">ES</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', letterSpacing: '-0.01em' }}>EquipSense AI</p>
            <p style={{ fontSize: 10, color: 'rgba(148,163,184,0.7)' }}>Predictive Maintenance</p>
          </div>
        </NavLink>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 dashboard-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-xl dashboard-profile-surface">
          <div className="dashboard-avatar">{initial}</div>
          <div className="min-w-0">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <span style={{
              display: 'inline-block', marginTop: 3, fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 9999,
              background: role.bg, color: role.color, border: `1px solid ${role.border}`,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{role.label}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar">
        {visibleGroups.map((group, gIdx) => (
          <div key={group.label}>
            {gIdx > 0 && <div className="nav-group-divider" />}
            <span className="nav-group-label">{group.label}</span>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="icon"><item.icon size={15} strokeWidth={1.8} /></span>
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 dashboard-sidebar-border-top">
        <button type="button" onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium"
          style={{ color: 'rgba(248,113,113,0.8)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.8)'; }}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(239,68,68,0.10)' }}><LogOut size={15} /></span>
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-shell flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden dashboard-overlay"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ width: 220 }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="dashboard-main flex-1 lg:ml-[220px] flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <header className="dashboard-topbar flex items-center gap-4 px-4 py-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(v => !v)}
            className="dashboard-menu-button" aria-label="Open navigation">
            {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <div className="dashboard-search">
            <Search size={16} />
            <input aria-label="Search" placeholder="Search anything..." />
          </div>
          <div className="dashboard-topbar-actions">
            <span className="dashboard-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <button aria-label="Settings" onClick={() => navigate('/dashboard/profile')}><Settings size={16} /></button>
            <div className="dashboard-popover-anchor">
              <button aria-label="Notifications" onClick={() => setNotificationsOpen(v => !v)}>
                <Bell size={16} /><span className="dashboard-notification-count">3</span>
              </button>
              {notificationsOpen && (
                <div className="dashboard-popover dashboard-notifications">
                  <div className="dashboard-popover-heading"><strong>Notifications</strong><span>View all</span></div>
                  <div className="dashboard-notification"><b>System status</b><small>All equipment updates are synced.</small></div>
                  <div className="dashboard-notification"><b>Risk review</b><small>New prediction results are available.</small></div>
                  <div className="dashboard-notification"><b>Maintenance</b><small>Upcoming maintenance requires review.</small></div>
                </div>
              )}
            </div>
            <div className="dashboard-popover-anchor">
              <button className="dashboard-user-trigger" aria-label="Open profile menu" onClick={() => setProfileOpen(v => !v)}>
                <span className="dashboard-topbar-avatar">{initial}</span>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="dashboard-popover dashboard-profile-popover">
                  <div className="dashboard-popover-user">
                    <span className="dashboard-topbar-avatar">{initial}</span>
                    <div><strong>{user?.name}</strong><small>{role.label}</small></div>
                  </div>
                  <button onClick={() => navigate('/dashboard/profile')}><UserRound size={14} /> Profile</button>
                  <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-main-content flex-1 p-6 animate-fade-in min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
