import { exportService } from "../services/api";
import { Download, FileText } from "lucide-react";
import KPICard from "../components/KPICard/KPICard";
import { AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Customer({ aggregated, dailyData }) {
  const c = aggregated.customer;

  const npsTrend = dailyData.slice(-30).map(d => ({
    date: d.date ? d.date.toString().slice(5, 10) : "",
    nps: d.customer.nps,
    good: 50,
    excellent: 70,
  }));

  const returnData = dailyData.slice(-14).map(d => ({
    date: d.dayName + " " + (d.date ? d.date.toString().slice(8) : ""),
    rate: d.customer.returnRate,
  }));

  const reviewData = dailyData.slice(-14).map(d => ({
    date: d.dayName,
    score: d.customer.reviewScore,
    count: d.customer.reviewCount,
  }));

  const handleExportPDF = () => {
    const url = exportService.getExportUrl("customer", "pdf", 30);
    window.open(url, "_blank");
  };

  const handleExportCSV = () => {
    const url = exportService.getExportUrl("customer", "csv", 30);
    window.open(url, "_blank");
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Customer Intelligence</h1>
          <p>Loyalty, satisfaction, and engagement metrics</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="export-btn" onClick={handleExportCSV}><FileText size={14} /> Export CSV</button>
          <button className="export-btn" onClick={handleExportPDF}><Download size={14} /> Export PDF</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <KPICard title="Guest Return Rate" value={c.returnRate} unit="%"
          benchmark={c.returnRate >= 40 ? "on-target" : "watch"}
          formula="Returning ÷ Total Unique × 100"
          sparklineData={dailyData.slice(-7).map(d => d.customer.returnRate)} delay={0} />
        <KPICard title="NPS Score" value={c.nps} trend={c.npsTrend}
          benchmark={c.nps >= 70 ? "on-target" : c.nps >= 50 ? "watch" : "alert"}
          formula="% Promoters − % Detractors"
          sparklineData={dailyData.slice(-7).map(d => d.customer.nps)} delay={1} />
        <KPICard title="Online Review Score" value={c.reviewScore}
          benchmark={c.reviewScore >= 4.4 ? "on-target" : c.reviewScore >= 4.0 ? "watch" : "alert"}
          hasAlert={c.reviewScore < 4.0} formula="Avg rating + review frequency"
          sparklineData={dailyData.slice(-7).map(d => d.customer.reviewScore)} delay={2} />
        <KPICard title="Customer CLV" value={c.clv} prefix="$"
          formula="Avg Spend × Visits/Yr × Avg Years"
          sparklineData={dailyData.slice(-7).map(d => d.customer.clv)} delay={3} />
        <KPICard title="Complaint Res. Time" value={c.complaintResTime} unit="min"
          benchmark={c.complaintResTime <= 15 ? "on-target" : c.complaintResTime <= 20 ? "watch" : "alert"}
          invertTrend hasAlert={c.complaintResTime > 20}
          formula="Complaint raised → Resolved (avg)"
          sparklineData={dailyData.slice(-7).map(d => d.customer.complaintResTime)} delay={4} />
        <KPICard title="Reservation No-Show" value={c.reservationNoShow} unit="%"
          benchmark={c.reservationNoShow <= 8 ? "on-target" : "alert"}
          invertTrend formula="No-Show ÷ Total Reservations × 100"
          sparklineData={dailyData.slice(-7).map(d => d.customer.reservationNoShow)} delay={5} />
      </div>

      <div className="section-grid section-grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="chart-container animate-in">
          <div className="chart-header">
            <div>
              <div className="chart-title">NPS Score Trend</div>
              <div className="chart-subtitle">30-day NPS with good (50) and excellent (70) benchmarks</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={npsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <YAxis domain={[30, 85]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="nps" stroke="#ec4899" fill="rgba(236,72,153,0.12)" strokeWidth={2} animationDuration={800} />
              <Line type="monotone" dataKey="good" stroke="#f59e0b" strokeDasharray="5 5" dot={false} strokeWidth={1} />
              <Line type="monotone" dataKey="excellent" stroke="#10b981" strokeDasharray="5 5" dot={false} strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container animate-in animate-in-delay-1">
          <div className="chart-header">
            <div>
              <div className="chart-title">Guest Return Rate</div>
              <div className="chart-subtitle">14-day returning customer percentage</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={returnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <YAxis domain={[20, 60]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Bar dataKey="rate" fill="#ec4899" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container animate-in animate-in-delay-2">
        <div className="chart-header">
          <div>
            <div className="chart-title">Online Review Score & Velocity</div>
            <div className="chart-subtitle">14-day review score and volume tracking</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={reviewData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
            <YAxis yAxisId="left" domain={[3.5, 5]} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
            <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
            <Bar yAxisId="right" dataKey="count" name="Reviews" fill="rgba(236,72,153,0.2)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="score" name="Score" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
