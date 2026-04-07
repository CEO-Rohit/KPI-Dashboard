import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const STATUS_COLORS = { success: "#10b981", warning: "#f59e0b", danger: "#ef4444" };

export default function GaugeChart({ value = 0, min = 0, max = 100, thresholds = { warning: 33, danger: 66 }, label = "", unit = "%", size = 180, invertThresholds = false }) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  let status;
  if (invertThresholds) {
    status = value <= thresholds.warning ? "success" : value <= thresholds.danger ? "warning" : "danger";
  } else {
    status = value >= thresholds.danger ? "danger" : value >= thresholds.warning ? "warning" : "success";
  }
  const color = STATUS_COLORS[status];

  const data = [
    { value: pct },
    { value: 100 - pct },
  ];

  return (
    <div className="gauge-container">
      <ResponsiveContainer width={size} height={size / 2 + 20}>
        <PieChart>
          <Pie data={data} cx="50%" cy="95%" startAngle={180} endAngle={0}
            innerRadius={size * 0.3} outerRadius={size * 0.42}
            dataKey="value" stroke="none" animationDuration={800}>
            <Cell fill={color} />
            <Cell fill="var(--bg-tertiary)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="gauge-value" style={{ color }}>{value}{unit}</div>
      {label && <div className="gauge-label">{label}</div>}
    </div>
  );
}
