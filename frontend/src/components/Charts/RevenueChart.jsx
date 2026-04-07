import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Line, ComposedChart } from "recharts";

export default function RevenueChart({ data = [], showTarget = true }) {
  const chartData = data.slice(-14).map(d => ({
    date: d.dayName + " " + d.date.slice(5),
    revenue: d.revenue.daily,
    target: d.revenue.target,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-primary)",
        borderRadius: "8px", padding: "12px", boxShadow: "var(--shadow-lg)",
      }}>
        <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: "13px", color: p.color }}>
            {p.name}: ${p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={800} />
        {showTarget && (
          <Line type="monotone" dataKey="target" name="Target" stroke="#f59e0b"
            strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={800} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
