import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BrainCircuit, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const CATEGORY_BADGE = { 'Healthy': 'badge-healthy', 'Needs Attention': 'badge-warning', 'Critical': 'badge-critical' };
const RISK_COLOR = (s) => s >= 70 ? '#f87171' : s >= 40 ? '#fbbf24' : '#34d399';

const EMPTY_FORM = { usageHours: '', failureCount: '', temperature: '', vibration: '', age: '' };

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#0d1e30', border: '1px solid rgba(34,211,238,0.18)', borderRadius: 10, padding: '10px 14px', minWidth: 160 }}>
      <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{d.fullName}</p>
      <p style={{ color: RISK_COLOR(d.risk), fontWeight: 900, fontSize: 18 }}>{d.risk}%</p>
      <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{d.date}</p>
      {d.source === 'seed' && <p style={{ color: '#fbbf24', fontSize: 10 }}>Demo data</p>}
    </div>
  );
}

export default function RiskPage() {
  const { toast, showToast, hideToast } = useToast();
  const [equipment, setEquipment] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedEq, setSelectedEq] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [hasRealLog, setHasRealLog] = useState(false);

  async function load() {
    try {
      const [eRes, pRes, sRes, lRes] = await Promise.all([
        apiRequest('/api/equipment'),
        apiRequest('/api/predictions'),
        apiRequest('/api/predictions/status'),
        apiRequest('/api/usage-logs'),
      ]);
      const completeLogEquipmentIds = new Set((lRes.data || [])
        .filter(log => [log.temperature, log.vibration, log.failureCount].every(value => value !== undefined && value !== null && value !== ''))
        .map(log => String(log.equipmentId)));
      setEquipment((eRes.data || []).filter(eq => completeLogEquipmentIds.has(String(eq.id))));
      setPredictions(pRes.data || []);
      setModelReady(sRes.mlReady === true);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!selectedEq) return;
    const eq = equipment.find(e => e.id === selectedEq);
    if (eq) {
      setForm(f => ({ ...f, usageHours: eq.usageHours || '', age: eq.age || '', failureCount: '', temperature: '', vibration: '' }));
      apiRequest(`/api/usage-logs?equipmentId=${selectedEq}`).then(response => {
        const latest = response.data?.[0];
        setHasRealLog(Boolean(latest && latest.temperature !== undefined && latest.vibration !== undefined && latest.failureCount !== undefined));
        if (latest) setForm(f => ({ ...f, temperature: latest.temperature, vibration: latest.vibration, failureCount: latest.failureCount }));
      }).catch(() => setHasRealLog(false));
    }
  }, [selectedEq]);

  async function handlePredict(e) {
    e.preventDefault();
    if (!selectedEq) { showToast('Select an equipment first', 'error'); return; }
    const requiredFields = ['usageHours', 'failureCount', 'temperature', 'vibration', 'age'];
    if (requiredFields.some(name => form[name] === '' || !Number.isFinite(Number(form[name])))) {
      showToast('Enter real usage, failure, temperature, vibration, and age data before predicting', 'error');
      return;
    }
    setPredicting(true); setResult(null);
    setPredictionError('');
    try {
      const res = await apiRequest(`/api/predictions/${selectedEq}/predict`, {
        method: 'POST',
        body: JSON.stringify({
          usageHours: Number(form.usageHours),
          failureCount: Number(form.failureCount),
          temperature: Number(form.temperature),
          vibration: Number(form.vibration),
          age: Number(form.age),
        }),
      });
      setResult(res); showToast('Prediction complete'); load();
    } catch (err) { setPredictionError(err.message); showToast(err.message, 'error'); }
    finally { setPredicting(false); }
  }

  const filteredPredictions = selectedEq ? predictions.filter(p => p.equipmentId === selectedEq) : predictions;

  const chartData = filteredPredictions.slice(0, 10).reverse().map(p => ({
    name: (() => {
      const eq = p.equipmentName || '';
      const short = eq.length > 10 ? eq.slice(0, 10) + '…' : eq;
      const dt = new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      return `${short} ${dt}`;
    })(),
    fullName: p.equipmentName,
    date: new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
    risk: p.riskScore,
    source: p.source,
  }));

  const f = (name) => ({ value: form[name], onChange: (e) => setForm(p => ({ ...p, [name]: e.target.value })) });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div>
        <h1 className="page-title">Risk Prediction</h1>
        <p className="page-subtitle">Only equipment with complete real usage logs is available for prediction</p>
      </div>
      {!modelReady && <div className="card" style={{ borderColor: 'rgba(251,191,36,0.35)', color: '#fbbf24' }}>Prediction model not yet trained — showing no score.</div>}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 16, fontSize: 15 }}>Run Prediction</h2>
          <form onSubmit={handlePredict} className="space-y-3">
            <div>
              <label className="label">Equipment</label>
              <select className="select" value={selectedEq} onChange={e => setSelectedEq(e.target.value)}>
                <option value="">Select equipment with usage data…</option>
                {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Usage Hours</label><input className="input" type="number" min="0" placeholder="0" {...f('usageHours')} /></div>
              <div><label className="label">Failure Count</label><input className="input" type="number" min="0" placeholder="0" {...f('failureCount')} /></div>
              <div><label className="label">Temperature (°C)</label><input className="input" type="number" placeholder="25" {...f('temperature')} /></div>
              <div><label className="label">Vibration (mm/s)</label><input className="input" type="number" min="0" step="0.1" placeholder="0" {...f('vibration')} /></div>
              <div><label className="label">Age (years)</label><input className="input" type="number" min="0" placeholder="0" {...f('age')} /></div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={predicting || !modelReady || !hasRealLog}>
              <BrainCircuit size={16} /> {predicting ? 'Analyzing…' : 'Run Prediction'}
            </button>
            {!hasRealLog && selectedEq && <p style={{ color: '#fbbf24', fontSize: 12, marginTop: 8 }}>Log a complete real usage record for this equipment first. Manual form values alone cannot produce a prediction.</p>}
            {modelReady && hasRealLog === false && !selectedEq && <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>Select equipment with a complete real usage record.</p>}
            {predictionError && <p role="alert" style={{ color: '#fca5a5', fontSize: 12, marginTop: 8 }}>{predictionError}</p>}
          </form>
          {result && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Result — {result.equipmentName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 48, fontWeight: 900, color: RISK_COLOR(result.riskScore), lineHeight: 1 }}>{result.riskScore}%</p>
                  <p style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 4 }}>Risk Score</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className={CATEGORY_BADGE[result.riskCategory] || 'badge-info'}>{result.riskCategory}</span>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Based only on the submitted equipment measurements</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* History chart */}
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 16, fontSize: 15 }}>Prediction History</h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="loading-spinner w-8 h-8" /></div>
          ) : chartData.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 48, paddingBottom: 48 }}>
              <BrainCircuit size={32} className="empty-state-icon" style={{ marginBottom: 8 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No predictions yet. Run your first prediction.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" interval={0} />
                <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="risk" name="Risk Score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={RISK_COLOR(entry.risk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {filteredPredictions.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }} className="space-y-2 max-h-48 overflow-y-auto">
              {filteredPredictions.slice(0, 10).map((p, i) => (
                <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{p.equipmentName} {p.source === 'seed' && <small style={{ color: '#fbbf24' }}>Demo</small>}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: RISK_COLOR(p.riskScore), fontWeight: 700 }}>{p.riskScore}%</span>
                    <span style={{ color: 'var(--text-soft)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
