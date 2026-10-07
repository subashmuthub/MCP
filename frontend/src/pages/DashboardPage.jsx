import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, CircleAlert, ShieldCheck, Ticket,
  Wrench, ArrowRight, Activity, TrendingUp,
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const GLOW_DOT_CLASS = { critical: 'glow-dot critical', warning: 'glow-dot warning', healthy: 'glow-dot healthy' };

function FleetStatCard({ label, value, color, icon: Icon, bgColor, link }) {
  const inner = (
    <div className="stat-card" style={{ cursor: link ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p style={{ fontSize: 34, fontWeight: 900, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      {link && <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 6 }}>View details</p>}
    </div>
  );
  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0d1e30', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-soft)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#22d3ee', fontWeight: 700, fontSize: 14 }}>{payload[0].value}% Risk</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ equipment: [], alerts: [], tickets: [], maintenance: [], predictions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [eq, al, tk, mn, pr, status] = await Promise.all([
          apiRequest('/api/equipment'),
          apiRequest('/api/alerts'),
          apiRequest('/api/tickets'),
          apiRequest('/api/maintenance'),
          apiRequest('/api/predictions'),
          apiRequest('/api/predictions/status'),
        ]);
        const realEquipmentIds = new Set((eq.data || []).filter(item => item.source !== 'seed').map(item => item.id));
        setData({
          equipment: (eq.data || []).filter(item => item.source !== 'seed'),
          alerts: (al.data || []).filter(item => realEquipmentIds.has(item.equipmentId)),
          tickets: (tk.data || []).filter(item => realEquipmentIds.has(item.equipmentId)),
          maintenance: (mn.data || []).filter(item => realEquipmentIds.has(item.equipmentId)),
          predictions: (pr.data || []).filter(item => item.source === 'real'),
        });
        setModelReady(status.mlReady === true);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const healthy    = data.equipment.filter(e => e.status === 'healthy').length;
  const warning    = data.equipment.filter(e => e.status === 'warning').length;
  const critical   = data.equipment.filter(e => e.status === 'critical').length;
  const total      = data.equipment.length || 1;
  const fleetPct   = Math.round((healthy / total) * 100);
  const openTickets = data.tickets.filter(t => t.status === 'open').length;
  const openAlerts  = data.alerts.filter(a => !a.resolved).length;

  const trendData = (() => {
    const weeks = {};
    data.predictions.forEach(p => {
      const d = new Date(p.createdAt);
      const key = `W${Math.ceil(d.getDate() / 7)}`;
      if (!weeks[key]) weeks[key] = { week: key, scores: [] };
      weeks[key].scores.push(p.riskScore);
    });
    const result = Object.values(weeks).map(w => ({
      week: w.week,
      avgRisk: Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length),
    }));
    return result;
  })();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div className="loading-spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          Welcome back, <strong style={{ color: '#22d3ee' }}>{user?.name}</strong>
          {' · '}<span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{user?.role}</span>
        </p>
      </div>

      {!modelReady && <div className="card" style={{ borderColor: 'rgba(251,191,36,0.35)', color: '#fbbf24' }}>Prediction model not yet trained — showing no score.</div>}

      {error && (
        <div style={{ background: 'var(--critical-bg)', border: '1px solid var(--critical-border)', borderRadius: 12, padding: '12px 16px', color: 'var(--critical-text)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Fleet Health Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FleetStatCard
          label="Fleet Health"
          value={`${fleetPct}%`}
          color="#22d3ee"
          bgColor="rgba(34,211,238,0.12)"
          icon={Activity}
          link="/dashboard/equipment"
        />
        <FleetStatCard
          label="Critical Assets"
          value={critical}
          color="#f87171"
          bgColor="rgba(239,68,68,0.12)"
          icon={CircleAlert}
          link="/dashboard/equipment"
        />
        <FleetStatCard
          label="Active Alerts"
          value={openAlerts}
          color="#fbbf24"
          bgColor="rgba(245,158,11,0.12)"
          icon={AlertTriangle}
          link="/dashboard/alerts"
        />
        <FleetStatCard
          label="Open Tickets"
          value={openTickets}
          color="#a78bfa"
          bgColor="rgba(139,92,246,0.12)"
          icon={Ticket}
          link="/dashboard/tickets"
        />
      </div>

      {/* Equipment status sub-strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Healthy', count: healthy, color: 'var(--healthy-text)', bg: 'var(--healthy-bg)', icon: CheckCircle2 },
          { label: 'Warning', count: warning,  color: 'var(--warning-text)', bg: 'var(--warning-bg)', icon: AlertTriangle },
          { label: 'Critical', count: critical, color: 'var(--critical-text)', bg: 'var(--critical-bg)', icon: CircleAlert },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <Link key={label} to="/dashboard/equipment" style={{ textDecoration: 'none' }}>
            <div style={{ background: bg, border: `1px solid ${bg}`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon size={18} style={{ color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{count}</p>
                <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts + feeds */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Risk Trend Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>Risk Score Trend</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Weekly average across all equipment</p>
            </div>
            <Link to="/dashboard/risk" style={{ fontSize: 12, color: '#22d3ee', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Run prediction <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avgRisk" stroke="#22d3ee" strokeWidth={2.5} fill="url(#riskGrad)" dot={{ fill: '#22d3ee', r: 4, strokeWidth: 2, stroke: '#020b17' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>Recent Alerts</h2>
            <Link to="/dashboard/alerts" style={{ fontSize: 12, color: '#22d3ee', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {data.alerts.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 32, paddingBottom: 32 }}>
              <CheckCircle2 size={32} className="empty-state-icon" style={{ marginBottom: 8 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active alerts</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.alerts.slice(0, 4).map(alert => (
                <div key={alert.id} style={{
                  display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 12,
                  background: alert.level === 'critical' ? 'var(--critical-bg)' : 'var(--warning-bg)',
                  border: `1px solid ${alert.level === 'critical' ? 'var(--critical-border)' : 'var(--warning-border)'}`,
                }}>
                  <div className={GLOW_DOT_CLASS[alert.level] || 'glow-dot warning'} style={{ marginTop: 4 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.message}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{alert.equipmentName} · {alert.level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Tickets */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>Open Tickets</h2>
            <Link to="/dashboard/tickets" style={{ fontSize: 12, color: '#22d3ee', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {data.tickets.filter(t => t.status !== 'resolved').length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 32, paddingBottom: 32 }}>
              <Ticket size={32} className="empty-state-icon" style={{ marginBottom: 8 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No open tickets</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.tickets.filter(t => t.status !== 'resolved').slice(0, 4).map(ticket => (
                <div key={ticket.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 12 }} className="shell-panel">
                  <span className={ticket.priority === 'high' ? 'badge-critical' : ticket.priority === 'medium' ? 'badge-warning' : 'badge-info'} style={{ flexShrink: 0 }}>
                    {ticket.priority}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ticket.equipmentName} · {ticket.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance Log */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>Maintenance Log</h2>
            <Link to="/dashboard/maintenance" style={{ fontSize: 12, color: '#22d3ee', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {data.maintenance.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 32, paddingBottom: 32 }}>
              <Wrench size={32} className="empty-state-icon" style={{ marginBottom: 8 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No maintenance records</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.maintenance.slice(0, 4).map(m => (
                <div key={m.id} style={{ padding: '10px 12px', borderRadius: 12 }} className="shell-panel">
                  <p style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{m.issueSummary}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.equipmentName} · {m.maintenanceType}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
