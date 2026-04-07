import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { generateActiveAlerts, DEMO_SCENARIOS } from "../data/alertScenarios";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [activeScenarios, setActiveScenarios] = useState([]);
  const [alerts, setAlerts] = useState(() => generateActiveAlerts([]));
  const [acknowledgedIds, setAcknowledgedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kpi-ack-alerts") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    setAlerts(generateActiveAlerts(activeScenarios));
  }, [activeScenarios]);

  useEffect(() => {
    localStorage.setItem("kpi-ack-alerts", JSON.stringify(acknowledgedIds));
  }, [acknowledgedIds]);

  const toggleScenario = useCallback((scenarioId) => {
    setActiveScenarios(prev => {
      const isTurningOn = !prev.includes(scenarioId);
      if (isTurningOn) {
        const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
        if (scenario) {
          setAcknowledgedIds(ack => ack.filter(id => !scenario.alertIds.includes(id)));
        }
        return [...prev, scenarioId];
      }
      return prev.filter(s => s !== scenarioId);
    });
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAcknowledgedIds(prev => [...prev, alertId]);
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const activeAlerts = alerts.map(a => ({
    ...a,
    acknowledged: acknowledgedIds.includes(a.id) || a.acknowledged,
  }));

  const unacknowledgedCount = activeAlerts.filter(a => !a.acknowledged).length;

  return (
    <AlertContext.Provider value={{
      alerts: activeAlerts, unacknowledgedCount,
      activeScenarios, scenarios: DEMO_SCENARIOS,
      toggleScenario, acknowledgeAlert, dismissAlert,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertContext);
