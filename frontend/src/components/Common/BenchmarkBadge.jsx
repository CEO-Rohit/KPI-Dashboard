import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

export default function BenchmarkBadge({ status, label }) {
  const config = {
    "on-target": { icon: CheckCircle, text: label || "On Target" },
    "watch": { icon: AlertTriangle, text: label || "Watch" },
    "alert": { icon: AlertCircle, text: label || "Alert" },
  };
  const { icon: Icon, text } = config[status] || config["on-target"];

  return (
    <span className={`benchmark-badge ${status}`}>
      <Icon size={12} />
      {text}
    </span>
  );
}
