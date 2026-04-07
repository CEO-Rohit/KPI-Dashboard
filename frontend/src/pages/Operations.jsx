import KPICard from "../components/KPICard/KPICard";
import GaugeChart from "../components/Charts/GaugeChart";
import HeatmapChart from "../components/Charts/HeatmapChart";
import { generateDeadSlotHeatmap, generateHourlyData } from "../data/mockDataGenerator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { exportToPDF, generateDomainExportData } from "../utils/exportUtils";
import { Download } from "lucide-react";

export default function Operations({ aggregated, dailyData }) {
  const o = aggregated.operations;
  const hourlyData = generateHourlyData(dailyData);
  const deadSlots = generateDeadSlotHeatmap(dailyData);

  const hourLabels = [];
  for (let h = 11; h <= 22; h++) { hourLabels.push(`${h}:00`); hourLabels.push(`${h}:30`); }
  const dayLabels = [...new Set(deadSlots.map(s => s.day))];
  const deadHeatmapData = deadSlots.map((s, i) => ({
    row: dayLabels.indexOf(s.day),
    col: hourLabels.indexOf(s.slot),
    value: Math.min(s.revenue, 500),
  }));

  const seatData = dailyData.slice(-7).map(d => ({
    day: d.dayName,
    utilisation: d.operations.seatUtilisation,
  }));

  const kttTrend = dailyData.slice(-14).map(d => ({
    date: d.dayName + " " + d.date.slice(8),
    ktt: d.operations.ktt,
    threshold: 18,
  }));

  const handleExport = () => {
    const { columns, rows } = generateDomainExportData(aggregated, "operations");
    exportToPDF("Operations Monitor Report", columns, rows, "operations-report");
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Operations Monitor</h1>
          <p>Kitchen performance, table management, and service efficiency</p>
        </div>
        <button className="export-btn" onClick={handleExport}><Download size={14} /> Export PDF</button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <KPICard title="Table Turnover" value={o.tableTurnover} unit="x" trend={o.turnoverTrend}
          benchmark={o.tableTurnover >= 3 ? "on-target" : o.tableTurnover >= 2.5 ? "watch" : "alert"}
          formula="Covers ÷ Number of Seats" sparklineData={dailyData.slice(-7).map(d => d.operations.tableTurnover)} delay={0} />
        <KPICard title="Avg Dwell Time" value={o.dwellTime} unit="min"
          benchmark={o.dwellTime <= 55 ? "on-target" : o.dwellTime <= 65 ? "watch" : "alert"}
          invertTrend formula="Total Seated Min ÷ Covers" sparklineData={dailyData.slice(-7).map(d => d.operations.dwellTime)} delay={1} />
        <KPICard title="Kitchen Ticket Time" value={o.ktt} unit="min" trend={o.kttTrend}
          benchmark={o.ktt <= 12 ? "on-target" : o.ktt <= 18 ? "watch" : "alert"}
          invertTrend hasAlert={o.ktt > 18} formula="Order placed → Food on pass (avg)"
          sparklineData={dailyData.slice(-7).map(d => d.operations.ktt)} delay={2} />
        <KPICard title="Delivery Time" value={o.deliveryTime} unit="min"
          benchmark={o.deliveryTime <= 35 ? "on-target" : o.deliveryTime <= 40 ? "watch" : "alert"}
          invertTrend hasAlert={o.deliveryTime > 40} formula="Order confirmed → Delivered (avg)"
          sparklineData={dailyData.slice(-7).map(d => d.operations.deliveryTime)} delay={3} />
        <KPICard title="Seat Utilisation" value={o.seatUtilisation} unit="%"
          benchmark={o.seatUtilisation >= 70 ? "on-target" : o.seatUtilisation >= 55 ? "watch" : "alert"}
          formula="Occupied Seat Hrs ÷ Available"
          sparklineData={dailyData.slice(-7).map(d => d.operations.seatUtilisation)} delay={4} />
        <KPICard title="Total Covers" value={o.totalCovers}
          formula="Dine-in covers + Delivery orders"
          sparklineData={dailyData.slice(-7).map(d => d.operations.totalCovers)} delay={5} />
      </div>

      <div className="section-grid section-grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="chart-container animate-in">
          <div className="chart-header">
            <div>
              <div className="chart-title">Kitchen Ticket Time Trend</div>
              <div className="chart-subtitle">14-day KTT with 18-min warning threshold</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={kttTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} domain={[6, 24]} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="ktt" stroke="#6366f1" fill="rgba(99,102,241,0.15)" strokeWidth={2} animationDuration={800} />
              <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container animate-in animate-in-delay-1">
          <div className="chart-header">
            <div>
              <div className="chart-title">Seat Utilisation</div>
              <div className="chart-subtitle">7-day seat occupancy rate during service hours</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={seatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="utilisation" stroke="#10b981" fill="rgba(16,185,129,0.15)" strokeWidth={2} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container animate-in animate-in-delay-2">
        <div className="chart-header">
          <div>
            <div className="chart-title">Dead Slot Identification</div>
            <div className="chart-subtitle">Revenue by 30-min block over 7 days — low-revenue slots highlighted</div>
          </div>
        </div>
        <HeatmapChart data={deadHeatmapData} xLabels={hourLabels} yLabels={dayLabels} maxVal={500} valuePrefix="$" small />
      </div>
    </div>
  );
}
