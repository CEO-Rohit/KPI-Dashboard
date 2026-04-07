export const ALERT_DEFINITIONS = [
  // Revenue domain
  { id: "revpash_drop", domain: "revenue", kpi: "RevPASH", severity: "warning",
    condition: "RevPASH drops >15% vs same weekday last week", threshold: 15,
    action: "Review staffing levels and check if any promotions are running on competitor platforms. Consider launching a flash lunch deal." },
  { id: "peak_revenue_low", domain: "revenue", kpi: "Peak Hour Revenue Capture Rate", severity: "warning",
    condition: "Peak 2hr revenue below 35% of daily revenue", threshold: 35,
    action: "Investigate kitchen bottleneck during peak hours. Check if table turnover is below target and consider adding a peak-hour prix fixe." },

  // Operations domain
  { id: "dwell_time_high", domain: "operations", kpi: "Average Table Dwell Time", severity: "info",
    condition: "Dwell time exceeds target by >20 min during peak", threshold: 20,
    action: "Prompt servers to present dessert menus and checks proactively. Consider incentivising quicker table turns during peak." },
  { id: "ktt_high", domain: "operations", kpi: "Kitchen Ticket Time", severity: "critical",
    condition: "Average KTT exceeds 22 minutes", threshold: 22,
    action: "Immediately check kitchen line status. Reassign prep staff to hot line. Consider 86-ing complex items temporarily." },
  { id: "delivery_time_high", domain: "operations", kpi: "Order to Delivery Time", severity: "critical",
    condition: "Rolling 30-min avg delivery time >40 min", threshold: 40,
    action: "PAUSE incoming delivery orders for 15 minutes. Prioritise in-queue delivery tickets. Notify delivery coordinator." },

  // Orders & Menu domain
  { id: "order_error_high", domain: "orders", kpi: "Order Error Rate", severity: "warning",
    condition: "Order error rate >2% in any shift", threshold: 2,
    action: "Schedule immediate shift debrief. Review POS order entry process. Check if any new menu items have confusing names or modifiers." },
  { id: "cancellation_spike", domain: "orders", kpi: "Cancellation Rate", severity: "critical",
    condition: "Cancellation rate spike >5% in 2-hour window", threshold: 5,
    action: "Identify cancellation source (dine-in vs delivery). Check wait times and kitchen delays. If delivery, review platform status." },

  // Staff domain
  { id: "rplh_drop", domain: "staff", kpi: "Revenue Per Labour Hour", severity: "warning",
    condition: "RPLH drops >10% vs last month same volume", threshold: 10,
    action: "Review shift schedules for overstaffing. Cross-check daily covers against staff hours. Consider adjusting part-time schedule." },
  { id: "staff_noshow", domain: "staff", kpi: "No-Show Rate", severity: "critical",
    condition: "Unplanned absence detected 2hrs before shift start", threshold: 2,
    action: "Activate on-call staff immediately. Reassign section responsibilities. Notify manager for coverage." },

  // Customer domain
  { id: "review_negative", domain: "customer", kpi: "Online Review Score", severity: "critical",
    condition: "1–2 star review received on any platform", threshold: 2,
    action: "Respond publicly within 1 hour. Identify the service/dish mentioned. Log for weekly review meeting." },
  { id: "complaint_unresolved", domain: "customer", kpi: "Complaint Resolution Time", severity: "warning",
    condition: "Complaint unresolved after 20 min in-house / 4hr online", threshold: 20,
    action: "Escalate to manager immediately. Offer complimentary item or discount. Document resolution for team learning." },

  // Inventory domain
  { id: "food_waste_high", domain: "inventory", kpi: "Food Waste %", severity: "critical",
    condition: "Daily waste value exceeds pre-set threshold (>5%)", threshold: 5,
    action: "Conduct same-day waste audit. Identify top waste categories. Adjust prep quantities for next service. Review portion sizes." },
  { id: "shrinkage_high", domain: "inventory", kpi: "Shrinkage Rate", severity: "warning",
    condition: "Weekly variance >2% on high-value category", threshold: 2,
    action: "Conduct immediate stock count on flagged category. Review receiving logs. Check for spoilage or theft patterns." },

  // ROI & Growth domain
  { id: "cashflow_low", domain: "roi", kpi: "Cash Flow Runway", severity: "critical",
    condition: "Cash flow runway drops below 21 days", threshold: 21,
    action: "Freeze non-essential purchases. Review upcoming payment obligations. Schedule urgent meeting with accountant." },
  { id: "delivery_margin_low", domain: "roi", kpi: "Delivery Platform Commission", severity: "warning",
    condition: "Net delivery margin below 8%", threshold: 8,
    action: "Review delivery menu pricing. Consider adding a delivery surcharge. Evaluate which platforms are worth continuing." },

  // Additional operational alerts
  { id: "food_cost_high", domain: "inventory", kpi: "Food Cost %", severity: "warning",
    condition: "Food cost % exceeds 36%", threshold: 36,
    action: "Review supplier invoices for price increases. Check portion control compliance. Audit high-cost menu items." },
  { id: "labour_cost_high", domain: "staff", kpi: "Labour Cost %", severity: "warning",
    condition: "Labour cost % exceeds 38%", threshold: 38,
    action: "Review overtime hours. Adjust part-time scheduling. Consider cross-training staff for multi-role flexibility." },
];

export const DEMO_SCENARIOS = [
  {
    id: "delivery_spike",
    name: "🚚 Delivery Time Spike",
    description: "Simulates delivery times exceeding 40 min due to kitchen backlog during dinner rush",
    alertIds: ["delivery_time_high", "ktt_high", "cancellation_spike"],
    kpiOverrides: {
      deliveryTime: 46, kitchenTicketTime: 24, cancellationRate: 6.2,
    },
  },
  {
    id: "waste_crisis",
    name: "🗑️ Food Waste Threshold Breach",
    description: "Daily waste exceeds 5% due to over-preparation for an expected event that cancelled",
    alertIds: ["food_waste_high", "shrinkage_high", "food_cost_high"],
    kpiOverrides: {
      foodWastePercent: 6.8, shrinkageRate: 3.1, foodCostPercent: 37.2,
    },
  },
  {
    id: "staffing_crisis",
    name: "👥 Staff No-Show Crisis",
    description: "Two servers and a line cook call in sick on a Saturday evening",
    alertIds: ["staff_noshow", "rplh_drop", "dwell_time_high", "order_error_high"],
    kpiOverrides: {
      staffNoShowRate: 14, rplhChange: -18, dwellTimeExcess: 28, orderErrorRate: 3.1,
    },
  },
];

export const generateActiveAlerts = (scenarioIds = []) => {
  const now = new Date();
  const baseAlerts = ALERT_DEFINITIONS.filter(a =>
    ["delivery_time_high", "food_waste_high", "review_negative", "cashflow_low", "food_cost_high"].includes(a.id)
  ).map((alert, i) => ({
    ...alert,
    triggeredAt: new Date(now.getTime() - (i * 15 + 5) * 60000).toISOString(),
    acknowledged: i > 2,
    active: true,
  }));

  const scenarioAlerts = [];
  scenarioIds.forEach(sId => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === sId);
    if (scenario) {
      scenario.alertIds.forEach(aId => {
        const def = ALERT_DEFINITIONS.find(a => a.id === aId);
        if (def && !baseAlerts.find(b => b.id === aId)) {
          scenarioAlerts.push({
            ...def,
            triggeredAt: new Date(now.getTime() - Math.floor(Math.random() * 30) * 60000).toISOString(),
            acknowledged: false,
            active: true,
            fromScenario: sId,
          });
        }
      });
    }
  });

  return [...scenarioAlerts, ...baseAlerts].sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
};

export default ALERT_DEFINITIONS;
