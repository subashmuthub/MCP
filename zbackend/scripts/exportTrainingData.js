import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/models/db.js';
import Equipment from '../src/models/equipmentModel.js';
import UsageLog from '../src/models/usageLogModel.js';

dotenv.config();

const columns = ['usageHours', 'failureCount', 'temperature', 'vibration', 'age', 'riskCategory'];

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function run() {
  const outputPath = process.argv[2] || 'training-data.csv';
  await connectDatabase();
  const [equipment, logs] = await Promise.all([
    Equipment.find({}).select('_id usageHours age').lean(),
    UsageLog.find({ riskCategory: { $in: ['Healthy', 'Needs Attention', 'Critical'] } }).sort({ timestamp: 1 }).lean(),
  ]);
  const equipmentById = new Map(equipment.map(row => [String(row._id), row]));
  const rows = logs.map(log => {
    const eq = equipmentById.get(String(log.equipmentId));
    return {
      usageHours: eq?.usageHours,
      failureCount: log.failureCount,
      temperature: log.temperature,
      vibration: log.vibration,
      age: eq?.age,
      riskCategory: log.riskCategory,
    };
  }).filter(row => columns.every(column => row[column] !== undefined && row[column] !== null && row[column] !== ''));

  if (!rows.length) throw new Error('No complete, real, labeled usage records available for training export.');
  const csv = [columns.join(','), ...rows.map(row => columns.map(column => csvCell(row[column])).join(','))].join('\n');
  await fs.writeFile(outputPath, `${csv}\n`, 'utf8');
  console.log(`Exported ${rows.length} labeled real rows to ${outputPath}`);
  await import('mongoose').then(({ default: mongoose }) => mongoose.disconnect());
}

run().catch(error => {
  console.error(`Training export failed: ${error.message}`);
  process.exitCode = 1;
});
