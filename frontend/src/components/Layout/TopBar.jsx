import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Bell, Menu, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTimeRange } from "../../context/TimeRangeContext";
import { useRole } from "../../context/RoleContext";
import { useAlerts } from "../../context/AlertContext";
import { TIME_RANGES, ROLES } from "../../data/businessProfile";
import toast from "react-hot-toast";

const PAGE_TITLES = {
  command: "Command Centre",
  revenue: "Revenue Intelligence",
  operations: "Operations Monitor",
  orders: "Orders & Menu Analytics",
  staff: "Staff Performance",
  customer: "Customer Intelligence",
  inventory: "Inventory & Waste",
  roi: "ROI & Growth",
  alerts: "Smart Alerts",
};

export default function TopBar({ activePage, sidebarCollapsed, onMobileMenu, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const { timeRange, setTimeRange } = useTimeRange();
  const { role, setRole } = useRole();
  const { alerts, unacknowledgedCount, acknowledgeAlert } = useAlerts();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`topbar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMobileMenu}>
          <Menu size={20} />
        </button>
        <h2 className="topbar-title">{PAGE_TITLES[activePage] || "Dashboard"}</h2>
        <div className="time-selector">
          {TIME_RANGES.map(tr => (
            <button key={tr.id}
              className={`time-selector-btn ${timeRange === tr.id ? "active" : ""}`}
              onClick={() => setTimeRange(tr.id)}>
              {tr.label}
            </button>
          ))}
        </div>
      </div>
      <div className="topbar-right">
        <div className="role-switcher">
          {ROLES.map(r => (
            <button key={r.id}
              className={`role-btn ${role === r.id ? "active" : ""}`}
              onClick={() => setRole(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div className="alert-bell-container" ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <button className="alert-bell" title="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {unacknowledgedCount > 0 && <span className="alert-bell-badge">{unacknowledgedCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <div>Notifications</div>
                {unacknowledgedCount > 0 && <span className="notifications-count">{unacknowledgedCount} new</span>}
              </div>
              <div className="notifications-body">
                {alerts.filter(a => !a.acknowledged).length === 0 ? (
                  <div className="notifications-empty">✨ You're all caught up!</div>
                ) : (
                  alerts.filter(a => !a.acknowledged).slice(0, 5).map(alert => (
                    <div key={alert.id} className="notification-item">
                      <div className={`alert-severity-dot ${alert.severity}`} style={{ marginTop: "4px" }} />
                      <div className="notification-content">
                        <div className="notification-title">{alert.kpi}</div>
                        <div className="notification-desc" title={alert.condition}>{alert.condition}</div>
                      </div>
                      <button className="notification-ack-btn" title="Acknowledge" onClick={() => {
                        acknowledgeAlert(alert.id);
                        toast.success(`Acknowledged: ${alert.kpi}`, {
                          style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-primary)',
                          },
                          iconTheme: {
                            primary: 'var(--status-success)',
                            secondary: 'white',
                          },
                        });
                      }}>
                        <Check size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="notifications-footer" onClick={() => {
                setShowNotifications(false);
                onNavigate("alerts");
              }}>
                View all in Smart Alerts
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
