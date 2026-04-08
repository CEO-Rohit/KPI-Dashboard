import { exportService } from "../services/api";
import GaugeChart from "../components/Charts/GaugeChart";
import KPICard from "../components/KPICard/KPICard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line } from "recharts";
import { Download, FileText } from "lucide-react";

export default function Inventory({ aggregated, dailyData }) {
  const inv = aggregated.inventory;

  const wasteTrend = dailyData.slice(-14).map(d => ({
    date: d.dayName + " " + (d.date ? d.date.toString().slice(8) : ""),
    percent: d.inventory.wastePercent,
    value: d.inventory.wasteValue,
    threshold: 5,
  }));

  const supplierData = dailyData.slice(-7).map(d => ({
    day: d.dayName, onTime: d.inventory.supplierOnTime,
  }));

  const shrinkageLog = dailyData.slice(-14).filter(d => d.inventory.shrinkageRate > 1.5).map(d => ({
    date: d.date ? d.date.toString().slice(0, 10) : "", 
    day: d.dayName, 
    rate: d.inventory.shrinkageRate,
    status: d.inventory.shrinkageRate > 2 ? "alert" : "watch",
  }));

  const handleExportPDF = () => {
    const url = exportService.getExportUrl("inventory", "pdf", 30);
    window.open(url, "_blank");
  };

  const handleExportCSV = () => {
    const url = exportService.getExportUrl("inventory", "csv", 30);
    window.open(url, "_blank");
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Inventory & Waste</h1>
          <p>Food cost control, waste management, and supplier performance</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="export-btn" onClick={handleExportCSV}><FileText size={14} /> Export CSV</button>
          <button className="export-btn" onClick={handleExportPDF}><Download size={14} /> Export PDF</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <KPICard title="Food Cost %" value={inv.foodCostPct} unit="%"
          benchmark={inv.foodCostPct <= 33 ? "on-target" : inv.foodCostPct <= 35 ? "watch" : "alert"}
          invertTrend hasAlert={inv.foodCostPct > 36} formula="COGS ÷ Food Revenue × 100"
          sparklineData={dailyData.slice(-7).map(d => d.inventory.foodCostPct)} delay={0} />
        <KPICard title="Food Waste %" value={inv.wastePercent} unit="%"
          benchmark={inv.wastePercent <= 3 ? "on-target" : inv.wastePercent <= 5 ? "watch" : "alert"}
          invertTrend hasAlert={inv.wastePercent > 5} formula="Waste Value ÷ Purchased × 100"
          sparklineData={dailyData.slice(-7).map(d => d.inventory.wastePercent)} delay={1} />
        <KPICard title="Waste Value" value={inv.wasteValue} prefix="$"
          invertTrend formula="Weight × Unit cost" delay={2} />
        <KPICard title="Inventory Turnover" value={inv.inventoryTurnover} unit="x"
          benchmark={inv.inventoryTurnover >= 4 ? "on-target" : "watch"}
          formula="COGS ÷ Avg Inventory Value"
          sparklineData={dailyData.slice(-7).map(d => d.inventory.inventoryTurnover)} delay={3} />
        <KPICard title="Shrinkage Rate" value={inv.shrinkageRate} unit="%"
          benchmark={inv.shrinkageRate <= 1 ? "on-target" : inv.shrinkageRate <= 2 ? "watch" : "alert"}
          invertTrend hasAlert={inv.shrinkageRate > 2} formula="(Expected − Actual) ÷ Expected × 100"
          sparklineData={dailyData.slice(-7).map(d => d.inventory.shrinkageRate)} delay={4} />
        <KPICard title="Supplier On-Time" value={inv.supplierOnTime} unit="%"
          benchmark={inv.supplierOnTime >= 95 ? "on-target" : "watch"}
          formula="On-Time ÷ Total Orders × 100"
          sparklineData={dailyData.slice(-7).map(d => d.inventory.supplierOnTime)} delay={5} />
      </div>

      <div className="section-grid section-grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="chart-container animate-in">
          <div className="chart-header">
            <div>
              <div className="chart-title">Food Cost % Tracker</div>
              <div className="chart-subtitle">Current food cost percentage against benchmarks</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <GaugeChart value={inv.foodCostPct} min={20} max={45}
              thresholds={{ warning: 33, danger: 36 }} label="of Revenue" />
          </div>
        </div>

        <div className="chart-container animate-in animate-in-delay-1">
          <div className="chart-header">
            <div>
              <div className="chart-title">Waste Trend (% + $)</div>
              <div className="chart-subtitle">14-day waste with 5% threshold</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={wasteTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="percent" stroke="#14b8a6" fill="rgba(20,184,166,0.15)" strokeWidth={2} name="Waste %" animationDuration={800} />
              <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" dot={false} strokeWidth={1.5} name="Threshold" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-grid section-grid-2">
        <div className="chart-container animate-in animate-in-delay-2">
          <div className="chart-header">
            <div>
              <div className="chart-title">Supplier Scorecard</div>
              <div className="chart-subtitle">On-time delivery rate (target: &gt;95%)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={supplierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Bar dataKey="onTime" fill="#14b8a6" radius={[4, 4, 0, 0]} name="On-Time %" animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container animate-in animate-in-delay-3">
          <div className="chart-header">
            <div>
              <div className="chart-title">Shrinkage Alert Log</div>
              <div className="chart-subtitle">Days with variance above 1.5%</div>
            </div>
          </div>
          {shrinkageLog.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-tertiary)" }}>No significant shrinkage events</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Day</th><th>Rate</th><th>Status</th></tr></thead>
              <tbody>
                {shrinkageLog.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.date}</td><td>{entry.day}</td>
                    <td style={{ fontWeight: 600 }}>{entry.rate.toFixed(2)}%</td>
                    <td><span className={`benchmark-badge ${entry.status}`}>{entry.status === "alert" ? "Alert" : "Watch"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <KPICard title="Portion Variance" value={inv.portionVariance} unit="%"
            benchmark={inv.portionVariance <= 5 ? "on-target" : "alert"}
            invertTrend formula="Actual vs Recipe costed variance"
            style={{ marginTop: 16 }} delay={6} />
        </div>
      </div>
    </div>
  );
}
