/**
 * Export Routes — CSV and PDF report generation
 * GET /api/export/:domain/csv   — download CSV report for a domain
 * GET /api/export/:domain/pdf   — download PDF report for a domain
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const PDFDocument = require('pdfkit');

// Domain-friendly names
const DOMAIN_NAMES = {
  revenue: 'Revenue',
  operations: 'Operations',
  orders: 'Orders & Menu',
  staff: 'Staff',
  customer: 'Customer Intelligence',
  inventory: 'Inventory & Waste',
  roi: 'ROI & Growth',
};

// Domain columns to export
const EXPORT_COLUMNS = {
  revenue: {
    columns: ['date', 'day_name', 'revenue_daily', 'revenue_target', 'revenue_attainment', 'revpash', 'avg_check', 'revenue_dine_in', 'revenue_delivery', 'revenue_takeaway', 'peak_capture', 'event_revenue'],
    headers: ['Date', 'Day', 'Revenue ($)', 'Target ($)', 'Attainment (%)', 'RevPASH ($/seat-hr)', 'Avg Check ($)', 'Dine-In ($)', 'Delivery ($)', 'Takeaway ($)', 'Peak Capture (%)', 'Event Revenue ($)'],
  },
  operations: {
    columns: ['date', 'day_name', 'table_turnover', 'dwell_time', 'ktt', 'delivery_time', 'seat_utilisation', 'dine_in_covers', 'delivery_orders', 'total_covers'],
    headers: ['Date', 'Day', 'Table Turnover', 'Dwell Time (min)', 'KTT (min)', 'Delivery Time (min)', 'Seat Utilisation (%)', 'Dine-In Covers', 'Delivery Orders', 'Total Covers'],
  },
  orders: {
    columns: ['date', 'day_name', 'order_error_rate', 'cancellation_rate', 'upsell_rate', 'item_86_count', 'bev_to_food_ratio'],
    headers: ['Date', 'Day', 'Error Rate (%)', 'Cancellation Rate (%)', 'Upsell Rate (%)', 'Item 86 Count', 'Bev:Food Ratio (%)'],
  },
  staff: {
    columns: ['date', 'day_name', 'staff_on_duty', 'staff_no_shows', 'foh_staff', 'boh_staff', 'total_staff_hours', 'labour_cost', 'labour_cost_pct', 'rplh', 'covers_per_server'],
    headers: ['Date', 'Day', 'Staff On Duty', 'No-Shows', 'FOH Staff', 'BOH Staff', 'Total Hours', 'Labour Cost ($)', 'Labour Cost (%)', 'RPLH ($)', 'Covers/Server'],
  },
  customer: {
    columns: ['date', 'day_name', 'nps', 'return_rate', 'review_score', 'review_count', 'clv', 'complaint_res_time', 'reservation_no_show'],
    headers: ['Date', 'Day', 'NPS', 'Return Rate (%)', 'Review Score', 'Reviews', 'CLV ($)', 'Complaint Res Time (min)', 'Reservation No-Show (%)'],
  },
  inventory: {
    columns: ['date', 'day_name', 'food_cost_pct', 'food_cost_value', 'waste_percent', 'waste_value', 'inventory_turnover', 'shrinkage_rate', 'supplier_on_time', 'portion_variance'],
    headers: ['Date', 'Day', 'Food Cost (%)', 'Food Cost ($)', 'Waste (%)', 'Waste ($)', 'Inv Turnover (x)', 'Shrinkage (%)', 'Supplier On-Time (%)', 'Portion Variance (%)'],
  },
  roi: {
    columns: ['date', 'day_name', 'prime_cost', 'ebitda', 'ebitda_margin', 'break_even_covers', 'cash_flow_runway', 'marketing_roi_social', 'marketing_roi_email', 'marketing_roi_local', 'loyalty_roi', 'delivery_commission', 'net_delivery_margin'],
    headers: ['Date', 'Day', 'Prime Cost (%)', 'EBITDA ($)', 'EBITDA Margin (%)', 'Break-Even Covers', 'Cash Flow Runway (days)', 'Marketing ROI Social (%)', 'Marketing ROI Email (%)', 'Marketing ROI Local (%)', 'Loyalty ROI (%)', 'Delivery Commission (%)', 'Net Delivery Margin (%)'],
  },
};

// ─── GET /api/export/:domain/csv ──────────────────────────────
router.get('/:domain/csv', async (req, res) => {
  try {
    const { domain } = req.params;
    const days = parseInt(req.query.days) || 30;

    if (!EXPORT_COLUMNS[domain]) {
      return res.status(400).json({ success: false, error: `Unknown domain: ${domain}` });
    }

    const config = EXPORT_COLUMNS[domain];
    const result = await query(
      `SELECT ${config.columns.join(', ')} FROM daily_kpi_data ORDER BY date DESC LIMIT $1`,
      [days]
    );

    // Build CSV
    const rows = result.rows.reverse();
    const csvHeader = config.headers.join(',');
    const csvRows = rows.map(row =>
      config.columns.map(col => {
        const val = row[col];
        if (val instanceof Date) return val.toISOString().split('T')[0];
        return val;
      }).join(',')
    );

    const csv = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${domain}_kpi_report_${days}d.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(`Error exporting ${req.params.domain} CSV:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/export/:domain/pdf ──────────────────────────────
router.get('/:domain/pdf', async (req, res) => {
  try {
    const { domain } = req.params;
    const days = parseInt(req.query.days) || 30;

    if (!EXPORT_COLUMNS[domain]) {
      return res.status(400).json({ success: false, error: `Unknown domain: ${domain}` });
    }

    const config = EXPORT_COLUMNS[domain];
    const domainName = DOMAIN_NAMES[domain];
    const result = await query(
      `SELECT ${config.columns.join(', ')} FROM daily_kpi_data ORDER BY date DESC LIMIT $1`,
      [days]
    );
    const rows = result.rows.reverse();

    // Create PDF
    const PDFTable = require('pdfkit-table');
    const doc = new PDFTable({ margin: 30, size: 'A4', layout: 'landscape' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${domain}_report_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    // ─── Header Section ──────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 60).fill('#1e293b');
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
       .text('Rasoi Master Intelligence', 40, 20);
    doc.fontSize(10).font('Helvetica')
       .text(`KPI Performance Report: ${domainName}`, 320, 25, { align: 'right', width: doc.page.width - 360 });
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, 320, 38, { align: 'right', width: doc.page.width - 360 });

    doc.fillColor('#334155').moveDown(4);

    // ─── Summary Analytics (Stats Grid) ──────────────────────────
    if (rows.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary (Last 30 Days)', 40);
      doc.moveDown(0.5);

      const numCols = config.columns.filter(c => c !== 'date' && c !== 'day_name');
      let currentX = 40;
      let currentY = doc.y;
      const boxWidth = 145;
      const boxHeight = 45;

      numCols.forEach((col, idx) => {
        // Line wrap after 5 boxes
        if (idx > 0 && idx % 5 === 0) {
          currentX = 40;
          currentY += boxHeight + 10;
        }

        const values = rows.map(r => parseFloat(r[col]) || 0);
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        const header = config.headers[config.columns.indexOf(col)];

        // Draw box
        doc.rect(currentX, currentY, boxWidth, boxHeight).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('#64748b').fontSize(7).text(header.toUpperCase(), currentX + 5, currentY + 8, { width: boxWidth - 10 });
        doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(avg.toFixed(1), currentX + 5, currentY + 20);
        
        currentX += boxWidth + 10;
      });

      doc.y = currentY + boxHeight + 20;
    }

    // ─── Detailed Data Table ─────────────────────────────────────
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Daily Performance Log', 40);
    doc.moveDown(0.5);

    // Prepare table data
    const tableData = {
      title: "",
      headers: config.headers,
      rows: rows.map(row => 
        config.columns.map(col => {
          let val = row[col];
          if (val instanceof Date) return val.toISOString().split('T')[0];
          return isNaN(val) ? val : parseFloat(val).toFixed(1);
        })
      ),
    };

    // Table styling
    await doc.table(tableData, {
      x: 40,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b'),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(8).fillColor('#334155');
        // Zebra striping
        if (indexRow % 2 === 0) {
          doc.rect(rectRow.x, rectRow.y, rectRow.width, rectRow.height).fill('#f1f5f9');
          // Re-draw text because fill covers it
          doc.fillColor('#334155');
        }
      },
      columnsSize: config.columns.map(() => (doc.page.width - 80) / config.columns.length)
    });

    // ─── Footer ──────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#94a3b8').text(
        `Page ${i + 1} of ${range.count} — Rasoi Master Intelligence Engine`,
        40, 
        doc.page.height - 40,
        { align: 'center' }
      );
    }

    doc.end();
  } catch (err) {
    console.error(`Error exporting ${req.params.domain} PDF:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
