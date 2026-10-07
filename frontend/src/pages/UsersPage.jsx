import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.js';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const ROLE_BADGE = {
  admin: 'badge-purple',
  technician: 'badge-info',
  viewer: 'badge-info',
};

export default function UsersPage() {
  const { toast, showToast, hideToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  async function load() {
    try {
      const res = await apiRequest('/api/users');
      setUsers(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRoleChange(user, role) {
    setSaving(user.id);
    try {
      await apiRequest(`/api/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ role }) });
      showToast(`${user.name}'s role updated to ${role}`);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleActive(user) {
    setSaving(user.id);
    try {
      await apiRequest(`/api/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !user.isActive }) });
      showToast(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Permanently delete ${user.name}?`)) return;
    try {
      await apiRequest(`/api/users/${user.id}`, { method: 'DELETE' });
      showToast('User deleted');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const grouped = { admin: [], technician: [], viewer: [] };
  users.forEach(u => (grouped[u.role] || []).push(u));

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">
          {users.length} users · {grouped.admin.length} admins · {grouped.technician.length} technicians · {grouped.viewer.length} viewers
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner w-8 h-8" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.5 }}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={ROLE_BADGE[u.role] || 'badge-info'}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.department || '—'}</td>
                  <td>
                    <span className={u.isActive ? 'badge-healthy' : 'badge-critical'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-soft)', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2 flex-wrap">
                      <select
                        className="select py-1 text-xs w-28"
                        value={u.role}
                        disabled={saving === u.id}
                        onChange={e => handleRoleChange(u, e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="technician">Technician</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={u.isActive ? 'btn-danger text-xs px-3 py-1' : 'btn-success text-xs px-3 py-1'}
                        disabled={saving === u.id}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(u)} className="btn-danger text-xs px-3 py-1" disabled={saving === u.id}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
