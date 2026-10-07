import mongoose from './db.js';

const maintenanceTicketSchema = new mongoose.Schema(
  {
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    equipmentName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    technicianName: { type: String, trim: true },
    cost: { type: Number, default: 0 },
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.MaintenanceTicket || mongoose.model('MaintenanceTicket', maintenanceTicketSchema);