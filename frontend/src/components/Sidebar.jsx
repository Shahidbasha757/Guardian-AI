import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Video, 
  Activity, 
  LineChart, 
  FileText, 
  Settings, 
  Cpu, 
  Terminal,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "camera", label: "Live Camera", icon: Video, path: "/camera" },
    { id: "activity", label: "Activity", icon: Activity, path: "/activity" },
    { id: "analytics", label: "Analytics", icon: LineChart, path: "/analytics" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  const isItemActive = (path) => {
    if (path === "/dashboard" && currentPath === "/") return true;
    return currentPath === path;
  };

  return (
    <aside className="fixed bottom-0 left-0 z-30 w-full p-4 md:sticky md:top-24 md:h-[calc(100vh-100px)] md:w-56 shrink-0">
      <div className="flex h-full flex-col justify-between rounded-xl glass-panel p-3.5 backdrop-blur-xl">
        
        {/* Navigation Menu */}
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span>Terminal</span>
            <Terminal className="h-3 w-3" />
          </div>

          <nav className="flex flex-row justify-around gap-1 md:flex-col md:space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition-all outline-none w-full ${
                    isActive 
                      ? "text-slate-100 font-bold" 
                      : "text-slate-450 hover:text-slate-200"
                  }`}
                >
                  {/* Active highlight slider block */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 rounded-lg bg-slate-900/60 border-l border-indigo-400"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <span className="relative z-10">
                    <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  </span>
                  
                  <span className="relative z-10 hidden md:inline-block">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Status widget */}
        <div className="hidden space-y-3.5 md:block">
          <div className="relative overflow-hidden rounded-lg border border-slate-900 bg-slate-950/20 p-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  AI CORE
                </span>
                <h4 className="text-xs font-bold text-slate-200">
                  Guardian Running
                </h4>
                <p className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block shrink-0 cyber-pulse-green" />
                  System Secure
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
                <span>Model Load</span>
                <span>14%</span>
              </div>
              <div className="h-1 w-full rounded bg-slate-900 overflow-hidden">
                <div className="h-full bg-indigo-500 w-[14%]" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950/30 hover:bg-rose-950/10 hover:text-rose-400 py-2 text-xs font-semibold text-slate-500 transition-all cursor-pointer"
          >
            <LogOut className="h-3 w-3" />
            <span>Lock Terminal</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
