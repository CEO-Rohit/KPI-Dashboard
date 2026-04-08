import { useState, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { TimeRangeProvider, useTimeRange } from "./context/TimeRangeContext";
import { RoleProvider } from "./context/RoleContext";
import { AlertProvider } from "./context/AlertContext";
import Sidebar from "./components/Layout/Sidebar";
import TopBar from "./components/Layout/TopBar";
import CommandCentre from "./pages/CommandCentre";
import Revenue from "./pages/Revenue";
import Operations from "./pages/Operations";
import OrdersMenu from "./pages/OrdersMenu";
import Staff from "./pages/Staff";
import Customer from "./pages/Customer";
import Inventory from "./pages/Inventory";
import ROIGrowth from "./pages/ROIGrowth";
import SmartAlerts from "./pages/SmartAlerts";
import { DataProvider, useData } from "./context/DataProvider";

function DashboardContent() {
  const [activePage, setActivePage] = useState("command");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, error, aggregated, dailyData, heatmaps } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium animate-pulse text-slate-400 tracking-widest uppercase">Initializing KPI Intelligence Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white p-8">
        <div className="text-center max-w-md p-8 rounded-2xl bg-slate-900 border border-red-500/30 shadow-2xl shadow-red-500/10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-6">{error || "The backend intelligence engine is unreachable. Please check if the server is running."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const props = { aggregated, dailyData, heatmaps };
    switch (activePage) {
      case "command": return <CommandCentre {...props} onNavigate={setActivePage} />;
      case "revenue": return <Revenue {...props} />;
      case "operations": return <Operations {...props} />;
      case "orders": return <OrdersMenu {...props} />;
      case "staff": return <Staff {...props} />;
      case "customer": return <Customer {...props} />;
      case "inventory": return <Inventory {...props} />;
      case "roi": return <ROIGrowth {...props} />;
      case "alerts": return <SmartAlerts />;
      default: return <CommandCentre {...props} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main className={`app-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <TopBar
          activePage={activePage}
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenu={() => setMobileOpen(true)}
          onNavigate={setActivePage}
        />
        <div className="app-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TimeRangeProvider>
        <RoleProvider>
          <AlertProvider>
            <DataProvider>
              <DashboardContent />
              <Toaster position="bottom-right" />
            </DataProvider>
          </AlertProvider>
        </RoleProvider>
      </TimeRangeProvider>
    </ThemeProvider>
  );
}
