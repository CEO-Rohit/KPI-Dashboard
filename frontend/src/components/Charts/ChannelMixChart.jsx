import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b"];

export default function ChannelMixChart({ dineIn = 60, delivery = 27, takeaway = 13, values = null }) {
  const data = [
    { name: "Dine-in", value: dineIn, amount: values?.dineIn },
    { name: "Delivery", value: delivery, amount: values?.delivery },
    { name: "Takeaway", value: takeaway, amount: values?.takeaway },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-primary)",
        borderRadius: "8px", padding: "12px", boxShadow: "var(--shadow-lg)",
      }}>
        <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</p>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{d.value.toFixed(1)}%</p>
        {d.amount && <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>${d.amount.toLocaleString()}</p>}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            dataKey="value" animationDuration={800} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS[i] }} />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{d.name}</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginLeft: "auto" }}>{d.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
