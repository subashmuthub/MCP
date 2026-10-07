import mongoose from './db.js';

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    serialNumber: { type: String, trim: true, sparse: true },
    lab: { type: String, trim: true },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: ['healthy', 'warning', 'critical'],
      default: 'healthy',
    },
    usageHours: { type: Number, default: 0 },
    age: { type: Number, default: 0 }, // years
    temperature: { type: Number, min: 0 },
    vibration: { type: Number, min: 0 },
    failureCount: { type: Number, min: 0 },
    source: { type: String, enum: ['seed', 'real'], default: 'real', index: true },
    purchaseDate: { type: Date },
    riskScore: { type: Number, default: 0 },
    riskCategory: {
      type: String,
      enum: ['Healthy', 'Needs Attention', 'Critical'],
      default: 'Healthy',
    },
  },
  { timestamps: true },
);

export default mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);