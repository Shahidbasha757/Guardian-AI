import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { LineChart as ChartIcon, AlertOctagon, Timer, Percent, ArrowUpRight, Database } from "lucide-react";
import { apiService } from "../services/api";

export default function Analytics() {
  const [range, setRange] = useState("daily"); // daily, weekly, monthly
  const [datasets, setDatasets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const res = await apiService.getAnalytics();
      if (res && res.data) {
        setDatasets(res.data);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const getActiveData = () => {
    if (!datasets) return [];
    return datasets[range] || [];
  };

  const activeData = getActiveData();

  const getStats = () => {
    switch (range) {
      case "weekly":
        return { presence: "91.2%", alerts: "15 Alerts", uptime: "94.5 Hours", accuracy: "98.1%" };
      case "monthly":
        return { presence: "93.4%", alerts: "38 Alerts", uptime: "374.8 Hours", accuracy: "98.3%" };
      case "daily":
      default:
        return { presence: "89.4%", alerts: "7 Alerts", uptime: "14.8 Hours", accuracy: "98.2%" };
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-5">
      
      {/* Header filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Threat Intelligence Analytics
          </h4>
        </div>

        {/* Range selectors */}
        <div className="flex items-center gap-1 bg-slate-950/20 border border-slate-900 rounded-lg p-1 text-[10px] font-bold">
          {["daily", "weekly", "monthly"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-2.5 py-1 transition-colors uppercase text-[9px] cursor-pointer ${
                range === r ? "bg-slate-900 text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-350"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-550 space-y-2 rounded-xl glass-panel">
          <Database className="h-6 w-6 text-indigo-400 animate-spin" />
          <span className="text-xs font-semibold">Resolving Data...</span>
        </div>
      ) : (
        <>
          {/* 4 Mini Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Presence average */}
            <div className="rounded-xl glass-panel p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Timer className="h-3 w-3 text-indigo-400" />
                  Presence Average
                </span>
                <div className="text-base font-bold text-slate-200">{stats.presence}</div>
              </div>
            </div>

            {/* Alerts warns */}
            <div className="rounded-xl glass-panel p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3 text-rose-500" />
                  Telegram Alerts
                </span>
                <div className="text-base font-bold text-slate-200">{stats.alerts}</div>
              </div>
            </div>

            {/* Uptime */}
            <div className="rounded-xl glass-panel p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <ChartIcon className="h-3 w-3 text-indigo-400" />
                  Uptime Monitor
                </span>
                <div className="text-base font-bold text-slate-200">{stats.uptime}</div>
              </div>
            </div>

            {/* Scan confidence */}
            <div className="rounded-xl glass-panel p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Percent className="h-3 w-3 text-emerald-400" />
                  Scan Confidence
                </span>
                <div className="text-base font-bold text-slate-200">{stats.accuracy}</div>
              </div>
            </div>
          </div>

          {/* Recharts Plots */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            
            {/* Presence Area Chart */}
            <div className="rounded-xl glass-panel p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Operator Presence & Biometric Confidence
                  </h4>
                </div>
                <span className="rounded bg-slate-950 px-2 py-0.5 text-[8px] font-mono text-indigo-400 border border-slate-900">
                  BIOMETRIC_PROFILE
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.05} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.015)" />
                    <XAxis dataKey={range === "daily" ? "time" : range === "weekly" ? "day" : "week"} stroke="rgba(255,255,255,0.2)" fontSize={8.5} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={8.5} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10, 12, 22, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "10.5px"
                      }}
                    />
                    <Area type="monotone" dataKey="presence" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPresence)" name="Presence%" />
                    <Area type="monotone" dataKey="confidence" stroke="#06b6d4" strokeWidth={1} fillOpacity={1} fill="url(#colorConfidence)" name="Confidence%" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts Bar Chart */}
            <div className="rounded-xl glass-panel p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Incidents & Average Accuracy Check
                  </h4>
                </div>
                <span className="rounded bg-slate-950 px-2 py-0.5 text-[8px] font-mono text-rose-450 border border-slate-900">
                  INCIDENTS_LOG
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.015)" />
                    <XAxis dataKey={range === "daily" ? "time" : range === "weekly" ? "day" : "week"} stroke="rgba(255,255,255,0.2)" fontSize={8.5} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={8.5} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10, 12, 22, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "10.5px"
                      }}
                    />
                    <Bar dataKey="alerts" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Telegram Dispatches" />
                    <Bar dataKey="accuracy" fill="#10b981" radius={[3, 3, 0, 0]} name="Average Accuracy%" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
