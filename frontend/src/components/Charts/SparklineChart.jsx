import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function SparklineChart({ data = [], color = "#6366f1" }) {
  if (!data || data.length === 0) return null;
  const chartData = data.map((v, i) => ({ v, i }));

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2}
          dot={false} isAnimationActive={true} animationDuration={800} />
      </LineChart>
    </ResponsiveContainer>
  );
}
