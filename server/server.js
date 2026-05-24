require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');
const budgetRoutes = require('./routes/budget.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const insightsRoutes = require('./routes/insights.routes');
const notificationRoutes = require('./routes/notification.routes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── SECURITY MIDDLEWARE ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── LOGGING ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── RATE LIMITING ───────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// ─── API ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   WealthFlow API Server                  ║
  ║   Running on port ${PORT}                    ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}             ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
