import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CheckCircle2, ExternalLink } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const EMPTY_FORM = { equipmentId: '', equipmentName: '', title: '', description: '', priority: 'medium', technicianId: '', cost: '' };
const PRIORITY_BADGE = { high: 'badge-critical', medium: 'badge-warning', low: 'badge-info' };
const STATUS_COLOR = { open: '#f87171', in_progress: '#fbbf24', resolved: '#34d399' };

export default function TicketsPage() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const isAdmin = user?.role === 'admin';
  const isTech  = user?.role === 'technician';

  async function load() {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const [tRes, eRes] = await Promise.all([
        apiRequest(`/api/tickets?${params}`),
        apiRequest('/api/equipment'),
      ]);
      setTickets(tRes.data || []);
      setEquipment(eRes.data || []);
      if (isAdmin) {
        const uRes = await apiRequest('/api/users');
        setTechnicians((uRes.data || []).filter(u => u.role === 'technician'));
      }
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterStatus]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(t) {
    setEditing(t);
    setForm({ equipmentId: t.equipmentId, equipmentName: t.equipmentName, title: t.title, description: t.description || '', priority: t.priority, technicianId: t.technicianId || '', cost: t.cost || '' });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.equipmentId || !form.title) { showToast('Equipment and title required', 'error'); return; }
    setSaving(true);
    const eq = equipment.find(eq => eq.id === form.equipmentId);
    const payload = { ...form, equipmentName: eq?.name || form.equipmentName, cost: Number(form.cost || 0) };
    try {
      if (editing) {
        await apiRequest(`/api/tickets/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Ticket updated');
      } else {
        await apiRequest('/api/tickets', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Ticket created');
      }
      setShowModal(false); load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleStatusChange(ticket, status) {
    try {
      await apiRequest(`/api/tickets/${ticket.id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      showToast('Status updated'); load();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function handleDelete(ticket) {
    if (!confirm('Delete this ticket?')) return;
    try {
      await apiRequest(`/api/tickets/${ticket.id}`, { method: 'DELETE' });
      showToast('Ticket deleted'); load();
    } catch (err) { showToast(err.message, 'error'); }
  }

  const f = (name) => ({ value: form[name], onChange: (e) => setForm(p => ({ ...p, [name]: e.target.value })) });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Maintenance Tickets</h1>
          <p className="page-subtitle">{tickets.length} tickets{isTech ? ' assigned to you' : ''}</p>
        </div>
        {isAdmin && <button onClick={openCreate} className="btn-primary">+ New Ticket</button>}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['', 'open', 'in_progress', 'resolved'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{
              padding: '6px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: filterStatus === s ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.04)',
              color: filterStatus === s ? '#22d3ee' : 'var(--text-muted)',
              border: filterStatus === s ? '1px solid rgba(34,211,238,0.30)' : '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            }}>{s || 'All'}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loading-spinner w-8 h-8" /></div>
      ) : tickets.length === 0 ? (
        <div className="empty-state card">
          <Ticket size={40} className="empty-state-icon" style={{ marginBottom: 12 }} />
          <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>No tickets found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All maintenance work is up to date</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={PRIORITY_BADGE[ticket.priority]}>{ticket.priority}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[ticket.status] || '#94a3b8' }}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>{ticket.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{ticket.equipmentName}</p>
              {ticket.description && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ticket.description}
                </p>
              )}
              {ticket.technicianName && (
                <p style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 8 }}>Assigned: <strong style={{ color: 'var(--text-muted)' }}>{ticket.technicianName}</strong></p>
              )}
              {ticket.cost > 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 4 }}>Cost: <strong style={{ color: 'var(--text-muted)' }}>₹{ticket.cost}</strong></p>
              )}

              {/* Source alert badge */}
              {ticket.sourceAlertId && (
                <div style={{ marginTop: 8 }}>
                  <Link to="/dashboard/alerts" style={{ fontSize: 11, color: '#fbbf24', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ExternalLink size={11} /> Generated from Alert
                  </Link>
                </div>
              )}

              {(isAdmin || isTech) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
                  {ticket.status === 'open' && (
                    <button onClick={() => handleStatusChange(ticket, 'in_progress')} className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>Start</button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <button onClick={() => handleStatusChange(ticket, 'resolved')} className="btn-success" style={{ fontSize: 12, padding: '5px 12px' }}>
                      <CheckCircle2 size={13} /> Resolve
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(ticket)} className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>Edit</button>
                      <button onClick={() => handleDelete(ticket)} className="btn-danger" style={{ fontSize: 12, padding: '5px 12px' }}>Delete</button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', marginBottom: 20 }}>{editing ? 'Edit Ticket' : 'Create Ticket'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="label">Equipment *</label>
                <select className="select" value={form.equipmentId} onChange={e => {
                  const eq = equipment.find(eq => eq.id === e.target.value);
                  setForm(p => ({ ...p, equipmentId: e.target.value, equipmentName: eq?.name || '' }));
                }}>
                  <option value="">Select equipment…</option>
                  {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>
              <div><label className="label">Title *</label><input className="input" placeholder="Inspect bearings" {...f('title')} /></div>
              <div><label className="label">Description</label><textarea className="input resize-none" rows={2} placeholder="Details…" {...f('description')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Priority</label>
                  <select className="select" {...f('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div><label className="label">Cost (₹)</label><input className="input" type="number" min="0" placeholder="0" {...f('cost')} /></div>
              </div>
              {isAdmin && technicians.length > 0 && (
                <div>
                  <label className="label">Assign Technician</label>
                  <select className="select" {...f('technicianId')}>
                    <option value="">Unassigned</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
