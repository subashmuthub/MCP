import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const EMPTY_FORM = { equipmentId: '', equipmentName: '', issueSummary: '', maintenanceType: 'Preventive', technicianName: '', maintenanceDate: '', notes: '' };

const TYPE_BADGE = { Preventive: 'badge-healthy', Corrective: 'badge-warning', Predictive: 'badge-info', Emergency: 'badge-critical' };

export default function MaintenancePage() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isTech  = user?.role === 'technician';

  async function load() {
    try {
      const [rRes, eRes] = await Promise.all([apiRequest('/api/maintenance'), apiRequest('/api/equipment')]);
      setRecords(rRes.data || []);
      setEquipment(eRes.data || []);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(r) {
    setEditing(r);
    setForm({ equipmentId: r.equipmentId, equipmentName: r.equipmentName, issueSummary: r.issueSummary, maintenanceType: r.maintenanceType, technicianName: r.technicianName || '', maintenanceDate: r.maintenanceDate ? r.maintenanceDate.slice(0, 10) : '', notes: r.notes || '' });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.equipmentId || !form.issueSummary) { showToast('Equipment and issue summary required', 'error'); return; }
    setSaving(true);
    const eq = equipment.find(eq => eq.id === form.equipmentId);
    const payload = { ...form, equipmentName: eq?.name || form.equipmentName };
    try {
      if (editing) {
        await apiRequest(`/api/maintenance/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Record updated');
      } else {
        await apiRequest('/api/maintenance', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Record created');
      }
      setShowModal(false); load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(r) {
    if (!confirm('Delete this maintenance record?')) return;
    try {
      await apiRequest(`/api/maintenance/${r.id}`, { method: 'DELETE' });
      showToast('Record deleted'); load();
    } catch (err) { showToast(err.message, 'error'); }
  }

  const f = (name) => ({ value: form[name], onChange: (e) => setForm(p => ({ ...p, [name]: e.target.value })) });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Maintenance Log</h1>
          <p className="page-subtitle">{records.length} records</p>
        </div>
        {(isAdmin || isTech) && <button onClick={openCreate} className="btn-primary">+ Add Record</button>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loading-spinner w-8 h-8" /></div>
      ) : records.length === 0 ? (
        <div className="empty-state card">
          <Wrench size={40} className="empty-state-icon" style={{ marginBottom: 12 }} />
          <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>No maintenance records</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Log completed maintenance work here</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr>
              <th>Equipment</th><th>Issue</th><th>Type</th><th>Technician</th><th>Date</th><th>Notes</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{r.equipmentName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.issueSummary}</td>
                  <td><span className={TYPE_BADGE[r.maintenanceType] || 'badge-info'}>{r.maintenanceType}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.technicianName || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.maintenanceDate ? new Date(r.maintenanceDate).toLocaleDateString() : '—'}</td>
                  <td style={{ color: 'var(--text-soft)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(isAdmin || isTech) && <button onClick={() => openEdit(r)} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Edit</button>}
                      {isAdmin && <button onClick={() => handleDelete(r)} className="btn-danger" style={{ fontSize: 12, padding: '4px 10px' }}>Delete</button>}
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
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', marginBottom: 20 }}>{editing ? 'Edit Record' : 'Add Maintenance Record'}</h2>
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
              <div><label className="label">Issue Summary *</label><input className="input" placeholder="Routine calibration" {...f('issueSummary')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select className="select" {...f('maintenanceType')}>
                    <option>Preventive</option><option>Corrective</option><option>Predictive</option><option>Emergency</option>
                  </select>
                </div>
                <div><label className="label">Technician</label><input className="input" placeholder="Name" {...f('technicianName')} /></div>
                <div><label className="label">Date</label><input className="input" type="date" {...f('maintenanceDate')} /></div>
              </div>
              <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} placeholder="Additional notes…" {...f('notes')} /></div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
