/**
 * Seed script: Generates 90 days of realistic F&B KPI data
 * Mirrors the logic from frontend/src/data/mockDataGenerator.js
 * Seeds PostgreSQL with daily_kpi_data, hourly_kpi_data, menu_items,
 * staff_members, alerts, alert_thresholds, revpash_heatmap, dead_slot_heatmap.
 */
const { pool } = require('./database');

// ─── Utility Functions ────────────────────────────────────────
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function lerp(min, max, t) { return min + (max - min) * t; }
function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }
function jitter(val, pct, rng) { return val * (1 + (rng() - 0.5) * 2 * pct); }

const WEEKDAY_MULTIPLIERS = [0.72, 0.78, 0.85, 0.88, 1.0, 1.18, 1.12]; // Sun-Sat
const HOUR_WEIGHTS = [0,0,0,0,0,0,0,0,0,0,0, 0.5, 0.9, 0.85, 0.4, 0.3, 0.3, 0.35, 0.6, 1.0, 0.95, 0.7, 0.4, 0.15];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── Business Profile ─────────────────────────────────────────
const BUSINESS = {
  seatingCapacity: 60,
  hoursPerDay: 12,
  averageCheck: { dineIn: 28, delivery: 22 },
};

// ─── Staff Data ───────────────────────────────────────────────
const ROLES_LIST = [
  'Server','Server','Server','Server','Server','Server',
  'Host','Host','Bartender','Bartender',
  'Head Chef','Sous Chef','Line Cook','Line Cook','Line Cook','Prep Cook',
  'Dishwasher','Dishwasher',
  'Manager','Delivery Coordinator','Busser','Busser',
];
const FIRST_NAMES = [
  'Alex','Jordan','Sam','Taylor','Morgan','Casey','Riley','Jamie','Avery','Quinn',
  'Cameron','Drew','Skyler','Reese','Finley','Sage','Rowan','Dakota','Eden','Blake','Kendall','Hayden',
];

function getHourlyRate(role, isFullTime, rng) {
  const base = {
    'Server':12,'Host':13,'Bartender':15,'Head Chef':28,'Sous Chef':22,
    'Line Cook':16,'Prep Cook':14,'Dishwasher':11,'Manager':25,
    'Delivery Coordinator':14,'Busser':11,
  };
  return (base[role] || 12) + (isFullTime ? 2 : 0) + rng() * 2;
}

function getHireDate(index) {
  const monthsAgo = index < 8 ? 12 + Math.floor(Math.random() * 24) : Math.floor(Math.random() * 12);
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().split('T')[0];
}

const FOH_ROLES = ['Server','Host','Bartender','Busser','Manager'];
const BOH_ROLES = ['Head Chef','Sous Chef','Line Cook','Prep Cook','Dishwasher'];

function generateDailyStaffSchedule(dateStr, staffMembers) {
  const dow = new Date(dateStr).getDay();
  const isWeekend = dow === 0 || dow === 5 || dow === 6;
  const staffOnDuty = isWeekend ? 16 : 12;
  const rng = seededRandom(new Date(dateStr).getTime() / 43200000 | 0);
  // Deterministic shuffle for seeding
  const shuffled = [...staffMembers].sort((a, b) => rng() - 0.5);
  const scheduled = shuffled.slice(0, staffOnDuty);
  const noShows = rng() < 0.08 ? 1 : 0;
  const lateArrivals = rng() < 0.15 ? 1 : 0;
  return {
    staffOnDuty: staffOnDuty - noShows,
    scheduled: scheduled.length,
    noShows,
    lateArrivals,
    fohStaff: scheduled.filter(s => FOH_ROLES.includes(s.role)).length,
    bohStaff: scheduled.filter(s => BOH_ROLES.includes(s.role)).length,
    totalHours: scheduled.reduce((sum, s) => sum + s.avgHoursPerShift, 0) - (noShows * 6),
    labourCost: scheduled.reduce((sum, s) => sum + (s.hourlyRate * s.avgHoursPerShift), 0) - (noShows * 70),
  };
}

// ─── Menu Item Data ───────────────────────────────────────────
const MENU_ITEMS = [
  { name:'Truffle Mushroom Risotto',category:'Pasta & Risotto',sellPrice:24,foodCost:6.50,popularity:88,quadrant:'star'},
  { name:'Grilled Salmon Fillet',category:'Grill',sellPrice:32,foodCost:9.20,popularity:92,quadrant:'star'},
  { name:'Crispy Calamari',category:'Starters',sellPrice:16,foodCost:3.80,popularity:85,quadrant:'star'},
  { name:'Wagyu Beef Burger',category:'Mains',sellPrice:28,foodCost:8.40,popularity:90,quadrant:'star'},
  { name:'Chocolate Lava Cake',category:'Desserts',sellPrice:14,foodCost:3.20,popularity:82,quadrant:'star'},
  { name:'Garlic Prawns',category:'Starters',sellPrice:18,foodCost:5.10,popularity:80,quadrant:'star'},
  { name:'Signature Cocktail',category:'Beverages',sellPrice:16,foodCost:3.50,popularity:86,quadrant:'star'},
  { name:'Chicken Tikka Bowl',category:'Mains',sellPrice:22,foodCost:5.80,popularity:84,quadrant:'star'},
  { name:'Caesar Salad',category:'Starters',sellPrice:15,foodCost:3.40,popularity:78,quadrant:'star'},
  { name:'Panna Cotta',category:'Desserts',sellPrice:12,foodCost:2.80,popularity:76,quadrant:'star'},
  { name:'Classic Margherita Pizza',category:'Mains',sellPrice:16,foodCost:6.20,popularity:94,quadrant:'plowhorse'},
  { name:'Fish & Chips',category:'Mains',sellPrice:18,foodCost:7.80,popularity:88,quadrant:'plowhorse'},
  { name:'Spaghetti Bolognese',category:'Pasta & Risotto',sellPrice:17,foodCost:6.50,popularity:86,quadrant:'plowhorse'},
  { name:'Chicken Wings (12pc)',category:'Starters',sellPrice:15,foodCost:6.40,popularity:90,quadrant:'plowhorse'},
  { name:'House Burger',category:'Mains',sellPrice:16,foodCost:6.80,popularity:82,quadrant:'plowhorse'},
  { name:'Garlic Bread',category:'Starters',sellPrice:8,foodCost:3.50,popularity:92,quadrant:'plowhorse'},
  { name:'Soft Drink',category:'Beverages',sellPrice:4,foodCost:1.80,popularity:96,quadrant:'plowhorse'},
  { name:'Fries & Dip',category:'Starters',sellPrice:9,foodCost:3.90,popularity:88,quadrant:'plowhorse'},
  { name:'Iced Tea',category:'Beverages',sellPrice:5,foodCost:2.20,popularity:80,quadrant:'plowhorse'},
  { name:'Cheese Nachos',category:'Starters',sellPrice:12,foodCost:5.10,popularity:84,quadrant:'plowhorse'},
  { name:'Tap Beer',category:'Beverages',sellPrice:7,foodCost:3.10,popularity:90,quadrant:'plowhorse'},
  { name:'Lobster Thermidor',category:'Grill',sellPrice:48,foodCost:14.00,popularity:22,quadrant:'puzzle'},
  { name:'Duck Confit',category:'Mains',sellPrice:36,foodCost:10.80,popularity:28,quadrant:'puzzle'},
  { name:'Saffron Seafood Paella',category:'Mains',sellPrice:34,foodCost:9.80,popularity:32,quadrant:'puzzle'},
  { name:'Crème Brûlée',category:'Desserts',sellPrice:14,foodCost:3.20,popularity:35,quadrant:'puzzle'},
  { name:'Lamb Rack',category:'Grill',sellPrice:42,foodCost:12.60,popularity:26,quadrant:'puzzle'},
  { name:'Aged Negroni',category:'Beverages',sellPrice:18,foodCost:4.20,popularity:30,quadrant:'puzzle'},
  { name:'Burrata Salad',category:'Starters',sellPrice:17,foodCost:4.50,popularity:34,quadrant:'puzzle'},
  { name:'Truffle Fries',category:'Starters',sellPrice:14,foodCost:3.60,popularity:38,quadrant:'puzzle'},
  { name:'Premium Wine Glass',category:'Beverages',sellPrice:22,foodCost:5.80,popularity:24,quadrant:'puzzle'},
  { name:'Tiramisu',category:'Desserts',sellPrice:13,foodCost:3.10,popularity:40,quadrant:'puzzle'},
  { name:'Vegetable Soup',category:'Starters',sellPrice:9,foodCost:3.80,popularity:18,quadrant:'dog'},
  { name:'Plain Grilled Chicken',category:'Grill',sellPrice:18,foodCost:7.60,popularity:20,quadrant:'dog'},
  { name:'House Salad',category:'Starters',sellPrice:10,foodCost:4.20,popularity:16,quadrant:'dog'},
  { name:'Steamed Rice Bowl',category:'Mains',sellPrice:12,foodCost:5.40,popularity:14,quadrant:'dog'},
  { name:'Fruit Platter',category:'Desserts',sellPrice:10,foodCost:4.80,popularity:12,quadrant:'dog'},
  { name:'Sparkling Water',category:'Beverages',sellPrice:5,foodCost:2.40,popularity:22,quadrant:'dog'},
  { name:'Mixed Greens Wrap',category:'Mains',sellPrice:14,foodCost:6.20,popularity:15,quadrant:'dog'},
  { name:'Onion Rings',category:'Starters',sellPrice:8,foodCost:3.60,popularity:24,quadrant:'dog'},
  { name:'Lemon Sorbet',category:'Desserts',sellPrice:8,foodCost:3.20,popularity:10,quadrant:'dog'},
  { name:'Club Sandwich',category:'Mains',sellPrice:14,foodCost:6.40,popularity:26,quadrant:'dog'},
  { name:'Mineral Water',category:'Beverages',sellPrice:3,foodCost:1.60,popularity:28,quadrant:'dog'},
];

// ─── Alert Definitions ────────────────────────────────────────
const ALERT_DEFINITIONS = [
  { id:'revpash_drop',domain:'revenue',kpi:'RevPASH',severity:'warning',condition:'RevPASH drops >15% vs same weekday last week',threshold:15,action:'Review staffing levels and check if any promotions are running on competitor platforms. Consider launching a flash lunch deal.'},
  { id:'peak_revenue_low',domain:'revenue',kpi:'Peak Hour Revenue Capture Rate',severity:'warning',condition:'Peak 2hr revenue below 35% of daily revenue',threshold:35,action:'Investigate kitchen bottleneck during peak hours. Check if table turnover is below target and consider adding a peak-hour prix fixe.'},
  { id:'dwell_time_high',domain:'operations',kpi:'Average Table Dwell Time',severity:'info',condition:'Dwell time exceeds target by >20 min during peak',threshold:20,action:'Prompt servers to present dessert menus and checks proactively. Consider incentivising quicker table turns during peak.'},
  { id:'ktt_high',domain:'operations',kpi:'Kitchen Ticket Time',severity:'critical',condition:'Average KTT exceeds 22 minutes',threshold:22,action:'Immediately check kitchen line status. Reassign prep staff to hot line. Consider 86-ing complex items temporarily.'},
  { id:'delivery_time_high',domain:'operations',kpi:'Order to Delivery Time',severity:'critical',condition:'Rolling 30-min avg delivery time >40 min',threshold:40,action:'PAUSE incoming delivery orders for 15 minutes. Prioritise in-queue delivery tickets. Notify delivery coordinator.'},
  { id:'order_error_high',domain:'orders',kpi:'Order Error Rate',severity:'warning',condition:'Order error rate >2% in any shift',threshold:2,action:'Schedule immediate shift debrief. Review POS order entry process. Check if any new menu items have confusing names or modifiers.'},
  { id:'cancellation_spike',domain:'orders',kpi:'Cancellation Rate',severity:'critical',condition:'Cancellation rate spike >5% in 2-hour window',threshold:5,action:'Identify cancellation source (dine-in vs delivery). Check wait times and kitchen delays. If delivery, review platform status.'},
  { id:'rplh_drop',domain:'staff',kpi:'Revenue Per Labour Hour',severity:'warning',condition:'RPLH drops >10% vs last month same volume',threshold:10,action:'Review shift schedules for overstaffing. Cross-check daily covers against staff hours. Consider adjusting part-time schedule.'},
  { id:'staff_noshow',domain:'staff',kpi:'No-Show Rate',severity:'critical',condition:'Unplanned absence detected 2hrs before shift start',threshold:2,action:'Activate on-call staff immediately. Reassign section responsibilities. Notify manager for coverage.'},
  { id:'review_negative',domain:'customer',kpi:'Online Review Score',severity:'critical',condition:'1–2 star review received on any platform',threshold:2,action:'Respond publicly within 1 hour. Identify the service/dish mentioned. Log for weekly review meeting.'},
  { id:'complaint_unresolved',domain:'customer',kpi:'Complaint Resolution Time',severity:'warning',condition:'Complaint unresolved after 20 min in-house / 4hr online',threshold:20,action:'Escalate to manager immediately. Offer complimentary item or discount. Document resolution for team learning.'},
  { id:'food_waste_high',domain:'inventory',kpi:'Food Waste %',severity:'critical',condition:'Daily waste value exceeds pre-set threshold (>5%)',threshold:5,action:'Conduct same-day waste audit. Identify top waste categories. Adjust prep quantities for next service. Review portion sizes.'},
  { id:'shrinkage_high',domain:'inventory',kpi:'Shrinkage Rate',severity:'warning',condition:'Weekly variance >2% on high-value category',threshold:2,action:'Conduct immediate stock count on flagged category. Review receiving logs. Check for spoilage or theft patterns.'},
  { id:'cashflow_low',domain:'roi',kpi:'Cash Flow Runway',severity:'critical',condition:'Cash flow runway drops below 21 days',threshold:21,action:'Freeze non-essential purchases. Review upcoming payment obligations. Schedule urgent meeting with accountant.'},
  { id:'delivery_margin_low',domain:'roi',kpi:'Delivery Platform Commission',severity:'warning',condition:'Net delivery margin below 8%',threshold:8,action:'Review delivery menu pricing. Consider adding a delivery surcharge. Evaluate which platforms are worth continuing.'},
  { id:'food_cost_high',domain:'inventory',kpi:'Food Cost %',severity:'warning',condition:'Food cost % exceeds 36%',threshold:36,action:'Review supplier invoices for price increases. Check portion control compliance. Audit high-cost menu items.'},
  { id:'labour_cost_high',domain:'staff',kpi:'Labour Cost %',severity:'warning',condition:'Labour cost % exceeds 38%',threshold:38,action:'Review overtime hours. Adjust part-time scheduling. Consider cross-training staff for multi-role flexibility.'},
  { id:'nps_low',domain:'customer',kpi:'NPS',severity:'warning',condition:'NPS drops below 40',threshold:40,action:'Survey recent customers. Review recent service complaints. Schedule team training session on customer service.'},
];

// ─── Seed Functions ───────────────────────────────────────────

async function seedStaffMembers(client) {
  console.log('  → Seeding staff_members...');
  await client.query('TRUNCATE staff_members RESTART IDENTITY CASCADE');
  const rng = seededRandom(42);
  for (let i = 0; i < FIRST_NAMES.length; i++) {
    const isFullTime = i < 14;
    const rate = getHourlyRate(ROLES_LIST[i], isFullTime, rng);
    await client.query(
      `INSERT INTO staff_members (name, role, type, hourly_rate, hire_date, shifts_per_week, avg_hours_per_shift, training_hours_month)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [FIRST_NAMES[i], ROLES_LIST[i], isFullTime ? 'full-time' : 'part-time',
       rate.toFixed(2), getHireDate(i), isFullTime ? 5 : 3, isFullTime ? 8 : 5, 4 + Math.floor(rng() * 5)]
    );
  }
  console.log(`    ✅ ${FIRST_NAMES.length} staff members seeded.`);
}

async function seedMenuItems(client) {
  console.log('  → Seeding menu_items...');
  await client.query('TRUNCATE menu_items RESTART IDENTITY CASCADE');
  for (const item of MENU_ITEMS) {
    await client.query(
      `INSERT INTO menu_items (name, category, sell_price, food_cost, popularity, quadrant)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [item.name, item.category, item.sellPrice, item.foodCost, item.popularity, item.quadrant]
    );
  }
  console.log(`    ✅ ${MENU_ITEMS.length} menu items seeded.`);
}

async function seedAlertDefinitions(client) {
  console.log('  → Seeding alerts & thresholds...');
  await client.query('TRUNCATE alerts RESTART IDENTITY CASCADE');
  await client.query('TRUNCATE alert_thresholds RESTART IDENTITY CASCADE');

  const now = new Date();
  // Seed some pre-triggered alerts
  const preTriggered = ['delivery_time_high','food_waste_high','review_negative','cashflow_low','food_cost_high'];
  
  for (const def of ALERT_DEFINITIONS) {
    const isTriggered = preTriggered.includes(def.id);
    const triggeredAt = isTriggered
      ? new Date(now.getTime() - (preTriggered.indexOf(def.id) * 15 + 5) * 60000).toISOString()
      : null;

    await client.query(
      `INSERT INTO alerts (id, domain, kpi, severity, condition_text, threshold, action_text, triggered_at, acknowledged, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET triggered_at=EXCLUDED.triggered_at, active=EXCLUDED.active`,
      [def.id, def.domain, def.kpi, def.severity, def.condition, def.threshold, def.action,
       triggeredAt, isTriggered && preTriggered.indexOf(def.id) > 2, isTriggered]
    );

    // Seed configurable threshold
    await client.query(
      `INSERT INTO alert_thresholds (id, domain, kpi, threshold_value)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO NOTHING`,
      [def.id, def.domain, def.kpi, def.threshold]
    );
  }
  console.log(`    ✅ ${ALERT_DEFINITIONS.length} alerts & thresholds seeded.`);
}

async function seedDailyKpiData(client, staffMembers) {
  console.log('  → Seeding daily_kpi_data (90 days)...');
  await client.query('TRUNCATE daily_kpi_data RESTART IDENTITY CASCADE');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dow = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    const rng = seededRandom(date.getTime() / 86400000 | 0);
    const wMul = WEEKDAY_MULTIPLIERS[dow];

    // Revenue
    const baseRevenue = 6000;
    const dailyRevenue = clamp(jitter(baseRevenue * wMul, 0.12, rng), 4200, 9200);
    const dineInPct = lerp(0.55, 0.65, rng());
    const deliveryPct = lerp(0.22, 0.32, rng());
    const takeawayPct = 1 - dineInPct - deliveryPct;
    const dineInRev = dailyRevenue * dineInPct;
    const deliveryRev = dailyRevenue * deliveryPct;
    const takeawayRev = dailyRevenue * takeawayPct;
    const revpash = dailyRevenue / (BUSINESS.seatingCapacity * BUSINESS.hoursPerDay);
    const dineInCovers = Math.round(dineInRev / BUSINESS.averageCheck.dineIn);
    const deliveryOrders = Math.round(deliveryRev / BUSINESS.averageCheck.delivery);
    const totalCovers = dineInCovers + deliveryOrders;
    const avgCheck = dailyRevenue / totalCovers;
    const peakRevenue = dailyRevenue * lerp(0.32, 0.42, rng());
    const peakCapture = (peakRevenue / dailyRevenue) * 100;
    const hasEvent = rng() < 0.15;
    const eventRevenue = hasEvent ? lerp(800, 2500, rng()) : 0;
    const eventPct = (eventRevenue / (dailyRevenue + eventRevenue)) * 100;

    // Operations
    const tableTurnover = clamp(jitter(3.2 * wMul, 0.1, rng), 2.0, 4.5);
    const dwellTime = clamp(jitter(52, 0.15, rng), 38, 78);
    const kitchenTicketTime = clamp(jitter(12, 0.15, rng), 9, 18);
    const deliveryTime = clamp(jitter(32, 0.12, rng), 28, 42);
    const seatUtil = clamp(jitter(0.72 * wMul, 0.1, rng), 0.45, 0.92);

    // Orders
    const orderErrorRate = clamp(jitter(1.2, 0.3, rng), 0.4, 2.8);
    const cancellationRate = clamp(jitter(2.2, 0.3, rng), 0.8, 5.5);
    const upsellRate = clamp(jitter(40, 0.15, rng), 28, 52);
    const item86Count = Math.floor(rng() * 3);
    const bevToFoodRatio = clamp(jitter(34, 0.1, rng), 28, 42);

    // Staff
    const schedule = generateDailyStaffSchedule(dateStr, staffMembers);
    const labourCostPct = (schedule.labourCost / dailyRevenue) * 100;
    const rplh = dailyRevenue / schedule.totalHours;
    const coversPerServer = totalCovers / Math.max(schedule.fohStaff, 1);

    // Customer
    const nps = clamp(Math.round(jitter(58, 0.15, rng)), 38, 78);
    const returnRate = clamp(jitter(44, 0.1, rng), 32, 56);
    const reviewScore = clamp(jitter(4.4, 0.05, rng), 3.8, 4.9);
    const reviewCount = Math.floor(lerp(1, 6, rng()));
    const clvVal = clamp(jitter(420, 0.1, rng), 320, 560);
    const complaintResTime = clamp(jitter(14, 0.2, rng), 6, 28);
    const reservationNoShow = clamp(jitter(6, 0.3, rng), 2, 14);

    // Inventory
    const foodCostPct = clamp(jitter(31, 0.08, rng), 28, 37);
    const foodCostValue = dailyRevenue * foodCostPct / 100;
    const wastePercent = clamp(jitter(3.2, 0.2, rng), 1.8, 6.0);
    const wasteValue = foodCostValue * wastePercent / 100;
    const inventoryTurnover = clamp(jitter(5.5, 0.15, rng), 4, 8);
    const shrinkageRate = clamp(jitter(0.8, 0.3, rng), 0.2, 2.5);
    const supplierOnTime = clamp(jitter(96, 0.03, rng), 88, 100);
    const portionVariance = clamp(jitter(3.5, 0.2, rng), 1.0, 7.0);

    // ROI & Growth
    const primeCost = labourCostPct + foodCostPct;
    const opex = dailyRevenue * lerp(0.08, 0.12, rng());
    const ebitda = dailyRevenue - foodCostValue - schedule.labourCost - opex;
    const ebitdaMargin = (ebitda / dailyRevenue) * 100;
    const breakEvenCovers = Math.round(lerp(85, 110, rng()));
    const cashFlowRunway = clamp(Math.round(jitter(38, 0.2, rng)), 15, 60);
    const mktSocial = lerp(180, 350, rng());
    const mktEmail = lerp(250, 500, rng());
    const mktLocal = lerp(120, 280, rng());
    const loyaltyRoi = lerp(15, 30, rng());
    const deliveryCommission = lerp(18, 30, rng());
    const netDeliveryMargin = ((deliveryRev * (1 - deliveryCommission / 100)) - (deliveryRev * foodCostPct / 100)) / deliveryRev * 100;

    const revenueTarget = Math.round(baseRevenue * wMul * 1.05);
    const attainment = ((dailyRevenue / revenueTarget) * 100);

    await client.query(
      `INSERT INTO daily_kpi_data (
        date, dow, day_name,
        revenue_daily, revenue_target, revenue_attainment, revpash, avg_check,
        revenue_dine_in, revenue_delivery, revenue_takeaway,
        dine_in_pct, delivery_pct, takeaway_pct,
        peak_capture, event_revenue, event_pct,
        table_turnover, dwell_time, ktt, delivery_time, seat_utilisation,
        dine_in_covers, delivery_orders, total_covers,
        order_error_rate, cancellation_rate, upsell_rate, item_86_count, bev_to_food_ratio,
        staff_on_duty, staff_scheduled, staff_no_shows, staff_late_arrivals,
        foh_staff, boh_staff, total_staff_hours, labour_cost,
        labour_cost_pct, rplh, covers_per_server,
        nps, return_rate, review_score, review_count, clv, complaint_res_time, reservation_no_show,
        food_cost_pct, food_cost_value, waste_percent, waste_value,
        inventory_turnover, shrinkage_rate, supplier_on_time, portion_variance,
        prime_cost, ebitda, ebitda_margin, break_even_covers, cash_flow_runway,
        marketing_roi_social, marketing_roi_email, marketing_roi_local,
        loyalty_roi, delivery_commission, net_delivery_margin
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,
        $39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,
        $57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67
      )`,
      [
        dateStr, dow, DAY_NAMES[dow],
        dailyRevenue.toFixed(2), revenueTarget, attainment.toFixed(1), revpash.toFixed(2), avgCheck.toFixed(2),
        dineInRev.toFixed(2), deliveryRev.toFixed(2), takeawayRev.toFixed(2),
        (dineInPct*100).toFixed(1), (deliveryPct*100).toFixed(1), (takeawayPct*100).toFixed(1),
        peakCapture.toFixed(1), eventRevenue.toFixed(2), eventPct.toFixed(1),
        tableTurnover.toFixed(2), Math.round(dwellTime), kitchenTicketTime.toFixed(1), deliveryTime.toFixed(1), (seatUtil*100).toFixed(1),
        dineInCovers, deliveryOrders, totalCovers,
        orderErrorRate.toFixed(2), cancellationRate.toFixed(2), upsellRate.toFixed(1), item86Count, bevToFoodRatio.toFixed(1),
        schedule.staffOnDuty, schedule.scheduled, schedule.noShows, schedule.lateArrivals,
        schedule.fohStaff, schedule.bohStaff, schedule.totalHours.toFixed(1), schedule.labourCost.toFixed(2),
        labourCostPct.toFixed(1), rplh.toFixed(2), coversPerServer.toFixed(1),
        nps, returnRate.toFixed(1), reviewScore.toFixed(2), reviewCount, Math.round(clvVal), Math.round(complaintResTime), reservationNoShow.toFixed(1),
        foodCostPct.toFixed(1), foodCostValue.toFixed(2), wastePercent.toFixed(2), wasteValue.toFixed(2),
        inventoryTurnover.toFixed(1), shrinkageRate.toFixed(2), supplierOnTime.toFixed(1), portionVariance.toFixed(1),
        primeCost.toFixed(1), ebitda.toFixed(2), ebitdaMargin.toFixed(1), breakEvenCovers, cashFlowRunway,
        mktSocial.toFixed(1), mktEmail.toFixed(1), mktLocal.toFixed(1),
        loyaltyRoi.toFixed(1), deliveryCommission.toFixed(1), netDeliveryMargin.toFixed(1),
      ]
    );
  }
  console.log('    ✅ 90 days of daily KPI data seeded.');
}

async function seedHourlyData(client) {
  console.log('  → Seeding hourly_kpi_data for today...');
  await client.query('TRUNCATE hourly_kpi_data RESTART IDENTITY CASCADE');

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const currentHour = today.getHours();

  // Get today's daily data for reference
  const res = await client.query('SELECT * FROM daily_kpi_data WHERE date = $1', [dateStr]);
  if (res.rows.length === 0) {
    console.log('    ⚠️  No daily data for today, skipping hourly seed.');
    return;
  }
  const todayData = res.rows[0];
  const dailyRev = parseFloat(todayData.revenue_daily);
  const totalCovers = todayData.total_covers;
  const kttBase = parseFloat(todayData.ktt);

  for (let h = 11; h <= 22; h++) {
    const weight = HOUR_WEIGHTS[h] || 0.3;
    const isLive = h <= currentHour;
    const rng = seededRandom(h * 137 + Math.round(dailyRev));
    const hourRevenue = isLive ? Math.round((dailyRev / 12) * weight * jitter(1, 0.15, rng) * 2) : 0;
    const hourCovers = isLive ? Math.round((totalCovers / 12) * weight * jitter(1, 0.1, rng) * 2) : 0;
    const hourKTT = isLive ? clamp(jitter(kttBase * (weight > 0.7 ? 1.2 : 0.9), 0.15, rng), 8, 22) : null;
    const seatOcc = isLive ? clamp(weight * jitter(0.85, 0.1, rng), 0.15, 1.0) : 0;

    await client.query(
      `INSERT INTO hourly_kpi_data (date, hour, label, weight, is_live, revenue, covers, ktt, seat_occupancy, delivery_orders)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [dateStr, h, `${h}:00`, weight, isLive, hourRevenue,
       hourCovers, hourKTT ? hourKTT.toFixed(1) : null, (seatOcc * 100).toFixed(1),
       isLive ? Math.round(hourCovers * 0.25 * jitter(1, 0.2, rng)) : 0]
    );
  }
  console.log('    ✅ Hourly data seeded.');
}

async function seedHeatmaps(client) {
  console.log('  → Seeding heatmap data...');
  await client.query('TRUNCATE revpash_heatmap RESTART IDENTITY CASCADE');
  await client.query('TRUNCATE dead_slot_heatmap RESTART IDENTITY CASCADE');

  const res = await client.query(
    'SELECT date, day_name, revpash, revenue_daily FROM daily_kpi_data ORDER BY date DESC LIMIT 7'
  );
  const last7 = res.rows.reverse();

  for (const day of last7) {
    const rng = seededRandom(new Date(day.date).getTime() / 1000 | 0);
    const revpash = parseFloat(day.revpash);
    const dailyRev = parseFloat(day.revenue_daily);

    for (let h = 11; h <= 22; h++) {
      const w = HOUR_WEIGHTS[h] || 0.3;
      const val = clamp(revpash * w * jitter(2, 0.2, rng), 0, 35);

      await client.query(
        `INSERT INTO revpash_heatmap (date, day_name, hour, value) VALUES ($1,$2,$3,$4)`,
        [day.date, day.day_name, h, val.toFixed(1)]
      );

      // Dead slot (30-min blocks)
      for (let half = 0; half < 2; half++) {
        const slot = `${h}:${half === 0 ? '00' : '30'}`;
        const rev = Math.round(dailyRev / 24 * w * jitter(2, 0.25, rng));
        await client.query(
          `INSERT INTO dead_slot_heatmap (date, day_name, slot, revenue, is_dead_slot) VALUES ($1,$2,$3,$4,$5)`,
          [day.date, day.day_name, slot, rev, rev < 120]
        );
      }
    }
  }
  console.log('    ✅ Heatmap data seeded.');
}

// ─── Main seeder ──────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Starting database seed...\n');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Build staff list for schedule generation
    const rng = seededRandom(42);
    const staffMembers = FIRST_NAMES.map((name, i) => ({
      id: i + 1,
      name,
      role: ROLES_LIST[i],
      type: i < 14 ? 'full-time' : 'part-time',
      hourlyRate: getHourlyRate(ROLES_LIST[i], i < 14, rng),
      shiftsPerWeek: i < 14 ? 5 : 3,
      avgHoursPerShift: i < 14 ? 8 : 5,
    }));

    await seedStaffMembers(client);
    await seedMenuItems(client);
    await seedAlertDefinitions(client);
    await seedDailyKpiData(client, staffMembers);
    await seedHourlyData(client);
    await seedHeatmaps(client);

    await client.query('COMMIT');
    console.log('\n🎉 Database seeded successfully!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seeding failed:', err.message);
    console.error(err.stack);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
