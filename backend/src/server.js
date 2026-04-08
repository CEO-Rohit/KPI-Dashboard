/**
 * F&B KPI Dashboard — Backend Server
 * Express + Socket.IO with PostgreSQL
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const { Server: SocketIOServer } = require('socket.io');

// Routes
const kpiRoutes = require('./routes/kpiRoutes');
const alertRoutes = require('./routes/alertRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Real-time
const { setupRealtimeSimulation } = require('./realtime/simulation');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://kpi-dashboard-black.vercel.app'
];

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// ─── Middleware ────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────────────────────
app.use('/api', kpiRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/export', exportRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const { query: dbQuery } = require('./db/database');
    const result = await dbQuery('SELECT NOW() as time, COUNT(*) as days FROM daily_kpi_data');
    res.json({
      status: 'healthy',
      server: 'F&B KPI Dashboard API',
      version: '1.0.0',
      database: {
        connected: true,
        serverTime: result.rows[0].time,
        daysOfData: +result.rows[0].days,
      },
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
    });
  }
});

// ─── API docs endpoint ────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    name: 'F&B KPI Dashboard API',
    version: '1.0.0',
    endpoints: {
      kpis: {
        'GET /api/kpis/all?range=today|week|month': 'Get aggregated KPIs across all domains',
        'GET /api/kpis/:domain?range=today|week|month': 'Get aggregated KPIs for a specific domain',
        'GET /api/daily?days=90': 'Get raw daily KPI data',
        'GET /api/hourly': 'Get today\'s hourly data',
        'GET /api/trends?days=30': 'Get trend data for charts',
        'GET /api/menu': 'Get all menu items with engineering quadrant',
        'GET /api/staff': 'Get staff members and metrics',
        'GET /api/heatmaps/revpash': 'Get 7-day RevPASH heatmap data',
        'GET /api/heatmaps/deadslot': 'Get 7-day dead slot heatmap data',
      },
      alerts: {
        'GET /api/alerts?domain=&severity=&active=': 'List alerts with filters',
        'PUT /api/alerts/:id/acknowledge': 'Acknowledge an alert',
        'PUT /api/alerts/:id/dismiss': 'Dismiss an alert',
        'PUT /api/alerts/:id/reset': 'Reset an alert to active',
        'POST /api/alerts/trigger': 'Trigger a demo scenario { scenarioId }',
        'POST /api/alerts/reset-scenario': 'Reset a demo scenario { scenarioId }',
      },
      settings: {
        'GET /api/settings/thresholds': 'Get all alert thresholds',
        'PUT /api/settings/thresholds/:id': 'Update a threshold { thresholdValue, operator }',
        'PUT /api/settings/thresholds': 'Bulk update thresholds { thresholds: [...] }',
      },
      export: {
        'GET /api/export/:domain/csv?days=30': 'Download CSV report',
        'GET /api/export/:domain/pdf?days=30': 'Download PDF report',
      },
      system: {
        'GET /api/health': 'Health check',
        'GET /api': 'This documentation',
      },
    },
    realtime: {
      'socket.io': 'Connect to receive live KPI updates',
      events: {
        'kpi:live-update': 'Real-time KPI values (every 30s during operating hours)',
        'kpi:alert-trigger': 'Real-time alert triggers when thresholds are breached',
        'kpi:status': 'Operating status updates',
      },
    },
  });
});

// ─── Error handling ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n F&B KPI Dashboard API running on http://localhost:${PORT}`);
  console.log(` API documentation: http://localhost:${PORT}/api`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(` Socket.IO enabled for real-time updates\n`);

  // Auto-seed database if empty (useful for first-time production deploy)
  const checkAndSeed = require('./db/ensure-seeded');
  checkAndSeed().catch(err => console.error('Auto-seed failed:', err.message));

  // Start real-time simulation
  setupRealtimeSimulation(io);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  const { stopSimulation } = require('./realtime/simulation');
  stopSimulation();
  
  server.close(() => {
    console.log('HTTP server closed.');
    const { pool } = require('./db/database');
    pool.end().then(() => {
      console.log('Database pool closed. Exit.');
      process.exit(0);
    });
  });

  // Force close after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

module.exports = { app, server, io };
