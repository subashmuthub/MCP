import mongoose from './db.js';

const alertSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    equipmentName: { type: String, required: true },
    message: { type: String, required: true },
    level: {
      type: String,
      enum: ['warning', 'critical'],
      required: true,
    },
    riskCategory: {
      type: String,
      enum: ['Healthy', 'Needs Attention', 'Critical'],
      default: 'Needs Attention',
    },
    riskScore: { type: Number, default: 0 },
    predictedDaysToFailure: { type: Number, default: 0 },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);