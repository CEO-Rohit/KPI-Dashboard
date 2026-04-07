import KPICard from "../components/KPICard/KPICard";
import RevenueChart from "../components/Charts/RevenueChart";
import AlertPanel from "../components/Alerts/AlertPanel";
import { useRole } from "../context/RoleContext";
import { DollarSign, Activity, UtensilsCrossed, Users, Heart, Package, TrendingUp } from "lucide-react";

const DOMAIN_ICONS = { revenue: DollarSign, operations: Activity, orders: UtensilsCrossed, staff: Users, customer: Heart, inventory: Package, roi: TrendingUp };
const DOMAIN_COLORS = { revenue: "#10b981", operations: "#6366f1", orders: "#f59e0b", staff: "#8b5cf6", customer: "#ec4899", inventory: "#14b8a6", roi: "#f97316" };
const DOMAIN_LABELS = { revenue: "Revenue", operations: "Operations", orders: "Orders & Menu", staff: "Staff", customer: "Customer", inventory: "Inventory", roi: "ROI & Growth" };

export default function CommandCentre({ aggregated, dailyData, onNavigate }) {
  const { role } = useRole();
  const r = aggregated.revenue;
  const o = aggregated.operations;
  const s = aggregated.staff;
  const c = aggregated.customer;
  const inv = aggregated.inventory;
  const roi = aggregated.roi;

  const managerKPIs = [
    { title: "Daily Revenue", value: r.daily, prefix: "$", trend: r.trend, benchmark: r.attainment >= 90 ? "on-target" : r.attainment >= 75 ? "watch" : "alert", formula: "Actual ÷ Target × 100", sparklineData: dailyData.slice(-7).map(d => d.revenue.daily) },
    { title: "Kitchen Ticket Time", value: o.ktt, unit: "min", trend: o.kttTrend, benchmark: o.ktt <= 12 ? "on-target" : o.ktt <= 18 ? "watch" : "alert", invertTrend: true, formula: "Order placed → Food on pass (avg)", sparklineData: dailyData.slice(-7).map(d => d.operations.ktt) },
    { title: "Covers Served", value: o.totalCovers, trend: o.turnoverTrend, benchmark: "on-target", formula: "Dine-in + Delivery orders", sparklineData: dailyData.slice(-7).map(d => d.operations.totalCovers) },
    { title: "Labour Cost %", value: s.labourCostPct, unit: "%", trend: s.labourTrend, benchmark: s.labourCostPct <= 33 ? "on-target" : s.labourCostPct <= 35 ? "watch" : "alert", invertTrend: true, formula: "Labour Cost ÷ Revenue × 100", sparklineData: dailyData.slice(-7).map(d => d.staff.labourCostPct) },
    { title: "Food Cost %", value: inv.foodCostPct, unit: "%", trend: inv.wasteTrend, benchmark: inv.foodCostPct <= 33 ? "on-target" : inv.foodCostPct <= 35 ? "watch" : "alert", invertTrend: true, formula: "COGS ÷ Food Revenue × 100", sparklineData: dailyData.slice(-7).map(d => d.inventory.foodCostPct) },
    { title: "NPS Score", value: c.nps, trend: c.npsTrend, benchmark: c.nps >= 70 ? "on-target" : c.nps >= 50 ? "watch" : "alert", formula: "% Promoters − % Detractors", sparklineData: dailyData.slice(-7).map(d => d.customer.nps) },
  ];

  const ownerKPIs = [
    { title: "Revenue vs Target", value: r.daily, prefix: "$", trend: r.trend, benchmark: r.attainment >= 90 ? "on-target" : r.attainment >= 75 ? "watch" : "alert", formula: "Actual ÷ Target × 100", sparklineData: dailyData.slice(-7).map(d => d.revenue.daily) },
    { title: "Prime Cost %", value: roi.primeCost, unit: "%", trend: roi.primeCostTrend, benchmark: roi.primeCost <= 58 ? "on-target" : roi.primeCost <= 62 ? "watch" : "alert", invertTrend: true, formula: "(Labour + COGS) ÷ Revenue × 100", sparklineData: dailyData.slice(-7).map(d => d.roi.primeCost) },
    { title: "EBITDA", value: roi.ebitda, prefix: "$", formula: "Rev − COGS − Labour − OpEx", sparklineData: dailyData.slice(-7).map(d => d.roi.ebitda) },
    { title: "RevPASH", value: r.revpash, unit: "/hr", prefix: "$", formula: "Revenue ÷ (Seats × Hours)", sparklineData: dailyData.slice(-7).map(d => d.revenue.revpash) },
    { title: "Customer CLV", value: c.clv, prefix: "$", formula: "Avg Spend × Visits/Yr × Avg Years", sparklineData: dailyData.slice(-7).map(d => d.customer.clv) },
    { title: "Cash Flow Runway", value: roi.cashFlowRunway, unit: "days", benchmark: roi.cashFlowRunway >= 45 ? "on-target" : roi.cashFlowRunway >= 21 ? "watch" : "alert", hasAlert: roi.cashFlowRunway < 21, sparklineData: dailyData.slice(-7).map(d => d.roi.cashFlowRunway) },
  ];

  const kpis = role === "owner" ? ownerKPIs : managerKPIs;

  return (
    <div>
      <div className="page-header">
        <h1>Command Centre</h1>
        <p>Your restaurant at a glance — {role === "owner" ? "strategic overview" : "operational pulse"}</p>
      </div>

      {/* Hero KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} delay={i} />
        ))}
      </div>

      {/* Domain Quick Links */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 700, marginBottom: "var(--space-md)", color: "var(--text-primary)" }}>Quick Navigation</h3>
        <div className="domain-links">
          {Object.entries(DOMAIN_LABELS).map(([key, label]) => {
            const Icon = DOMAIN_ICONS[key];
            return (
              <div key={key} className="domain-link" onClick={() => onNavigate(key)}>
                <div className="domain-link-icon" style={{ background: `${DOMAIN_COLORS[key]}18`, color: DOMAIN_COLORS[key] }}>
                  <Icon size={22} />
                </div>
                <span className="domain-link-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Chart + Alerts */}
      <div className="section-grid section-grid-2">
        <div className="chart-container animate-in animate-in-delay-3">
          <div className="chart-header">
            <div>
              <div className="chart-title">Revenue Trend</div>
              <div className="chart-subtitle">Last 14 days — actual vs target</div>
            </div>
          </div>
          <RevenueChart data={dailyData} />
        </div>
        <div className="animate-in animate-in-delay-4">
          <AlertPanel compact />
        </div>
      </div>
    </div>
  );
}
