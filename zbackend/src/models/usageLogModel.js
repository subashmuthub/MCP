import mongoose from './db.js';

const usageLogSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    equipmentName: { type: String, required: true },
    hoursLogged: { type: Number, required: true, min: 0 },
    temperature: { type: Number, required: true, min: 0 },
    vibration: { type: Number, required: true, min: 0 },
    failureCount: { type: Number, required: true, min: 0 },
    riskCategory: { type: String, enum: ['Healthy', 'Needs Attention', 'Critical'] },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loggedByName: { type: String },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.models.UsageLog || mongoose.model('UsageLog', usageLogSchema);
