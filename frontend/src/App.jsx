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
import { generateDailyData, getAggregatedData } from "./data/mockDataGenerator";

function DashboardContent() {
  const [activePage, setActivePage] = useState("command");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { timeRange } = useTimeRange();

  const dailyData = useMemo(() => generateDailyData(90), []);
  const aggregated = useMemo(() => getAggregatedData(dailyData, timeRange), [dailyData, timeRange]);

  const renderPage = () => {
    const props = { aggregated, dailyData };
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
            <DashboardContent />
            <Toaster position="bottom-right" />
          </AlertProvider>
        </RoleProvider>
      </TimeRangeProvider>
    </ThemeProvider>
  );
}
