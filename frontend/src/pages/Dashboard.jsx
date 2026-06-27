import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cpu, Heart, Thermometer, CloudRain, Clock, AlertOctagon } from "lucide-react";
import StatusCard from "../components/StatusCard";
import CameraFeed from "../components/CameraFeed";
import ActivityLog from "../components/ActivityLog";
import Analytics from "../components/Analytics";

// Detection Status Banner component
function DetectionStatusBanner({ userPresent, pcLocked, absenceTimer, detectionConfidence = 98, cameraStatus }) {
  return (
    <AnimatePresence mode="wait">
      {pcLocked ? (
        <motion.div
          key="locked"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl glass-panel border-rose-500/30 bg-rose-950/20 p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <div className="text-left">
              <h4 className="text-xs font-bold text-rose-450 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔒 WORKSTATION LOCKED</span>
              </h4>
              <p className="text-[10px] text-slate-455 mt-0.5 font-medium">The workstation is locked. Operator identity check failed.</p>
              <div className="text-[9px] font-mono text-rose-400 mt-1 font-bold">Confidence: 0%</div>
            </div>
          </div>
        </motion.div>
      ) : cameraStatus === "Multiple Persons" ? (
        <motion.div
          key="multiple"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl glass-panel border-amber-500/30 bg-amber-950/15 p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <div className="text-left">
              <h4 className="text-xs font-bold text-amber-450 uppercase tracking-wider">⚠ Multiple Users Detected</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Multiple operator silhouettes detected in terminal viewport.</p>
              <div className="text-[9px] font-mono text-amber-400 mt-1 font-bold">Confidence: {Math.round(detectionConfidence)}%</div>
            </div>
          </div>
        </motion.div>
      ) : userPresent ? (
        <motion.div
          key="detected"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl glass-panel border-emerald-500/30 bg-emerald-950/10 p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🟢 USER DETECTED</h4>
              <p className="text-[10px] text-slate-455 mt-0.5 font-medium">Guardian AI detected the user.</p>
              <p className="text-[10px] text-slate-455 mt-0.5 font-medium">Monitoring Active.</p>
              <div className="text-[9px] font-mono text-emerald-400 mt-1 font-bold">Confidence: {Math.round(detectionConfidence)}%</div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="absent"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl glass-panel border-rose-500/30 bg-rose-950/15 p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <div className="text-left">
              <h4 className="text-xs font-bold text-rose-450 uppercase tracking-wider">🔴 NO USER FOUND</h4>
              <p className="text-[10px] text-slate-450 mt-0.5 font-medium">
                Waiting for user...
              </p>
              {absenceTimer > 0 && (
                <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
                  Absent for {absenceTimer} seconds. System will lock after 50 seconds.
                </p>
              )}
              <div className="text-[9px] font-mono text-rose-400 mt-1 font-bold">Confidence: 0%</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Dashboard({ 
  logs, 
  userPresent, 
  pcLocked, 
  settings, 
  systemMetrics,
  notifications,
  cameraStatus,
  loading,
  error,
  onDetectionChange,
  absenceTimer = 0,
  isCounting = false,
  detectionConfidence = 98
}) {
  const [uptime, setUptime] = useState("00h 00m 00s");

  useEffect(() => {
    let startSeconds = systemMetrics.uptimeSeconds || 9858;
    const interval = setInterval(() => {
      startSeconds += 1;
      const hrs = String(Math.floor(startSeconds / 3600)).padStart(2, "0");
      const mins = String(Math.floor((startSeconds % 3600) / 60)).padStart(2, "0");
      const secs = String(startSeconds % 60).padStart(2, "0");
      setUptime(`${hrs}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [systemMetrics.uptimeSeconds]);

  const SkeletonLoader = () => (
    <div className="space-y-6">
      <div className="h-40 rounded-xl glass-panel animate-pulse p-6 bg-slate-950/20" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-xl glass-panel animate-pulse bg-slate-950/20" />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="rounded-xl glass-panel border-rose-500/20 bg-rose-950/5 p-6 text-center max-w-sm mx-auto mt-12 space-y-4">
        <AlertOctagon className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Connection Interrupted</h3>
        <p className="text-xs text-slate-450">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold px-3 py-1.5 text-xs transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const getUserPresenceVal = () => {
    switch (cameraStatus) {
      case "Absent": return "Absent";
      case "Multiple Persons": return "Multiple Operators";
      case "Unknown": return "Unknown Signature";
      case "Present":
      default: return "Authorized User";
    }
  };

  const getUserPresenceBadge = () => {
    switch (cameraStatus) {
      case "Absent": return "Away";
      case "Multiple Persons": return "Warning";
      case "Unknown": return "Threat";
      case "Present":
      default: return "Secure";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Hero block (Stripe-like minimal) */}
      <div className="relative overflow-hidden rounded-xl glass-panel p-5 md:p-6.5">
        <div className="flex flex-col-reverse items-center justify-between gap-6 md:flex-row">
          
          <div className="space-y-3.5 text-left max-w-xl">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-0.5 text-[8.5px] font-bold text-indigo-400 uppercase tracking-wider">
                AI Engine Active
              </span>
              <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                Model: Biometric_v4
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Guardian AI Security Console
              </h2>
              <p className="text-[11px] text-slate-450 font-medium tracking-wide uppercase">
                Presence Based Smart Security Assistant
              </p>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-400 font-normal">
              Workstation console biometrics administrator. Sweeps viewport sensors to confirm authorized presence, locking interfaces and dispatching Telegram alerts upon anomaly detection.
            </p>
          </div>

          {/* Minimal line-vector shield */}
          <div className="relative flex h-24 w-24 items-center justify-center shrink-0">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-slate-800"
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-xl border border-slate-850 bg-slate-950/40">
              <Shield className="h-6 w-6 text-indigo-400/80" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>

        </div>
      </div>

      {/* 4 Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          type="user"
          title="Presence Status"
          value={getUserPresenceVal()}
          statusText={getUserPresenceBadge()}
          statusType={cameraStatus === "Present" ? "success" : cameraStatus === "Absent" ? "danger" : "warning"}
          trendData={cameraStatus === "Present" ? [85, 88, 92, 90, 94, 98, 96] : [90, 80, 50, 20, 10, 5, 5]}
        />
        
        <StatusCard
          type="pc"
          title="Console Policy"
          value={pcLocked ? "Locked" : "Unlocked"}
          statusText={pcLocked ? "Protected" : "Unlocked"}
          statusType={pcLocked ? "danger" : "success"}
          trendData={pcLocked ? [5, 5, 5, 100, 100, 100, 100] : [100, 100, 100, 100, 5, 5, 5]}
        />

        <StatusCard
          type="monitoring"
          title="AI Shield Status"
          value={pcLocked ? "Lock Mode" : "Monitoring Active"}
          statusText={pcLocked ? "System Locked" : "API Connected"}
          statusType={pcLocked ? "danger" : "success"}
          trendData={[99, 98, 99, 99, 98, 99, 98.8]}
        />

        <StatusCard
          type="telegram"
          title="Telegram Link"
          value={settings.telegramChatId ? "Bot Synced" : "Bot Unlinked"}
          statusText={settings.telegramChatId ? "Online" : "Offline"}
          statusType={settings.telegramChatId ? "success" : "warning"}
          trendData={settings.telegramChatId ? [1, 2, 0, 3, 2, 1, 4] : [0, 0, 0, 0, 0, 0, 0]}
        />
      </div>

      {/* Grid: Left camera, Right diagnostics metrics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Sensor Camera Viewport
            </h4>
          </div>
          <DetectionStatusBanner 
            userPresent={userPresent} 
            pcLocked={pcLocked} 
            absenceTimer={absenceTimer} 
            detectionConfidence={detectionConfidence}
            cameraStatus={cameraStatus}
          />
          <CameraFeed 
            isSimulating={settings.isSimulating} 
            confidenceThreshold={settings.confidenceThreshold}
            captureInterval={settings.captureInterval}
            cameraSelection={settings.cameraSelection}
            onDetectionChange={onDetectionChange}
          />
        </div>

        {/* Telemetry diagnostics sidebar */}
        <div className="lg:col-span-4 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Host Diagnostics
            </h4>
          </div>

          <div className="rounded-xl glass-panel p-4.5 space-y-4">
            
            {/* Minimal Protection Score */}
            <div className="flex items-center justify-between bg-slate-950/20 border border-slate-900 rounded-lg p-3.5">
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Protection Health
                </span>
                <h4 className="text-xl font-bold text-slate-200">98 / 100</h4>
                <p className="text-[8px] text-emerald-400 font-semibold">Workspace fully compliant</p>
              </div>
              <Shield className="h-5 w-5 text-indigo-400/60" />
            </div>

            {/* Weather / Acid rain environment */}
            <div className="rounded-lg bg-slate-950/10 border border-slate-900 p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Station Climate
                </span>
                <p className="text-[11px] font-semibold text-slate-300">Neo-Tokyo, Acid Rain</p>
                <p className="text-[9px] text-slate-500">Temp: 24°C</p>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400/80">
                <CloudRain className="h-4 w-4" />
                <Thermometer className="h-4 w-4" />
              </div>
            </div>

            {/* Metrics sliders */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>CPU Core Load</span>
                  <span className="font-mono text-slate-300 text-[10px]">{systemMetrics.cpu}%</span>
                </div>
                <div className="h-1 w-full rounded bg-slate-950 overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${systemMetrics.cpu}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Memory Buffer</span>
                  <span className="font-mono text-slate-300 text-[10px]">{systemMetrics.memory}%</span>
                </div>
                <div className="h-1 w-full rounded bg-slate-950 overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${systemMetrics.memory}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>System Uptime</span>
                  <span className="font-mono text-slate-350 text-[9.5px]">{uptime}</span>
                </div>
                <div className="h-1 w-full rounded bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%]" />
                </div>
              </div>
            </div>

            {/* Threat checklist */}
            <div className="border-t border-slate-900 pt-3.5 space-y-2">
              <h5 className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                Audited Incidents
              </h5>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] rounded-lg bg-slate-950/20 border border-slate-900 px-3 py-1.5">
                  <span className="text-slate-400">Intrusions Intercepted</span>
                  <span className="font-mono font-bold text-rose-400">
                    {logs.filter(l => l.category === "threat").length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] rounded-lg bg-slate-950/20 border border-slate-900 px-3 py-1.5">
                  <span className="text-slate-400">Policy locks executed</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {logs.filter(l => l.category === "lock").length}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Recharts Analytics & Timeline logs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Analytics />
        </div>
        <div className="lg:col-span-5">
          <ActivityLog logs={logs} />
        </div>
      </div>

    </div>
  );
}
