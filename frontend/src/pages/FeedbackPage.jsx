import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const EMPTY_FORM = { equipmentId: '', rating: '5', comment: '' };

function Stars({ rating, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ fontSize: 16, color: i < rating ? '#fbbf24' : 'rgba(255,255,255,0.12)' }}>★</span>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [feedback, setFeedback] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterEq, setFilterEq] = useState('');

  const isAdmin = user?.role === 'admin';

  async function load() {
    try {
      const params = new URLSearchParams();
      if (filterEq) params.set('equipmentId', filterEq);
      const [fRes, eRes] = await Promise.all([
        apiRequest(`/api/feedback?${params}`),
        apiRequest('/api/equipment'),
      ]);
      setFeedback(fRes.data || []);
      setEquipment(eRes.data || []);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterEq]);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.equipmentId) { showToast('Select an equipment', 'error'); return; }
    setSaving(true);
    try {
      await apiRequest('/api/feedback', { method: 'POST', body: JSON.stringify({ ...form, rating: Number(form.rating) }) });
      showToast('Feedback submitted'); setShowModal(false); setForm(EMPTY_FORM); load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(fb) {
    if (!confirm('Delete this feedback?')) return;
    try {
      await apiRequest(`/api/feedback/${fb.id}`, { method: 'DELETE' });
      showToast('Feedback deleted'); load();
    } catch (err) { showToast(err.message, 'error'); }
  }

  const avgRating = feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Feedback</h1>
          <p className="page-subtitle">{feedback.length} reviews · Avg rating: <strong style={{ color: '#fbbf24' }}>{avgRating}</strong> / 5</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Submit Feedback</button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <select className="select" style={{ maxWidth: 240 }} value={filterEq} onChange={e => setFilterEq(e.target.value)}>
          <option value="">All equipment</option>
          {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loading-spinner w-8 h-8" /></div>
      ) : feedback.length === 0 ? (
        <div className="empty-state card">
          <MessageCircle size={40} className="empty-state-icon" style={{ marginBottom: 12 }} />
          <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>No feedback yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Share your experience with equipment</p>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ marginTop: 16, fontSize: 13 }}>Be the first to submit</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedback.map(fb => (
            <div key={fb.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>{fb.equipmentName}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{fb.userName}</p>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(fb)} className="btn-danger" style={{ fontSize: 11, padding: '3px 8px' }}>Delete</button>
                )}
              </div>
              <Stars rating={fb.rating} />
              {fb.comment && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 10 }}>{fb.comment}</p>}
              <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 12 }}>{new Date(fb.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', marginBottom: 20 }}>Submit Feedback</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="label">Equipment *</label>
                <select className="select" value={form.equipmentId} onChange={e => setForm(p => ({ ...p, equipmentId: e.target.value }))}>
                  <option value="">Select equipment…</option>
                  {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Rating</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button"
                      style={{ fontSize: 24, color: Number(form.rating) >= n ? '#fbbf24' : 'rgba(255,255,255,0.15)', transition: 'transform 0.1s, color 0.15s', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      onClick={() => setForm(p => ({ ...p, rating: String(n) }))}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Comment</label>
                <textarea className="input resize-none" rows={3} placeholder="Share your experience…"
                  value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Submitting…' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
