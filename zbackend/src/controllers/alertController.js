import Alert from '../models/alertModel.js';

function serializeAlert(row) {
  return {
    id: row._id,
    equipmentId: row.equipmentId,
    equipmentName: row.equipmentName,
    message: row.message,
    level: row.level,
    riskCategory: row.riskCategory,
    riskScore: row.riskScore,
    predictedDaysToFailure: row.predictedDaysToFailure,
    resolved: row.resolved,
    resolvedBy: row.resolvedBy,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
  };
}

export async function listAlerts(req, res, next) {
  try {
    const filter = {};
    if (req.query.resolved !== undefined) {
      filter.resolved = req.query.resolved === 'true';
    }
    const rows = await Alert.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ data: rows.map(serializeAlert) });
  } catch (error) {
    next(error);
  }
}

export async function createAlert(req, res, next) {
  try {
    const { equipmentId, equipmentName, message, level, riskCategory, riskScore, predictedDaysToFailure } = req.body;

    if (!equipmentId || !equipmentName || !message || !level) {
      return res.status(400).json({ message: 'equipmentId, equipmentName, message, and level are required' });
    }

    const alert = await Alert.create({
      equipmentId,
      equipmentName,
      message,
      level,
      riskCategory: riskCategory || 'Needs Attention',
      riskScore: Number(riskScore || 0),
      predictedDaysToFailure: Number(predictedDaysToFailure || 0),
    });

    res.status(201).json({ message: 'Alert created', data: serializeAlert(alert) });
  } catch (error) {
    next(error);
  }
}

export async function updateAlert(req, res, next) {
  try {
    const { alertId } = req.params;
    const existing = await Alert.findById(alertId);
    if (!existing) return res.status(404).json({ message: 'Alert not found' });

    const { message, level, riskCategory, riskScore, predictedDaysToFailure } = req.body;
    if (message !== undefined) existing.message = message;
    if (level !== undefined) existing.level = level;
    if (riskCategory !== undefined) existing.riskCategory = riskCategory;
    if (riskScore !== undefined) existing.riskScore = riskScore;
    if (predictedDaysToFailure !== undefined) existing.predictedDaysToFailure = predictedDaysToFailure;

    await existing.save();
    res.json({ message: 'Alert updated', data: serializeAlert(existing) });
  } catch (error) {
    next(error);
  }
}

export async function resolveAlert(req, res, next) {
  try {
    const { alertId } = req.params;
    const existing = await Alert.findById(alertId);
    if (!existing) return res.status(404).json({ message: 'Alert not found' });

    existing.resolved = true;
    existing.resolvedBy = req.user.id;
    existing.resolvedAt = new Date();
    await existing.save();

    res.json({ message: 'Alert resolved', data: serializeAlert(existing) });
  } catch (error) {
    next(error);
  }
}

export async function deleteAlert(req, res, next) {
  try {
    const { alertId } = req.params;
    const deleted = await Alert.findByIdAndDelete(alertId);
    if (!deleted) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
}
