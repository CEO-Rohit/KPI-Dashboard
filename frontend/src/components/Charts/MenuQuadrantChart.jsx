import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const QUADRANT_COLORS = { star: "#10b981", plowhorse: "#6366f1", puzzle: "#f59e0b", dog: "#ef4444" };
const QUADRANT_LABELS = { star: "Stars ★", plowhorse: "Plowhorses 🐴", puzzle: "Puzzles 🧩", dog: "Dogs 🐕" };

export default function MenuQuadrantChart({ menuItems = [] }) {
  const data = menuItems.map(item => ({
    name: item.name,
    x: item.popularity,
    y: item.contributionMargin,
    quadrant: item.quadrant,
    category: item.category,
    sellPrice: item.sellPrice,
    foodCost: item.foodCost,
  }));
  const avgPopularity = data.length ? data.reduce((s, d) => s + d.x, 0) / data.length : 0;
  const avgMargin = data.length ? data.reduce((s, d) => s + d.y, 0) / data.length : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-primary)",
        borderRadius: "8px", padding: "12px", boxShadow: "var(--shadow-lg)",
        minWidth: "180px",
      }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{d.name}</p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Category: {d.category}</p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Popularity: {d.x}%</p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Margin: ${d.y.toFixed(2)}</p>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Sell Price: ${d.sellPrice}</p>
        <p style={{ fontSize: "12px", color: QUADRANT_COLORS[d.quadrant], fontWeight: 600 }}>{QUADRANT_LABELS[d.quadrant]}</p>
      </div>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
          <XAxis type="number" dataKey="x" name="Popularity"
            tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
            label={{ value: "Popularity →", position: "bottom", fontSize: 12, fill: "var(--text-secondary)" }} />
          <YAxis type="number" dataKey="y" name="Contribution Margin"
            tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
            label={{ value: "Margin $", angle: -90, position: "insideLeft", fontSize: 12, fill: "var(--text-secondary)" }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={avgPopularity} stroke="var(--text-tertiary)" strokeDasharray="5 5" />
          <ReferenceLine y={avgMargin} stroke="var(--text-tertiary)" strokeDasharray="5 5" />
          <Scatter data={data} animationDuration={800}>
            {data.map((d, i) => <Cell key={i} fill={QUADRANT_COLORS[d.quadrant]} r={7} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="quadrant-legend">
        {Object.entries(QUADRANT_LABELS).map(([key, label]) => (
          <div key={key} className="quadrant-legend-item">
            <div className="quadrant-dot" style={{ background: QUADRANT_COLORS[key] }} />
            <span>{label} ({data.filter(d => d.quadrant === key).length})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
