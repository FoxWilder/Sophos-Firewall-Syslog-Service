import React, { useState, useMemo } from "react";
import { SyslogEvent, Severity } from "../types";
import { translateSophosEvent, HumanTranslatedLog, decodeSophosLogId } from "../lib/sophosParser";
import {
  Search,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Terminal,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface HumanLogsViewProps {
  events: SyslogEvent[];
  onSelectEvent: (event: SyslogEvent) => void;
  onOpenExplorerWithFilter?: (severity?: Severity, facility?: string) => void;
}

export const HumanLogsView: React.FC<HumanLogsViewProps> = ({
  events,
  onSelectEvent
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "allowed" | "blocked" | "warning" | "info">("all");
  const [componentFilter, setComponentFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [hostFilter, setHostFilter] = useState<string>("all");
  const [layoutMode, setLayoutMode] = useState<"cards" | "table">("cards");
  const [expandedRawIds, setExpandedRawIds] = useState<Record<string, boolean>>({});

  // Parse all events into human translated format
  const parsedLogs = useMemo(() => {
    return events.map((evt) => translateSophosEvent(evt));
  }, [events]);

  // Extract unique hosts and components for filter dropdowns
  const uniqueHosts = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.host) set.add(e.host);
    });
    return Array.from(set);
  }, [events]);

  const uniqueComponents = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.logComponent) set.add(e.logComponent);
    });
    return Array.from(set);
  }, [events]);

  // Filtered List
  const filteredLogs = useMemo(() => {
    return parsedLogs.filter((item) => {
      // Outcome filter
      if (outcomeFilter !== "all" && item.statusCategory !== outcomeFilter) {
        return false;
      }

      // Component filter
      if (componentFilter !== "all" && item.event.logComponent !== componentFilter && item.event.facility !== componentFilter) {
        return false;
      }

      // Severity filter
      if (severityFilter !== "all" && item.event.severity !== severityFilter) {
        return false;
      }

      // Host filter
      if (hostFilter !== "all" && item.event.host !== hostFilter) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesExplanation = item.explanation.toLowerCase().includes(q);
        const matchesIp = item.event.ip.toLowerCase().includes(q) || (item.event.attributes?.dst_ip || "").toLowerCase().includes(q);
        const matchesHost = item.event.host.toLowerCase().includes(q);
        const matchesUser = (item.event.attributes?.user_name || "").toLowerCase().includes(q);
        const matchesRule = (item.event.attributes?.fw_rule_id || "").toLowerCase().includes(q);
        const matchesRaw = item.event.rawPayload.toLowerCase().includes(q);

        return matchesTitle || matchesSummary || matchesExplanation || matchesIp || matchesHost || matchesUser || matchesRule || matchesRaw;
      }

      return true;
    });
  }, [parsedLogs, outcomeFilter, componentFilter, severityFilter, hostFilter, searchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    let allowed = 0;
    let blocked = 0;
    let warning = 0;
    let info = 0;

    parsedLogs.forEach((item) => {
      if (item.statusCategory === "allowed") allowed++;
      else if (item.statusCategory === "blocked") blocked++;
      else if (item.statusCategory === "warning") warning++;
      else info++;
    });

    return { total: parsedLogs.length, allowed, blocked, warning, info };
  }, [parsedLogs]);

  const toggleRawExpand = (id: string) => {
    setExpandedRawIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setOutcomeFilter("all");
    setComponentFilter("all");
    setSeverityFilter("all");
    setHostFilter("all");
  };

  return (
    <div className="space-y-4 font-mono select-none">
      
      {/* Header Banner */}
      <div className="rounded border border-[#2a2a2a] bg-[#111113] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs">
                <ShieldCheck size={14} />
              </span>
              <h2 className="text-white font-bold text-sm tracking-tight uppercase">
                HUMAN_READABLE_LOG_PARSER
              </h2>
              <span className="text-[10px] bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                SOPHOS SFOS v22.0 TRANSLATOR
              </span>
            </div>
            <p className="text-[11px] text-[#888888] mt-1 leading-relaxed">
              Translates complex, verbose Sophos key-value syslog strings into plain-English security narratives with color-coded threat statuses and recommended administrator actions.
            </p>
          </div>

          <a
            href="https://docs.sophos.com/nsg/sophos-firewall/22.0/syslog/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start md:self-auto rounded border border-[#333333] bg-[#1a1a1d] px-2.5 py-1.5 text-[10px] font-bold text-emerald-400 hover:bg-[#222226] hover:border-emerald-500/50 transition shrink-0"
          >
            <span>Sophos v22.0 Spec Docs</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-[#1f1f22]">
          <div className="rounded border border-[#222226] bg-[#16161a] p-2 text-center">
            <span className="text-[9px] text-[#777777] uppercase block font-bold">TOTAL PARSED</span>
            <span className="text-sm font-bold text-white">{metrics.total}</span>
          </div>
          <div className="rounded border border-emerald-900/40 bg-emerald-950/20 p-2 text-center">
            <span className="text-[9px] text-emerald-400 uppercase block font-bold">ALLOWED TRAFFIC</span>
            <span className="text-sm font-bold text-emerald-400">{metrics.allowed}</span>
          </div>
          <div className="rounded border border-red-900/40 bg-red-950/20 p-2 text-center">
            <span className="text-[9px] text-red-400 uppercase block font-bold">BLOCKED / THREATS</span>
            <span className="text-sm font-bold text-red-400">{metrics.blocked}</span>
          </div>
          <div className="rounded border border-amber-900/40 bg-amber-950/20 p-2 text-center">
            <span className="text-[9px] text-amber-300 uppercase block font-bold">WARNINGS / FAILS</span>
            <span className="text-sm font-bold text-amber-300">{metrics.warning}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded border border-cyan-900/40 bg-cyan-950/20 p-2 text-center">
            <span className="text-[9px] text-cyan-300 uppercase block font-bold">INFO / SYSTEM</span>
            <span className="text-sm font-bold text-cyan-300">{metrics.info}</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3 space-y-3">
        
        {/* Search & Layout Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plain-English explanations, IPs, users, firewall rules, or raw logs..."
              className="w-full rounded border border-[#2a2a2a] bg-[#16161a] py-1.5 pl-8 pr-8 text-xs text-white placeholder-[#555555] focus:border-emerald-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-[#888888] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Layout Mode Buttons */}
          <div className="flex items-center gap-1 shrink-0 bg-[#16161a] p-1 rounded border border-[#2a2a2a]">
            <button
              onClick={() => setLayoutMode("cards")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded transition ${
                layoutMode === "cards"
                  ? "bg-emerald-950 border border-emerald-700/60 text-emerald-400"
                  : "text-[#888888] hover:text-white"
              }`}
              title="Card View - Full plain English narrative cards"
            >
              <LayoutGrid size={12} />
              <span>CARDS</span>
            </button>
            <button
              onClick={() => setLayoutMode("table")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded transition ${
                layoutMode === "table"
                  ? "bg-emerald-950 border border-emerald-700/60 text-emerald-400"
                  : "text-[#888888] hover:text-white"
              }`}
              title="Compact Matrix Table View"
            >
              <List size={12} />
              <span>TABLE</span>
            </button>
          </div>
        </div>

        {/* Outcome Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1a1a1d]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#666666] uppercase mr-1">OUTCOME:</span>
            
            <button
              onClick={() => setOutcomeFilter("all")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase border transition ${
                outcomeFilter === "all"
                  ? "bg-[#222226] border-white text-white"
                  : "bg-[#16161a] border-[#2a2a2a] text-[#888888] hover:border-[#444444]"
              }`}
            >
              ALL ({metrics.total})
            </button>

            <button
              onClick={() => setOutcomeFilter("allowed")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase border transition ${
                outcomeFilter === "allowed"
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-[#16161a] border-[#2a2a2a] text-emerald-500/70 hover:border-emerald-800"
              }`}
            >
              <CheckCircle2 size={12} />
              <span>ALLOWED ({metrics.allowed})</span>
            </button>

            <button
              onClick={() => setOutcomeFilter("blocked")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase border transition ${
                outcomeFilter === "blocked"
                  ? "bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                  : "bg-[#16161a] border-[#2a2a2a] text-red-500/70 hover:border-red-800"
              }`}
            >
              <AlertOctagon size={12} />
              <span>BLOCKED / THREATS ({metrics.blocked})</span>
            </button>

            <button
              onClick={() => setOutcomeFilter("warning")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase border transition ${
                outcomeFilter === "warning"
                  ? "bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                  : "bg-[#16161a] border-[#2a2a2a] text-amber-500/70 hover:border-amber-800"
              }`}
            >
              <AlertTriangle size={12} />
              <span>WARNINGS ({metrics.warning})</span>
            </button>

            <button
              onClick={() => setOutcomeFilter("info")}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded uppercase border transition ${
                outcomeFilter === "info"
                  ? "bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  : "bg-[#16161a] border-[#2a2a2a] text-cyan-500/70 hover:border-cyan-800"
              }`}
            >
              <Info size={12} />
              <span>INFO ({metrics.info})</span>
            </button>
          </div>

          {/* Additional Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Component Selector */}
            <select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              className="rounded border border-[#2a2a2a] bg-[#16161a] py-1 px-2 text-[10px] text-[#cccccc] focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Modules / Components</option>
              {uniqueComponents.map((comp) => (
                <option key={comp} value={comp}>
                  Module: {comp}
                </option>
              ))}
            </select>

            {/* Host Selector */}
            <select
              value={hostFilter}
              onChange={(e) => setHostFilter(e.target.value)}
              className="rounded border border-[#2a2a2a] bg-[#16161a] py-1 px-2 text-[10px] text-[#cccccc] focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Firewall Hosts</option>
              {uniqueHosts.map((h) => (
                <option key={h} value={h}>
                  Host: {h}
                </option>
              ))}
            </select>

            {(searchQuery || outcomeFilter !== "all" || componentFilter !== "all" || severityFilter !== "all" || hostFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded border border-[#333333] bg-[#1f1f24] px-2 py-1 text-[10px] text-[#aaaaaa] hover:text-white hover:border-[#555555]"
                title="Reset all filters"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredLogs.length === 0 ? (
        <div className="rounded border border-[#2a2a2a] bg-[#111113] p-12 text-center">
          <ShieldAlert size={36} className="mx-auto text-[#444444] mb-3" />
          <h3 className="text-white font-bold text-sm uppercase">No Matching Syslog Events</h3>
          <p className="text-xs text-[#666666] mt-1 max-w-md mx-auto">
            No events match your current filter settings or search query. Try resetting filters or switching stream mode.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 rounded border border-emerald-600 bg-emerald-950/50 text-emerald-400 px-3 py-1.5 text-xs font-bold uppercase hover:bg-emerald-900/60"
          >
            Reset All Filters
          </button>
        </div>
      ) : layoutMode === "cards" ? (
        /* CARDS VIEW MODE */
        <div className="space-y-3">
          {filteredLogs.map((item) => {
            const isRawExpanded = !!expandedRawIds[item.event.id];

            // Style configurations based on statusCategory
            let cardBg = "bg-[#111113] border-[#222226]";
            let borderAccent = "border-l-cyan-500";
            let badgeBg = "bg-cyan-950/60 border-cyan-800/80 text-cyan-300";
            let StatusIcon = Info;

            if (item.statusCategory === "allowed") {
              cardBg = "bg-[#0d1512] border-emerald-900/30";
              borderAccent = "border-l-emerald-500";
              badgeBg = "bg-emerald-950/80 border-emerald-700/80 text-emerald-400";
              StatusIcon = CheckCircle2;
            } else if (item.statusCategory === "blocked") {
              cardBg = "bg-[#170e10] border-red-900/30";
              borderAccent = "border-l-red-500";
              badgeBg = "bg-red-950/80 border-red-700/80 text-red-400";
              StatusIcon = AlertOctagon;
            } else if (item.statusCategory === "warning") {
              cardBg = "bg-[#17130c] border-amber-900/30";
              borderAccent = "border-l-amber-500";
              badgeBg = "bg-amber-950/80 border-amber-700/80 text-amber-300";
              StatusIcon = AlertTriangle;
            }

            return (
              <div
                key={item.event.id}
                className={`rounded border border-l-4 ${borderAccent} ${cardBg} p-4 transition hover:border-[#3a3a40]`}
              >
                {/* Header metadata row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1f1f24]">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeBg}`}>
                      <StatusIcon size={12} />
                      <span>{item.statusBadgeText}</span>
                    </span>

                    {/* Log Type */}
                    <span className="text-[10px] bg-[#1a1a1e] border border-[#2d2d32] text-[#cccccc] px-2 py-0.5 rounded font-bold">
                      {item.logTypeLabel}
                    </span>

                    {/* Component */}
                    <span className="text-[10px] bg-[#1a1a1e] border border-[#2d2d32] text-[#888888] px-2 py-0.5 rounded">
                      Comp: {item.logComponentLabel}
                    </span>

                    {/* Rule ID if available */}
                    {item.ruleInfo && (
                      <span className="text-[10px] bg-amber-950/30 border border-amber-800/40 text-amber-300 px-2 py-0.5 rounded font-bold">
                        {item.ruleInfo}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#777777]">
                    <span>Host: <strong className="text-white">{item.event.host}</strong></span>
                    <span>Time: <strong className="text-white">{item.event.time}</strong></span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="mt-3 space-y-2.5">
                  {/* Headline Title */}
                  <h3 className="text-white font-bold text-sm flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${
                      item.securityImpact === "Critical Threat" ? "bg-red-950 text-red-400 border-red-800" :
                      item.securityImpact === "High Risk" ? "bg-orange-950 text-orange-400 border-orange-800" :
                      item.securityImpact === "Medium Risk" ? "bg-amber-950 text-amber-300 border-amber-800" :
                      "bg-emerald-950 text-emerald-400 border-emerald-800"
                    }`}>
                      {item.securityImpact}
                    </span>
                  </h3>

                  {/* Plain-English Summary Box */}
                  <div className="rounded border border-[#24242a] bg-[#0c0c0e] p-3 text-xs text-[#dddddd] leading-relaxed">
                    <p className="font-semibold text-emerald-400/90 mb-1 flex items-center gap-1.5">
                      <HelpCircle size={13} className="text-emerald-400" />
                      <span>What Happened in Plain English:</span>
                    </p>
                    <p className="text-[#d1d1d1] font-sans text-[13px]">{item.summary}</p>
                  </div>

                  {/* Sophos Policy Explanation */}
                  <div className="text-xs text-[#a0a0a0] leading-relaxed pl-1">
                    <strong className="text-[#eeeeee]">Sophos Policy Analysis:</strong> {item.explanation}
                  </div>

                  {/* Traffic Parameters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-[#141418] border border-[#222228] p-2.5 rounded">
                    <div>
                      <span className="text-[#666666] block text-[9px] uppercase font-bold">SOURCE HOST / USER</span>
                      <span className="text-white font-mono font-medium">{item.srcFormatted}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ArrowRight size={14} className="text-[#555555] shrink-0" />
                      <div>
                        <span className="text-[#666666] block text-[9px] uppercase font-bold">DESTINATION HOST / APP</span>
                        <span className="text-white font-mono font-medium">{item.dstFormatted}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#666666] block text-[9px] uppercase font-bold">USER / APPLICATION</span>
                      <span className="text-emerald-400 font-mono font-medium">{item.appOrUser}</span>
                    </div>
                  </div>

                  {/* Recommended Administrator Action */}
                  <div className="rounded border border-[#2a2a30] bg-[#18181c] p-2.5 flex items-start gap-2 text-[11px]">
                    <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-amber-300 font-bold uppercase text-[10px] block">RECOMMENDED ADMIN ACTION:</span>
                      <span className="text-[#cccccc] font-sans">{item.recommendedAction}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Raw Syslog Accordion */}
                <div className="mt-3 pt-2 border-t border-[#1a1a1e] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <button
                    onClick={() => toggleRawExpand(item.event.id)}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    <Terminal size={12} />
                    <span>{isRawExpanded ? "Hide Raw Syslog String" : "Inspect Raw Sophos SFOS Syslog"}</span>
                    {isRawExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <button
                    onClick={() => onSelectEvent(item.event)}
                    className="flex items-center gap-1 text-[#888888] hover:text-white text-[10px] font-bold uppercase bg-[#1a1a1e] border border-[#2d2d32] px-2 py-1 rounded"
                  >
                    <Eye size={12} />
                    <span>Open Syslog Inspector</span>
                  </button>
                </div>

                {/* Expanded Raw Syslog & Sophos Log ID Decoder */}
                {isRawExpanded && (
                  <div className="mt-3 rounded border border-[#2a2a32] bg-[#08080a] p-3 text-xs font-mono space-y-2.5">
                    
                    {/* Log ID Decoder Breakdown */}
                    {item.decodedLogId && (
                      <div className="pb-2 border-b border-[#1f1f26]">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                          Sophos SFOS v22.0 12-Digit Log ID Decoder: <strong className="text-white">{item.event.logId}</strong>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px]">
                          <div className="bg-[#121216] border border-[#222228] p-1.5 rounded">
                            <span className="text-[#666666] block">Type (c1c2):</span>
                            <span className="text-white font-bold">{item.decodedLogId.typeId} ({item.logTypeLabel})</span>
                          </div>
                          <div className="bg-[#121216] border border-[#222228] p-1.5 rounded">
                            <span className="text-[#666666] block">Component (c3c4):</span>
                            <span className="text-white font-bold">{item.decodedLogId.componentId}</span>
                          </div>
                          <div className="bg-[#121216] border border-[#222228] p-1.5 rounded">
                            <span className="text-[#666666] block">Subtype (c5c6):</span>
                            <span className="text-white font-bold">{item.decodedLogId.subtypeId}</span>
                          </div>
                          <div className="bg-[#121216] border border-[#222228] p-1.5 rounded">
                            <span className="text-[#666666] block">Severity (c7):</span>
                            <span className="text-white font-bold">{item.decodedLogId.severityCode}</span>
                          </div>
                          <div className="bg-[#121216] border border-[#222228] p-1.5 rounded">
                            <span className="text-[#666666] block">Msg ID (c8-12):</span>
                            <span className="text-white font-bold">{item.decodedLogId.messageId}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Raw Key-Value Payload */}
                    <div>
                      <span className="text-[10px] font-bold text-[#777777] uppercase block mb-1">
                        Raw Ingested Key-Value Packet:
                      </span>
                      <div className="p-2 bg-[#050507] border border-[#1a1a20] rounded text-[#00ffcc] break-all select-all text-[11px] leading-relaxed">
                        {item.event.rawPayload}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT MATRIX TABLE VIEW MODE */
        <div className="rounded border border-[#2a2a2a] bg-[#111113] overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#16161a] text-[10px] text-[#777777] uppercase tracking-wider">
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">HOST</th>
                <th className="py-2.5 px-3">HUMAN_EXPLANATION</th>
                <th className="py-2.5 px-3">SOURCE → DESTINATION</th>
                <th className="py-2.5 px-3">USER / APP</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1d]">
              {filteredLogs.map((item, idx) => (
                <tr
                  key={`${item.event.id}-${idx}`}
                  onClick={() => onSelectEvent(item.event)}
                  className="hover:bg-[#16161a] even:bg-[#131316] cursor-pointer group text-[11px]"
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      item.statusCategory === "allowed" ? "bg-emerald-950 border-emerald-800 text-emerald-400" :
                      item.statusCategory === "blocked" ? "bg-red-950 border-red-800 text-red-400" :
                      item.statusCategory === "warning" ? "bg-amber-950 border-amber-800 text-amber-300" :
                      "bg-cyan-950 border-cyan-800 text-cyan-300"
                    }`}>
                      {item.statusBadgeText}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#aaaaaa] whitespace-nowrap">{item.event.time}</td>
                  <td className="py-2.5 px-3 text-white font-bold whitespace-nowrap">{item.event.host}</td>
                  <td className="py-2.5 px-3 max-w-md">
                    <div className="font-bold text-white group-hover:text-emerald-400 transition">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[#888888] truncate max-w-xs sm:max-w-md">
                      {item.summary}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#cccccc] whitespace-nowrap font-mono text-[10px]">
                    <div>{item.srcFormatted}</div>
                    <div className="text-[#666666]">→ {item.dstFormatted}</div>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono whitespace-nowrap text-[10px]">
                    {item.appOrUser}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(item.event);
                      }}
                      className="text-[10px] bg-[#1a1a1d] border border-[#2a2a2a] text-[#888888] hover:text-white px-2 py-1 rounded"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
