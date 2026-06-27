import React from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, Key, MessageSquare, ToggleLeft } from "lucide-react";

export default function ActivityLog({ logs }) {
  
  const getLogIcon = (category) => {
    switch (category) {
      case "threat":
        return { icon: ShieldAlert, color: "text-rose-450 bg-slate-950/40 border-slate-900" };
      case "lock":
        return { icon: Key, color: "text-amber-450 bg-slate-950/40 border-slate-900" };
      case "telegram":
        return { icon: MessageSquare, color: "text-orange-450 bg-slate-950/40 border-slate-900" };
      case "system":
        return { icon: Shield, color: "text-indigo-400 bg-slate-950/40 border-slate-900" };
      default:
        return { icon: ToggleLeft, color: "text-slate-400 bg-slate-950/40 border-slate-900" };
    }
  };

  const getLogBadge = (category) => {
    switch (category) {
      case "threat":
        return "bg-rose-500/5 text-rose-400 border border-rose-500/10";
      case "lock":
        return "bg-amber-500/5 text-amber-450 border border-amber-500/10";
      case "telegram":
        return "bg-orange-500/5 text-orange-450 border border-orange-500/10";
      case "system":
        return "bg-indigo-500/5 text-indigo-400 border border-indigo-500/10";
      default:
        return "bg-slate-500/5 text-slate-400 border border-slate-500/10";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="rounded-xl glass-panel p-4.5 shadow-xl min-h-[380px] flex flex-col justify-between">
      <div className="mb-3.5 flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Security Timeline
        </h4>
        <span className="rounded bg-slate-950 border border-slate-900 px-2 py-0.5 text-[8px] font-mono text-slate-500">
          REALTIME
        </span>
      </div>

      {/* Timeline logs */}
      <div className="relative flex-grow overflow-y-auto pr-1 max-h-[300px]">
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center py-10 text-slate-600 text-xs font-semibold">
            Timeline empty
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative border-l border-slate-900 pl-4.5 ml-2.5 py-1 space-y-3.5"
          >
            {logs.map((log, index) => {
              const iconCfg = getLogIcon(log.category);
              const LogIcon = iconCfg.icon;
              
              return (
                <motion.div
                  key={log.id || index}
                  variants={itemVariants}
                  className="relative group"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[24px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-slate-950 border border-slate-900">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      log.category === "threat" 
                        ? "bg-rose-500" 
                        : log.category === "lock" 
                        ? "bg-amber-500"
                        : log.category === "telegram"
                        ? "bg-orange-500"
                        : "bg-indigo-400"
                    }`} />
                  </div>

                  {/* Glass Log Item */}
                  <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-950/10 border border-slate-900/60 hover:border-slate-850 p-2.5 transition-all">
                    <div className="flex gap-2.5">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${iconCfg.color}`}>
                        <LogIcon className="h-3.5 w-3.5" />
                      </div>
                      
                      <div className="flex flex-col">
                        <p className="text-[11.5px] font-semibold text-slate-200">
                          {log.description}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`rounded px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider ${getLogBadge(log.category)}`}>
                            {log.category === "threat" ? "alert" : log.category}
                          </span>
                          <span className="text-[9px] font-medium text-slate-500">
                            {log.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[8px] font-mono text-slate-600 group-hover:text-slate-500 uppercase shrink-0 mt-0.5">
                      {log.id ? log.id.slice(0, 4) : "SYS"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
