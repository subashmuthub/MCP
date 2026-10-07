import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { FolderArchive } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const SOURCES = [
  { label: 'Equipment',   endpoint: '/api/equipment',  date: r => r.createdAt || r.purchaseDate, detail: r => `${r.category} · ${r.location || 'No location'}` },
  { label: 'Predictions', endpoint: '/api/predictions', date: r => r.createdAt, detail: r => `${r.riskScore}% risk · ${r.status}` },
  { label: 'Alerts',      endpoint: '/api/alerts',      date: r => r.createdAt, detail: r => `${r.level} · ${r.resolved ? 'Resolved' : 'Open'}` },
  { label: 'Maintenance', endpoint: '/api/maintenance', date: r => r.maintenanceDate || r.createdAt, detail: r => `${r.maintenanceType} · ${r.issueSummary}` },
  { label: 'Usage logs',  endpoint: '/api/usage-logs',  date: r => r.timestamp || r.createdAt, detail: r => `${r.hoursLogged || 0} hours logged` },
];

const BADGE_MAP = {
  'Equipment': 'badge-info', 'Predictions': 'badge-purple',
  'Alerts': 'badge-critical', 'Maintenance': 'badge-warning', 'Usage logs': 'badge-healthy',
};

function formatDate(v) { return v ? new Date(v).toLocaleDateString() : 'No date'; }

export default function RecordsPage() {
  const { toast, showToast, hideToast } = useToast();
  const [records, setRecords] = useState([]);
  const [source, setSource] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const responses = await Promise.all(SOURCES.map(item => apiRequest(item.endpoint)));
        setRecords(responses.flatMap((response, index) => (response.data || []).map(row => ({
          ...row,
          recordType: SOURCES[index].label,
          recordDate: SOURCES[index].date(row),
          recordDetail: SOURCES[index].detail(row),
        }))));
      } catch (err) { showToast(err.message, 'error'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = useMemo(() => records
    .filter(r => source === 'all' || r.recordType === source)
    .filter(r => !from || (r.recordDate && new Date(r.recordDate) >= new Date(`${from}T00:00:00`)))
    .filter(r => !to   || (r.recordDate && new Date(r.recordDate) <= new Date(`${to}T23:59:59`)))
    .sort((a, b) => new Date(b.recordDate || 0) - new Date(a.recordDate || 0)),
  [records, source, from, to]);

  function exportRecords() {
    if (!filtered.length) { showToast('No records to export', 'error'); return; }
    const rows = filtered.map(r => ({
      'Record Type': r.recordType, Name: r.equipmentName || r.name || 'System record',
      Details: r.recordDetail, Date: r.recordDate ? new Date(r.recordDate).toISOString().slice(0,10) : '',
      'Record ID': r.id || r._id || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    XLSX.writeFile(wb, 'equipsense-records.xlsx');
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Records</h1>
          <p className="page-subtitle">Audit trail — all predictions, alerts, maintenance, and usage events in one view</p>
        </div>
        <button className="btn-secondary" onClick={exportRecords}>Export Excel</button>
      </div>

      <div className="card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Record type</label>
            <select className="select" value={source} onChange={e => setSource(e.target.value)}>
              <option value="all">All records</option>
              {SOURCES.map(item => <option key={item.label}>{item.label}</option>)}
            </select>
          </div>
          <div><label className="label">From date</label><input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label className="label">To date</label><input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-secondary w-full justify-center" onClick={() => { setSource('all'); setFrom(''); setTo(''); }}>Clear filters</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="loading-spinner w-8 h-8" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr>
              <th>Type</th><th>Name</th><th>Details</th><th>Date</th><th>Record ID</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state" style={{ paddingTop: 48, paddingBottom: 48 }}>
                    <FolderArchive size={32} className="empty-state-icon" style={{ marginBottom: 8 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No records match these filters</p>
                  </div>
                </td></tr>
              ) : filtered.map((row, index) => (
                <tr key={`${row.recordType}-${row.id || row._id || index}`}>
                  <td><span className={BADGE_MAP[row.recordType] || 'badge-info'}>{row.recordType}</span></td>
                  <td style={{ fontWeight: 700, color: '#e2e8f0' }}>{row.equipmentName || row.name || 'System record'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{row.recordDetail}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(row.recordDate)}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-soft)', fontFamily: 'monospace' }}>{(row.id || row._id || '—').toString().slice(-8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
