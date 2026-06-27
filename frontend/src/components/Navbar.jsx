import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Moon, Sun, Shield, ChevronRight, User, Clock, AlertTriangle, ShieldCheck, Settings, LogOut } from "lucide-react";

export default function Navbar({ notifications, clearNotifications, markNotificationRead }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedSuggestIndex, setSelectedSuggestIndex] = useState(-1);
  const [time, setTime] = useState(new Date());
  const [cyberMode, setCyberMode] = useState(true);

  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getBreadcrumb = () => {
    switch (currentPath) {
      case "/dashboard":
      case "/":
        return "Dashboard";
      case "/camera":
        return "Live Camera";
      case "/activity":
        return "Activity Logs";
      case "/analytics":
        return "Analytics";
      case "/reports":
        return "Security Reports";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const searchIndex = [
    { label: "System Dashboard Overview", category: "Navigation", path: "/dashboard" },
    { label: "Live Face Scanner feed", category: "Navigation", path: "/camera" },
    { label: "Audit Timeline Log logs", category: "Navigation", path: "/activity" },
    { label: "Analytics Graphs and Metrics", category: "Navigation", path: "/analytics" },
    { label: "Export CSV and PDF reports", category: "Navigation", path: "/reports" },
    { label: "Engine Confidence Configuration", category: "Settings", path: "/settings" },
    { label: "Telegram integration webhook setup", category: "Settings", path: "/settings" },
    { label: "Biometric matching sensitivity settings", category: "Settings", path: "/settings" },
    { label: "Lock console policy controls", category: "Settings", path: "/settings" },
  ];

  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    return searchIndex.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const suggestions = getSuggestions();

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestIndex >= 0 && selectedSuggestIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedSuggestIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setSearchFocused(false);
    }
  };

  const handleSelectSuggestion = (suggest) => {
    navigate(suggest.path);
    setSearchQuery("");
    setSearchFocused(false);
    setSelectedSuggestIndex(-1);
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-xl glass-panel px-5 py-2.5 backdrop-blur-xl">
        
        {/* Left Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 shadow-sm">
            <Shield className="h-4 w-4 text-indigo-400" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white uppercase">
                Guardian AI
              </span>
              <span className="rounded bg-slate-900 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 border border-slate-800">
                L4
              </span>
            </div>
            <span className="hidden text-[9px] tracking-wide text-slate-500 md:inline-block">
              Presence Security Assistant
            </span>
          </div>
        </div>

        {/* Center Breadcrumb */}
        <div className="hidden items-center gap-1.5 text-[11px] font-medium text-slate-500 lg:flex">
          <span>Guardian AI</span>
          <ChevronRight className="h-3 w-3 text-slate-700" />
          <motion.span 
            key={currentPath}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-350 font-semibold"
          >
            {getBreadcrumb()}
          </motion.span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3.5">
          
          {/* Real-time Clock */}
          <div className="hidden items-center gap-1.5 rounded-lg bg-slate-950/20 border border-slate-900 px-2.5 py-1 text-[11px] font-mono text-slate-400 sm:flex">
            <Clock className="h-3.5 w-3.5 text-indigo-400/80" />
            <span>{formatTime(time)}</span>
          </div>

          {/* Search Box with Autocomplete */}
          <div ref={searchRef} className="relative hidden md:block">
            <div className={`flex items-center gap-2 rounded-lg bg-slate-950/30 border px-2.5 py-1.5 transition-all w-48 ${
              searchFocused ? "border-slate-700 bg-slate-950/60" : "border-slate-850"
            }`}>
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSuggestIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-transparent text-[11px] text-slate-200 outline-none placeholder:text-slate-650"
              />
            </div>

            {/* Suggestions Overlay */}
            <AnimatePresence>
              {searchFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-1.5 z-50 rounded-lg glass-panel p-1.5 shadow-2xl max-h-56 overflow-y-auto"
                >
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseEnter={() => setSelectedSuggestIndex(index)}
                      className={`flex flex-col w-full text-left rounded-md p-1.5 text-[11px] transition-colors ${
                        selectedSuggestIndex === index 
                          ? "bg-slate-900 text-cyan-400 font-semibold" 
                          : "text-slate-400"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{item.category}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cyber Mode Button */}
          <button
            onClick={() => setCyberMode(!cyberMode)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
              cyberMode 
                ? "border-slate-800 bg-slate-900/40 text-cyan-400"
                : "border-slate-900 bg-slate-950/20 text-slate-500 hover:text-slate-350"
            }`}
          >
            {cyberMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                showNotifications 
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-900 bg-slate-950/20 text-slate-400 hover:text-slate-300"
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 z-50 w-72 rounded-xl glass-panel p-3 shadow-2xl"
                  >
                    <div className="mb-2 flex items-center justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alerts</span>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => {
                            clearNotifications();
                            setShowNotifications(false);
                          }}
                          className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 uppercase hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-5 text-center text-slate-650">
                          <p className="text-[10px]">No notification alerts</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`flex items-start gap-2 rounded-lg p-2 text-[10.5px] border transition-colors cursor-pointer ${
                              !notif.read ? "bg-slate-900/30 border-slate-850" : "bg-slate-950/10 border-slate-900/40 opacity-50"
                            } ${
                              notif.type === "alert" ? "hover:border-rose-500/10" : "hover:border-indigo-500/10"
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {notif.type === "alert" ? (
                                <AlertTriangle className="h-3 w-3 text-rose-500" />
                              ) : (
                                <Shield className="h-3 w-3 text-indigo-400" />
                              )}
                            </div>

                            <div className="flex-grow flex flex-col gap-0.5 min-w-0">
                              <span className="font-bold text-slate-300 truncate">{notif.title}</span>
                              <span className="text-[9px] text-slate-500 leading-normal">{notif.message}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 outline-none cursor-pointer group"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 shadow-sm">
                <User className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-300" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 cyber-pulse-green"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 z-50 w-44 rounded-lg glass-panel p-1.5 shadow-2xl"
                  >
                    <div className="px-2 py-1 border-b border-slate-900 mb-1">
                      <p className="text-[11px] font-bold text-slate-300">Prajyesh</p>
                      <p className="text-[8px] text-slate-500 font-mono">Sysadmin</p>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors w-full text-left"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        window.location.reload();
                      }}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-rose-450 hover:bg-rose-950/20 transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Lock Terminal</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
}
