import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const EMPTY_FORM = { equipmentId: '', hoursLogged: '', temperature: '', vibration: '', failureCount: '', riskCategory: '', notes: '', timestamp: '' };

export default function UsageLogsPage() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterEq, setFilterEq] = useState('');

  const canWrite = ['admin', 'technician'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  async function load() {
    try {
      const params = new URLSearchParams();
      if (filterEq) params.set('equipmentId', filterEq);
      const [lRes, eRes] = await Promise.all([
        apiRequest(`/api/usage-logs?${params}`),
        apiRequest('/api/equipment'),
      ]);
      setLogs(lRes.data || []);
      setEquipment(eRes.data || []);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterEq]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(log) {
    setEditing(log);
    setForm({ equipmentId: log.equipmentId, hoursLogged: log.hoursLogged, temperature: log.temperature ?? '', vibration: log.vibration ?? '', failureCount: log.failureCount ?? '', riskCategory: log.riskCategory || '', notes: log.notes || '', timestamp: log.timestamp ? log.timestamp.slice(0, 10) : '' });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.equipmentId || !form.hoursLogged) { showToast('Equipment and hours required', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/usage-logs/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        showToast('Log updated');
      } else {
        await apiRequest('/api/usage-logs', { method: 'POST', body: JSON.stringify(form) });
        showToast('Usage logged');
      }
      setShowModal(false); load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(log) {
    if (!confirm('Delete this log entry?')) return;
    try {
      await apiRequest(`/api/usage-logs/${log.id}`, { method: 'DELETE' });
      showToast('Log deleted'); load();
    } catch (err) { showToast(err.message, 'error'); }
  }

  const f = (name) => ({ value: form[name], onChange: (e) => setForm(p => ({ ...p, [name]: e.target.value })) });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Usage Logs</h1>
          <p className="page-subtitle">Track equipment usage hours</p>
        </div>
        {canWrite && <button onClick={openCreate} className="btn-primary">+ Log Usage</button>}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <select className="select" style={{ maxWidth: 240 }} value={filterEq} onChange={e => setFilterEq(e.target.value)}>
          <option value="">All equipment</option>
          {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loading-spinner w-8 h-8" /></div>
      ) : logs.length === 0 ? (
        <div className="empty-state card">
          <ClipboardList size={40} className="empty-state-icon" style={{ marginBottom: 12 }} />
          <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>No usage logs yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Start tracking equipment usage hours</p>
          {canWrite && <button onClick={openCreate} className="btn-primary" style={{ marginTop: 16, fontSize: 13 }}>Log first usage</button>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr>
              <th>Equipment</th>
              <th className="text-right">Hours</th><th>Temp</th><th>Vibration</th><th>Failures</th>
              <th>Logged By</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{log.equipmentName}</td>
                  <td className="text-right" style={{ fontWeight: 800, color: '#22d3ee' }}>{log.hoursLogged}h</td>
                  <td>{log.temperature} °C</td><td>{log.vibration} mm/s</td><td>{log.failureCount}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.loggedByName || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : '—'}</td>
                  <td style={{ color: 'var(--text-soft)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canWrite && <button onClick={() => openEdit(log)} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Edit</button>}
                      {isAdmin && <button onClick={() => handleDelete(log)} className="btn-danger" style={{ fontSize: 12, padding: '4px 10px' }}>Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', marginBottom: 20 }}>{editing ? 'Edit Log' : 'Log Usage'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="label">Equipment *</label>
                <select className="select" value={form.equipmentId} onChange={e => setForm(p => ({ ...p, equipmentId: e.target.value }))}>
                  <option value="">Select equipment…</option>
                  {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>
              <div><label className="label">Hours Logged *</label><input className="input" type="number" min="0" step="0.5" placeholder="8" {...f('hoursLogged')} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Temperature (°C) *</label><input className="input" type="number" min="0" step="0.1" {...f('temperature')} /></div>
                <div><label className="label">Vibration (mm/s) *</label><input className="input" type="number" min="0" step="0.1" {...f('vibration')} /></div>
                <div><label className="label">Failure Count *</label><input className="input" type="number" min="0" step="1" {...f('failureCount')} /></div>
              </div>
              <div><label className="label">Confirmed Risk Label (for training)</label><select className="select" {...f('riskCategory')}><option value="">Not labeled</option><option>Healthy</option><option>Needs Attention</option><option>Critical</option></select></div>
              <div><label className="label">Date</label><input className="input" type="date" {...f('timestamp')} /></div>
              <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} placeholder="Session notes…" {...f('notes')} /></div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Log'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
