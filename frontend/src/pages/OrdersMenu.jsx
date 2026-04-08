import { exportService, kpiService } from "../services/api";
import MenuQuadrantChart from "../components/Charts/MenuQuadrantChart";
import KPICard from "../components/KPICard/KPICard";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function OrdersMenu({ aggregated, dailyData }) {
  const o = aggregated.orders;
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kpiService.getMenuItems().then(res => {
      const mapped = res.data.map(item => ({
        ...item,
        sellPrice: parseFloat(item.sell_price),
        foodCost: parseFloat(item.food_cost),
        contributionMargin: parseFloat(item.sell_price) - parseFloat(item.food_cost),
      }));
      setMenuItems(mapped);
      setLoading(false);
    });
  }, []);

  const topItems = [...menuItems].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const bottomItems = [...menuItems].sort((a, b) => a.popularity - b.popularity).slice(0, 5);

  const handleExportPDF = () => {
    const url = exportService.getExportUrl("orders", "pdf", 30);
    window.open(url, "_blank");
  };

  const handleExportCSV = () => {
    const url = exportService.getExportUrl("orders", "csv", 30);
    window.open(url, "_blank");
  };

  if (loading) {
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
          <h1>Orders & Menu Analytics</h1>
          <p>Menu engineering, order quality, and upsell performance</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="export-btn" onClick={handleExportCSV}><FileText size={14} /> CSV</button>
          <button className="export-btn" onClick={handleExportPDF}><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <KPICard title="Order Error Rate" value={o.errorRate} unit="%" trend={o.errorTrend}
          benchmark={o.errorRate <= 1 ? "on-target" : o.errorRate <= 2 ? "watch" : "alert"}
          invertTrend hasAlert={o.errorRate > 2} formula="Wrong Orders ÷ Total × 100"
          sparklineData={dailyData.slice(-7).map(d => d.orders.errorRate)} delay={0} />
        <KPICard title="Cancellation Rate" value={o.cancellationRate} unit="%"
          benchmark={o.cancellationRate <= 3 ? "on-target" : o.cancellationRate <= 5 ? "watch" : "alert"}
          invertTrend hasAlert={o.cancellationRate > 5} formula="Cancelled ÷ Total × 100"
          sparklineData={dailyData.slice(-7).map(d => d.orders.cancellationRate)} delay={1} />
        <KPICard title="Upsell Conversion" value={o.upsellRate} unit="%"
          benchmark={o.upsellRate >= 40 ? "on-target" : o.upsellRate >= 30 ? "watch" : "alert"}
          formula="Orders with Upsell ÷ Total × 100"
          sparklineData={dailyData.slice(-7).map(d => d.orders.upsellRate)} delay={2} />
        <KPICard title="Item 86 Frequency" value={o.item86Count}
          benchmark={o.item86Count <= 2 ? "on-target" : o.item86Count <= 5 ? "watch" : "alert"}
          invertTrend formula="Times 86d ÷ Service Periods" delay={3} />
        <KPICard title="Bev-to-Food Ratio" value={o.bevToFoodRatio} unit="%"
          benchmark={o.bevToFoodRatio >= 30 ? "on-target" : "watch"}
          formula="Beverage Rev ÷ Food Rev × 100"
          sparklineData={dailyData.slice(-7).map(d => d.orders.bevToFoodRatio)} delay={4} />
        <KPICard title="Menu Items Tracked" value={menuItems.length} delay={5}
          benchmark="on-target" formula="42 items across 6 categories" />
      </div>

      <div className="chart-container animate-in" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">Menu Engineering Quadrant</div>
            <div className="chart-subtitle">Popularity vs contribution margin — position your items strategically</div>
          </div>
        </div>
        <MenuQuadrantChart menuItems={menuItems} />
      </div>

      <div className="section-grid section-grid-2">
        <div className="chart-container animate-in animate-in-delay-1">
          <div className="chart-header">
            <div className="chart-title">Top 5 — Best Sellers</div>
          </div>
          <table className="data-table">
            <thead><tr><th>Item</th><th>Category</th><th>Popularity</th><th>Margin</th></tr></thead>
            <tbody>
              {topItems.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.popularity}%</td>
                  <td style={{ color: "var(--status-success)" }}>${item.contributionMargin.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container animate-in animate-in-delay-2">
          <div className="chart-header">
            <div className="chart-title">Bottom 5 — Needs Attention</div>
          </div>
          <table className="data-table">
            <thead><tr><th>Item</th><th>Category</th><th>Popularity</th><th>Margin</th></tr></thead>
            <tbody>
              {bottomItems.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category}</td>
                  <td style={{ color: "var(--status-danger)" }}>{item.popularity}%</td>
                  <td>${item.contributionMargin.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
