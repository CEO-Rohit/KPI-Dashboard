import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export default function TrendArrow({ direction = "flat", value, invertColor = false }) {
  const getClass = () => {
    if (direction === "flat") return "flat";
    const isPositiveDir = direction === "up";
    const isGood = invertColor ? !isPositiveDir : isPositiveDir;
    return `${direction} ${isGood ? "positive" : "negative"}`;
  };

  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;

  return (
    <span className={`kpi-card-trend ${getClass()}`}>
      <Icon size={14} />
      {value !== undefined && <span>{value}%</span>}
    </span>
  );
}
