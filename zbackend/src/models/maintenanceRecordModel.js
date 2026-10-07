import mongoose from './db.js';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    equipmentName: { type: String, required: true },
    issueSummary: { type: String, required: true, trim: true },
    maintenanceType: { type: String, required: true, trim: true },
    technicianName: { type: String, trim: true },
    maintenanceDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.models.MaintenanceRecord || mongoose.model('MaintenanceRecord', maintenanceRecordSchema);