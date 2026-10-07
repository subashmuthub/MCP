import MaintenanceRecord from '../models/maintenanceRecordModel.js';

function serializeRecord(row) {
  return {
    id: row._id,
    equipmentId: row.equipmentId,
    equipmentName: row.equipmentName,
    issueSummary: row.issueSummary,
    maintenanceType: row.maintenanceType,
    technicianName: row.technicianName,
    maintenanceDate: row.maintenanceDate,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

export async function listMaintenanceRecords(_req, res, next) {
  try {
    const rows = await MaintenanceRecord.find().sort({ maintenanceDate: -1, createdAt: -1 }).lean();
    res.json({ data: rows.map(serializeRecord) });
  } catch (error) {
    next(error);
  }
}

export async function createMaintenanceRecord(req, res, next) {
  try {
    const { equipmentId, equipmentName, issueSummary, maintenanceType, technicianName, maintenanceDate, notes } = req.body;

    if (!equipmentId || !issueSummary || !maintenanceType) {
      return res.status(400).json({ message: 'equipmentId, issueSummary, and maintenanceType are required' });
    }

    const record = await MaintenanceRecord.create({
      equipmentId,
      equipmentName: equipmentName || 'Unknown Equipment',
      issueSummary,
      maintenanceType,
      technicianName: technicianName || undefined,
      maintenanceDate: maintenanceDate || undefined,
      notes: notes || undefined,
    });

    res.status(201).json({
      message: 'Maintenance record saved',
      data: serializeRecord(record),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMaintenanceRecord(req, res, next) {
  try {
    const { recordId } = req.params;
    const existing = await MaintenanceRecord.findById(recordId);

    if (!existing) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    const { equipmentId, equipmentName, issueSummary, maintenanceType, technicianName, maintenanceDate, notes } = req.body;

    existing.equipmentId = equipmentId ?? existing.equipmentId;
    existing.equipmentName = equipmentName ?? existing.equipmentName;
    existing.issueSummary = issueSummary ?? existing.issueSummary;
    existing.maintenanceType = maintenanceType ?? existing.maintenanceType;
    existing.technicianName = technicianName ?? existing.technicianName;
    existing.maintenanceDate = maintenanceDate ?? existing.maintenanceDate;
    existing.notes = notes ?? existing.notes;

    await existing.save();

    res.json({
      message: 'Maintenance record updated',
      data: serializeRecord(existing),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMaintenanceRecord(req, res, next) {
  try {
    const { recordId } = req.params;
    const deleted = await MaintenanceRecord.findByIdAndDelete(recordId);

    if (!deleted) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json({ message: 'Maintenance record deleted' });
  } catch (error) {
    next(error);
  }
}