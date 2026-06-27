import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Shield, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import { apiService } from "./services/api";
import { firebaseService } from "./services/firebase";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
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
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPresent, setUserPresent] = useState(true);
  const [pcLocked, setPcLocked] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Present");
  const [systemMetrics, setSystemMetrics] = useState({ cpu: 14, memory: 54, uptimeSeconds: 9858 });

  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Welcome Agent. I am Guardian AI, your presence-based smart assistant. How can I assist you with workstation defense today?" }
  ]);

  const [fastApiOnline, setFastApiOnline] = useState(false);
  const [firebaseActive, setFirebaseActive] = useState(false);

  const addToast = (title, message, type = "info") => {
    if (!settings.notificationToggle) return;
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const addNotificationLog = async (title, message, type = "info", category = "system") => {
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setNotifications(prev => [
      { id, title, message, time: "Just now", type, read: false },
      ...prev
    ]);

    const logRecord = { id, description: message, time: timeStr, category };
    setLogs(prev => [logRecord, ...prev]);

    await firebaseService.addActivity(logRecord);

    if (type === "alert") {
      await firebaseService.addAlert({ type, message });
    }

    addToast(title, message, type);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    addToast("Notifications Cleared", "System alert tray flushed.", "info");
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      try {
        const local = localStorage.getItem("guardian_settings");
        if (local) {
          const parsed = JSON.parse(local);
          setSettings(parsed);
          await apiService.saveSettings(parsed);
        } else {
          const apiConfig = await apiService.getSettings();
          if (apiConfig && apiConfig.data) {
            setSettings(apiConfig.data);
            localStorage.setItem("guardian_settings", JSON.stringify(apiConfig.data));
          }
        }

        const metricsRes = await apiService.getStatus();
        if (metricsRes && metricsRes.data) {
          setSystemMetrics({
            cpu: metricsRes.data.cpuUsage,
            memory: metricsRes.data.memoryUsage,
            uptimeSeconds: metricsRes.data.uptimeSeconds
          });
          setFastApiOnline(metricsRes.data.apiConnected);
        }

        const logsRes = await apiService.getActivity();
        if (logsRes && logsRes.data) {
          setLogs(logsRes.data);
        }

        setFirebaseActive(firebaseService.getIsConnected());
        setError(null);
      } catch (err) {
        setError("Failed to sync client with local services. Confirm backend server state.");
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const metricsRes = await apiService.getStatus();
        if (metricsRes && metricsRes.data) {
          setSystemMetrics({
            cpu: metricsRes.data.cpuUsage,
            memory: metricsRes.data.memoryUsage,
            uptimeSeconds: metricsRes.data.uptimeSeconds
          });
          setFastApiOnline(true);
        }

        const logsRes = await apiService.getActivity();
        if (logsRes && logsRes.data) {
          setLogs(prev => {
            const combined = [...logsRes.data, ...prev];
            const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            return unique.slice(0, 25);
          });
        }
      } catch {
        setFastApiOnline(false);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleDetectionChange = async ({ status, confidence, label }) => {
    if (status === cameraStatus) return;

    setCameraStatus(status);

    if (status === "Absent") {
      setUserPresent(false);
      addNotificationLog(
        "Operator Absent", 
        "Active user presence lost. Station console lock warning queued.", 
        "warn", 
        "threat"
      );

      if (settings.lockOnAbsence) {
        setPcLocked(true);
        await apiService.lockPC();
        
        addNotificationLog(
          "Console Locked", 
          "Workstation console auto-locked. Enforcing absence shielding.", 
          "alert", 
          "lock"
        );

        await apiService.sendTelegramAlert({
          chatId: settings.telegramChatId,
          token: settings.telegramToken,
          message: `🚨 GUARDIAN AI SECURITY ALERT: Operator left workstation. Console auto-locked.`
        });
      }
    } 
    else if (status === "Present") {
      setUserPresent(true);
      if (pcLocked) {
        setPcLocked(false);
        await apiService.unlockPC();
        
        addNotificationLog(
          "Console Unlocked", 
          "Operator identity confirmed. Station restored.", 
          "success", 
          "system"
        );
      } else {
        addToast("Operator Confirmed", "Operator biometric signature verified.", "success");
      }
    } 
    else if (status === "Multiple Persons") {
      setPcLocked(true);
      await apiService.lockPC();
      
      addNotificationLog(
        "Breach Detected", 
        "Multiple operator silhouettes detected in terminal viewport. Console locked.", 
        "alert", 
        "threat"
      );

      await apiService.sendTelegramAlert({
        chatId: settings.telegramChatId,
        token: settings.telegramToken,
        message: `🚨 GUARDIAN AI SECURITY ALERT: Multiple operators detected. Station locked immediately.`
      });
    } 
    else if (status === "Unknown") {
      setPcLocked(true);
      await apiService.lockPC();
      
      addNotificationLog(
        "Breach Detected", 
        `Unknown biometric profile detected (Match: ${confidence}%). Console locked.`, 
        "alert", 
        "threat"
      );

      await apiService.sendTelegramAlert({
        chatId: settings.telegramChatId,
        token: settings.telegramToken,
        message: `🚨 GUARDIAN AI SECURITY ALERT: Unknown operator biometric scan breach. Console locked.`
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    setTimeout(async () => {
      let reply = "";
      const textLower = userText.toLowerCase();

      if (textLower.includes("status")) {
        reply = `Core load: ${systemMetrics.cpu}%, memory: ${systemMetrics.memory}%. Workstation: ${pcLocked ? "LOCKED" : "UNLOCKED"}.`;
      } else if (textLower.includes("lock")) {
        reply = "Locking console...";
        setCameraStatus("Absent");
        setUserPresent(false);
        setPcLocked(true);
        await apiService.lockPC();
        addNotificationLog("Remote Lock", "Workstation locked remotely via security assistant chat.", "alert", "lock");
      } else if (textLower.includes("unlock")) {
        reply = "Restoring workstation presence Override...";
        setCameraStatus("Present");
        setUserPresent(true);
        setPcLocked(false);
        await apiService.unlockPC();
        addNotificationLog("Remote Unlock", "Workstation restored remotely via security assistant chat.", "success", "system");
      } else if (textLower.includes("help")) {
        reply = "Commands: status, lock, unlock, clear";
      } else if (textLower.includes("clear")) {
        reply = "Logs flushed.";
        setLogs([]);
        setNotifications([]);
      } else {
        reply = `Command: "${userText}" logged. Enter "help" for action list.`;
      }

      setChatMessages(prev => [...prev, { sender: "ai", text: reply }]);
    }, 800);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
  };

  return (
    <div className="relative min-h-screen aurora-bg overflow-x-hidden flex flex-col justify-between">
      
      {/* Structural layout backgrounds */}
      <div className="cyber-grid" />
      <div className="cyber-dots" />
      <div className="noise-overlay" />
      <div className="blob-container">
        <div className="blob-blue" />
        <div className="blob-purple" />
        <div className="blob-cyan" />
      </div>

      <div className="cursor-spotlight" />

      {/* Top Navbar */}
      <Navbar 
        notifications={notifications}
        clearNotifications={clearNotifications}
        markNotificationRead={markNotificationRead}
      />

      {/* Main Wrapper */}
      <div className="mx-auto max-w-7xl px-4 pt-2 md:px-6 w-full flex-grow">
        <div className="flex flex-col gap-6 md:flex-row">
          
          {/* Floating Sidebar */}
          <Sidebar />

          {/* Subviews match */}
          <main className="flex-grow min-w-0 md:pl-2">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route 
                  path="/dashboard" 
                  element={
                    <motion.div {...pageVariants}>
                      <Dashboard 
                        logs={logs}
                        userPresent={userPresent}
                        pcLocked={pcLocked}
                        settings={settings}
                        systemMetrics={systemMetrics}
                        notifications={notifications}
                        cameraStatus={cameraStatus}
                        loading={loading}
                        error={error}
                        onDetectionChange={handleDetectionChange}
                      />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/camera" 
                  element={
                    <motion.div {...pageVariants} className="max-w-4xl mx-auto space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div>
                          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl uppercase">Live Stream</h2>
                        </div>
                        <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[8px] font-bold text-indigo-400 uppercase tracking-widest">
                          Active Channel
                        </span>
                      </div>
                      <Dashboard 
                        logs={logs}
                        userPresent={userPresent}
                        pcLocked={pcLocked}
                        settings={settings}
                        systemMetrics={systemMetrics}
                        notifications={notifications}
                        cameraStatus={cameraStatus}
                        loading={loading}
                        error={error}
                        onDetectionChange={handleDetectionChange}
                      />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/activity" 
                  element={
                    <motion.div {...pageVariants} className="max-w-4xl mx-auto">
                      <div className="mb-4 px-1">
                        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl uppercase">Audit Timeline Logs</h2>
                      </div>
                      <Dashboard 
                        logs={logs}
                        userPresent={userPresent}
                        pcLocked={pcLocked}
                        settings={settings}
                        systemMetrics={systemMetrics}
                        notifications={notifications}
                        cameraStatus={cameraStatus}
                        loading={loading}
                        error={error}
                        onDetectionChange={handleDetectionChange}
                      />
                    </motion.div>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <motion.div {...pageVariants} className="max-w-5xl mx-auto space-y-4">
                      <div className="mb-4 px-1">
                        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl uppercase">Analytics dashboard</h2>
                      </div>
                      <Dashboard 
                        logs={logs}
                        userPresent={userPresent}
                        pcLocked={pcLocked}
                        settings={settings}
                        systemMetrics={systemMetrics}
                        notifications={notifications}
                        cameraStatus={cameraStatus}
                        loading={loading}
                        error={error}
                        onDetectionChange={handleDetectionChange}
                      />
                    </motion.div>
                  } 
                />
                <Route path="/reports" element={<Reports logs={logs} />} />
                <Route 
                  path="/settings" 
                  element={
                    <Settings 
                      settings={settings} 
                      setSettings={setSettings}
                      addNotification={addNotificationLog}
                    />
                  } 
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Footer (Stripe-like minimal diagnostics row) */}
      <footer className="mt-16 w-full py-6 border-t border-slate-900/60 bg-slate-950/20 backdrop-blur-md text-[10px] text-slate-550 font-semibold">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5 text-center md:text-left">
            <div className="flex items-center gap-1.5 justify-center md:justify-start">
              <span className="font-bold text-slate-300 uppercase tracking-widest text-[11px]">Guardian AI</span>
              <span className="text-[8px] bg-slate-900 border border-slate-850 rounded px-1 text-slate-500 font-mono">v4.2.0</span>
            </div>
            <p className="text-[8.5px] text-slate-600 font-normal">Copyright © 2026 Guardian Security Corp.</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] font-mono">
            <div className="flex items-center gap-1 bg-slate-950/40 border border-slate-900 rounded-md px-2 py-0.5 text-slate-450">
              <span className={`h-1 w-1 rounded-full ${fastApiOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>FastAPI: {fastApiOnline ? "Online" : "Mock Fallback"}</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950/40 border border-slate-900 rounded-md px-2 py-0.5 text-slate-450">
              <span className={`h-1 w-1 rounded-full ${firebaseActive ? "bg-emerald-500" : "bg-slate-650"}`} />
              <span>Firebase: {firebaseActive ? "Active" : "Sandbox"}</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950/40 border border-slate-900 rounded-md px-2 py-0.5 text-slate-450">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              <span>AI Core: Active</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950/40 border border-slate-900 rounded-md px-2 py-0.5 text-slate-450">
              <span className={`h-1 w-1 rounded-full ${settings.telegramChatId ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span>Telegram: {settings.telegramChatId ? "Linked" : "Offline"}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Alert Sliders */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-xs w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`flex items-start gap-2.5 rounded-xl glass-panel p-3 shadow-2xl border-l-2 ${
                toast.type === "alert"
                  ? "border-l-rose-500 bg-slate-950 text-slate-200"
                  : toast.type === "warn"
                  ? "border-l-amber-500 bg-slate-950 text-slate-200"
                  : toast.type === "success"
                  ? "border-l-emerald-500 bg-slate-950 text-slate-200"
                  : "border-l-indigo-500 bg-slate-950 text-slate-200"
              }`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] font-bold text-slate-255 truncate">{toast.title}</span>
                <span className="text-[9.5px] text-slate-500 leading-normal">{toast.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Chatbot Dialogue */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-650 hover:bg-indigo-550 text-white shadow-lg cursor-pointer"
        >
          {chatOpen ? <X className="h-4.5 w-4.5" /> : <MessageSquare className="h-4.5 w-4.5" />}
        </button>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-14 right-0 w-80 sm:w-88 rounded-xl glass-panel shadow-2xl p-3.5 flex flex-col h-[380px] justify-between z-50"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 border border-slate-900">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-350">Guardian Assistant</h4>
                    <span className="text-[7.5px] font-bold uppercase tracking-wider text-emerald-500">Online</span>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-slate-350 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto py-2 space-y-2 pr-0.5 text-[10.5px] leading-relaxed">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 border ${
                      msg.sender === "user"
                        ? "bg-slate-900 border-slate-800 text-slate-200"
                        : "bg-slate-950/40 border-slate-900/60 text-slate-400"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-1.5 border-t border-slate-950 pt-2 mt-1">
                <input
                  type="text"
                  placeholder="Ask security assistant..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow rounded-lg bg-slate-950/40 border border-slate-900 px-3 py-1.5 text-xs text-slate-205 outline-none focus:border-indigo-500/40"
                />
                <button
                  type="submit"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-650 hover:bg-indigo-550 text-white shrink-0 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}