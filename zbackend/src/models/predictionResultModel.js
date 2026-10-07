import mongoose from './db.js';

const predictionResultSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    equipmentName: { type: String, required: true },
    riskScore: { type: Number, required: true },
    predictedDaysToFailure: { type: Number, required: true },
    source: { type: String, enum: ['seed', 'real'], default: 'real', index: true },
    status: {
      type: String,
      enum: ['healthy', 'warning', 'critical'],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.PredictionResult || mongoose.model('PredictionResult', predictionResultSchema);