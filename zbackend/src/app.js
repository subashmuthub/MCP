import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import usageLogRoutes from './routes/usageLogRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import userRoutes from './routes/userRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';

dotenv.config();

const app = express();

// Trust proxy when running behind a reverse proxy in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}));
// Access logs in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.LOG_FORMAT || 'combined'));
}
app.use(cookieParser());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'equipsense-ai-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/usage-logs', usageLogRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/predictions', predictionRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
