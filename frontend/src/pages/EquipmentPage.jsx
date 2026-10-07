import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { FlaskConical } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';


const EMPTY_FORM = { name: '', category: '', serialNumber: '', lab: '', location: '', status: 'healthy', usageHours: '', age: '', temperature: '', vibration: '', failureCount: '', purchaseDate: '' };

const STATUS_BADGE = { healthy: 'badge-healthy', warning: 'badge-warning', critical: 'badge-critical' };
const RISK_BADGE = { 'Healthy': 'badge-healthy', 'Needs Attention': 'badge-warning', 'Critical': 'badge-critical' };

export default function EquipmentPage() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLab, setFilterLab] = useState('');

  const isAdmin = user?.role === 'admin';
  const isTech = user?.role === 'technician';

  function parseImportedValue(value) {
    if (value === null || value === undefined || value === '') return '';
    const text = String(value).trim();
    return text;
  }

  function normalizeImportedRow(row) {
    const name = parseImportedValue(row.name || row.Equipment || row.Equipments || row['Equipment Name'] || row['Equipment']);
    const category = parseImportedValue(row.category || row.Make || row.Manufacturer || row['Make'] || row.Category);
    if (!name || !category) return null;

    const rawPurchaseDate = row.purchaseDate || row['Date of Purchase'] || row['Purchase Date'] || row['Purchase date'];
    const purchaseDate = normalizeImportedDate(rawPurchaseDate);
    const usageHours = Number(row.usageHours ?? row['Usage Hours'] ?? row['Qty'] ?? row['Quantity'] ?? row.usage ?? 0) || 0;
    const age = Number(row.age ?? row['Age'] ?? row['Age (years)'] ?? 0) || 0;
    const temperature = row.temperature ?? row.Temperature ?? row['Temperature (°C)'];
    const vibration = row.vibration ?? row.Vibration ?? row['Vibration (mm/s)'];
    const failureCount = row.failureCount ?? row['Failure Count'] ?? row.Failures;
    const lab = parseImportedValue(row.lab || row.Lab || row['Lab Name'] || row.Laboratory || row.location || row.Location) || 'Imported';
    const location = parseImportedValue(row.location || row.Location || row.Room || row['Room No.']);

    return {
      name,
      category,
      serialNumber: parseImportedValue(row.serialNumber || row['Serial No.'] || row['Serial Number'] || row['S.No']) || undefined,
      lab,
      location,
      status: ['healthy', 'warning', 'critical'].includes(String(row.status || row.Status || 'healthy').toLowerCase()) ? String(row.status || row.Status || 'healthy').toLowerCase() : 'healthy',
      usageHours,
      age,
      temperature: temperature === undefined || temperature === '' ? undefined : Number(temperature),
      vibration: vibration === undefined || vibration === '' ? undefined : Number(vibration),
      failureCount: failureCount === undefined || failureCount === '' ? undefined : Number(failureCount),
      purchaseDate: purchaseDate || undefined,
    };
  }

  function normalizeImportedDate(value) {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number' && Number.isFinite(value)) {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed) return '';
      const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
      return Number.isNaN(date.getTime()) ? '' : date.toISOString();
    }
    const date = new Date(String(value).trim());
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const normalizedRows = rows
        .map(normalizeImportedRow)
        .filter(Boolean);

      if (!normalizedRows.length) {
        throw new Error('No valid equipment rows were found in the Excel file.');
      }

      const response = await apiRequest('/api/equipment/import', {
        method: 'POST',
        body: JSON.stringify({ rows: normalizedRows }),
      });

      const predictionCount = response.predictions?.length || normalizedRows.length;
      showToast(`${response.count || normalizedRows.length} equipment imported; ${predictionCount} predictions generated`);
      event.target.value = '';
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function handleExport() {
    if (!equipment.length) {
      showToast('There is no equipment to export yet', 'error');
      return;
    }

    const exportRows = equipment.map(eq => ({
      'Equipment Name': eq.name,
      Category: eq.category,
      Lab: eq.lab || '',
      'Serial No.': eq.serialNumber || '',
      Location: eq.location || '',
      Status: eq.status,
      'Usage Hours': eq.usageHours ?? '',
      'Age (years)': eq.age ?? '',
      'Purchase Date': eq.purchaseDate && !Number.isNaN(new Date(eq.purchaseDate).getTime()) ? new Date(eq.purchaseDate).toISOString().slice(0, 10) : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipment');
    XLSX.writeFile(workbook, 'equipment.xlsx');
  }

  async function load() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (filterLab) params.set('lab', filterLab);
      const res = await apiRequest(`/api/equipment?${params}`);
      setEquipment(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search, filterStatus, filterLab]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(eq) { setEditing(eq); setForm({ name: eq.name, category: eq.category, serialNumber: eq.serialNumber || '', lab: eq.lab || '', location: eq.location || '', status: eq.status, usageHours: eq.usageHours || '', age: eq.age || '', temperature: eq.temperature ?? '', vibration: eq.vibration ?? '', failureCount: eq.failureCount ?? '', purchaseDate: eq.purchaseDate && !Number.isNaN(new Date(eq.purchaseDate).getTime()) ? eq.purchaseDate.slice(0, 10) : '' }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.category) { showToast('Name and category are required', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/equipment/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        showToast('Equipment updated');
      } else {
        await apiRequest('/api/equipment', { method: 'POST', body: JSON.stringify(form) });
        showToast('Equipment added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eq) {
    if (!confirm(`Delete "${eq.name}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/equipment/${eq.id}`, { method: 'DELETE' });
      showToast('Equipment deleted');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const f = (name) => ({ value: form[name], onChange: (e) => setForm(p => ({ ...p, [name]: e.target.value })) });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Equipment</h1>
          <p className="page-subtitle">{equipment.length} items registered</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport} className="btn-secondary">Export Excel</button>
          {isAdmin && (
            <>
              <label className="btn-primary cursor-pointer">
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
                Import Excel
              </label>
              <button onClick={openCreate} className="btn-primary">+ Add Equipment</button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input className="input max-w-xs" placeholder="Search name, category…" value={search} onChange={e => setSearch(e.target.value)} />
        <input className="input w-40" placeholder="Filter by lab" value={filterLab} onChange={e => setFilterLab(e.target.value)} />
        <select className="select w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner w-8 h-8" /></div>
      ) : equipment.length === 0 ? (
        <div className="empty-state card">
          <FlaskConical size={40} className="empty-state-icon" style={{ marginBottom: 12 }} />
          <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>No equipment found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Try adjusting your search or add new equipment</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Category</th><th>Lab</th><th>Location</th><th>Status</th>
                <th>Risk</th><th className="text-right">Usage (hrs)</th><th className="text-right">Age (yr)</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(eq => (
                <tr key={eq.id}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{eq.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{eq.category}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{eq.lab || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{eq.location || '—'}</td>
                  <td><span className={STATUS_BADGE[eq.status]}>{eq.status}</span></td>
                  <td><span className={RISK_BADGE[eq.riskCategory] || 'badge-info'}>{eq.riskCategory || 'Unknown'}</span></td>
                  <td className="text-right" style={{ color: '#22d3ee', fontWeight: 700 }}>{eq.usageHours ?? '—'}</td>
                  <td className="text-right" style={{ color: 'var(--text-muted)' }}>{eq.age ?? '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      {(isAdmin || isTech) && (
                        <button onClick={() => openEdit(eq)} className="btn-secondary px-3 py-1 text-xs">Edit</button>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDelete(eq)} className="btn-danger px-3 py-1 text-xs">Delete</button>
                      )}
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
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', marginBottom: 20 }}>{editing ? 'Edit Equipment' : 'Add Equipment'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Name *</label><input className="input" placeholder="Microscope A1" {...f('name')} /></div>
                <div><label className="label">Category *</label><input className="input" placeholder="Optics" {...f('category')} /></div>
                <div><label className="label">Serial No.</label><input className="input" placeholder="EQ-1001" {...f('serialNumber')} /></div>
                <div><label className="label">Lab *</label><input className="input" placeholder="Chemistry Lab" {...f('lab')} /></div>
                <div><label className="label">Location / Room</label><input className="input" placeholder="Room 1" {...f('location')} /></div>
                <div>
                  <label className="label">Status</label>
                  <select className="select" {...f('status')}>
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div><label className="label">Usage Hours</label><input className="input" type="number" min="0" placeholder="0" {...f('usageHours')} /></div>
                <div><label className="label">Age (years)</label><input className="input" type="number" min="0" placeholder="0" {...f('age')} /></div>
                <div><label className="label">Temperature (°C)</label><input className="input" type="number" min="0" step="0.1" placeholder="Measured value" {...f('temperature')} /></div>
                <div><label className="label">Vibration (mm/s)</label><input className="input" type="number" min="0" step="0.1" placeholder="Measured value" {...f('vibration')} /></div>
                <div><label className="label">Failure Count</label><input className="input" type="number" min="0" step="1" placeholder="Confirmed count" {...f('failureCount')} /></div>
                <div><label className="label">Purchase Date</label><input className="input" type="date" {...f('purchaseDate')} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
