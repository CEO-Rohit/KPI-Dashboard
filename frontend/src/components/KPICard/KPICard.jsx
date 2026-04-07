import { Bell, Info } from "lucide-react";
import TrendArrow from "../Common/TrendArrow";
import BenchmarkBadge from "../Common/BenchmarkBadge";
import SparklineChart from "../Charts/SparklineChart";
import { useTimeRange } from "../../context/TimeRangeContext";

export default function KPICard({
  title, value, unit = "", prefix = "", formula,
  trend, benchmark, sparklineData, hasAlert = false,
  invertTrend = false, className = "", delay = 0,
}) {
  const { timeRange } = useTimeRange();
  const periodLabel = timeRange === "today" ? "Today" : timeRange === "week" ? "This Week" : "This Month";

  const formatValue = () => {
    if (typeof value === "number") {
      if (unit === "%") return `${value}%`;
      if (prefix === "$") return `$${value.toLocaleString()}`;
      if (unit === "min") return `${value} min`;
      if (unit === "x") return `${value}x`;
      if (unit === "hrs") return `${value} hrs`;
      if (unit === "days") return `${value} days`;
      if (unit === "/hr") return `$${value}/hr`;
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className={`kpi-card animate-in animate-in-delay-${delay % 7} ${className}`}>
      {hasAlert && (
        <div className="kpi-card-alert-icon">
          <Bell size={16} fill="currentColor" />
        </div>
      )}
      <div className="kpi-card-header">
        <div className="kpi-card-title">
          {title}
          {formula && (
            <span className="formula-trigger">
              <Info size={13} />
              <span className="formula-tooltip">{formula}</span>
            </span>
          )}
        </div>
        {benchmark && <BenchmarkBadge status={benchmark} />}
      </div>
      <div className="kpi-card-value">
        {prefix && !["$"].includes(prefix) && prefix}{formatValue()}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="sparkline-container">
          <SparklineChart data={sparklineData} color={benchmark === "alert" ? "#ef4444" : benchmark === "watch" ? "#f59e0b" : "#6366f1"} />
        </div>
      )}
      <div className="kpi-card-footer">
        {trend && (
          <TrendArrow direction={trend.direction} value={trend.value} invertColor={invertTrend} />
        )}
        <span className="kpi-card-period">{periodLabel}</span>
      </div>
    </div>
  );
}
