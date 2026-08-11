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
  Debug: "text-[#888888] bg-[#1a1a1d] border-[#333333]",
  Info: "text-emerald-400 bg-emerald-950/40 border-emerald-800/50",
  Notice: "text-blue-400 bg-blue-950/40 border-blue-800/50",
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

  // Extract unique hosts and components from current dataset for filter dropdowns
  const uniqueHosts = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.host))).sort();
  }, [events]);

  const uniqueComponents = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.logComponent || e.facility))).sort();
  }, [events]);

  // Filter pipeline
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Search query
      if (activeFilter.searchQuery) {
        const q = activeFilter.searchQuery.toLowerCase();
        const fullText = `${e.host} ${e.ip} ${e.message} ${e.facility} ${e.source} ${e.rawPayload} ${e.logComponent || ""}`.toLowerCase();
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
      <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#666666]">
              <Sparkles size={13} className="text-emerald-400" /> PRESETS:
            </span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setActiveFilter((prev) => ({ ...prev, ...preset.filters }));
                  setCurrentPage(1);
                }}
                className="rounded border border-[#333333] bg-[#16161a] px-2.5 py-1 text-[10px] font-bold text-[#d1d1d1] transition hover:border-[#444444] hover:bg-[#222226]"
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSavePresetModal(true)}
            className="flex items-center gap-1 rounded border border-emerald-800/50 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-950/70"
          >
            <Save size={13} /> SAVE_PRESET
          </button>
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3.5 space-y-3">
        
        {/* Search Input Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
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
              className="h-8 w-full rounded border border-[#2a2a2a] bg-black pl-8 pr-3 text-[11px] text-emerald-400 outline-none placeholder:text-[#444444] focus:border-[#444444]"
            />
            {activeFilter.searchQuery && (
              <button
                onClick={() => setActiveFilter((prev) => ({ ...prev, searchQuery: "" }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={resetFilters}
            className="rounded border border-[#333333] bg-[#16161a] px-3 py-1.5 text-[10px] font-bold text-[#888888] hover:bg-[#222226] uppercase"
          >
            RESET
          </button>
        </div>

        {/* Dropdown Attribute Filters */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 text-[10px]">
          
          {/* Severity */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#666666]">
              Severity
            </label>
            <select
              aria-label="Filter by Severity"
              value={activeFilter.severity}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, severity: e.target.value as Severity | "All" }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#2a2a2a] bg-black px-2 pr-6 text-[10px] text-[#d1d1d1] outline-none"
            >
              <option value="All">All Severity</option>
              <option value="Debug">Debug</option>
              <option value="Info">Info</option>
              <option value="Notice">Notice</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
              <option value="Critical">Critical</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#666666]" />
          </div>

          {/* Facility */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#666666]">
              Facility
            </label>
            <select
              aria-label="Filter by Facility"
              value={activeFilter.facility}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, facility: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#2a2a2a] bg-black px-2 pr-6 text-[10px] text-[#d1d1d1] outline-none"
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
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#666666]" />
          </div>

          {/* Host */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#666666]">
              Firewall Host
            </label>
            <select
              aria-label="Filter by Host"
              value={activeFilter.host}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, host: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#2a2a2a] bg-black px-2 pr-6 text-[10px] text-[#d1d1d1] outline-none"
            >
              <option value="All hosts">All Hosts</option>
              {uniqueHosts.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#666666]" />
          </div>

          {/* Component */}
          <div className="relative">
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#666666]">
              Log Component
            </label>
            <select
              aria-label="Filter by Component"
              value={activeFilter.logComponent}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, logComponent: e.target.value }));
                setCurrentPage(1);
              }}
              className="h-7 w-full appearance-none rounded border border-[#2a2a2a] bg-black px-2 pr-6 text-[10px] text-[#d1d1d1] outline-none"
            >
              <option value="All components">All Components</option>
              {uniqueComponents.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 bottom-2 text-[#666666]" />
          </div>

          {/* IP Filter Input */}
          <div>
            <label className="mb-1 block text-[9px] font-bold uppercase text-[#666666]">
              IP Address
            </label>
            <input
              value={activeFilter.ipFilter}
              onChange={(e) => {
                setActiveFilter((prev) => ({ ...prev, ipFilter: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="e.g. 10.24.1.12"
              className="h-7 w-full rounded border border-[#2a2a2a] bg-black px-2 text-[10px] text-emerald-400 outline-none placeholder:text-[#444444]"
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
          <span className="text-[#666666]">
            (TOTAL: {events.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={exportAsCSV}
            className="flex items-center gap-1 rounded border border-[#333333] bg-[#16161a] px-2.5 py-1 text-[10px] font-bold text-[#d1d1d1] hover:bg-[#222226]"
          >
            <FileSpreadsheet size={12} /> CSV
          </button>
          
          <button
            onClick={exportAsJSON}
            className="flex items-center gap-1 rounded border border-[#333333] bg-[#16161a] px-2.5 py-1 text-[10px] font-bold text-[#d1d1d1] hover:bg-[#222226]"
          >
            <FileCode size={12} /> JSON
          </button>

          <button
            onClick={exportAsJSONL}
            className="flex items-center gap-1 rounded border border-[#333333] bg-[#16161a] px-2.5 py-1 text-[10px] font-bold text-[#d1d1d1] hover:bg-[#222226]"
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
      <div className="rounded border border-[#2a2a2a] bg-[#0d0d0f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#16161a] text-[10px] text-[#666666] uppercase">
              <tr className="border-b border-[#2a2a2a]">
                <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-28">TIMESTAMP</th>
                <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-28">HOST / IP</th>
                <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-16">LVL</th>
                <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-24">FACILITY</th>
                <th className="px-3 py-2 font-normal">MESSAGE & ATTRIBUTES</th>
                <th className="px-2 py-2 font-normal text-right w-16">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1c]">
              {paginatedEvents.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="hover:bg-[#16161a] even:bg-[#121214] cursor-pointer group text-[11px]"
                >
                  <td className="px-3 py-2 border-r border-[#2a2a2a] text-[#888888] font-mono whitespace-nowrap">
                    {event.time}
                  </td>
                  
                  <td className="px-3 py-2 border-r border-[#2a2a2a] whitespace-nowrap">
                    <div className="text-blue-400 font-bold block truncate max-w-[100px]">{event.host}</div>
                    <div className="text-[9px] text-[#666666]">
                      {event.ip} {event.srcPort ? `:${event.srcPort}` : ""}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-[#2a2a2a] whitespace-nowrap">
                    <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold border uppercase ${severityStyles[event.severity] || "text-[#888]"}`}>
                      {event.severity.slice(0, 4)}
                    </span>
                  </td>

                  <td className="px-3 py-2 border-r border-[#2a2a2a] text-[#888888] whitespace-nowrap font-mono text-[10px]">
                    {event.logComponent || event.facility}
                  </td>

                  <td className="px-3 py-2 text-slate-300 font-mono text-[11px]">
                    <p className="truncate max-w-[500px]" title={event.message}>{event.message}</p>
                    {event.logId && (
                      <span className="mt-0.5 inline-block text-[9px] text-emerald-400/80 font-mono">
                        log_id={event.logId}
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleCopyRaw(e, event)}
                        className="p-1 text-[#666666] hover:text-emerald-400"
                        title="Copy raw syslog line"
                      >
                        {copiedId === event.id ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="rounded border border-[#333333] bg-[#1a1a1d] px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-[#222226]"
                      >
                        VIEW
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#666666] text-xs">
                    NO_MATCHING_SYS_LOGS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-2 border-t border-[#2a2a2a] bg-[#111113] px-3 py-2 sm:flex-row sm:items-center sm:justify-between text-[10px]">
          <div className="flex items-center gap-2 text-[#666666]">
            <span>PAGE_SIZE:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-[#2a2a2a] bg-black px-1.5 py-0.5 text-[#d1d1d1]"
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
              className="rounded border border-[#333333] bg-[#16161a] px-2 py-1 text-[10px] font-bold text-[#d1d1d1] disabled:opacity-30"
            >
              PREV
            </button>
            <span className="text-[#888888] font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="rounded border border-[#333333] bg-[#16161a] px-2 py-1 text-[10px] font-bold text-[#d1d1d1] disabled:opacity-30"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Save Preset Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded border border-[#2a2a2a] bg-[#111113] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2">
              <h3 className="text-xs font-bold text-white uppercase">Save Filter Preset</h3>
              <button
                onClick={() => setShowSavePresetModal(false)}
                className="text-[#666666] hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#666666] uppercase">Preset Name</label>
                <input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g. CRITICAL_FIREWALL_DROPS"
                  className="w-full rounded border border-[#2a2a2a] bg-black p-2 text-[11px] text-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#666666] uppercase">Description</label>
                <input
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="e.g. Critical severity firewall drops"
                  className="w-full rounded border border-[#2a2a2a] bg-black p-2 text-[11px] text-[#d1d1d1] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2a2a]">
              <button
                onClick={() => setShowSavePresetModal(false)}
                className="rounded border border-[#333333] px-3 py-1 text-[10px] text-[#888888]"
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
                className="rounded border border-emerald-500/50 bg-emerald-950 px-3 py-1 text-[10px] font-bold text-emerald-400 disabled:opacity-40"
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
