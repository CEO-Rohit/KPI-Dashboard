/**
 * Alert Routes — persistent alert management
 * GET  /api/alerts          — list all alerts (filterable by domain, severity, active)
 * PUT  /api/alerts/:id/acknowledge — acknowledge an alert
 * PUT  /api/alerts/:id/dismiss    — dismiss an alert
 * POST /api/alerts/trigger        — trigger a demo scenario
 * PUT  /api/alerts/:id/reset      — reset an alert to active
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

// ─── GET /api/alerts ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { domain, severity, active } = req.query;
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    let idx = 1;

    if (domain) { sql += ` AND domain = $${idx++}`; params.push(domain); }
    if (severity) { sql += ` AND severity = $${idx++}`; params.push(severity); }
    if (active !== undefined) { sql += ` AND active = $${idx++}`; params.push(active === 'true'); }

    sql += ' ORDER BY CASE severity WHEN \'critical\' THEN 1 WHEN \'warning\' THEN 2 ELSE 3 END, triggered_at DESC NULLS LAST';

    const result = await query(sql, params);
    
    const alerts = result.rows.map(a => ({
      id: a.id,
      domain: a.domain,
      kpi: a.kpi,
      severity: a.severity,
      condition: a.condition_text,
      threshold: +a.threshold,
      action: a.action_text,
      triggeredAt: a.triggered_at,
      acknowledged: a.acknowledged,
      dismissed: a.dismissed,
      active: a.active,
      fromScenario: a.from_scenario,
    }));

    const unacknowledgedCount = alerts.filter(a => a.active && !a.acknowledged && !a.dismissed).length;

    res.json({ success: true, data: alerts, unacknowledgedCount });
  } catch (err) {
    console.error('Error in GET /api/alerts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/alerts/:id/acknowledge ──────────────────────────
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE alerts SET acknowledged = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error acknowledging alert:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/alerts/:id/dismiss ──────────────────────────────
router.put('/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE alerts SET dismissed = true, active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error dismissing alert:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/alerts/trigger ─────────────────────────────────
router.post('/trigger', async (req, res) => {
  try {
    const { scenarioId } = req.body;
    
    const SCENARIOS = {
      delivery_spike: {
        alertIds: ['delivery_time_high', 'ktt_high', 'cancellation_spike'],
        name: '🚚 Delivery Time Spike',
      },
      waste_crisis: {
        alertIds: ['food_waste_high', 'shrinkage_high', 'food_cost_high'],
        name: '🗑️ Food Waste Threshold Breach',
      },
      staffing_crisis: {
        alertIds: ['staff_noshow', 'rplh_drop', 'dwell_time_high', 'order_error_high'],
        name: '👥 Staff No-Show Crisis',
      },
    };

    const scenario = SCENARIOS[scenarioId];
    if (!scenario) {
      return res.status(400).json({ success: false, error: `Unknown scenario: ${scenarioId}` });
    }

    const now = new Date().toISOString();
    for (const alertId of scenario.alertIds) {
      await query(
        `UPDATE alerts SET active = true, triggered_at = $1, acknowledged = false, dismissed = false, from_scenario = $2, updated_at = NOW()
         WHERE id = $3`,
        [now, scenarioId, alertId]
      );
    }

    res.json({ success: true, message: `Scenario "${scenario.name}" triggered`, alertIds: scenario.alertIds });
  } catch (err) {
    console.error('Error triggering scenario:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/alerts/reset-scenario ──────────────────────────
router.post('/reset-scenario', async (req, res) => {
  try {
    const { scenarioId } = req.body;
    await query(
      `UPDATE alerts SET active = false, triggered_at = NULL, from_scenario = NULL, updated_at = NOW() WHERE from_scenario = $1`,
      [scenarioId]
    );
    res.json({ success: true, message: `Scenario "${scenarioId}" reset` });
  } catch (err) {
    console.error('Error resetting scenario:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/alerts/:id/reset ────────────────────────────────
router.put('/:id/reset', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE alerts SET acknowledged = false, dismissed = false, active = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error resetting alert:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
