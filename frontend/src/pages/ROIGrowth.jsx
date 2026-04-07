import KPICard from "../components/KPICard/KPICard";
import GaugeChart from "../components/Charts/GaugeChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { exportToPDF, generateDomainExportData } from "../utils/exportUtils";
import { Download } from "lucide-react";

export default function ROIGrowth({ aggregated, dailyData }) {
  const roi = aggregated.roi;
  const r = aggregated.revenue;

  const ebitdaTrend = dailyData.slice(-30).map(d => ({
    date: d.date.slice(5),
    ebitda: d.roi.ebitda,
    margin: d.roi.ebitdaMargin,
  }));

  const primeCostTrend = dailyData.slice(-14).map(d => ({
    date: d.dayName + " " + d.date.slice(8),
    cost: d.roi.primeCost,
    target: 60,
  }));

  const marketingData = [
    { channel: "Social Media", roi: roi.marketingRoi.social, spend: 800 },
    { channel: "Email", roi: roi.marketingRoi.email, spend: 300 },
    { channel: "Local Ads", roi: roi.marketingRoi.local, spend: 600 },
  ];

  const handleExport = () => {
    const { columns, rows } = generateDomainExportData(aggregated, "roi");
    exportToPDF("ROI & Growth Report", columns, rows, "roi-report");
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>ROI & Growth</h1>
          <p>Financial health, profitability, and growth levers</p>
        </div>
        <button className="export-btn" onClick={handleExport}><Download size={14} /> Export PDF</button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <KPICard title="Prime Cost %" value={roi.primeCost} unit="%" trend={roi.primeCostTrend}
          benchmark={roi.primeCost <= 58 ? "on-target" : roi.primeCost <= 62 ? "watch" : "alert"}
          invertTrend formula="(Labour + COGS) ÷ Revenue × 100"
          sparklineData={dailyData.slice(-7).map(d => d.roi.primeCost)} delay={0} />
        <KPICard title="EBITDA Margin" value={roi.ebitdaMargin} unit="%"
          benchmark={roi.ebitdaMargin >= 12 ? "on-target" : roi.ebitdaMargin >= 8 ? "watch" : "alert"}
          formula="(Rev-COGS-Labour-OpEx) ÷ Rev × 100"
          sparklineData={dailyData.slice(-7).map(d => d.roi.ebitdaMargin)} delay={1} />
        <KPICard title="EBITDA" value={roi.ebitda} prefix="$"
          formula="Rev − COGS − Labour − OpEx"
          sparklineData={dailyData.slice(-7).map(d => d.roi.ebitda)} delay={2} />
        <KPICard title="Break-Even Covers" value={roi.breakEvenCovers}
          formula="Fixed Costs ÷ Avg Margin"
          benchmark="on-target" delay={3} />
        <KPICard title="Cash Flow Runway" value={roi.cashFlowRunway} unit="days"
          benchmark={roi.cashFlowRunway >= 45 ? "on-target" : roi.cashFlowRunway >= 21 ? "watch" : "alert"}
          hasAlert={roi.cashFlowRunway < 21} formula="Cash Balance ÷ Avg Daily Outflow"
          sparklineData={dailyData.slice(-7).map(d => d.roi.cashFlowRunway)} delay={4} />
        <KPICard title="Loyalty ROI" value={roi.loyaltyRoi} unit="%"
          formula="(Incremental Rev − Cost) ÷ Cost"
          benchmark={roi.loyaltyRoi > 15 ? "on-target" : "watch"} delay={5} />
        <KPICard title="Delivery Commission" value={roi.deliveryCommission} unit="%"
          invertTrend formula="Delivery Rev × Commission %"
          benchmark={roi.netDeliveryMargin >= 12 ? "on-target" : roi.netDeliveryMargin >= 8 ? "watch" : "alert"}
          hasAlert={roi.netDeliveryMargin < 8} delay={6} />
      </div>

      <div className="section-grid section-grid-2" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="chart-container animate-in">
          <div className="chart-header">
            <div>
              <div className="chart-title">Prime Cost Gauge</div>
              <div className="chart-subtitle">Target: below 60% (Labour + COGS)</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <GaugeChart value={roi.primeCost} min={40} max={75}
              thresholds={{ warning: 58, danger: 62 }} label="Labour + COGS" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={primeCostTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <YAxis domain={[48, 68]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="cost" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
              <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container animate-in animate-in-delay-1">
          <div className="chart-header">
            <div>
              <div className="chart-title">EBITDA Trend</div>
              <div className="chart-subtitle">30-day EBITDA performance</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ebitdaTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }}
                formatter={(v) => [`$${v.toLocaleString()}`, "EBITDA"]} />
              <Area type="monotone" dataKey="ebitda" stroke="#f97316" fill="rgba(249,115,22,0.12)" strokeWidth={2} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container animate-in animate-in-delay-2">
        <div className="chart-header">
          <div>
            <div className="chart-title">Marketing ROI by Channel</div>
            <div className="chart-subtitle">Return on investment per marketing channel</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={marketingData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="channel" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} width={100} />
            <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 8 }}
              formatter={(v) => [`${v}%`, "ROI"]} />
            <Bar dataKey="roi" fill="#f97316" radius={[0, 4, 4, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
