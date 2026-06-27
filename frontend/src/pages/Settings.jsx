import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Key, Share2, Save, AlertCircle, RefreshCw, Sliders, Smartphone, Palette } from "lucide-react";
import { apiService } from "../services/api";

export default function Settings({ settings, setSettings, addNotification }) {
  const [localToken, setLocalToken] = useState("");
  const [localChatId, setLocalChatId] = useState("");
  const [localConfidence, setLocalConfidence] = useState(85);
  const [localLockAbsence, setLocalLockAbsence] = useState(true);
  const [localSimulate, setLocalSimulate] = useState(true);
  const [localInterval, setLocalInterval] = useState(5);
  const [localSensitivity, setLocalSensitivity] = useState(80);
  const [localNotification, setLocalNotification] = useState(true);
  const [localTheme, setLocalTheme] = useState("cyberpunk");
  const [localCamera, setLocalCamera] = useState("default_cam");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalToken(settings.telegramToken || "");
      setLocalChatId(settings.telegramChatId || "");
      setLocalConfidence(settings.confidenceThreshold || 85);
      setLocalLockAbsence(settings.lockOnAbsence !== undefined ? settings.lockOnAbsence : true);
      setLocalSimulate(settings.isSimulating !== undefined ? settings.isSimulating : true);
      setLocalInterval(settings.captureInterval || 5);
      setLocalSensitivity(settings.aiSensitivity || 80);
      setLocalNotification(settings.notificationToggle !== undefined ? settings.notificationToggle : true);
      setLocalTheme(settings.theme || "cyberpunk");
      setLocalCamera(settings.cameraSelection || "default_cam");
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updatedSettings = {
      telegramToken: localToken,
      telegramChatId: localChatId,
      confidenceThreshold: Number(localConfidence),
      lockOnAbsence: localLockAbsence,
      isSimulating: localSimulate,
      captureInterval: Number(localInterval),
      aiSensitivity: Number(localSensitivity),
      notificationToggle: localNotification,
      theme: localTheme,
      cameraSelection: localCamera
    };

    const res = await apiService.saveSettings(updatedSettings);
    if (res && res.data) {
      setSettings(res.data);
      localStorage.setItem("guardian_settings", JSON.stringify(res.data));
    }

    addNotification({
      title: "Settings Saved",
      message: "Configurations synchronized to core database.",
      type: "success",
      category: "system"
    });

    setSaving(false);
  };

  const handleReset = () => {
    const defaults = {
      telegramToken: "629910485:AAE9Ox1b_m...",
      telegramChatId: "981104859",
      confidenceThreshold: 85,
      lockOnAbsence: true,
      isSimulating: true,
      captureInterval: 5,
      aiSensitivity: 80,
      notificationToggle: true,
      theme: "cyberpunk",
      cameraSelection: "default_cam"
    };

    setLocalToken(defaults.telegramToken);
    setLocalChatId(defaults.telegramChatId);
    setLocalConfidence(defaults.confidenceThreshold);
    setLocalLockAbsence(defaults.lockOnAbsence);
    setLocalSimulate(defaults.isSimulating);
    setLocalInterval(defaults.captureInterval);
    setLocalSensitivity(defaults.aiSensitivity);
    setLocalNotification(defaults.notificationToggle);
    setLocalTheme(defaults.theme);
    setLocalCamera(defaults.cameraSelection);

    setSettings(defaults);
    localStorage.setItem("guardian_settings", JSON.stringify(defaults));

    addNotification({
      title: "Settings Reset",
      message: "Restored system default engine configurations.",
      type: "info",
      category: "system"
    });
  };

  const triggerTestAlert = async () => {
    addNotification({
      title: "Telegram Dispatch Triggered",
      message: `Sending biometric check warning telemetry package to Chat: ${localChatId}`,
      type: "warn",
      category: "telegram"
    });

    await apiService.sendTelegramAlert({
      chatId: localChatId,
      token: localToken,
      message: "WARNING: Guardian AI Alert. Workstation console breach check triggered."
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl uppercase">System Settings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure biometrics, camera scanning loops, theme modes and Telegram notification hooks.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Side */}
        <div className="space-y-6">
          
          {/* Biometrics */}
          <div className="rounded-xl glass-panel p-4.5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-350">
                Biometric Settings
              </h3>
            </div>

            {/* Simulation toggle */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <div className="flex flex-col">
                <span>Face Recognition Simulation</span>
                <span className="text-[9px] text-slate-550 mt-0.5">Toggle mock scanning for testing logs</span>
              </div>
              <input
                type="checkbox"
                checked={localSimulate}
                onChange={(e) => setLocalSimulate(e.target.checked)}
                className="h-3.5 w-7 rounded-full appearance-none bg-slate-900 checked:bg-indigo-500 relative cursor-pointer transition-all duration-300 before:content-[''] before:absolute before:h-2.5 before:w-2.5 before:bg-slate-500 checked:before:bg-slate-100 before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition-all"
              />
            </div>

            {/* AI Sensitivity */}
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>AI Model Sensitivity</span>
                <span className="text-indigo-400 font-mono">{localSensitivity}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={localSensitivity}
                onChange={(e) => setLocalSensitivity(Number(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
            </div>

            {/* Threshold slider */}
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Alert Confidence Threshold</span>
                <span className="text-indigo-400 font-mono">{localConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={localConfidence}
                onChange={(e) => setLocalConfidence(Number(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
            </div>

            {/* Capture Interval slider */}
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Camera Scan Capture Interval</span>
                <span className="text-indigo-400 font-mono">{localInterval} Seconds</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={localInterval}
                onChange={(e) => setLocalInterval(Number(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Autolock Rules */}
          <div className="rounded-xl glass-panel p-4.5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Shield className="h-4 w-4 text-indigo-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-350">
                Enforcement Policies
              </h3>
            </div>

            {/* Auto Lock PC */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <div className="flex flex-col">
                <span>Auto Lock Terminal on Absence</span>
                <span className="text-[9px] text-slate-550 mt-0.5">Enforce lock screen immediately on absence</span>
              </div>
              <input
                type="checkbox"
                checked={localLockAbsence}
                onChange={(e) => setLocalLockAbsence(e.target.checked)}
                className="h-3.5 w-7 rounded-full appearance-none bg-slate-900 checked:bg-indigo-500 relative cursor-pointer transition-all duration-300 before:content-[''] before:absolute before:h-2.5 before:w-2.5 before:bg-slate-500 checked:before:bg-slate-100 before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition-all"
              />
            </div>

            {/* Notification Toggle */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <div className="flex flex-col">
                <span>Local Toast Notifications</span>
                <span className="text-[9px] text-slate-550 mt-0.5">Trigger pop-up alerts on state changes</span>
              </div>
              <input
                type="checkbox"
                checked={localNotification}
                onChange={(e) => setLocalNotification(e.target.checked)}
                className="h-3.5 w-7 rounded-full appearance-none bg-slate-900 checked:bg-indigo-500 relative cursor-pointer transition-all duration-300 before:content-[''] before:absolute before:h-2.5 before:w-2.5 before:bg-slate-500 checked:before:bg-slate-100 before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition-all"
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-slate-950/20 border border-slate-900 p-3 text-[10px] text-slate-500">
              <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="leading-normal">
                Enforced screen policies secure local terminal session interfaces when matching confidence levels decline.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          
          {/* Telegram bot */}
          <div className="rounded-xl glass-panel p-4.5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Share2 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-350">
                Telegram Dispatch Hook
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                Bot Authorization Token
              </label>
              <input
                type="password"
                placeholder="Token..."
                value={localToken}
                onChange={(e) => setLocalToken(e.target.value)}
                className="w-full rounded-lg bg-slate-950/40 border border-slate-900 px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500/40 placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1 mt-3">
              <label className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                Target Chat / Channel ID
              </label>
              <input
                type="text"
                placeholder="Chat ID..."
                value={localChatId}
                onChange={(e) => setLocalChatId(e.target.value)}
                className="w-full rounded-lg bg-slate-950/40 border border-slate-900 px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500/40 placeholder:text-slate-700"
              />
            </div>

            <button
              type="button"
              onClick={triggerTestAlert}
              className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950/30 px-3.5 py-2 text-xs font-bold text-slate-400 hover:bg-slate-900/30 transition-all w-full justify-center cursor-pointer"
            >
              <span>Test Webhook Alert</span>
            </button>
          </div>

          {/* Theme & Camera */}
          <div className="rounded-xl glass-panel p-4.5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Palette className="h-4 w-4 text-indigo-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-350">
                Device Settings
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                Select GUI Theme Mode
              </label>
              <select
                value={localTheme}
                onChange={(e) => setLocalTheme(e.target.value)}
                className="w-full rounded-lg bg-slate-950/40 border border-slate-900 px-3 py-2 text-xs text-slate-400 outline-none focus:border-indigo-500/40"
              >
                <option value="cyberpunk" className="bg-slate-950 text-slate-300">Neon Cyberpunk</option>
                <option value="dark" className="bg-slate-950 text-slate-300">Deep Slate Dark</option>
                <option value="glassmorphic" className="bg-slate-950 text-slate-300">Apple VisionOS Glass</option>
              </select>
            </div>

            <div className="space-y-1.5 mt-3">
              <label className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                Select Active Camera Device
              </label>
              <select
                value={localCamera}
                onChange={(e) => setLocalCamera(e.target.value)}
                className="w-full rounded-lg bg-slate-950/40 border border-slate-900 px-3 py-2 text-xs text-slate-400 outline-none focus:border-indigo-500/40"
              >
                <option value="default_cam" className="bg-slate-950 text-slate-300">Default Integrated Webcam</option>
                <option value="external_usb" className="bg-slate-950 text-slate-300">External USB Camera Device</option>
                <option value="ip_rtsp" className="bg-slate-950 text-slate-300">RTSP Net Security Stream</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950/30 hover:bg-rose-950/15 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-450 transition-all w-1/3 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-650 hover:bg-indigo-550 py-2.5 text-xs font-bold text-white shadow transition-all w-2/3 cursor-pointer"
            >
              <span>{saving ? "Syncing..." : "Save Configurations"}</span>
            </button>
          </div>

        </div>
      </form>
    </motion.div>
  );
}
