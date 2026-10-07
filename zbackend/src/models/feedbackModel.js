import mongoose from './db.js';

const feedbackSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    equipmentName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
