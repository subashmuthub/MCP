import Equipment from '../models/equipmentModel.js';
import Alert from '../models/alertModel.js';
import MaintenanceRecord from '../models/maintenanceRecordModel.js';
import MaintenanceTicket from '../models/maintenanceTicketModel.js';
import PredictionResult from '../models/predictionResultModel.js';
import UsageLog from '../models/usageLogModel.js';
import Feedback from '../models/feedbackModel.js';

async function predictImportedEquipment(equipment) {
  return { equipmentId: equipment._id, prediction: null, message: 'No prediction generated during import; real measurements are required.' };
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).replace(/[^0-9.\-]/g, '').trim();
  if (!cleaned) return 0;
  return Number(cleaned);
}

function parseDate(value) {
  if (!value) return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const excelDate = new Date(excelEpoch.getTime() + value * 86400000);
    return Number.isNaN(excelDate.getTime()) ? undefined : excelDate;
  }
  const raw = String(value).trim();
  if (!raw) return undefined;

  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;

  const match = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    const parsed = new Date(`${y}-${m}-${d}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return undefined;
}

function normalizeImportedRow(row) {
  const name = String(row.name || row.Equipment || row.Equipments || row['Equipment Name'] || row['Equipment'] || '').trim();
  const category = String(row.category || row.Make || row.Manufacturer || row['Make'] || row.Category || '').trim();
  const lab = String(row.lab || row.Lab || row['Lab Name'] || row.Laboratory || row.location || row.Location || 'Imported').trim() || 'Imported';
  const location = String(row.location || row.Location || row['Room'] || row['Room No.'] || '').trim() || undefined;
  const purchaseDate = parseDate(row.purchaseDate || row['Date of Purchase'] || row['Purchase Date'] || row['Purchase date']);
  const usageHours = parseNumber(row.usageHours ?? row['Usage Hours'] ?? row['Qty'] ?? row['Quantity'] ?? row.usage ?? row['Hours']);
  const age = parseNumber(row.age ?? row['Age'] ?? row['Age (years)'] ?? (purchaseDate ? Math.max(0, new Date().getFullYear() - purchaseDate.getFullYear()) : 0));
  const temperature = parseNumber(row.temperature ?? row.Temperature ?? row['Temperature (°C)']);
  const vibration = parseNumber(row.vibration ?? row.Vibration ?? row['Vibration (mm/s)']);
  const failureCount = parseNumber(row.failureCount ?? row['Failure Count'] ?? row.Failures);
  const serialNumber = String(row.serialNumber || row['Serial No.'] || row['Serial Number'] || row['S.No'] || '').trim() || undefined;

  if (!name || !category) return null;

  return {
    name,
    category,
    serialNumber,
    lab,
    location,
    status: ['healthy', 'warning', 'critical'].includes(String(row.status || row.Status || '').toLowerCase()) ? String(row.status || row.Status).toLowerCase() : 'healthy',
    usageHours,
    age,
    temperature: row.temperature === undefined && row.Temperature === undefined && row['Temperature (°C)'] === undefined ? undefined : temperature,
    vibration: row.vibration === undefined && row.Vibration === undefined && row['Vibration (mm/s)'] === undefined ? undefined : vibration,
    failureCount: row.failureCount === undefined && row['Failure Count'] === undefined && row.Failures === undefined ? undefined : failureCount,
    purchaseDate: purchaseDate ? purchaseDate.toISOString() : undefined,
  };
}

function serializeEquipment(row) {
  return {
    id: row._id,
    name: row.name,
    category: row.category,
    serialNumber: row.serialNumber,
    lab: row.lab,
    location: row.location,
    status: row.status,
    usageHours: row.usageHours,
    age: row.age,
    temperature: row.temperature,
    vibration: row.vibration,
    failureCount: row.failureCount,
    source: row.source,
    purchaseDate: row.purchaseDate,
    riskScore: row.riskScore,
    riskCategory: row.riskCategory,
    createdAt: row.createdAt,
  };
}

export async function listEquipment(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.riskCategory) filter.riskCategory = req.query.riskCategory;
    if (req.query.lab) filter.lab = req.query.lab;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
        { lab: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const rows = await Equipment.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ data: rows.map(serializeEquipment) });
  } catch (error) {
    next(error);
  }
}

export async function getEquipment(req, res, next) {
  try {
    const { equipmentId } = req.params;
    const equipment = await Equipment.findById(equipmentId).lean();
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json({ data: serializeEquipment(equipment) });
  } catch (error) {
    next(error);
  }
}

export async function createEquipment(req, res, next) {
  try {
    const { name, category, serialNumber, lab, location, status, usageHours, age, temperature, vibration, failureCount, purchaseDate } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'name and category are required' });
    }
    const equipment = await Equipment.create({
      name: name.trim(),
      category: category.trim(),
      serialNumber: serialNumber || undefined,
      lab: lab || undefined,
      location: location || undefined,
      status: status || 'healthy',
      usageHours: Number(usageHours || 0),
      age: Number(age || 0),
      temperature: temperature === '' || temperature === undefined ? undefined : Number(temperature),
      vibration: vibration === '' || vibration === undefined ? undefined : Number(vibration),
      failureCount: failureCount === '' || failureCount === undefined ? undefined : Number(failureCount),
      source: 'real',
      purchaseDate: purchaseDate || undefined,
    });
    res.status(201).json({ message: 'Equipment registered', data: serializeEquipment(equipment) });
  } catch (error) {
    next(error);
  }
}

export async function updateEquipment(req, res, next) {
  try {
    const { equipmentId } = req.params;
    const existing = await Equipment.findById(equipmentId);
    if (!existing) return res.status(404).json({ message: 'Equipment not found' });
    if (!req.body) return res.status(400).json({ message: 'No data provided for update' });

    const { name, category, serialNumber, lab, location, status, usageHours, age, temperature, vibration, failureCount, purchaseDate } = req.body;
    if (name !== undefined) existing.name = name.trim();
    if (category !== undefined) existing.category = category.trim();
    if (serialNumber !== undefined) existing.serialNumber = serialNumber;
    if (lab !== undefined) existing.lab = lab;
    if (location !== undefined) existing.location = location;
    if (status !== undefined) existing.status = status;
    if (usageHours !== undefined) existing.usageHours = Number(usageHours);
    if (age !== undefined) existing.age = Number(age);
    for (const [field, value] of Object.entries({ temperature, vibration, failureCount })) {
      if (value !== undefined && value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
        return res.status(400).json({ message: `${field} must be a non-negative number` });
      }
      if (value !== undefined) existing[field] = value === '' ? undefined : Number(value);
    }
    if (purchaseDate !== undefined) existing.purchaseDate = purchaseDate;

    await existing.save();
    res.json({ message: 'Equipment updated', data: serializeEquipment(existing) });
  } catch (error) {
    next(error);
  }
}

export async function deleteEquipment(req, res, next) {
  try {
    const { equipmentId } = req.params;
    const deleted = await Equipment.findByIdAndDelete(equipmentId);
    if (!deleted) return res.status(404).json({ message: 'Equipment not found' });

    await Promise.all([
      Alert.deleteMany({ equipmentId }),
      MaintenanceTicket.deleteMany({ equipmentId }),
      MaintenanceRecord.deleteMany({ equipmentId }),
      PredictionResult.deleteMany({ equipmentId }),
      UsageLog.deleteMany({ equipmentId }),
      Feedback.deleteMany({ equipmentId }),
    ]);

    res.json({ message: 'Equipment deleted' });
  } catch (error) {
    next(error);
  }
}

export async function importEquipment(req, res, next) {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) {
      return res.status(400).json({ message: 'No equipment rows provided for import' });
    }

    const normalized = rows
      .map(normalizeImportedRow)
      .filter(Boolean);

    if (!normalized.length) {
      return res.status(400).json({ message: 'No valid equipment rows found in the import file' });
    }

    const created = await Equipment.insertMany(normalized, { ordered: false });
    const predictionResults = await Promise.all(created.map(predictImportedEquipment));
    res.status(201).json({
      message: 'Equipment imported successfully',
      count: created.length,
      predictions: predictionResults,
      data: created.map(serializeEquipment),
    });
  } catch (error) {
    next(error);
  }
}
