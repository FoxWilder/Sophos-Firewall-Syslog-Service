import React, { useState, useMemo } from "react";
import { 
  SyslogEvent, 
  ReceiverSettings, 
  Severity 
} from "../types";
import { 
  Activity, 
  Terminal, 
  Server, 
  Wifi, 
  Network, 
  LockKeyhole, 
  Check, 
  BookOpen, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Search, 
  ChevronDown, 
  Filter, 
  CircleAlert, 
  CircleCheck, 
  Clock3,
  Eye,
  Sliders,
  Database,
  X
} from "lucide-react";

interface DashboardViewProps {
  events: SyslogEvent[];
  settings: ReceiverSettings;
  onOpenExplorerWithFilter: (severity?: Severity, facility?: string) => void;
  onSelectEvent: (event: SyslogEvent) => void;
  onOpenSetupGuide: () => void;
  onOpenSettings: () => void;
}

const severityStyles: Record<Severity, string> = {
  Debug: "text-[#888888] bg-[#1a1a1d] border-[#333333]",
  Info: "text-emerald-400 bg-emerald-950/40 border-emerald-800/50",
  Notice: "text-blue-400 bg-blue-950/40 border-blue-800/50",
  Warning: "text-amber-400 bg-amber-950/40 border-amber-800/50",
  Error: "text-red-400 bg-red-950/40 border-red-800/50",
  Critical: "text-red-400 bg-red-950/70 border-red-600/70 font-bold animate-pulse",
  Alert: "text-red-500 bg-red-950/80 border-red-600",
  Emergency: "text-red-500 bg-red-950 border-red-500",
};

function StatusDot({ tone = "teal" }: { tone?: "teal" | "amber" | "red" }) {
  const bgClass = 
    tone === "teal" 
      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
      : tone === "amber" 
      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
      : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  return (
    <span className={`relative flex h-2 w-2 shrink-0 ${bgClass} rounded-full`} />
  );
}

function TransportRow({
  icon: Icon,
  label,
  port,
  detail,
  tone = "teal",
}: {
  icon: React.ElementType;
  label: string;
  port: string;
  detail: string;
  tone?: "teal" | "amber";
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[#1c1c1f] py-2.5 last:border-0 font-mono text-[11px]">
      <div className="flex h-7 w-7 items-center justify-center rounded bg-[#16161a] border border-[#2a2a2a] text-[#888888]">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#d1d1d1] uppercase text-[10px]">{label}</span>
          <span className="font-mono text-[10px] text-emerald-400">{port}</span>
        </div>
        <p className="truncate text-[10px] text-[#666666]">{detail}</p>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#888888]">
        <StatusDot tone={tone} />
        <span>{tone === "teal" ? "READY" : "STANDBY"}</span>
      </div>
    </div>
  );
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  settings,
  onOpenExplorerWithFilter,
  onSelectEvent,
  onOpenSetupGuide,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "All">("All");
  const [facility, setFacility] = useState("All facilities");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery =
        [event.host, event.message, event.ip, event.facility, event.rawPayload]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesSeverity = severity === "All" || event.severity === severity;
      const matchesFacility = facility === "All facilities" || event.facility === facility;
      return matchesQuery && matchesSeverity && matchesFacility;
    }).slice(0, 15); // Show latest 15 on dashboard
  }, [events, query, severity, facility]);

  const totalEventCount = events.length;
  const criticalCount = events.filter((e) => e.severity === "Critical" || e.severity === "Error").length;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top Metric Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Listener Health */}
        <div className="relative overflow-hidden rounded border border-[#2a2a2a] bg-[#111113] p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#666666]">
                LISTENER_HEALTH
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusDot tone="teal" />
                <span className="text-sm font-bold text-white tracking-tight">ACTIVE_OK</span>
              </div>
            </div>
            <Activity className="text-emerald-500" size={18} />
          </div>
          <p className="mt-2.5 text-[10px] text-[#888888]">
            UDP:{settings.udpPort} | TCP:{settings.tcpPort} ACTIVE
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400/80">
            <Clock3 size={12} /> BIND: {settings.bindAddress}
          </div>
        </div>

        {/* Card 2: Received Volume */}
        <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#666666]">
              PROCESSED_EVENTS
            </p>
            <Terminal size={16} className="text-[#888888]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl font-bold font-mono tracking-tight text-white">
              {(totalEventCount * 184).toLocaleString()}
            </p>
            <span className="rounded bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
              +12.8%
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[#666666]">BUFF_LIMIT: 500 lines</p>
          
          {/* Sparkline */}
          <div className="mt-2 flex h-5 items-end gap-0.5">
            {[35, 52, 41, 64, 48, 72, 60, 85, 68, 92, 75, 100].map((height, i) => (
              <span
                key={i}
                className="flex-1 bg-emerald-500/60"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Card 3: Collector Identity */}
        <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#666666]">
              COLLECTOR_ID
            </p>
            <Server size={16} className="text-[#888888]" />
          </div>
          <p className="mt-2 text-sm font-bold text-white truncate">
            {settings.collectorName}
          </p>
          <p className="mt-0.5 text-[10px] text-[#666666]">WIN_SERVER_2022</p>
          <div className="mt-2.5 flex items-center gap-1.5 rounded bg-[#0a0a0c] border border-[#222226] p-1.5 text-[10px] text-[#888888]">
            <Database size={12} className="text-emerald-500 shrink-0" />
            <span className="truncate font-mono">{settings.logDirectory}syslog.jsonl</span>
          </div>
        </div>

        {/* Card 4: Threat Alerts */}
        <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#666666]">
              THREAT_ALERTS
            </p>
            <CircleAlert size={16} className="text-[#ef4444]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold font-mono text-[#ef4444]">
              {criticalCount}
            </p>
            <span className="text-[10px] text-[#888888]">ERRORS/CRIT</span>
          </div>
          <p className="mt-0.5 text-[10px] text-[#666666]">ATP & IPS Security Events</p>
          <button
            onClick={() => onOpenExplorerWithFilter("Critical")}
            className="mt-2.5 w-full rounded border border-red-800/40 bg-red-950/30 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/60"
          >
            INSPECT_ERRORS
          </button>
        </div>

      </section>

      {/* Main Grid: Recent Log Events & Right Sidebar */}
      <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
        
        {/* Left Column: Recent Events Stream */}
        <div className="min-w-0 rounded border border-[#2a2a2a] bg-[#0d0d0f]">
          
          {/* Header & CMD Input Bar */}
          <div className="border-b border-[#2a2a2a] bg-[#111113] p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-[#666666] font-bold tracking-widest">
                  LIVE_LOG_STREAM
                </span>
                <span className="rounded bg-[#1f1f23] border border-[#2a2a2a] px-1.5 py-0.5 text-[9px] font-mono text-emerald-400">
                  {filteredEvents.length} LINES
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setQuery("");
                    setSeverity("All");
                    setFacility("All facilities");
                  }}
                  className="text-[10px] text-[#666666] hover:text-[#888888] uppercase font-bold"
                >
                  RESET_QUERY
                </button>
                <button
                  onClick={() => onOpenExplorerWithFilter()}
                  className="flex items-center gap-1 rounded border border-[#333333] bg-[#16161a] px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-[#222226]"
                >
                  FULL_EXPLORER <ArrowUpRight size={12} />
                </button>
              </div>
            </div>

            {/* CMD Style Search Input */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 bg-black border border-[#2a2a2a] h-7 flex items-center px-2 gap-2 rounded">
                <span className="text-[#555555] font-bold text-[10px]">CMD&gt;</span>
                <input
                  aria-label="Search live logs"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='grep -i "threat" | host...'
                  className="bg-transparent outline-none flex-1 text-emerald-400 text-[11px] placeholder:text-[#444444]"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[#666666] hover:text-white">
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  aria-label="Filter by facility"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="h-7 rounded bg-black border border-[#2a2a2a] px-2 text-[10px] text-[#d1d1d1] outline-none"
                >
                  <option>All facilities</option>
                  <option>firewall</option>
                  <option>auth</option>
                  <option>daemon</option>
                  <option>system</option>
                  <option>vpn</option>
                  <option>dns</option>
                  <option>atp</option>
                  <option>ips</option>
                </select>

                <select
                  aria-label="Filter by severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity | "All")}
                  className="h-7 rounded bg-black border border-[#2a2a2a] px-2 text-[10px] text-[#d1d1d1] outline-none"
                >
                  <option value="All">All Severity</option>
                  <option>Info</option>
                  <option>Notice</option>
                  <option>Warning</option>
                  <option>Error</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Events Stream Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#16161a] text-[10px] text-[#666666]">
                <tr className="border-b border-[#2a2a2a]">
                  <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-28">TIMESTAMP</th>
                  <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-28">HOST / IP</th>
                  <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-16">LVL</th>
                  <th className="px-3 py-2 font-normal border-r border-[#2a2a2a] w-24">FACILITY</th>
                  <th className="px-3 py-2 font-normal">MESSAGE</th>
                  <th className="px-2 py-2 font-normal text-right w-12">VIEW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1c]">
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="hover:bg-[#16161a] even:bg-[#121214] cursor-pointer group text-[11px]"
                  >
                    <td className="px-3 py-1.5 border-r border-[#2a2a2a] text-[#888888] font-mono whitespace-nowrap">
                      {event.time}
                    </td>
                    <td className="px-3 py-1.5 border-r border-[#2a2a2a] whitespace-nowrap">
                      <span className="text-blue-400 font-bold block truncate max-w-[100px]">{event.host}</span>
                      <span className="text-[9px] text-[#666666] block">{event.ip}</span>
                    </td>
                    <td className="px-3 py-1.5 border-r border-[#2a2a2a] whitespace-nowrap">
                      <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold border uppercase ${severityStyles[event.severity] || "text-[#888]"}`}>
                        {event.severity.slice(0, 4)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 border-r border-[#2a2a2a] text-[#888888] whitespace-nowrap font-mono text-[10px]">
                      {event.facility}
                    </td>
                    <td className="px-3 py-1.5 text-slate-300 font-mono text-[11px] truncate max-w-[380px]" title={event.message}>
                      {event.message}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="text-[#666666] hover:text-emerald-400"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#666666] text-xs">
                      NO_LOGS_FOUND_MATCHING_FILTER
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Transports & Collector Specs */}
        <aside className="space-y-3">
          
          {/* Transport Listeners */}
          <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase text-[#666666] font-bold tracking-widest">
                LISTENERS
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">2 ACTIVE</span>
            </div>
            <div>
              <TransportRow
                icon={Wifi}
                label="UDP_SYSLOG"
                port={`:${settings.udpPort}`}
                detail={settings.udpEnabled ? "0.0.0.0 listening" : "Disabled"}
                tone={settings.udpEnabled ? "teal" : "amber"}
              />
              <TransportRow
                icon={Network}
                label="TCP_SYSLOG"
                port={`:${settings.tcpPort}`}
                detail={settings.tcpEnabled ? "0.0.0.0 listening" : "Disabled"}
                tone={settings.tcpEnabled ? "teal" : "amber"}
              />
              <TransportRow
                icon={LockKeyhole}
                label="TLS_SECURE"
                port={`:${settings.tlsPort}`}
                detail={settings.tlsEnabled ? "TLS Cert ready" : "Cert pending"}
                tone={settings.tlsEnabled ? "teal" : "amber"}
              />
            </div>
          </div>

          {/* Windows Setup Guide Link */}
          <div className="rounded border border-[#2a2a2a] bg-[#16161a] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-white tracking-wider">
                SETUP_DOCS
              </span>
            </div>
            <p className="text-[10px] text-[#888888] leading-normal">
              Execute PowerShell scripts on target host to bind socket ports and permit firewall traffic.
            </p>
            <button
              onClick={onOpenSetupGuide}
              className="mt-1 w-full flex items-center justify-between rounded border border-[#333333] bg-[#222226] px-2.5 py-1 text-[10px] font-bold uppercase text-white hover:bg-[#2b2b30]"
            >
              <span>READ_GUIDE</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          {/* Quick Config Specs */}
          <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#666666] font-bold tracking-widest">
                PARAMS
              </span>
              <button onClick={onOpenSettings} className="text-[9px] text-emerald-400 underline">
                EDIT
              </button>
            </div>
            
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between border-b border-[#1c1c1f] pb-1">
                <span className="text-[#666666]">BIND_ADDR</span>
                <span className="text-white">{settings.bindAddress}</span>
              </div>
              <div className="flex justify-between border-b border-[#1c1c1f] pb-1">
                <span className="text-[#666666]">RETENTION</span>
                <span className="text-white">{settings.retentionDays}d</span>
              </div>
              <div className="flex justify-between border-b border-[#1c1c1f] pb-1">
                <span className="text-[#666666]">MAX_FILE</span>
                <span className="text-white">{settings.maxFileSizeMb}MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">SOPHOS_KV</span>
                <span className="text-emerald-400">
                  {settings.extractSophosKv ? "PARSER_ON" : "OFF"}
                </span>
              </div>
            </div>
          </div>

        </aside>

      </section>
    </div>
  );
};
