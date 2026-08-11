import React, { useState, useMemo } from "react";
import { 
  SyslogEvent, 
  Severity, 
  FilterState, 
  FilterPreset 
} from "../types";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  CircleAlert, 
  CircleCheck, 
  Download, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  Copy, 
  Check, 
  SlidersHorizontal,
  FileSpreadsheet,
  FileCode,
  Sparkles
} from "lucide-react";

interface EventExplorerProps {
  events: SyslogEvent[];
  presets: FilterPreset[];
  activeFilter: FilterState;
  setActiveFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectEvent: (event: SyslogEvent) => void;
  onClearLogs: () => void;
  onSavePreset: (name: string, description: string) => void;
}

const severityStyles: Record<Severity, string> = {
  Debug: "text-[#8ea8cb] bg-[#07111e] border-[#1f3354]",
  Info: "text-[#00a3e0] bg-[#0066cc]/20 border-[#00a3e0]/40",
  Notice: "text-[#00a3e0] bg-[#0066cc]/30 border-[#00a3e0]/50",
  Warning: "text-amber-400 bg-amber-950/40 border-amber-800/50",
  Error: "text-red-400 bg-red-950/40 border-red-800/50",
  Critical: "text-red-400 bg-red-950/70 border-red-600/70 font-bold",
  Alert: "text-red-500 bg-red-950/80 border-red-600",
  Emergency: "text-red-500 bg-red-950 border-red-500",
};

export const EventExplorer: React.FC<EventExplorerProps> = ({
  events,
  presets,
  activeFilter,
  setActiveFilter,
  onSelectEvent,
  onClearLogs,
  onSavePreset,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDesc, setNewPresetDesc] = useState("");

  // Extract unique filter fields dynamically from dataset and sort alphabetically
  const uniqueHosts = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.host) set.add(e.host);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [events]);

  const uniqueComponents = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const comp = e.logComponent || e.facility;
      if (comp) set.add(comp);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [events]);

  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const u =
        e.attributes.user ||
        e.attributes.src_user ||
        e.attributes.user_name ||
        e.attributes.userName ||
        e.attributes.live_user;
      if (u && u.trim()) set.add(u.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [events]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const c =
        e.attributes.category ||
        e.attributes.cat_name ||
        e.attributes.catName ||
        e.attributes.web_category;
      if (c && c.trim()) set.add(c.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [events]);

  const uniqueApps = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const a =
        e.attributes.app_name ||
        e.attributes.appName ||
        e.attributes.application ||
        e.attributes.app;
      if (a && a.trim()) set.add(a.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [events]);

  const uniqueStatuses = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const st = e.attributes.status || e.attributes.action || e.attributes.log_subtype;
      if (st && st.trim()) set.add(st.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [events]);

  // Filter pipeline
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Search query
      if (activeFilter.searchQuery) {
        const q = activeFilter.searchQuery.toLowerCase();
        const fullText = `${e.host} ${e.ip} ${e.message} ${e.facility} ${e.source} ${e.rawPayload} ${e.logComponent || ""} ${JSON.stringify(e.attributes)}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }

      // Severity
      if (activeFilter.severity !== "All" && e.severity !== activeFilter.severity) {
        return false;
      }

      // Facility
      if (activeFilter.facility !== "All facilities" && e.facility !== activeFilter.facility) {
        return false;
      }

      // Host
      if (activeFilter.host !== "All hosts" && e.host !== activeFilter.host) {
        return false;
      }

      // Log Component
      if (activeFilter.logComponent !== "All components" && e.logComponent !== activeFilter.logComponent && e.facility !== activeFilter.logComponent) {
        return false;
      }

      // Dynamic User Filter
      if (activeFilter.userFilter && activeFilter.userFilter !== "All users") {
        const u =
          e.attributes.user ||
          e.attributes.src_user ||
          e.attributes.user_name ||
          e.attributes.userName ||
          e.attributes.live_user ||
          "";
        if (u.toLowerCase() !== activeFilter.userFilter.toLowerCase()) return false;
      }

      // Dynamic Category Filter
      if (activeFilter.categoryFilter && activeFilter.categoryFilter !== "All categories") {
        const c =
          e.attributes.category ||
          e.attributes.cat_name ||
          e.attributes.catName ||
          e.attributes.web_category ||
          "";
        if (c.toLowerCase() !== activeFilter.categoryFilter.toLowerCase()) return false;
      }

      // Dynamic Application Filter
      if (activeFilter.appFilter && activeFilter.appFilter !== "All apps") {
        const a =
          e.attributes.app_name ||
          e.attributes.appName ||
          e.attributes.application ||
          e.attributes.app ||
          "";
        if (a.toLowerCase() !== activeFilter.appFilter.toLowerCase()) return false;
      }

      // Dynamic Status/Action Filter
      if (activeFilter.statusFilter && activeFilter.statusFilter !== "All statuses") {
        const st = (e.attributes.status || e.attributes.action || e.attributes.log_subtype || "").toLowerCase();
        if (!st.includes(activeFilter.statusFilter.toLowerCase())) return false;
      }

      // IP filter
      if (activeFilter.ipFilter && !e.ip.includes(activeFilter.ipFilter) && !(e.attributes.dst_ip && e.attributes.dst_ip.includes(activeFilter.ipFilter))) {
        return false;
      }

      return true;
    });
  }, [events, activeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Copy raw payload helper
  const handleCopyRaw = (e: React.MouseEvent, event: SyslogEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.rawPayload);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export handlers
  const exportAsJSON = () => {
    const jsonStr = JSON.stringify(filteredEvents, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sophos-syslog-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const exportAsJSONL = () => {
    const jsonlStr = filteredEvents.map((e) => JSON.stringify(e)).join("\n");
    const blob = new Blob([jsonlStr], { type: "application/x-jsonlines" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `syslog.jsonl`;
    a.click();
  };

  const exportAsCSV = () => {
    const headers = ["ID", "Time", "ISO_Timestamp", "Host", "IP", "Facility", "Severity", "Component", "Message", "Raw_Payload"];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.time,
      e.isoTimestamp,
      e.host,
      e.ip,
      e.facility,
      e.severity,
      e.logComponent || "",
      `"${e.message.replace(/"/g, '""')}"`,
      `"${e.rawPayload.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sophos-syslog-events-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setActiveFilter({
      searchQuery: "",
      severity: "All",
      facility: "All facilities",
      host: "All hosts",
      logComponent: "All components",
      timeRange: "all",
      ipFilter: ""
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      
      {/* Presets Bar */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#8ea8cb]">
              <Sparkles size={13} className="text-[#00a3e0]" /> PRESETS:
            </span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setActiveFilter((prev) => ({ ...prev, ...preset.filters }));
                  setCurrentPage(1);
                }}
                className="rounded border border-[#1f3354] bg-[#07111e] px-2.5 py-1 text-[10px] font-bold text-[#a2bdde] transition hover:border-[#0066cc] hover:bg-[#13253f] hover:text-white"
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSavePresetModal(true)}
            className="flex items-center gap-1 rounded border border-[#0066cc] bg-[#0066cc] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#0052a3] transition"
          >
            <Save size={13} /> SAVE_PRESET
          </button>
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
        
        {/* Search Input Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8ea8cb]"
              size={14}
            />
            <input
              aria-label="Search all logs"
              value={activeFilter.searchQuery}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Filter keyword, IP address, rule ID, or Sophos error message..."
              className="h-8 w-full rounded border border-[#1f3354] bg-[#050c17] pl-8 pr-3 text-[11px] text-[#00a3e0] outline-none placeholder:text-[#8ea8cb]/50 focus:border-[#00a3e0]"
            />
            {activeFilter.searchQuery && (
              <button
                onClick={() => setActiveFilter((prev) => ({ ...prev, searchQuery: "" }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ea8cb] hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={resetFilters}
            className="rounded border border-[#1f3354] bg-[#07111e] px-3 py-1.5 text-[10px] font-bold text-[#8ea8cb] hover:bg-[#13253f] hover:text-white uppercase"
          >
            RESET
          </button>
        </div>

        {/* Dropdown Attribute Filters */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 text-[10px]">
          
          {/* Severity */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              Severity
            </label>
            <select
              aria-label="Filter by Severity"
              value={activeFilter.severity}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, severity: e.target.value as Severity | "All" }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#1f3354] bg-[#050c17] px-2 pr-6 text-[10px] text-white outline-none focus:border-[#00a3e0]"
            >
              <option value="All">All Severity</option>
              <option value="Debug">Debug</option>
              <option value="Info">Info</option>
              <option value="Notice">Notice</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
              <option value="Critical">Critical</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#8ea8cb]" />
          </div>

          {/* User Filter */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              User
            </label>
            <select
              aria-label="Filter by User"
              value={activeFilter.userFilter || "All users"}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, userFilter: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#1f3354] bg-[#050c17] px-2 pr-6 text-[10px] text-white outline-none focus:border-[#00a3e0]"
            >
              <option value="All users">All Users ({uniqueUsers.length})</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#8ea8cb]" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              Category
            </label>
            <select
              aria-label="Filter by Category"
              value={activeFilter.categoryFilter || "All categories"}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, categoryFilter: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#1f3354] bg-[#050c17] px-2 pr-6 text-[10px] text-white outline-none focus:border-[#00a3e0]"
            >
              <option value="All categories">All Categories ({uniqueCategories.length})</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#8ea8cb]" />
          </div>

          {/* Application Filter */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              Application
            </label>
            <select
              aria-label="Filter by Application"
              value={activeFilter.appFilter || "All apps"}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, appFilter: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#1f3354] bg-[#050c17] px-2 pr-6 text-[10px] text-white outline-none focus:border-[#00a3e0]"
            >
              <option value="All apps">All Apps ({uniqueApps.length})</option>
              {uniqueApps.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#8ea8cb]" />
          </div>

          {/* Facility */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              Facility
            </label>
            <select
              aria-label="Filter by Facility"
              value={activeFilter.facility}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, facility: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#1f3354] bg-[#050c17] px-2 pr-6 text-[10px] text-white outline-none focus:border-[#00a3e0]"
            >
              <option value="All facilities">All Facilities</option>
              <option value="firewall">firewall</option>
              <option value="auth">auth</option>
              <option value="daemon">daemon</option>
              <option value="system">system</option>
              <option value="vpn">vpn</option>
              <option value="dns">dns</option>
              <option value="atp">atp</option>
              <option value="ips">ips</option>
              <option value="webfilter">webfilter</option>
              <option value="antivirus">antivirus</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#8ea8cb]" />
          </div>

          {/* Host */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              Firewall Host
            </label>
            <select
              aria-label="Filter by Host"
              value={activeFilter.host}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, host: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#1f3354] bg-[#050c17] px-2 pr-6 text-[10px] text-white outline-none focus:border-[#00a3e0]"
            >
              <option value="All hosts">All Hosts ({uniqueHosts.length})</option>
              {uniqueHosts.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#8ea8cb]" />
          </div>

          {/* Log Component */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              Log Component
            </label>
            <select
              aria-label="Filter by Component"
              value={activeFilter.logComponent}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, logComponent: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#1f3354] bg-[#050c17] px-2 pr-6 text-[10px] text-white outline-none focus:border-[#00a3e0]"
            >
              <option value="All components">All Components ({uniqueComponents.length})</option>
              {uniqueComponents.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#8ea8cb]" />
          </div>

          {/* IP Filter Input */}
          <div>
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#8ea8cb]">
              IP Address
            </label>
            <input
              value={activeFilter.ipFilter}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, ipFilter: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="e.g. 10.24.1.12"
              className="h-7 w-full rounded border border-[#1f3354] bg-[#050c17] px-2 text-[10px] text-[#00a3e0] outline-none placeholder:text-[#8ea8cb]/50 focus:border-[#00a3e0]"
            />
          </div>

        </div>

      </div>

      {/* Explorer Table Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white uppercase">
            MATCHED: {filteredEvents.length} LINES
          </span>
          <span className="text-[#8ea8cb]">
            (TOTAL: {events.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={exportAsCSV}
            className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#07111e] px-2.5 py-1 text-[10px] font-bold text-[#a2bdde] hover:bg-[#13253f] hover:text-white"
          >
            <FileSpreadsheet size={12} /> CSV
          </button>
          
          <button
            onClick={exportAsJSON}
            className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#07111e] px-2.5 py-1 text-[10px] font-bold text-[#a2bdde] hover:bg-[#13253f] hover:text-white"
          >
            <FileCode size={12} /> JSON
          </button>

          <button
            onClick={exportAsJSONL}
            className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#07111e] px-2.5 py-1 text-[10px] font-bold text-[#a2bdde] hover:bg-[#13253f] hover:text-white"
          >
            <Download size={12} /> JSONL
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 rounded border border-red-900/40 bg-red-950/30 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-950/60"
          >
            <Trash2 size={12} /> CLEAR
          </button>
        </div>
      </div>

      {/* Event Logs Table */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#07111e] text-[10px] text-[#8ea8cb] uppercase">
              <tr className="border-b border-[#1f3354]">
                <th className="px-3 py-2 font-semibold border-r border-[#1f3354] w-28">TIMESTAMP</th>
                <th className="px-3 py-2 font-semibold border-r border-[#1f3354] w-28">HOST / IP</th>
                <th className="px-3 py-2 font-semibold border-r border-[#1f3354] w-16">LVL</th>
                <th className="px-3 py-2 font-semibold border-r border-[#1f3354] w-24">FACILITY</th>
                <th className="px-3 py-2 font-semibold">MESSAGE & ATTRIBUTES</th>
                <th className="px-2 py-2 font-semibold text-right w-16">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#13253f]">
              {paginatedEvents.map((event, idx) => (
                <tr
                  key={`${event.id}-${idx}`}
                  onClick={() => onSelectEvent(event)}
                  className="hover:bg-[#13253f] even:bg-[#091424] cursor-pointer group text-[11px]"
                >
                  <td className="px-3 py-2 border-r border-[#1f3354] text-[#a2bdde] font-mono whitespace-nowrap">
                    {event.time}
                  </td>
                  
                  <td className="px-3 py-2 border-r border-[#1f3354] whitespace-nowrap">
                    <div className="text-[#00a3e0] font-bold block truncate max-w-[100px]">{event.host}</div>
                    <div className="text-[9px] text-[#8ea8cb]">
                      {event.ip} {event.srcPort ? `:${event.srcPort}` : ""}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-[#1f3354] whitespace-nowrap">
                    <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold border uppercase ${severityStyles[event.severity] || "text-[#8ea8cb]"}`}>
                      {event.severity.slice(0, 4)}
                    </span>
                  </td>

                  <td className="px-3 py-2 border-r border-[#1f3354] text-[#a2bdde] whitespace-nowrap font-mono text-[10px]">
                    {event.logComponent || event.facility}
                  </td>

                  <td className="px-3 py-2 text-[#e2ebf8] font-mono text-[11px]">
                    <p className="truncate max-w-[650px]" title={event.message}>{event.message}</p>
                    
                    {/* Rich Attribute Badge Strip */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px]">
                      {event.logId && (
                        <span className="rounded bg-[#07111e] border border-[#1f3354] px-1.5 py-0.5 font-mono text-[#00a3e0]">
                          log_id={event.logId}
                        </span>
                      )}

                      {/* User Badge */}
                      {(event.attributes.user || event.attributes.user_name || event.attributes.src_user) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const u = event.attributes.user || event.attributes.user_name || event.attributes.src_user;
                            setActiveFilter((prev) => ({ ...prev, userFilter: u }));
                          }}
                          className="rounded bg-[#0066cc]/20 border border-[#00a3e0]/40 px-1.5 py-0.5 font-bold text-[#00a3e0] hover:bg-[#0066cc]/40"
                          title="Click to filter by user"
                        >
                          👤 {event.attributes.user || event.attributes.user_name || event.attributes.src_user}
                        </button>
                      )}

                      {/* App Badge */}
                      {(event.attributes.app_name || event.attributes.appName || event.attributes.application) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const a = event.attributes.app_name || event.attributes.appName || event.attributes.application;
                            setActiveFilter((prev) => ({ ...prev, appFilter: a }));
                          }}
                          className="rounded bg-indigo-950/40 border border-indigo-800/50 px-1.5 py-0.5 font-bold text-indigo-300 hover:bg-indigo-900/60"
                          title="Click to filter by application"
                        >
                          📱 {event.attributes.app_name || event.attributes.appName || event.attributes.application}
                        </button>
                      )}

                      {/* Category Badge */}
                      {(event.attributes.category || event.attributes.cat_name || event.attributes.web_category) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const c = event.attributes.category || event.attributes.cat_name || event.attributes.web_category;
                            setActiveFilter((prev) => ({ ...prev, categoryFilter: c }));
                          }}
                          className="rounded bg-purple-950/40 border border-purple-800/50 px-1.5 py-0.5 font-bold text-purple-300 hover:bg-purple-900/60"
                          title="Click to filter by category"
                        >
                          📁 {event.attributes.category || event.attributes.cat_name || event.attributes.web_category}
                        </button>
                      )}

                      {/* Firewall Rule ID */}
                      {(event.attributes.fw_rule_id || event.attributes.rule_id) && (
                        <span className="rounded bg-emerald-950/40 border border-emerald-800/50 px-1.5 py-0.5 font-mono text-emerald-400">
                          🛡️ rule:{event.attributes.fw_rule_id || event.attributes.rule_id}
                        </span>
                      )}

                      {/* Action / Status Pill */}
                      {(event.attributes.status || event.attributes.action || event.attributes.log_subtype) && (
                        <span
                          className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                            (event.attributes.status || event.attributes.action || "").toLowerCase().includes("block") ||
                            (event.attributes.status || event.attributes.action || "").toLowerCase().includes("deny") ||
                            (event.attributes.status || event.attributes.action || "").toLowerCase().includes("drop")
                              ? "bg-red-950/60 border border-red-800/60 text-red-400"
                              : (event.attributes.status || event.attributes.action || "").toLowerCase().includes("warn")
                              ? "bg-amber-950/60 border border-amber-800/60 text-amber-400"
                              : "bg-emerald-950/60 border border-emerald-800/60 text-emerald-400"
                          }`}
                        >
                          {event.attributes.status || event.attributes.action || event.attributes.log_subtype}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-2 py-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleCopyRaw(e, event)}
                        className="p-1 text-[#8ea8cb] hover:text-[#00a3e0]"
                        title="Copy raw syslog line"
                      >
                        {copiedId === event.id ? (
                          <Check size={12} className="text-[#00a3e0]" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="rounded border border-[#1f3354] bg-[#07111e] px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-[#13253f]"
                      >
                        VIEW
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8ea8cb] text-xs">
                    NO_MATCHING_SYS_LOGS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-2 border-t border-[#1f3354] bg-[#07111e] px-3 py-2 sm:flex-row sm:items-center sm:justify-between text-[10px]">
          <div className="flex items-center gap-2 text-[#8ea8cb]">
            <span>PAGE_SIZE:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-[#1f3354] bg-[#050c17] px-1.5 py-0.5 text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              SHOWING {filteredEvents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredEvents.length)} OF {filteredEvents.length}
            </span>
          </div>

          {/* Page Controls */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="rounded border border-[#1f3354] bg-[#0b192c] px-2 py-1 text-[10px] font-bold text-[#a2bdde] disabled:opacity-30"
            >
              PREV
            </button>
            <span className="text-[#a2bdde] font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="rounded border border-[#1f3354] bg-[#0b192c] px-2 py-1 text-[10px] font-bold text-[#a2bdde] disabled:opacity-30"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Save Preset Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded border border-[#1f3354] bg-[#0b192c] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
              <h3 className="text-xs font-bold text-white uppercase">Save Filter Preset</h3>
              <button
                onClick={() => setShowSavePresetModal(false)}
                className="text-[#8ea8cb] hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Preset Name</label>
                <input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g. CRITICAL_FIREWALL_DROPS"
                  className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-[11px] text-[#00a3e0] outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Description</label>
                <input
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="e.g. Critical severity firewall drops"
                  className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-[11px] text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f3354]">
              <button
                onClick={() => setShowSavePresetModal(false)}
                className="rounded border border-[#1f3354] px-3 py-1 text-[10px] text-[#8ea8cb]"
              >
                CANCEL
              </button>
              <button
                disabled={!newPresetName.trim()}
                onClick={() => {
                  onSavePreset(newPresetName, newPresetDesc);
                  setNewPresetName("");
                  setNewPresetDesc("");
                  setShowSavePresetModal(false);
                }}
                className="rounded border border-[#0066cc] bg-[#0066cc] px-3 py-1 text-[10px] font-bold text-white disabled:opacity-40"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
