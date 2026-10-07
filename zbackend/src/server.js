import app from './app.js';
import { connectDatabase } from './models/db.js';

const port = process.env.PORT || 4000;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`EquipSense AI backend running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend server:', error);
  process.exit(1);
});
