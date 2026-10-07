import Equipment from '../models/equipmentModel.js';
import PredictionResult from '../models/predictionResultModel.js';
import MaintenanceTicket from '../models/maintenanceTicketModel.js';
import Alert from '../models/alertModel.js';
import UsageLog from '../models/usageLogModel.js';
import { getModelHealth, getPrediction } from '../services/mlClient.js';

const RISK_THRESHOLD = { warning: 40, critical: 70 };

export function validatePredictionInputs(body = {}) {
  const fields = ['usageHours', 'failureCount', 'temperature', 'vibration', 'age'];
  const values = Object.fromEntries(fields.map(field => [field, Number(body[field])]));
  const valid = fields.every(field => Number.isFinite(values[field]) && values[field] >= 0);
  return { valid, values };
}

function normalizeStatus(riskScore) {
  if (riskScore >= RISK_THRESHOLD.critical) return 'critical';
  if (riskScore >= RISK_THRESHOLD.warning) return 'warning';
  return 'healthy';
}

function normalizeCategory(riskScore) {
  if (riskScore >= RISK_THRESHOLD.critical) return 'Critical';
  if (riskScore >= RISK_THRESHOLD.warning) return 'Needs Attention';
  return 'Healthy';
}

async function autoCreateAlert(equipment, dbStatus, riskScore, predictedDaysToFailure) {
  if (dbStatus === 'healthy') {
    await Alert.deleteMany({ equipmentId: equipment._id, resolved: false });
    return;
  }

  const message = dbStatus === 'critical'
    ? `${equipment.name} requires immediate inspection. Risk score: ${riskScore}.`
    : `${equipment.name} is approaching maintenance threshold. Risk score: ${riskScore}.`;

  await Alert.findOneAndUpdate(
    { equipmentId: equipment._id, resolved: false },
    {
      equipmentName: equipment.name,
      message,
      level: dbStatus,
      riskCategory: normalizeCategory(riskScore),
      riskScore,
      predictedDaysToFailure,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function autoCreateTicket(equipmentId, status, name) {
  if (status !== 'critical') return;
  const existing = await MaintenanceTicket.findOne({
    equipmentId,
    status: { $in: ['open', 'in_progress'] },
  }).lean();
  if (existing) return;
  await MaintenanceTicket.create({
    equipmentId,
    equipmentName: name,
    title: `Urgent: Inspect ${name}`,
    description: 'Auto-generated from risk prediction crossing critical threshold.',
    priority: 'high',
    status: 'open',
  });
}

export async function listPredictions(req, res, next) {
  try {
    const filter = {};
    if (req.query.equipmentId) filter.equipmentId = req.query.equipmentId;
    const rows = await PredictionResult.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
}

export async function predictionStatus(req, res, next) {
  try {
    const health = await getModelHealth();
    res.json({ mlReady: health.ml_ready === true });
  } catch {
    res.json({ mlReady: false });
  }
}

export async function predictRisk(req, res, next) {
  try {
    const { equipmentId } = req.params;
    const equipment = await Equipment.findById(equipmentId).lean();
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    const latestLog = await UsageLog.findOne({ equipmentId }).sort({ timestamp: -1 }).lean();
    if (!latestLog) {
      return res.status(422).json({ message: 'A complete real usage log is required before prediction.' });
    }

    const { valid, values } = validatePredictionInputs(req.body);
    if (!valid) {
      return res.status(422).json({ message: 'Real usage, failure, temperature, vibration, and age measurements are required.' });
    }

    let prediction;
    try {
      prediction = await getPrediction({ equipmentId, ...values });
    } catch (error) {
      return res.status(503).json({ message: 'A validated ML model is unavailable. No prediction was generated.' });
    }

    const riskScore = Number(prediction.riskScore);
    if (!Number.isFinite(riskScore) || riskScore < 0 || riskScore > 100) {
      return res.status(502).json({ message: 'Prediction service returned an invalid risk score.' });
    }
    const predictedDaysToFailure = 0;
    const dbStatus = normalizeStatus(riskScore);
    const riskCategory = normalizeCategory(riskScore);

    await PredictionResult.create({
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      riskScore,
      predictedDaysToFailure,
      status: dbStatus,
      source: 'real',
    });

    await Equipment.findByIdAndUpdate(equipmentId, { status: dbStatus, riskScore, riskCategory });
    await autoCreateAlert(equipment, dbStatus, riskScore, predictedDaysToFailure);
    await autoCreateTicket(equipment._id, dbStatus, equipment.name);

    res.json({
      equipmentId,
      equipmentName: equipment.name,
      riskScore,
      riskCategory,
      status: dbStatus,
      predictedDaysToFailure,
      source: 'real',
      recommendation: dbStatus === 'critical'
        ? 'Schedule immediate maintenance'
        : dbStatus === 'warning'
          ? 'Monitor closely and plan maintenance'
          : 'Equipment is operating normally',
    });
  } catch (error) {
    next(error);
  }
}
