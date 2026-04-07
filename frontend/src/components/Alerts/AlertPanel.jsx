import { useState } from "react";
import { useAlerts } from "../../context/AlertContext";
import { AlertTriangle, Clock, Check, X, Filter } from "lucide-react";
import { KPI_DOMAINS } from "../../data/businessProfile";

export default function AlertPanel({ compact = false }) {
  const { alerts, acknowledgeAlert, dismissAlert } = useAlerts();
  const [filter, setFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = alerts.filter(a => {
    if (filter !== "all" && a.domain !== filter) return false;
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    return true;
  });

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.round((now - d) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.round(diffMin / 60)}h ago`;
  };

  return (
    <div className="alert-panel">
      <div className="alert-panel-header">
        <div className="alert-panel-title">
          <AlertTriangle size={18} />
          Active Alerts ({filtered.length})
        </div>
        {!compact && (
          <div className="alert-panel-filters">
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", borderRadius: "6px", padding: "4px 8px", fontSize: "12px", color: "var(--text-primary)" }}>
              <option value="all">All Domains</option>
              {KPI_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            {["all", "critical", "warning", "info"].map(s => (
              <button key={s} className={`alert-filter-btn ${severityFilter === s ? "active" : ""}`}
                onClick={() => setSeverityFilter(s)}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="alert-list">
        {filtered.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)" }}>
            <Check size={24} style={{ marginBottom: 8 }} />
            <p>No active alerts matching your filter</p>
          </div>
        ) : (
          filtered.map((alert, i) => (
            <div key={`${alert.id}-${i}`} className={`alert-item ${alert.acknowledged ? "acknowledged" : ""}`}>
              <div className={`alert-severity-dot ${alert.severity}`} />
              <div className="alert-content">
                <div className="alert-title">{alert.kpi}</div>
                <div className="alert-condition">{alert.condition}</div>
                {!compact && <div className="alert-action">💡 {alert.action}</div>}
              </div>
              <div className="alert-meta">
                <span className="alert-time"><Clock size={10} /> {formatTime(alert.triggeredAt)}</span>
                <span className="alert-domain-tag">{alert.domain}</span>
                {!alert.acknowledged && (
                  <button className="alert-dismiss-btn" onClick={() => acknowledgeAlert(alert.id)}>
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
