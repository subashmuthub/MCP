import dotenv from 'dotenv';
import { connectDatabase } from '../src/models/db.js';
import Equipment from '../src/models/equipmentModel.js';
import PredictionResult from '../src/models/predictionResultModel.js';
import MaintenanceTicket from '../src/models/maintenanceTicketModel.js';
import MaintenanceRecord from '../src/models/maintenanceRecordModel.js';
import Alert from '../src/models/alertModel.js';
import UsageLog from '../src/models/usageLogModel.js';
import Feedback from '../src/models/feedbackModel.js';
import User from '../src/models/userModel.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function upsertUser({ name, email, password, role, department }) {
  const existing = await User.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 10);
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = role;
    existing.department = department;
    existing.isActive = true;
    await existing.save();
    return existing;
  }
  return User.create({ name, email, passwordHash, role, department, isActive: true });
}

async function run() {
  await connectDatabase();

  // Clear operational data (keep users)
  await Promise.all([
    Equipment.deleteMany({}),
    PredictionResult.deleteMany({}),
    MaintenanceTicket.deleteMany({}),
    MaintenanceRecord.deleteMany({}),
    Alert.deleteMany({}),
    UsageLog.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  // Deactivate test / junk accounts
  await User.updateMany(
    { email: { $in: ['asd@gmail.com', '2312@nec.edu.in', '2312401@nec.edu.in', 'test@test.com'] } },
    { isActive: false }
  );
  // Deactivate extra duplicate admin accounts except the primary one
  await User.updateMany(
    { email: { $in: ['priya.admin@equipsense.com', 'raj.admin@equipsense.com'] } },
    { isActive: false }
  );

  // Seed users — 3 per role
  const [admin1, admin2, admin3] = await Promise.all([
    upsertUser({ name: 'Subash (Admin)', email: 'subash@gmail.com', password: 'Admin@123', role: 'admin', department: 'Lab Management' }),
    upsertUser({ name: 'Priya Admin', email: 'priya.admin@equipsense.com', password: 'Admin@123', role: 'admin', department: 'Operations' }),
    upsertUser({ name: 'Raj Admin', email: 'raj.admin@equipsense.com', password: 'Admin@123', role: 'admin', department: 'IT' }),
  ]);

  const [tech1, tech2, tech3] = await Promise.all([
    upsertUser({ name: 'Arun Tech', email: 'arun@equipsense.com', password: 'Tech@123', role: 'technician', department: 'Maintenance' }),
    upsertUser({ name: 'Divya Tech', email: 'divya@equipsense.com', password: 'Tech@123', role: 'technician', department: 'Maintenance' }),
    upsertUser({ name: 'Kumar Tech', email: 'kumar@equipsense.com', password: 'Tech@123', role: 'technician', department: 'Field Service' }),
  ]);

  const [viewer1, viewer2, viewer3] = await Promise.all([
    upsertUser({ name: 'Meena Viewer', email: 'meena@equipsense.com', password: 'View@123', role: 'viewer', department: 'Research' }),
    upsertUser({ name: 'Suresh Viewer', email: 'suresh@equipsense.com', password: 'View@123', role: 'viewer', department: 'Quality' }),
    upsertUser({ name: 'Lakshmi Viewer', email: 'lakshmi@equipsense.com', password: 'View@123', role: 'viewer', department: 'Testing' }),
  ]);

  // Seed Equipment
  const now = new Date();
  const equipmentList = await Equipment.insertMany([
    { name: 'Microscope A1', category: 'Optics', serialNumber: 'EQ-1001', location: 'Lab 1', source: 'seed', status: 'healthy', usageHours: 120, age: 2, purchaseDate: new Date('2022-01-15'), riskScore: 12, riskCategory: 'Healthy' },
    { name: 'Centrifuge B2', category: 'Chemistry', serialNumber: 'EQ-1002', location: 'Lab 2', source: 'seed', status: 'warning', usageHours: 850, age: 4, purchaseDate: new Date('2020-06-10'), riskScore: 58, riskCategory: 'Needs Attention' },
    { name: 'Hot Air Oven C3', category: 'Physics', serialNumber: 'EQ-1003', location: 'Lab 3', source: 'seed', status: 'critical', usageHours: 2100, age: 7, purchaseDate: new Date('2017-03-20'), riskScore: 86, riskCategory: 'Critical' },
    { name: 'Spectrophotometer D4', category: 'Optics', serialNumber: 'EQ-1004', location: 'Lab 1', source: 'seed', status: 'healthy', usageHours: 300, age: 1, purchaseDate: new Date('2023-09-01'), riskScore: 8, riskCategory: 'Healthy' },
    { name: 'Autoclave E5', category: 'Sterilization', serialNumber: 'EQ-1005', location: 'Lab 4', source: 'seed', status: 'warning', usageHours: 640, age: 3, purchaseDate: new Date('2021-11-05'), riskScore: 52, riskCategory: 'Needs Attention' },
    { name: 'Oscilloscope F6', category: 'Electronics', serialNumber: 'EQ-1006', location: 'Lab 2', source: 'seed', status: 'healthy', usageHours: 90, age: 1, purchaseDate: new Date('2023-04-12'), riskScore: 6, riskCategory: 'Healthy' },
  ]);

  const [eq1, eq2, eq3, eq4, eq5, eq6] = equipmentList;

  // Seed Predictions
  const weekAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
  await PredictionResult.insertMany([
    { equipmentId: eq1._id, equipmentName: eq1.name, riskScore: 12, predictedDaysToFailure: 0, status: 'healthy', source: 'seed' },
    { equipmentId: eq2._id, equipmentName: eq2.name, riskScore: 58, predictedDaysToFailure: 0, status: 'warning', source: 'seed', createdAt: weekAgo(7) },
    { equipmentId: eq2._id, equipmentName: eq2.name, riskScore: 55, predictedDaysToFailure: 0, status: 'warning', source: 'seed', createdAt: weekAgo(14) },
    { equipmentId: eq3._id, equipmentName: eq3.name, riskScore: 86, predictedDaysToFailure: 0, status: 'critical', source: 'seed', createdAt: weekAgo(3) },
    { equipmentId: eq3._id, equipmentName: eq3.name, riskScore: 79, predictedDaysToFailure: 0, status: 'critical', source: 'seed', createdAt: weekAgo(10) },
    { equipmentId: eq5._id, equipmentName: eq5.name, riskScore: 52, predictedDaysToFailure: 0, status: 'warning', source: 'seed', createdAt: weekAgo(5) },
  ]);

  // Seed Alerts
  const [alert1, alert2, alert3] = await Alert.insertMany([
    { equipmentId: eq2._id, equipmentName: eq2.name, message: 'Centrifuge B2 is approaching maintenance threshold. Risk score: 58.', level: 'warning', riskCategory: 'Needs Attention', riskScore: 58, predictedDaysToFailure: 9, resolved: false },
    { equipmentId: eq3._id, equipmentName: eq3.name, message: 'Hot Air Oven C3 requires immediate inspection. Risk score: 86.', level: 'critical', riskCategory: 'Critical', riskScore: 86, predictedDaysToFailure: 2, resolved: false },
    { equipmentId: eq5._id, equipmentName: eq5.name, message: 'Autoclave E5 approaching threshold. Risk score: 52.', level: 'warning', riskCategory: 'Needs Attention', riskScore: 52, predictedDaysToFailure: 13, resolved: true, resolvedBy: admin1._id, resolvedAt: weekAgo(2) },
  ]);

  // Seed Tickets (linked to source alerts)
  await MaintenanceTicket.insertMany([
    { equipmentId: eq2._id, equipmentName: eq2.name, title: 'Inspect Centrifuge B2 bearings', description: 'Bearing noise detected during high-speed operation.', priority: 'high', status: 'open', technicianId: tech1._id, technicianName: tech1.name, sourceAlertId: alert1._id, assignedAt: weekAgo(2) },
    { equipmentId: eq3._id, equipmentName: eq3.name, title: 'Urgent: Service Hot Air Oven C3', description: 'Temperature regulation failure. Immediate service required.', priority: 'high', status: 'in_progress', technicianId: tech2._id, technicianName: tech2.name, sourceAlertId: alert2._id, assignedAt: weekAgo(3) },
    { equipmentId: eq5._id, equipmentName: eq5.name, title: 'Preventive maintenance - Autoclave E5', description: 'Scheduled quarterly maintenance.', priority: 'medium', status: 'resolved', technicianId: tech3._id, technicianName: tech3.name, sourceAlertId: alert3._id, cost: 1500, assignedAt: weekAgo(10), resolvedAt: weekAgo(8) },
  ]);

  // Seed Maintenance Records
  await MaintenanceRecord.insertMany([
    { equipmentId: eq1._id, equipmentName: eq1.name, issueSummary: 'Routine calibration and lens cleaning', maintenanceType: 'Preventive', technicianName: tech1.name, maintenanceDate: weekAgo(30), notes: 'All optics in good condition' },
    { equipmentId: eq5._id, equipmentName: eq5.name, issueSummary: 'Replaced pressure seals and gaskets', maintenanceType: 'Corrective', technicianName: tech3.name, maintenanceDate: weekAgo(8), notes: 'Seals were worn. Performance restored.' },
  ]);

  // Seed Usage Logs
  await UsageLog.insertMany([
    { equipmentId: eq1._id, equipmentName: eq1.name, hoursLogged: 8, temperature: 24, vibration: 0.4, failureCount: 0, riskCategory: 'Healthy', loggedBy: tech1._id, loggedByName: tech1.name, timestamp: weekAgo(1), notes: 'Demo data: regular lab session' },
    { equipmentId: eq2._id, equipmentName: eq2.name, hoursLogged: 12, temperature: 42, vibration: 3.2, failureCount: 1, riskCategory: 'Needs Attention', loggedBy: tech1._id, loggedByName: tech1.name, timestamp: weekAgo(2), notes: 'Demo data: extended centrifugation run' },
    { equipmentId: eq3._id, equipmentName: eq3.name, hoursLogged: 24, temperature: 68, vibration: 7.1, failureCount: 3, riskCategory: 'Critical', loggedBy: tech2._id, loggedByName: tech2.name, timestamp: weekAgo(3), notes: 'Demo data: overnight batch processing' },
  ]);

  // Seed Feedback
  await Feedback.insertMany([
    { equipmentId: eq1._id, equipmentName: eq1.name, userId: viewer1._id, userName: viewer1.name, rating: 5, comment: 'Excellent optics, very reliable', timestamp: weekAgo(5) },
    { equipmentId: eq2._id, equipmentName: eq2.name, userId: viewer2._id, userName: viewer2.name, rating: 3, comment: 'Slightly noisy at high speeds lately', timestamp: weekAgo(4) },
    { equipmentId: eq3._id, equipmentName: eq3.name, userId: viewer3._id, userName: viewer3.name, rating: 1, comment: 'Temperature inconsistent - needs urgent repair', timestamp: weekAgo(2) },
  ]);

  console.log('\n✅ Demo data seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  ADMIN:      subash@gmail.com / Admin@123');
  console.log('  ADMIN:      priya.admin@equipsense.com / Admin@123');
  console.log('  TECHNICIAN: arun@equipsense.com / Tech@123');
  console.log('  VIEWER:     meena@equipsense.com / View@123');
  process.exit(0);
}

run().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});