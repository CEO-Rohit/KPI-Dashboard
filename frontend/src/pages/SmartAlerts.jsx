import { useState } from "react";
import AlertPanel from "../components/Alerts/AlertPanel";
import AlertSimulator from "../components/Alerts/AlertSimulator";
import ThresholdSettings from "../components/Alerts/ThresholdSettings";
import { MessageSquare, Settings2, ShieldCheck } from "lucide-react";

export default function SmartAlerts() {
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'settings'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <ShieldCheck size={32} />
            </span>
            Smart Alerts & Governance
          </h1>
          <p className="text-slate-400 mt-2">Real-time threshold monitoring with actionable intelligence and rule management</p>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button 
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "live" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-slate-500 hover:text-slate-300"}`}
          >
            <MessageSquare size={16} /> Live Feed
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "settings" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Settings2 size={16} /> Rule Config
          </button>
        </div>
      </div>

      {activeTab === "live" ? (
        <div className="animate-in">
          <div className="mb-8">
            <AlertSimulator />
          </div>
          <AlertPanel />
        </div>
      ) : (
        <div className="animate-in">
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl">
            <ThresholdSettings />
          </div>
        </div>
      )}
    </div>
  );
}
