import { useState } from "react";
import {
  LayoutDashboard, DollarSign, Activity, UtensilsCrossed, Users,
  Heart, Package, TrendingUp, Bell, ChevronLeft, ChevronRight,
  Clock, Shield
} from "lucide-react";
import { useAlerts } from "../../context/AlertContext";
import { useRole } from "../../context/RoleContext";
import { useTimeRange } from "../../context/TimeRangeContext";
import { ROLES, TIME_RANGES } from "../../data/businessProfile";

const ICON_MAP = { LayoutDashboard, DollarSign, Activity, UtensilsCrossed, Users, Heart, Package, TrendingUp, Bell };

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { unacknowledgedCount } = useAlerts();
  const { role, setRole } = useRole();
  const { timeRange, setTimeRange } = useTimeRange();

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? "visible" : ""}`} onClick={onCloseMobile} />
      <nav className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">R</div>
          <span className="sidebar-brand-text">Rasoi Master</span>
        </div>

        <div className="sidebar-nav">
          {/* Mobile-only Role & Time Selectors */}
          {mobileOpen && (
            <div className="mobile-selectors-section">
              <div className="sidebar-section-title">Perspective</div>
              <div className="mobile-selector-grid">
                {ROLES.map(r => (
                  <button key={r.id} 
                    className={`mobile-selector-btn ${role === r.id ? "active" : ""}`}
                    onClick={() => { setRole(r.id); onCloseMobile(); }}>
                    <Shield size={14} />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>

              <div className="sidebar-section-title" style={{ marginTop: "1rem" }}>Timeline</div>
              <div className="mobile-selector-grid">
                {TIME_RANGES.map(tr => (
                  <button key={tr.id}
                    className={`mobile-selector-btn ${timeRange === tr.id ? "active" : ""}`}
                    onClick={() => { setTimeRange(tr.id); onCloseMobile(); }}>
                    <Clock size={14} />
                    <span>{tr.label}</span>
                  </button>
                ))}
              </div>
              <div className="sidebar-divider" />
            </div>
          )}

          <div className="sidebar-section-title">Navigation</div>
          {NAV_ITEMS.map((item, idx) => {
            const Icon = ICON_MAP[item.icon];
            const showSection = item.section && !collapsed && (idx === 1 || idx === 8);
            return (
              <div key={item.id}>
                {showSection && <div className="sidebar-section-title">{item.section}</div>}
                <div
                  className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => { onNavigate(item.id); onCloseMobile(); }}
                >
                  <Icon size={20} className="sidebar-nav-icon" />
                  <span className="sidebar-nav-label">{item.label}</span>
                  {item.id === "alerts" && unacknowledgedCount > 0 && (
                    <span className="sidebar-nav-badge">{unacknowledgedCount}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!mobileOpen && (
          <button className="sidebar-collapse-btn" onClick={onToggleCollapse}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </nav>
    </>
  );
}

const NAV_ITEMS = [
  { id: "command", label: "Command Centre", icon: "LayoutDashboard" },
  { id: "revenue", label: "Revenue", icon: "DollarSign", section: "Domains" },
  { id: "operations", label: "Operations", icon: "Activity" },
  { id: "orders", label: "Orders & Menu", icon: "UtensilsCrossed" },
  { id: "staff", label: "Staff", icon: "Users" },
  { id: "customer", label: "Customer", icon: "Heart" },
  { id: "inventory", label: "Inventory", icon: "Package" },
  { id: "roi", label: "ROI & Growth", icon: "TrendingUp" },
  { id: "alerts", label: "Smart Alerts", icon: "Bell", section: "System" },
];
