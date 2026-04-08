import { exportService, kpiService } from "../services/api";
import GaugeChart from "../components/Charts/GaugeChart";
import KPICard from "../components/KPICard/KPICard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Download, Loader2, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function Staff({ aggregated, dailyData }) {
  const s = aggregated.staff;
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kpiService.getStaffData().then(res => {
      setMetrics(res.data.metrics);
      setLoading(false);
    });
  }, []);

  const labourTrend = dailyData.slice(-14).map(d => ({
    date: d.dayName + " " + (d.date ? d.date.toString().slice(8) : ""),
    cost: d.staff.labourCostPct,
    threshold: 35,
  }));

  const coversData = dailyData.slice(-7).map(d => ({
    day: d.dayName, covers: d.staff.coversPerServer,
  }));

  const noShowLog = dailyData.slice(-14).filter(d => d.staff.noShows > 0).map(d => ({
    date: d.date ? d.date.toString().slice(0, 10) : "", 
    day: d.dayName, 
    noShows: d.staff.noShows, 
    late: d.staff.lateArrivals,
  }));

  const handleExportPDF = () => {
    const url = exportService.getExportUrl("staff", "pdf", 30);
    window.open(url, "_blank");
  };

  const handleExportCSV = () => {
    const url = exportService.getExportUrl("staff", "csv", 30);
    window.open(url, "_blank");
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Staff Performance</h1>
          <p>Labour cost efficiency, productivity, and attendance tracking</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="export-btn" onClick={handleExportCSV}><FileText size={14} /> Export CSV</button>
          <button className="export-btn" onClick={handleExportPDF}><Download size={14} /> Export PDF</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <KPICard title="Labour Cost %" value={s.labourCostPct} unit="%" trend={s.labourTrend}
          benchmark={s.labourCostPct <= 33 ? "on-target" : s.labourCostPct <= 35 ? "watch" : "alert"}
          invertTrend hasAlert={s.labourCostPct > 35} formula="Labour Cost ÷ Revenue × 100"
          sparklineData={dailyData.slice(-7).map(d => d.staff.labourCostPct)} delay={0} />
        <KPICard title="Revenue / Labour Hr" value={s.rplh} prefix="$" unit="/hr"
          benchmark={s.rplh >= 45 ? "on-target" : s.rplh >= 35 ? "watch" : "alert"}
          formula="Total Revenue ÷ Total Staff Hours"
          sparklineData={dailyData.slice(-7).map(d => d.staff.rplh)} delay={1} />
        <KPICard title="Staff Turnover Rate" value={metrics.turnoverRate} unit="%"
          benchmark={+metrics.turnoverRate <= 30 ? "on-target" : "alert"}
          invertTrend formula="(Left ÷ Avg Headcount) × 100" delay={2} />
        <KPICard title="Covers / Server" value={s.coversPerServer}
          benchmark={s.coversPerServer >= 25 ? "on-target" : "watch"}
          formula="Total Covers ÷ FOH Staff"
          sparklineData={dailyData.slice(-7).map(d => d.staff.coversPerServer)} delay={3} />
        <KPICard title="No-Shows" value={s.noShows} hasAlert={s.noShows > 2}
          benchmark={s.noShows <= 1 ? "on-target" : s.noShows <= 3 ? "watch" : "alert"}
          invertTrend formula="Unplanned Absences ÷ Scheduled" delay={4} />
        <KPICard title="Avg Training Hrs/Mo" value={metrics.avgTrainingHours} unit="hrs"
          benchmark={+metrics.avgTrainingHours >= 4 ? "on-target" : "watch"}
          formula="Total Training Hrs ÷ Staff Count" delay={5} />
      </div>

      <div className="section-grid section-grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="chart-container animate-in">
          <div className="chart-header">
            <div>
              <div className="chart-title">Labour Cost % Trend</div>
              <div className="chart-subtitle">14-day labour cost with 35% alert threshold</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GaugeChart value={s.labourCostPct} min={20} max={45}
              thresholds={{ warning: 33, danger: 35 }} label="of Revenue" invertThresholds={false} />
          </div>
          <div style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={labourTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
                <YAxis domain={[24, 40]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container animate-in animate-in-delay-1">
          <div className="chart-header">
            <div>
              <div className="chart-title">Covers per Server</div>
              <div className="chart-subtitle">7-day server productivity (target: 25–40)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={coversData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Bar dataKey="covers" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>

          {noShowLog.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No-Show Log (Last 14 days)</div>
              <table className="data-table">
                <thead><tr><th>Date</th><th>Day</th><th>No-Shows</th><th>Late</th></tr></thead>
                <tbody>
                  {noShowLog.map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.date}</td><td>{entry.day}</td>
                      <td style={{ color: "var(--status-danger)", fontWeight: 600 }}>{entry.noShows}</td>
                      <td>{entry.late}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
