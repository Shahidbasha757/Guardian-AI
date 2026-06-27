import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Search, Calendar, FileText, CheckCircle, ShieldAlert, Cpu, Database } from "lucide-react";
import { apiService } from "../services/api";

export default function Reports({ logs }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const res = await apiService.getReports();
      if (res && res.data) {
        setReports(res.data);
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(rep => {
    const matchesSearch = rep.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? rep.date === dateFilter : true;
    const matchesStatus = statusFilter === "all" ? true : rep.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("No activities to export!");
      return;
    }

    const headers = ["Log ID", "Category", "Description", "Time"];
    const csvRows = [headers.join(",")];

    logs.forEach(log => {
      const row = [
        `"${log.id || "AUTO"}"`,
        `"${log.category}"`,
        `"${log.description.replace(/"/g, '""')}"`,
        `"${log.time}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `guardian_security_activity_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const reportTitle = "GUARDIAN AI WORKSTATION AUDIT REPORT";
    const divider = "==========================================================";
    const dateStr = `Export Date: ${new Date().toLocaleString()}`;
    const statsStr = `Total Activities Logged: ${logs.length}\nCritical Incidents: ${logs.filter(l => l.category === "threat").length}`;
    
    let reportBody = `${reportTitle}\n${divider}\n${dateStr}\n${statsStr}\n\nACTIVITIES TIMELINE:\n`;
    logs.forEach((log, index) => {
      reportBody += `[${log.time}] [${log.category.toUpperCase()}] ID_${log.id ? log.id.slice(0, 5) : "AUTO"}: ${log.description}\n`;
    });
    
    const blob = new Blob([reportBody], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `guardian_security_audit_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl uppercase">Security Reports</h2>
          <p className="text-xs text-slate-400 mt-1">Export, search and filter security compliance audit logs.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950/30 hover:bg-slate-900/40 px-3 py-2 text-xs font-bold text-slate-350 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow transition-all cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Export Report TXT</span>
          </button>
        </div>
      </div>

      {/* Grid boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl glass-panel p-4.5 space-y-2">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Station Compliance</h4>
          <p className="text-[10px] text-slate-500 leading-normal">Workspace complies with standard corporate biometrics lock rules.</p>
          <span className="inline-flex rounded-full bg-emerald-500/5 border border-emerald-550/10 px-2 py-0.5 text-[8px] font-bold text-emerald-400">PASSED</span>
        </div>

        <div className="rounded-xl glass-panel p-4.5 space-y-2">
          <Cpu className="h-5 w-5 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Integrations State</h4>
          <p className="text-[10px] text-slate-500 leading-normal">Telegram push hooks verified and telemetry socket connections running.</p>
          <span className="inline-flex rounded-full bg-indigo-500/5 border border-indigo-550/10 px-2 py-0.5 text-[8px] font-bold text-indigo-400">VERIFIED</span>
        </div>

        <div className="rounded-xl glass-panel p-4.5 space-y-2">
          <ShieldAlert className="h-5 w-5 text-rose-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Intrusion Logs</h4>
          <p className="text-[10px] text-slate-500 leading-normal">Recent threat events checked and marked as resolved in timeline.</p>
          <span className="inline-flex rounded-full bg-rose-500/5 border border-rose-550/10 px-2 py-0.5 text-[8px] font-bold text-rose-450">
            {logs.filter(l => l.category === "threat").length} CRITICAL
          </span>
        </div>
      </div>

      {/* Filters form */}
      <div className="rounded-xl glass-panel p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search report titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-950/40 border border-slate-900 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/40 pl-8.5"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
        </div>

        <div className="flex flex-wrap w-full md:w-auto items-center gap-3 justify-end">
          <div className="relative flex items-center">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg bg-slate-950/40 border border-slate-900 px-3 py-1.5 text-xs text-slate-500 outline-none focus:border-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950/20 border border-slate-900 rounded-lg p-0.5 text-xs font-semibold">
            {["all", "Passed", "Review"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded px-2.5 py-1 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                  statusFilter === st ? "bg-slate-900 text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="rounded-xl glass-panel p-4.5 space-y-3.5">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-550">Daily Threat Audit Checks</h4>
        
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-600 space-y-2">
            <Database className="h-6 w-6 text-indigo-400 animate-spin" />
            <span className="text-xs font-semibold">Resolving report database...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-10 text-center text-slate-600 text-xs font-semibold">
            No matching reports found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReports.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs border border-slate-900/60 bg-slate-950/15 hover:bg-slate-950/40 rounded-lg px-3.5 py-2.5 transition-colors">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200">{item.title}</div>
                  <div className="text-[9.5px] text-slate-500 flex items-center gap-2">
                    <span>Date: {item.date}</span>
                    <span>•</span>
                    <span>Threats: {item.threats}</span>
                    <span>•</span>
                    <span>Alerts: {item.alerts}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded px-2 py-0.5 text-[8px] font-bold border ${
                    item.status.toLowerCase() === "passed"
                      ? "bg-emerald-500/5 border-emerald-550/10 text-emerald-400"
                      : "bg-amber-500/5 border-amber-555/10 text-amber-450"
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}
