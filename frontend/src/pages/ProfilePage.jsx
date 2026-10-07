import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const ROLE_DETAILS = {
  admin: { label: 'Administrator', description: 'Full workspace access and user management', color: '#c4b5fd', background: 'rgba(139,92,246,0.12)' },
  technician: { label: 'Technician', description: 'Equipment, maintenance, and prediction access', color: '#67e8f9', background: 'rgba(34,211,238,0.10)' },
  viewer: { label: 'Viewer', description: 'Read-only visibility across operational records', color: '#94a3b8', background: 'rgba(148,163,184,0.08)' },
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', contactInfo: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [preferences, setPreferences] = useState(() => ({
    alerts: localStorage.getItem('profile-alerts') !== 'off',
    compact: localStorage.getItem('profile-compact') === 'on',
  }));

  useEffect(() => {
    setForm({ name: user?.name || '', department: user?.department || '', contactInfo: user?.contactInfo || '' });
  }, [user]);

  const role = ROLE_DETAILS[user?.role] || ROLE_DETAILS.viewer;
  const initial = user?.name?.[0]?.toUpperCase() || '?';
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recently';

  function updateField(name, value) {
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function togglePreference(name) {
    const value = !preferences[name];
    setPreferences(previous => ({ ...previous, [name]: value }));
    localStorage.setItem(name === 'alerts' ? 'profile-alerts' : 'profile-compact', value ? 'on' : 'off');
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      showToast('Profile details updated');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const field = name => ({ value: form[name], onChange: event => updateField(name, event.target.value) });

  return (
    <div className="profile-page space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div>
        <h1 className="page-title">Profile & Settings</h1>
        <p className="page-subtitle">Manage your account, security, and workspace preferences</p>
      </div>

      <section className="profile-hero">
        <div className="profile-hero-glow" />
        <div className="profile-avatar-large">{initial}</div>
        <div className="profile-hero-copy">
          <p className="profile-eyebrow">EquipSense workspace</p>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div className="profile-meta"><span style={{ color: role.color, background: role.background }}>{role.label}</span><span>Member since {joined}</span></div>
        </div>
        <div className="profile-hero-status"><span className="profile-status-dot" /> Account active</div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form className="card profile-panel" onSubmit={saveProfile}>
          <div className="profile-panel-heading"><div><h2>Personal details</h2><p>Keep your contact information current.</p></div><span className="profile-panel-icon">✦</span></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Full name</label><input className="input" {...field('name')} /></div>
            <div><label className="label">Email address</label><input className="input" value={user?.email || ''} disabled /></div>
            <div><label className="label">Department</label><input className="input" placeholder="Operations or Laboratory" {...field('department')} /></div>
            <div><label className="label">Contact information</label><input className="input" placeholder="Phone or extension" {...field('contactInfo')} /></div>
          </div>
          <div className="flex justify-end pt-5"><button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></div>
        </form>

        <section className="card profile-panel">
          <div className="profile-panel-heading"><div><h2>Workspace access</h2><p>Your current permissions.</p></div><span className="profile-panel-icon">◈</span></div>
          <div className="profile-access-card" style={{ background: role.background }}><strong style={{ color: role.color }}>{role.label}</strong><p>{role.description}</p></div>
          <div className="profile-detail-row"><span>Account status</span><strong className="profile-active-text">Active</strong></div>
          <div className="profile-detail-row"><span>Login email</span><strong>{user?.email}</strong></div>
        </section>

        <form className="card profile-panel" onSubmit={changePassword}>
          <div className="profile-panel-heading"><div><h2>Security</h2><p>Update your password regularly.</p></div><span className="profile-panel-icon">⌁</span></div>
          <div className="space-y-4">
            <div><label className="label">Current password</label><input className="input" type="password" required value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="label">New password</label><input className="input" type="password" minLength={6} required value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} /></div><div><label className="label">Confirm password</label><input className="input" type="password" minLength={6} required value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} /></div></div>
          </div>
          <div className="flex justify-end pt-5"><button className="btn-secondary" disabled={saving}>Change password</button></div>
        </form>

        <section className="card profile-panel">
          <div className="profile-panel-heading"><div><h2>Preferences</h2><p>Personalize your dashboard.</p></div><span className="profile-panel-icon">☼</span></div>
          <button className="preference-row" type="button" onClick={() => togglePreference('alerts')}><span><strong>Alert updates</strong><small>Show operational alert notifications</small></span><span className={`preference-switch ${preferences.alerts ? 'is-on' : ''}`}><span /></span></button>
          <button className="preference-row" type="button" onClick={() => togglePreference('compact')}><span><strong>Compact view</strong><small>Use tighter spacing in data tables</small></span><span className={`preference-switch ${preferences.compact ? 'is-on' : ''}`}><span /></span></button>
        </section>
      </div>
    </div>
  );
}