/**
 * Real-time KPI simulation via Socket.IO
 * Emits live KPI updates every 30-60 seconds to connected clients
 * Simulates a restaurant in operation: revenue ticks up, covers increase,
 * KTT fluctuates based on time of day, etc.
 */
const { query } = require('../db/database');

// Utility functions
function jitter(val, pct) {
  return val * (1 + (Math.random() - 0.5) * 2 * pct);
}
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

const HOUR_WEIGHTS = [0,0,0,0,0,0,0,0,0,0,0, 0.5, 0.9, 0.85, 0.4, 0.3, 0.3, 0.35, 0.6, 1.0, 0.95, 0.7, 0.4, 0.15];

let intervalId = null;

function setupRealtimeSimulation(io) {
  console.log('📡 Real-time simulation engine initialized');

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Emit KPI updates every 30 seconds
  intervalId = setInterval(async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const weight = HOUR_WEIGHTS[currentHour] || 0.1;

      // Only simulate during operating hours (11am - 11pm)
      if (currentHour < 11 || currentHour > 22) {
        io.emit('kpi:status', { operating: false, message: 'Restaurant closed' });
        return;
      }

      // Generate incremental live data
      const revenue_tick = Math.round(jitter(50 * weight, 0.3));
      const covers_tick = Math.random() < weight ? Math.round(jitter(2, 0.5)) : 0;
      const currentKTT = clamp(jitter(12 * (weight > 0.7 ? 1.3 : 1.0), 0.2), 8, 24);
      const seatOccupancy = clamp(weight * jitter(0.82, 0.15), 0.15, 1.0) * 100;
      const deliveryTime = clamp(jitter(32 * (weight > 0.8 ? 1.15 : 1.0), 0.1), 25, 48);

      // Update today's hourly data in DB
      const dateStr = now.toISOString().split('T')[0];
      await query(
        `UPDATE hourly_kpi_data 
         SET revenue = revenue + $1, covers = covers + $2, ktt = $3, 
             seat_occupancy = $4, is_live = true
         WHERE date = $5 AND hour = $6`,
        [revenue_tick, covers_tick, currentKTT.toFixed(1), seatOccupancy.toFixed(1), dateStr, currentHour]
      );

      // Get today's running totals
      const totals = await query(
        `SELECT COALESCE(SUM(revenue), 0) as total_revenue, 
                COALESCE(SUM(covers), 0) as total_covers
         FROM hourly_kpi_data WHERE date = $1 AND is_live = true`,
        [dateStr]
      );

      // Get today's target
      const target = await query(
        `SELECT revenue_target FROM daily_kpi_data WHERE date = $1`,
        [dateStr]
      );

      const totalRevenue = +totals.rows[0]?.total_revenue || 0;
      const totalCovers = +totals.rows[0]?.total_covers || 0;
      const revenueTarget = +target.rows[0]?.revenue_target || 6000;

      const liveData = {
        timestamp: now.toISOString(),
        hour: currentHour,
        weight,
        operating: true,
        ticks: {
          revenue: revenue_tick,
          covers: covers_tick,
        },
        current: {
          ktt: +currentKTT.toFixed(1),
          seatOccupancy: +seatOccupancy.toFixed(1),
          deliveryTime: +deliveryTime.toFixed(1),
        },
        totals: {
          revenue: totalRevenue,
          covers: totalCovers,
          revenueTarget,
          attainment: +((totalRevenue / revenueTarget) * 100).toFixed(1),
        },
      };

      io.emit('kpi:live-update', liveData);

      // Check for alert conditions and emit alerts
      const alertChecks = [];
      if (currentKTT > 22) {
        alertChecks.push({
          id: 'ktt_high', severity: 'critical',
          message: `Kitchen Ticket Time at ${currentKTT.toFixed(1)} min (threshold: 22 min)`,
        });
      }
      if (deliveryTime > 40) {
        alertChecks.push({
          id: 'delivery_time_high', severity: 'critical',
          message: `Delivery Time at ${deliveryTime.toFixed(1)} min (threshold: 40 min)`,
        });
      }
      if (seatOccupancy < 30 && weight > 0.5) {
        alertChecks.push({
          id: 'low_occupancy', severity: 'warning',
          message: `Seat occupancy at ${seatOccupancy.toFixed(1)}% during high-traffic period`,
        });
      }

      if (alertChecks.length > 0) {
        io.emit('kpi:alert-trigger', alertChecks);
      }

    } catch (err) {
      console.error('Real-time simulation error:', err.message);
    }
  }, 30000); // Every 30 seconds

  return intervalId;
}

function stopSimulation() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('📡 Real-time simulation stopped');
  }
}

module.exports = { setupRealtimeSimulation, stopSimulation };
