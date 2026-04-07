/**
 * Settings Routes — alert threshold configuration
 * GET  /api/settings/thresholds         — list all thresholds
 * PUT  /api/settings/thresholds/:id     — update a specific threshold
 * PUT  /api/settings/thresholds         — bulk update thresholds
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

// ─── GET /api/settings/thresholds ─────────────────────────────
router.get('/thresholds', async (req, res) => {
  try {
    const result = await query('SELECT * FROM alert_thresholds ORDER BY domain, kpi');
    res.json({
      success: true,
      data: result.rows.map(r => ({
        id: r.id,
        domain: r.domain,
        kpi: r.kpi,
        thresholdValue: +r.threshold_value,
        operator: r.operator,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err) {
    console.error('Error in GET /api/settings/thresholds:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/settings/thresholds/:id ─────────────────────────
router.put('/thresholds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { thresholdValue, operator } = req.body;

    if (thresholdValue === undefined) {
      return res.status(400).json({ success: false, error: 'thresholdValue is required' });
    }

    const sets = ['threshold_value = $1', 'updated_at = NOW()'];
    const params = [thresholdValue];
    let idx = 2;

    if (operator) {
      sets.push(`operator = $${idx++}`);
      params.push(operator);
    }

    params.push(id);
    const result = await query(
      `UPDATE alert_thresholds SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Threshold not found' });
    }

    // Also update the threshold in the alerts table
    await query(
      'UPDATE alerts SET threshold = $1 WHERE id = $2',
      [thresholdValue, id]
    );

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        domain: result.rows[0].domain,
        kpi: result.rows[0].kpi,
        thresholdValue: +result.rows[0].threshold_value,
        operator: result.rows[0].operator,
        updatedAt: result.rows[0].updated_at,
      },
    });
  } catch (err) {
    console.error('Error updating threshold:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/settings/thresholds (bulk) ──────────────────────
router.put('/thresholds', async (req, res) => {
  try {
    const { thresholds } = req.body;
    
    if (!Array.isArray(thresholds)) {
      return res.status(400).json({ success: false, error: 'thresholds must be an array' });
    }

    const updated = [];
    for (const t of thresholds) {
      const result = await query(
        'UPDATE alert_thresholds SET threshold_value = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [t.thresholdValue, t.id]
      );
      if (result.rows.length > 0) {
        await query('UPDATE alerts SET threshold = $1 WHERE id = $2', [t.thresholdValue, t.id]);
        updated.push(result.rows[0]);
      }
    }

    res.json({ success: true, updated: updated.length });
  } catch (err) {
    console.error('Error bulk updating thresholds:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
