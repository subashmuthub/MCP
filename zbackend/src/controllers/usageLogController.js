import UsageLog from '../models/usageLogModel.js';
import Equipment from '../models/equipmentModel.js';

function serialize(row) {
  return {
    id: row._id,
    equipmentId: row.equipmentId,
    equipmentName: row.equipmentName,
    hoursLogged: row.hoursLogged,
    usageHours: row.usageHours,
    temperature: row.temperature,
    vibration: row.vibration,
    failureCount: row.failureCount,
    riskCategory: row.riskCategory,
    loggedBy: row.loggedBy,
    loggedByName: row.loggedByName,
    timestamp: row.timestamp,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

export async function listUsageLogs(req, res, next) {
  try {
    const filter = {};
    if (req.query.equipmentId) filter.equipmentId = req.query.equipmentId;
    const rows = await UsageLog.find(filter).sort({ timestamp: -1 }).lean();
    res.json({ data: rows.map(serialize) });
  } catch (error) {
    next(error);
  }
}

export async function createUsageLog(req, res, next) {
  try {
    const { equipmentId, hoursLogged, temperature, vibration, failureCount, riskCategory, timestamp, notes } = req.body;
    const values = { hoursLogged, temperature, vibration, failureCount };
    if (!equipmentId || Object.values(values).some(value => value === undefined || !Number.isFinite(Number(value)) || Number(value) < 0)) {
      return res.status(400).json({ message: 'Equipment, hours, temperature, vibration, and failure count are required and cannot be negative.' });
    }
    const equipment = await Equipment.findById(equipmentId).lean();
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

    const log = await UsageLog.create({
      equipmentId,
      equipmentName: equipment.name,
      hoursLogged: Number(hoursLogged),
      usageHours: Number(hoursLogged),
      temperature: Number(temperature),
      vibration: Number(vibration),
      failureCount: Number(failureCount),
      riskCategory: riskCategory || undefined,
      loggedBy: req.user.id,
      loggedByName: req.user.name,
      timestamp: timestamp || new Date(),
      notes: notes?.trim(),
    });

    // Update equipment usageHours
    await Equipment.findByIdAndUpdate(equipmentId, {
      $inc: { usageHours: Number(hoursLogged) },
      $set: { temperature: Number(temperature), vibration: Number(vibration), failureCount: Number(failureCount) },
    });

    res.status(201).json({ message: 'Usage log created', data: serialize(log) });
  } catch (error) {
    next(error);
  }
}

export async function updateUsageLog(req, res, next) {
  try {
    const { logId } = req.params;
    const existing = await UsageLog.findById(logId);
    if (!existing) return res.status(404).json({ message: 'Usage log not found' });

    const { hoursLogged, temperature, vibration, failureCount, riskCategory, timestamp, notes } = req.body;
    for (const [field, value] of Object.entries({ hoursLogged, temperature, vibration, failureCount })) {
      if (value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
        return res.status(400).json({ message: `${field} must be a non-negative number` });
      }
    }
    if (hoursLogged !== undefined) existing.hoursLogged = Number(hoursLogged);
    if (temperature !== undefined) existing.temperature = Number(temperature);
    if (vibration !== undefined) existing.vibration = Number(vibration);
    if (failureCount !== undefined) existing.failureCount = Number(failureCount);
    if (riskCategory !== undefined) existing.riskCategory = riskCategory || undefined;
    if (timestamp !== undefined) existing.timestamp = timestamp;
    if (notes !== undefined) existing.notes = notes.trim();

    await existing.save();
    res.json({ message: 'Usage log updated', data: serialize(existing) });
  } catch (error) {
    next(error);
  }
}

export async function deleteUsageLog(req, res, next) {
  try {
    const { logId } = req.params;
    const deleted = await UsageLog.findByIdAndDelete(logId);
    if (!deleted) return res.status(404).json({ message: 'Usage log not found' });
    res.json({ message: 'Usage log deleted' });
  } catch (error) {
    next(error);
  }
}
