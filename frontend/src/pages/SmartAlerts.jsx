import AlertPanel from "../components/Alerts/AlertPanel";
import AlertSimulator from "../components/Alerts/AlertSimulator";

export default function SmartAlerts() {
  return (
    <div>
      <div className="page-header">
        <h1>Smart Alerts</h1>
        <p>Real-time threshold monitoring with actionable recommendations</p>
      </div>

      <div style={{ marginBottom: "var(--space-xl)" }}>
        <AlertSimulator />
      </div>

      <AlertPanel />
    </div>
  );
}
