import { Zap } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";

export default function AlertSimulator() {
  const { scenarios, activeScenarios, toggleScenario } = useAlerts();

  return (
    <div className="alert-simulator">
      <div className="alert-simulator-title">
        <Zap size={18} /> Alert Simulation Toggle
      </div>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
        Toggle demo scenarios to simulate alert conditions and see the alert system in action.
      </p>
      {scenarios.map(s => {
        const isActive = activeScenarios.includes(s.id);
        return (
          <div key={s.id} className={`scenario-card ${isActive ? "active" : ""}`} onClick={() => toggleScenario(s.id)} style={{ cursor: "pointer" }}>
            <div>
              <div className="scenario-name">{s.name}</div>
              <div className="scenario-desc">{s.description}</div>
            </div>
            <div className={`scenario-toggle ${isActive ? "active" : ""}`} role="switch" aria-checked={isActive} />
          </div>
        );
      })}
    </div>
  );
}
