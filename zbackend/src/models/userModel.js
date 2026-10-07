import mongoose from './db.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'technician', 'viewer'],
      default: 'viewer',
    },
    department: { type: String, trim: true },
    contactInfo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model('User', userSchema);