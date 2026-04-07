import { BUSINESS_PROFILE } from "./businessProfile";
import { generateDailyStaffSchedule } from "./staffData";

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function lerp(min, max, t) { return min + (max - min) * t; }
function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }
function jitter(val, pct, rng) { return val * (1 + (rng() - 0.5) * 2 * pct); }

const WEEKDAY_MULTIPLIERS = [0.72, 0.78, 0.85, 0.88, 1.0, 1.18, 1.12]; // Sun-Sat
const HOUR_WEIGHTS = [0,0,0,0,0,0,0,0,0,0,0, 0.5, 0.9, 0.85, 0.4, 0.3, 0.3, 0.35, 0.6, 1.0, 0.95, 0.7, 0.4, 0.15];

export function generateDailyData(daysBack = 90) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dow = date.getDay();
    const dateStr = date.toISOString().split("T")[0];
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
    const seats = BUSINESS_PROFILE.seatingCapacity;
    const hours = BUSINESS_PROFILE.hoursPerDay;
    const revpash = dailyRevenue / (seats * hours);
    const dineInCovers = Math.round(dineInRev / BUSINESS_PROFILE.averageCheck.dineIn);
    const deliveryOrders = Math.round(deliveryRev / BUSINESS_PROFILE.averageCheck.delivery);
    const totalCovers = dineInCovers + deliveryOrders;
    const avgCheck = dailyRevenue / totalCovers;

    // Peak hours
    const peakRevenue = dailyRevenue * lerp(0.32, 0.42, rng());
    const peakCapture = (peakRevenue / dailyRevenue) * 100;

    // Catering
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
    const staffSchedule = generateDailyStaffSchedule(dateStr);
    const labourCost = staffSchedule.labourCost;
    const labourCostPct = (labourCost / dailyRevenue) * 100;
    const rplh = dailyRevenue / staffSchedule.totalHours;
    const coversPerServer = totalCovers / Math.max(staffSchedule.fohStaff, 1);

    // Customer
    const nps = clamp(Math.round(jitter(58, 0.15, rng)), 38, 78);
    const returnRate = clamp(jitter(44, 0.1, rng), 32, 56);
    const onlineReviewScore = clamp(jitter(4.4, 0.05, rng), 3.8, 4.9);
    const reviewCount = Math.floor(lerp(1, 6, rng()));
    const clv = clamp(jitter(420, 0.1, rng), 320, 560);
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
    const ebitda = dailyRevenue - foodCostValue - labourCost - opex;
    const ebitdaMargin = (ebitda / dailyRevenue) * 100;
    const breakEvenCovers = Math.round(lerp(85, 110, rng()));
    const cashFlowRunway = clamp(Math.round(jitter(38, 0.2, rng)), 15, 60);
    const marketingRoi = { social: lerp(180, 350, rng()), email: lerp(250, 500, rng()), local: lerp(120, 280, rng()) };
    const loyaltyRoi = lerp(15, 30, rng());
    const deliveryCommission = lerp(18, 30, rng());
    const netDeliveryMargin = ((deliveryRev * (1 - deliveryCommission / 100)) - (deliveryRev * foodCostPct / 100)) / deliveryRev * 100;

    days.push({
      date: dateStr, dow, dayName: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow],
      revenue: {
        daily: Math.round(dailyRevenue), target: Math.round(baseRevenue * wMul * 1.05),
        attainment: ((dailyRevenue / (baseRevenue * wMul * 1.05)) * 100).toFixed(1),
        revpash: +revpash.toFixed(2), avgCheck: +avgCheck.toFixed(2),
        dineIn: Math.round(dineInRev), delivery: Math.round(deliveryRev), takeaway: Math.round(takeawayRev),
        dineInPct: +(dineInPct * 100).toFixed(1), deliveryPct: +(deliveryPct * 100).toFixed(1), takeawayPct: +(takeawayPct * 100).toFixed(1),
        peakCapture: +peakCapture.toFixed(1), eventRevenue: Math.round(eventRevenue), eventPct: +eventPct.toFixed(1),
      },
      operations: {
        tableTurnover: +tableTurnover.toFixed(2), dwellTime: Math.round(dwellTime),
        ktt: +kitchenTicketTime.toFixed(1), deliveryTime: +deliveryTime.toFixed(1),
        seatUtilisation: +(seatUtil * 100).toFixed(1), dineInCovers, deliveryOrders, totalCovers,
      },
      orders: {
        errorRate: +orderErrorRate.toFixed(2), cancellationRate: +cancellationRate.toFixed(2),
        upsellRate: +upsellRate.toFixed(1), item86Count, bevToFoodRatio: +bevToFoodRatio.toFixed(1),
      },
      staff: {
        ...staffSchedule, labourCostPct: +labourCostPct.toFixed(1), rplh: +rplh.toFixed(2),
        coversPerServer: +coversPerServer.toFixed(1),
      },
      customer: {
        nps, returnRate: +returnRate.toFixed(1), reviewScore: +onlineReviewScore.toFixed(2),
        reviewCount, clv: Math.round(clv), complaintResTime: Math.round(complaintResTime),
        reservationNoShow: +reservationNoShow.toFixed(1),
      },
      inventory: {
        foodCostPct: +foodCostPct.toFixed(1), foodCostValue: Math.round(foodCostValue),
        wastePercent: +wastePercent.toFixed(2), wasteValue: Math.round(wasteValue),
        inventoryTurnover: +inventoryTurnover.toFixed(1), shrinkageRate: +shrinkageRate.toFixed(2),
        supplierOnTime: +supplierOnTime.toFixed(1), portionVariance: +portionVariance.toFixed(1),
      },
      roi: {
        primeCost: +primeCost.toFixed(1), ebitda: Math.round(ebitda), ebitdaMargin: +ebitdaMargin.toFixed(1),
        breakEvenCovers, cashFlowRunway, marketingRoi,
        loyaltyRoi: +loyaltyRoi.toFixed(1), deliveryCommission: +deliveryCommission.toFixed(1),
        netDeliveryMargin: +netDeliveryMargin.toFixed(1),
      },
    });
  }
  return days;
}

export function generateHourlyData(dailyData) {
  const todayData = dailyData[dailyData.length - 1];
  const hours = [];
  const currentHour = new Date().getHours();

  for (let h = 11; h <= 22; h++) {
    const weight = HOUR_WEIGHTS[h] || 0.3;
    const isLive = h <= currentHour;
    const rng = seededRandom(h * 137 + todayData.revenue.daily);
    const hourRevenue = isLive ? Math.round((todayData.revenue.daily / 12) * weight * jitter(1, 0.15, rng) * 2) : 0;
    const hourCovers = isLive ? Math.round((todayData.operations.totalCovers / 12) * weight * jitter(1, 0.1, rng) * 2) : 0;
    const hourKTT = isLive ? clamp(jitter(todayData.operations.ktt * (weight > 0.7 ? 1.2 : 0.9), 0.15, rng), 8, 22) : null;
    const seatOcc = isLive ? clamp(weight * jitter(0.85, 0.1, rng), 0.15, 1.0) : 0;

    hours.push({
      hour: h, label: `${h}:00`, weight, isLive,
      revenue: hourRevenue, covers: hourCovers,
      ktt: hourKTT ? +hourKTT.toFixed(1) : null,
      seatOccupancy: +(seatOcc * 100).toFixed(1),
      deliveryOrders: isLive ? Math.round(hourCovers * 0.25 * jitter(1, 0.2, rng)) : 0,
    });
  }
  return hours;
}

export function generateRevPASHHeatmap(dailyData) {
  const last7 = dailyData.slice(-7);
  return last7.map(day => {
    const rng = seededRandom(new Date(day.date).getTime() / 1000 | 0);
    const hourlyRevpash = [];
    for (let h = 11; h <= 22; h++) {
      const w = HOUR_WEIGHTS[h] || 0.3;
      const val = day.revenue.revpash * w * jitter(2, 0.2, rng);
      hourlyRevpash.push({ hour: h, value: +clamp(val, 0, 35).toFixed(1) });
    }
    return { day: day.dayName, date: day.date, hours: hourlyRevpash };
  });
}

export function generateDeadSlotHeatmap(dailyData) {
  const last7 = dailyData.slice(-7);
  const slots = [];
  last7.forEach(day => {
    const rng = seededRandom(new Date(day.date).getTime() / 2000 | 0);
    for (let h = 11; h <= 22; h++) {
      for (let half = 0; half < 2; half++) {
        const timeSlot = `${h}:${half === 0 ? "00" : "30"}`;
        const w = HOUR_WEIGHTS[h] || 0.3;
        const rev = Math.round(day.revenue.daily / 24 * w * jitter(2, 0.25, rng));
        slots.push({ day: day.dayName, date: day.date, slot: timeSlot, revenue: rev, isDeadSlot: rev < 120 });
      }
    }
  });
  return slots;
}

export function getAggregatedData(dailyData, range = "today") {
  let data;
  if (range === "today") data = dailyData.slice(-1);
  else if (range === "week") data = dailyData.slice(-7);
  else data = dailyData.slice(-30);

  const len = data.length;
  const sum = (arr, fn) => arr.reduce((s, d) => s + fn(d), 0);
  const avg = (arr, fn) => sum(arr, fn) / len;

  const prevData = range === "today" ? dailyData.slice(-2, -1) :
    range === "week" ? dailyData.slice(-14, -7) : dailyData.slice(-60, -30);
  const prevLen = prevData.length || 1;

  const calcTrend = (currFn, prevFn) => {
    const curr = avg(data, currFn);
    const prev = prevData.length > 0 ? prevData.reduce((s, d) => s + prevFn(d), 0) / prevLen : curr;
    if (prev === 0) return { value: 0, direction: "flat" };
    const change = ((curr - prev) / prev) * 100;
    return { value: +Math.abs(change).toFixed(1), direction: change > 1 ? "up" : change < -1 ? "down" : "flat" };
  };

  return {
    revenue: {
      daily: range === "today" ? data[0]?.revenue.daily || 0 : Math.round(sum(data, d => d.revenue.daily)),
      target: range === "today" ? data[0]?.revenue.target || 0 : Math.round(sum(data, d => d.revenue.target)),
      attainment: +avg(data, d => +d.revenue.attainment).toFixed(1),
      revpash: +avg(data, d => d.revenue.revpash).toFixed(2),
      avgCheck: +avg(data, d => d.revenue.avgCheck).toFixed(2),
      dineIn: Math.round(sum(data, d => d.revenue.dineIn)),
      delivery: Math.round(sum(data, d => d.revenue.delivery)),
      takeaway: Math.round(sum(data, d => d.revenue.takeaway)),
      dineInPct: +avg(data, d => d.revenue.dineInPct).toFixed(1),
      deliveryPct: +avg(data, d => d.revenue.deliveryPct).toFixed(1),
      takeawayPct: +avg(data, d => d.revenue.takeawayPct).toFixed(1),
      peakCapture: +avg(data, d => d.revenue.peakCapture).toFixed(1),
      eventRevenue: Math.round(sum(data, d => d.revenue.eventRevenue)),
      eventPct: +avg(data, d => d.revenue.eventPct).toFixed(1),
      trend: calcTrend(d => d.revenue.daily, d => d.revenue.daily),
    },
    operations: {
      tableTurnover: +avg(data, d => d.operations.tableTurnover).toFixed(2),
      dwellTime: Math.round(avg(data, d => d.operations.dwellTime)),
      ktt: +avg(data, d => d.operations.ktt).toFixed(1),
      deliveryTime: +avg(data, d => d.operations.deliveryTime).toFixed(1),
      seatUtilisation: +avg(data, d => d.operations.seatUtilisation).toFixed(1),
      totalCovers: range === "today" ? data[0]?.operations.totalCovers || 0 : Math.round(sum(data, d => d.operations.totalCovers)),
      dineInCovers: range === "today" ? data[0]?.operations.dineInCovers || 0 : Math.round(sum(data, d => d.operations.dineInCovers)),
      deliveryOrders: range === "today" ? data[0]?.operations.deliveryOrders || 0 : Math.round(sum(data, d => d.operations.deliveryOrders)),
      kttTrend: calcTrend(d => d.operations.ktt, d => d.operations.ktt),
      turnoverTrend: calcTrend(d => d.operations.tableTurnover, d => d.operations.tableTurnover),
    },
    orders: {
      errorRate: +avg(data, d => d.orders.errorRate).toFixed(2),
      cancellationRate: +avg(data, d => d.orders.cancellationRate).toFixed(2),
      upsellRate: +avg(data, d => d.orders.upsellRate).toFixed(1),
      item86Count: Math.round(sum(data, d => d.orders.item86Count)),
      bevToFoodRatio: +avg(data, d => d.orders.bevToFoodRatio).toFixed(1),
      errorTrend: calcTrend(d => d.orders.errorRate, d => d.orders.errorRate),
    },
    staff: {
      labourCostPct: +avg(data, d => d.staff.labourCostPct).toFixed(1),
      rplh: +avg(data, d => d.staff.rplh).toFixed(2),
      coversPerServer: +avg(data, d => d.staff.coversPerServer).toFixed(1),
      noShows: Math.round(sum(data, d => d.staff.noShows)),
      totalHours: Math.round(sum(data, d => d.staff.totalHours)),
      labourCost: Math.round(sum(data, d => d.staff.labourCost)),
      labourTrend: calcTrend(d => d.staff.labourCostPct, d => d.staff.labourCostPct),
    },
    customer: {
      nps: Math.round(avg(data, d => d.customer.nps)),
      returnRate: +avg(data, d => d.customer.returnRate).toFixed(1),
      reviewScore: +avg(data, d => d.customer.reviewScore).toFixed(2),
      reviewCount: Math.round(sum(data, d => d.customer.reviewCount)),
      clv: Math.round(avg(data, d => d.customer.clv)),
      complaintResTime: Math.round(avg(data, d => d.customer.complaintResTime)),
      reservationNoShow: +avg(data, d => d.customer.reservationNoShow).toFixed(1),
      npsTrend: calcTrend(d => d.customer.nps, d => d.customer.nps),
    },
    inventory: {
      foodCostPct: +avg(data, d => d.inventory.foodCostPct).toFixed(1),
      foodCostValue: Math.round(sum(data, d => d.inventory.foodCostValue)),
      wastePercent: +avg(data, d => d.inventory.wastePercent).toFixed(2),
      wasteValue: Math.round(sum(data, d => d.inventory.wasteValue)),
      inventoryTurnover: +avg(data, d => d.inventory.inventoryTurnover).toFixed(1),
      shrinkageRate: +avg(data, d => d.inventory.shrinkageRate).toFixed(2),
      supplierOnTime: +avg(data, d => d.inventory.supplierOnTime).toFixed(1),
      portionVariance: +avg(data, d => d.inventory.portionVariance).toFixed(1),
      wasteTrend: calcTrend(d => d.inventory.wastePercent, d => d.inventory.wastePercent),
    },
    roi: {
      primeCost: +avg(data, d => d.roi.primeCost).toFixed(1),
      ebitda: range === "today" ? data[0]?.roi.ebitda || 0 : Math.round(sum(data, d => d.roi.ebitda)),
      ebitdaMargin: +avg(data, d => d.roi.ebitdaMargin).toFixed(1),
      breakEvenCovers: Math.round(avg(data, d => d.roi.breakEvenCovers)),
      cashFlowRunway: Math.round(avg(data, d => d.roi.cashFlowRunway)),
      marketingRoi: {
        social: +avg(data, d => d.roi.marketingRoi.social).toFixed(0),
        email: +avg(data, d => d.roi.marketingRoi.email).toFixed(0),
        local: +avg(data, d => d.roi.marketingRoi.local).toFixed(0),
      },
      loyaltyRoi: +avg(data, d => d.roi.loyaltyRoi).toFixed(1),
      deliveryCommission: +avg(data, d => d.roi.deliveryCommission).toFixed(1),
      netDeliveryMargin: +avg(data, d => d.roi.netDeliveryMargin).toFixed(1),
      primeCostTrend: calcTrend(d => d.roi.primeCost, d => d.roi.primeCost),
    },
  };
}
