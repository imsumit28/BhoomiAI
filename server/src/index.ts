import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db';
import apiRouter from './routes/api';
import { seedDatabase } from './seed/seedData';
import { User } from './models/User';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configure Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected to live processing updates: ${socket.id}`);
  socket.on('disconnect', () => {
    // disconnected
  });
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads & samples folder
const uploadsDir = path.join(__dirname, '../../uploads');
const samplesDir = path.join(__dirname, '../../samples');
app.use('/uploads', express.static(uploadsDir));
app.use('/samples', express.static(samplesDir));

// API Router
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BhoomiAI - Intelligent Land Record Digitization & Validation System',
    version: '1.0.0 (SIH 2026)',
    timestamp: new Date().toISOString(),
  });
});

// Initialize DB and launch server
async function startServer() {
  try {
    await connectDB();

    // Auto-seed if users table is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Auto-running seed script...');
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`
============================================================
🏛️  BHOOMI-AI: Intelligent Land Record Digitization Platform
    SIH26018 - Ministry of Rural Development
    Server running on: http://localhost:${PORT}
    API Endpoint:      http://localhost:${PORT}/api
    Health Check:      http://localhost:${PORT}/api/health
============================================================
      `);
    });
  } catch (err) {
    console.error('Failed to start BhoomiAI server:', err);
    process.exit(1);
  }
}

startServer();

export { io };
