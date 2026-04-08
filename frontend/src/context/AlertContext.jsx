import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { alertService } from "../services/api";
import { toast } from "react-hot-toast";

const AlertContext = createContext();

export const DEMO_SCENARIOS = [
  {
    id: "delivery_spike",
    name: "🚚 Delivery Time Spike",
    description: "Simulates delivery times exceeding 40 min due to kitchen backlog",
    alertIds: ["delivery_time_high", "ktt_high", "cancellation_spike"],
  },
  {
    id: "waste_crisis",
    name: "🗑️ Food Waste Threshold Breach",
    description: "Daily waste exceeds 5% due to over-preparation",
    alertIds: ["food_waste_high", "shrinkage_high", "food_cost_high"],
  },
  {
    id: "staffing_crisis",
    name: "👥 Staff No-Show Crisis",
    description: "Two servers and a line cook call in sick on a Saturday evening",
    alertIds: ["staff_noshow", "rplh_drop", "dwell_time_high", "order_error_high"],
  },
];

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [activeScenarios, setActiveScenarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await alertService.getAlerts();
      setAlerts(res.data);
      setUnacknowledgedCount(res.unacknowledgedCount);
      
      // Update active scenarios based on triggered alerts
      const activeFromAlerts = [
        ...new Set(res.data.filter(a => a.active && a.fromScenario).map(a => a.fromScenario))
      ];
      setActiveScenarios(activeFromAlerts);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const toggleScenario = useCallback(async (scenarioId) => {
    const isActive = activeScenarios.includes(scenarioId);
    try {
      if (isActive) {
        await alertService.resetScenario(scenarioId);
        setActiveScenarios(prev => prev.filter(id => id !== scenarioId));
        toast.success(`Scenario reset`);
      } else {
        await alertService.triggerScenario(scenarioId);
        setActiveScenarios(prev => [...prev, scenarioId]);
        toast.success(`Scenario triggered`);
      }
      fetchAlerts(); // Refresh state
    } catch (err) {
      toast.error(`Failed to toggle scenario: ${err.message}`);
    }
  }, [activeScenarios, fetchAlerts]);

  const acknowledgeAlert = useCallback(async (alertId) => {
    try {
      await alertService.acknowledge(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
      setUnacknowledgedCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(`Error acknowledging alert: ${err.message}`);
    }
  }, []);

  const dismissAlert = useCallback(async (alertId) => {
    try {
      await alertService.dismiss(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      fetchAlerts(); // Re-sync count
      toast.success("Alert dismissed");
    } catch (err) {
      toast.error(`Error dismissing alert: ${err.message}`);
    }
  }, [fetchAlerts]);

  return (
    <AlertContext.Provider value={{
      alerts, 
      unacknowledgedCount,
      activeScenarios, 
      scenarios: DEMO_SCENARIOS,
      loading,
      toggleScenario, 
      acknowledgeAlert, 
      dismissAlert,
      refreshAlerts: fetchAlerts,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertContext);
