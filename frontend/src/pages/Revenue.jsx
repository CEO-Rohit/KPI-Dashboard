import KPICard from "../components/KPICard/KPICard";
import RevenueChart from "../components/Charts/RevenueChart";
import ChannelMixChart from "../components/Charts/ChannelMixChart";
import HeatmapChart from "../components/Charts/HeatmapChart";
import { generateRevPASHHeatmap } from "../data/mockDataGenerator";
import { exportToPDF, generateDomainExportData } from "../utils/exportUtils";
import { Download } from "lucide-react";

export default function Revenue({ aggregated, dailyData }) {
  const r = aggregated.revenue;
  const heatmapRaw = generateRevPASHHeatmap(dailyData);
  const hourLabels = Array.from({ length: 12 }, (_, i) => `${i + 11}:00`);
  const dayLabels = heatmapRaw.map(d => d.day);
  const heatmapData = [];
  heatmapRaw.forEach((day, yi) => {
    day.hours.forEach((h, xi) => {
      heatmapData.push({ row: yi, col: xi, value: h.value });
    });
  });

  const handleExport = () => {
    const { columns, rows } = generateDomainExportData(aggregated, "revenue");
    exportToPDF("Revenue Intelligence Report", columns, rows, "revenue-report");
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Revenue Intelligence</h1>
          <p>Track revenue performance, channel mix, and peak hour capture</p>
        </div>
        <button className="export-btn" onClick={handleExport}><Download size={14} /> Export PDF</button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <KPICard title="Revenue Attainment" value={r.attainment} unit="%" trend={r.trend}
          benchmark={r.attainment >= 90 ? "on-target" : r.attainment >= 75 ? "watch" : "alert"}
          formula="Actual ÷ Target × 100" sparklineData={dailyData.slice(-7).map(d => +d.revenue.attainment)} delay={0} />
        <KPICard title="RevPASH" value={r.revpash} prefix="$" unit="/hr"
          benchmark={r.revpash >= 15 ? "on-target" : r.revpash >= 10 ? "watch" : "alert"}
          formula="Revenue ÷ (Seats × Op Hours)" sparklineData={dailyData.slice(-7).map(d => d.revenue.revpash)}
          hasAlert={r.revpash < 10} delay={1} />
        <KPICard title="Avg Check / Cover" value={r.avgCheck} prefix="$"
          formula="Total Revenue ÷ Total Covers" sparklineData={dailyData.slice(-7).map(d => d.revenue.avgCheck)} delay={2} />
        <KPICard title="Peak Hour Capture" value={r.peakCapture} unit="%"
          benchmark={r.peakCapture >= 35 ? "on-target" : "watch"}
          formula="Peak 2hr Rev ÷ Daily Rev" hasAlert={r.peakCapture < 35}
          sparklineData={dailyData.slice(-7).map(d => d.revenue.peakCapture)} delay={3} />
        <KPICard title="Catering & Events" value={r.eventRevenue} prefix="$"
          formula="Events Rev ÷ Total Rev × 100" delay={4} />
        <KPICard title="Total Revenue" value={r.daily} prefix="$" trend={r.trend}
          benchmark={r.daily >= r.target * 0.9 ? "on-target" : r.daily >= r.target * 0.75 ? "watch" : "alert"}
          sparklineData={dailyData.slice(-7).map(d => d.revenue.daily)} delay={5} />
      </div>

      <div className="section-grid section-grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="chart-container animate-in">
          <div className="chart-header">
            <div>
              <div className="chart-title">Daily Revenue vs Target</div>
              <div className="chart-subtitle">14-day trend with target overlay</div>
            </div>
          </div>
          <RevenueChart data={dailyData} />
        </div>
        <div className="chart-container animate-in animate-in-delay-1">
          <div className="chart-header">
            <div>
              <div className="chart-title">Channel Mix</div>
              <div className="chart-subtitle">Revenue distribution by channel</div>
            </div>
          </div>
          <ChannelMixChart dineIn={r.dineInPct} delivery={r.deliveryPct} takeaway={r.takeawayPct}
            values={{ dineIn: r.dineIn, delivery: r.delivery, takeaway: r.takeaway }} />
        </div>
      </div>

      <div className="chart-container animate-in animate-in-delay-2">
        <div className="chart-header">
          <div>
            <div className="chart-title">RevPASH Heatmap</div>
            <div className="chart-subtitle">Revenue per available seat-hour by time × day (last 7 days)</div>
          </div>
        </div>
        <HeatmapChart data={heatmapData} xLabels={hourLabels} yLabels={dayLabels} maxVal={28} valuePrefix="$" />
      </div>
    </div>
  );
}
