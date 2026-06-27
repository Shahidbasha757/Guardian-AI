import React from "react";
import { motion } from "framer-motion";
import { UserCheck, ShieldAlert, Cpu, Share2, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatusCard({ type, title, value, statusText, statusType, trendData = [10, 15, 8, 20, 18, 25, 30] }) {
  
  const getConfig = () => {
    switch (type) {
      case "user":
        return {
          icon: UserCheck,
          iconColor: "text-emerald-400 border-slate-900 bg-slate-950/40",
          statusColor: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10",
          sparkColor: "#10b981",
          pulse: "bg-emerald-500"
        };
      case "pc":
        return {
          icon: Cpu,
          iconColor: "text-blue-400 border-slate-900 bg-slate-950/40",
          statusColor: "text-blue-400 bg-blue-500/5 border-blue-500/10",
          sparkColor: "#3b82f6",
          pulse: "bg-blue-500"
        };
      case "monitoring":
        return {
          icon: ShieldAlert,
          iconColor: "text-indigo-400 border-slate-900 bg-slate-950/40",
          statusColor: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10",
          sparkColor: "#6366f1",
          pulse: "bg-indigo-500"
        };
      case "telegram":
        return {
          icon: Share2,
          iconColor: "text-amber-400 border-slate-900 bg-slate-950/40",
          statusColor: "text-amber-400 bg-amber-500/5 border-amber-500/10",
          sparkColor: "#f59e0b",
          pulse: "bg-amber-500"
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: "text-slate-400 border-slate-900 bg-slate-950/40",
          statusColor: "text-slate-400 bg-slate-500/5 border-slate-500/10",
          sparkColor: "#94a3b8",
          pulse: "bg-slate-500"
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const width = 100;
  const height = 30;
  const max = Math.max(...trendData);
  const min = Math.min(...trendData);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = trendData
    .map((val, i) => {
      const x = (i / (trendData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = trendData[trendData.length - 1] >= trendData[0];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl glass-panel p-4.5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-white">
            {value}
          </h3>
        </div>

        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider ${config.statusColor}`}>
          <span className={`h-1 w-1 rounded-full ${config.pulse} shrink-0`} />
          {statusText}
        </span>
      </div>

      {/* Sparkline & Details */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${config.iconColor}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>

          <div className="flex flex-col">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
              Monitor
            </span>
            <div className="flex items-center text-[9px] font-semibold text-slate-400">
              {isUp ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-405 mr-0.5 shrink-0" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-rose-405 mr-0.5 shrink-0" />
              )}
              <span className={isUp ? "text-emerald-400" : "text-rose-400"}>
                {isUp ? "+4.2%" : "-1.5%"}
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline SVG */}
        <div className="relative w-20 h-6 shrink-0 opacity-80">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.sparkColor} stopOpacity="0.15" />
                <stop offset="100%" stopColor={config.sparkColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={config.sparkColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            <path
              d={`M0,${height} L${points} L${width},${height} Z`}
              fill={`url(#gradient-${type})`}
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
