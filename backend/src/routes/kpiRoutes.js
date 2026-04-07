/**
 * KPI Routes — serves aggregated KPI data per domain and trends
 * GET /api/kpis/:domain?range=today|week|month
 * GET /api/kpis/all?range=today|week|month
 * GET /api/trends?range=week|month
 * GET /api/hourly
 * GET /api/heatmaps/revpash
 * GET /api/heatmaps/deadslot
 * GET /api/menu
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

// ─── Helpers ──────────────────────────────────────────────────

function getRangeFilter(range) {
  switch (range) {
    case 'today': return 1;
    case 'week': return 7;
    case 'month': return 30;
    default: return 1;
  }
}

function getPrevRangeFilter(range) {
  switch (range) {
    case 'today': return { offset: 2, limit: 1 }; // yesterday
    case 'week': return { offset: 14, limit: 7 }; // previous week
    case 'month': return { offset: 60, limit: 30 }; // previous month
    default: return { offset: 2, limit: 1 };
  }
}

function calcTrend(curr, prev) {
  if (!prev || prev === 0) return { value: 0, direction: 'flat' };
  const change = ((curr - prev) / Math.abs(prev)) * 100;
  return {
    value: +Math.abs(change).toFixed(1),
    direction: change > 1 ? 'up' : change < -1 ? 'down' : 'flat',
  };
}

// Domain column mappings
const DOMAIN_COLUMNS = {
  revenue: [
    'revenue_daily', 'revenue_target', 'revenue_attainment', 'revpash', 'avg_check',
    'revenue_dine_in', 'revenue_delivery', 'revenue_takeaway',
    'dine_in_pct', 'delivery_pct', 'takeaway_pct',
    'peak_capture', 'event_revenue', 'event_pct',
  ],
  operations: [
    'table_turnover', 'dwell_time', 'ktt', 'delivery_time', 'seat_utilisation',
    'dine_in_covers', 'delivery_orders', 'total_covers',
  ],
  orders: [
    'order_error_rate', 'cancellation_rate', 'upsell_rate', 'item_86_count', 'bev_to_food_ratio',
  ],
  staff: [
    'staff_on_duty', 'staff_scheduled', 'staff_no_shows', 'staff_late_arrivals',
    'foh_staff', 'boh_staff', 'total_staff_hours', 'labour_cost',
    'labour_cost_pct', 'rplh', 'covers_per_server',
  ],
  customer: [
    'nps', 'return_rate', 'review_score', 'review_count', 'clv', 'complaint_res_time', 'reservation_no_show',
  ],
  inventory: [
    'food_cost_pct', 'food_cost_value', 'waste_percent', 'waste_value',
    'inventory_turnover', 'shrinkage_rate', 'supplier_on_time', 'portion_variance',
  ],
  roi: [
    'prime_cost', 'ebitda', 'ebitda_margin', 'break_even_covers', 'cash_flow_runway',
    'marketing_roi_social', 'marketing_roi_email', 'marketing_roi_local',
    'loyalty_roi', 'delivery_commission', 'net_delivery_margin',
  ],
};

// Sum vs average classification
const SUM_FIELDS = new Set([
  'revenue_daily', 'revenue_target', 'revenue_dine_in', 'revenue_delivery', 'revenue_takeaway',
  'event_revenue', 'total_covers', 'dine_in_covers', 'delivery_orders',
  'item_86_count', 'staff_no_shows', 'total_staff_hours', 'labour_cost',
  'food_cost_value', 'waste_value', 'ebitda', 'review_count',
]);

// ─── Format aggregated data to match frontend shape ───────────
function formatAggregated(rows, prevRows, range) {
  const len = rows.length || 1;
  const prevLen = prevRows.length || 1;

  const avg = (field) => rows.reduce((s, r) => s + parseFloat(r[field] || 0), 0) / len;
  const sum = (field) => rows.reduce((s, r) => s + parseFloat(r[field] || 0), 0);
  const prevAvg = (field) => prevRows.reduce((s, r) => s + parseFloat(r[field] || 0), 0) / prevLen;

  const val = (field) => SUM_FIELDS.has(field)
    ? (range === 'today' ? parseFloat(rows[0]?.[field] || 0) : Math.round(sum(field)))
    : +avg(field).toFixed(2);

  const trend = (field) => calcTrend(avg(field), prevRows.length > 0 ? prevAvg(field) : avg(field));

  return {
    revenue: {
      daily: val('revenue_daily'), target: val('revenue_target'),
      attainment: +avg('revenue_attainment').toFixed(1),
      revpash: +avg('revpash').toFixed(2), avgCheck: +avg('avg_check').toFixed(2),
      dineIn: val('revenue_dine_in'), delivery: val('revenue_delivery'), takeaway: val('revenue_takeaway'),
      dineInPct: +avg('dine_in_pct').toFixed(1), deliveryPct: +avg('delivery_pct').toFixed(1), takeawayPct: +avg('takeaway_pct').toFixed(1),
      peakCapture: +avg('peak_capture').toFixed(1),
      eventRevenue: val('event_revenue'), eventPct: +avg('event_pct').toFixed(1),
      trend: trend('revenue_daily'),
    },
    operations: {
      tableTurnover: +avg('table_turnover').toFixed(2),
      dwellTime: Math.round(avg('dwell_time')),
      ktt: +avg('ktt').toFixed(1),
      deliveryTime: +avg('delivery_time').toFixed(1),
      seatUtilisation: +avg('seat_utilisation').toFixed(1),
      totalCovers: val('total_covers'),
      dineInCovers: val('dine_in_covers'),
      deliveryOrders: val('delivery_orders'),
      kttTrend: trend('ktt'),
      turnoverTrend: trend('table_turnover'),
    },
    orders: {
      errorRate: +avg('order_error_rate').toFixed(2),
      cancellationRate: +avg('cancellation_rate').toFixed(2),
      upsellRate: +avg('upsell_rate').toFixed(1),
      item86Count: val('item_86_count'),
      bevToFoodRatio: +avg('bev_to_food_ratio').toFixed(1),
      errorTrend: trend('order_error_rate'),
    },
    staff: {
      labourCostPct: +avg('labour_cost_pct').toFixed(1),
      rplh: +avg('rplh').toFixed(2),
      coversPerServer: +avg('covers_per_server').toFixed(1),
      noShows: val('staff_no_shows'),
      totalHours: val('total_staff_hours'),
      labourCost: val('labour_cost'),
      labourTrend: trend('labour_cost_pct'),
    },
    customer: {
      nps: Math.round(avg('nps')),
      returnRate: +avg('return_rate').toFixed(1),
      reviewScore: +avg('review_score').toFixed(2),
      reviewCount: val('review_count'),
      clv: Math.round(avg('clv')),
      complaintResTime: Math.round(avg('complaint_res_time')),
      reservationNoShow: +avg('reservation_no_show').toFixed(1),
      npsTrend: trend('nps'),
    },
    inventory: {
      foodCostPct: +avg('food_cost_pct').toFixed(1),
      foodCostValue: val('food_cost_value'),
      wastePercent: +avg('waste_percent').toFixed(2),
      wasteValue: val('waste_value'),
      inventoryTurnover: +avg('inventory_turnover').toFixed(1),
      shrinkageRate: +avg('shrinkage_rate').toFixed(2),
      supplierOnTime: +avg('supplier_on_time').toFixed(1),
      portionVariance: +avg('portion_variance').toFixed(1),
      wasteTrend: trend('waste_percent'),
    },
    roi: {
      primeCost: +avg('prime_cost').toFixed(1),
      ebitda: val('ebitda'),
      ebitdaMargin: +avg('ebitda_margin').toFixed(1),
      breakEvenCovers: Math.round(avg('break_even_covers')),
      cashFlowRunway: Math.round(avg('cash_flow_runway')),
      marketingRoi: {
        social: +avg('marketing_roi_social').toFixed(0),
        email: +avg('marketing_roi_email').toFixed(0),
        local: +avg('marketing_roi_local').toFixed(0),
      },
      loyaltyRoi: +avg('loyalty_roi').toFixed(1),
      deliveryCommission: +avg('delivery_commission').toFixed(1),
      netDeliveryMargin: +avg('net_delivery_margin').toFixed(1),
      primeCostTrend: trend('prime_cost'),
    },
  };
}

// ─── GET /api/kpis/all ────────────────────────────────────────
router.get('/kpis/all', async (req, res) => {
  try {
    const range = req.query.range || 'today';
    const days = getRangeFilter(range);
    const prev = getPrevRangeFilter(range);

    const current = await query(
      'SELECT * FROM daily_kpi_data ORDER BY date DESC LIMIT $1', [days]
    );
    const previous = await query(
      'SELECT * FROM daily_kpi_data ORDER BY date DESC OFFSET $1 LIMIT $2', [prev.offset, prev.limit]
    );

    const aggregated = formatAggregated(current.rows.reverse(), previous.rows.reverse(), range);
    res.json({ success: true, data: aggregated, range, days: current.rows.length });
  } catch (err) {
    console.error('Error in /api/kpis/all:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/kpis/:domain ────────────────────────────────────
router.get('/kpis/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const range = req.query.range || 'today';
    
    if (!DOMAIN_COLUMNS[domain]) {
      return res.status(400).json({ success: false, error: `Unknown domain: ${domain}` });
    }

    const days = getRangeFilter(range);
    const prev = getPrevRangeFilter(range);
    const cols = DOMAIN_COLUMNS[domain].join(', ');

    const current = await query(
      `SELECT date, day_name, ${cols} FROM daily_kpi_data ORDER BY date DESC LIMIT $1`, [days]
    );
    const previous = await query(
      `SELECT date, day_name, ${cols} FROM daily_kpi_data ORDER BY date DESC OFFSET $1 LIMIT $2`, [prev.offset, prev.limit]
    );

    const aggregated = formatAggregated(current.rows.reverse(), previous.rows.reverse(), range);
    res.json({ success: true, data: aggregated[domain], range, rawDays: current.rows.reverse() });
  } catch (err) {
    console.error(`Error in /api/kpis/${req.params.domain}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/trends ──────────────────────────────────────────
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = await query(
      'SELECT date, day_name, revenue_daily, revenue_target, revpash, ktt, food_cost_pct, labour_cost_pct, nps, ebitda_margin FROM daily_kpi_data ORDER BY date DESC LIMIT $1',
      [days]
    );
    res.json({ success: true, data: result.rows.reverse() });
  } catch (err) {
    console.error('Error in /api/trends:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/daily (raw daily data for charts) ───────────────
router.get('/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const result = await query(
      'SELECT * FROM daily_kpi_data ORDER BY date DESC LIMIT $1', [days]
    );
    
    // Transform to frontend-compatible shape
    const data = result.rows.reverse().map(row => ({
      date: row.date,
      dow: row.dow,
      dayName: row.day_name,
      revenue: {
        daily: +row.revenue_daily, target: +row.revenue_target,
        attainment: +row.revenue_attainment, revpash: +row.revpash, avgCheck: +row.avg_check,
        dineIn: +row.revenue_dine_in, delivery: +row.revenue_delivery, takeaway: +row.revenue_takeaway,
        dineInPct: +row.dine_in_pct, deliveryPct: +row.delivery_pct, takeawayPct: +row.takeaway_pct,
        peakCapture: +row.peak_capture, eventRevenue: +row.event_revenue, eventPct: +row.event_pct,
      },
      operations: {
        tableTurnover: +row.table_turnover, dwellTime: +row.dwell_time,
        ktt: +row.ktt, deliveryTime: +row.delivery_time, seatUtilisation: +row.seat_utilisation,
        dineInCovers: +row.dine_in_covers, deliveryOrders: +row.delivery_orders, totalCovers: +row.total_covers,
      },
      orders: {
        errorRate: +row.order_error_rate, cancellationRate: +row.cancellation_rate,
        upsellRate: +row.upsell_rate, item86Count: +row.item_86_count, bevToFoodRatio: +row.bev_to_food_ratio,
      },
      staff: {
        staffOnDuty: +row.staff_on_duty, scheduled: +row.staff_scheduled,
        noShows: +row.staff_no_shows, lateArrivals: +row.staff_late_arrivals,
        fohStaff: +row.foh_staff, bohStaff: +row.boh_staff,
        totalHours: +row.total_staff_hours, labourCost: +row.labour_cost,
        labourCostPct: +row.labour_cost_pct, rplh: +row.rplh, coversPerServer: +row.covers_per_server,
      },
      customer: {
        nps: +row.nps, returnRate: +row.return_rate, reviewScore: +row.review_score,
        reviewCount: +row.review_count, clv: +row.clv, complaintResTime: +row.complaint_res_time,
        reservationNoShow: +row.reservation_no_show,
      },
      inventory: {
        foodCostPct: +row.food_cost_pct, foodCostValue: +row.food_cost_value,
        wastePercent: +row.waste_percent, wasteValue: +row.waste_value,
        inventoryTurnover: +row.inventory_turnover, shrinkageRate: +row.shrinkage_rate,
        supplierOnTime: +row.supplier_on_time, portionVariance: +row.portion_variance,
      },
      roi: {
        primeCost: +row.prime_cost, ebitda: +row.ebitda, ebitdaMargin: +row.ebitda_margin,
        breakEvenCovers: +row.break_even_covers, cashFlowRunway: +row.cash_flow_runway,
        marketingRoi: {
          social: +row.marketing_roi_social, email: +row.marketing_roi_email, local: +row.marketing_roi_local,
        },
        loyaltyRoi: +row.loyalty_roi, deliveryCommission: +row.delivery_commission,
        netDeliveryMargin: +row.net_delivery_margin,
      },
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error in /api/daily:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/hourly ──────────────────────────────────────────
router.get('/hourly', async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM hourly_kpi_data WHERE date = CURRENT_DATE ORDER BY hour"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error in /api/hourly:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/heatmaps/revpash ────────────────────────────────
router.get('/heatmaps/revpash', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM revpash_heatmap ORDER BY date, hour'
    );
    // Group by date
    const grouped = {};
    result.rows.forEach(r => {
      const key = r.date;
      if (!grouped[key]) grouped[key] = { day: r.day_name, date: r.date, hours: [] };
      grouped[key].hours.push({ hour: r.hour, value: +r.value });
    });
    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    console.error('Error in /api/heatmaps/revpash:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/heatmaps/deadslot ───────────────────────────────
router.get('/heatmaps/deadslot', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM dead_slot_heatmap ORDER BY date, slot'
    );
    res.json({ success: true, data: result.rows.map(r => ({
      day: r.day_name, date: r.date, slot: r.slot, revenue: +r.revenue, isDeadSlot: r.is_dead_slot,
    })) });
  } catch (err) {
    console.error('Error in /api/heatmaps/deadslot:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/menu ────────────────────────────────────────────
router.get('/menu', async (req, res) => {
  try {
    const result = await query('SELECT * FROM menu_items ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error in /api/menu:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/staff ───────────────────────────────────────────
router.get('/staff', async (req, res) => {
  try {
    const result = await query('SELECT * FROM staff_members ORDER BY id');
    const totalStaff = result.rows.length;
    const leftInYear = Math.floor(totalStaff * 0.22);
    const avgTrainingHours = result.rows.reduce((s, m) => s + parseFloat(m.training_hours_month), 0) / totalStaff;
    res.json({
      success: true,
      data: {
        members: result.rows,
        metrics: {
          totalStaff,
          fullTime: result.rows.filter(s => s.type === 'full-time').length,
          partTime: result.rows.filter(s => s.type === 'part-time').length,
          turnoverRate: ((leftInYear / totalStaff) * 100).toFixed(1),
          avgTrainingHours: avgTrainingHours.toFixed(1),
          leftInYear,
        },
      },
    });
  } catch (err) {
    console.error('Error in /api/staff:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
