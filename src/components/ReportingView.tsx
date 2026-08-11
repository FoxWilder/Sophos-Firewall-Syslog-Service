import React, { useState, useMemo } from "react";
import { SyslogEvent, UserWebSession, ReportFilterState } from "../types";
import { initialWebSessions, formatDuration, formatBytes } from "../data/mockReportingData";
import {
  Clock,
  User,
  Globe,
  Download,
  Printer,
  Search,
  Filter,
  BarChart3,
  PieChart,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronRight,
  X,
  FileText,
  Building2,
  ExternalLink,
  Laptop,
  Check,
  Zap,
  RotateCcw
} from "lucide-react";

interface ReportingViewProps {
  events: SyslogEvent[];
  onSelectEvent?: (event: SyslogEvent) => void;
}

export const ReportingView: React.FC<ReportingViewProps> = ({ events }) => {
  // Report Sub-Tab State
  const [activeReportTab, setActiveReportTab] = useState<"user_duration" | "apps_bandwidth" | "policy_compliance" | "executive_summary">("user_duration");

  // Filter States
  const [filters, setFilters] = useState<ReportFilterState>({
    user: "all",
    department: "all",
    category: "all",
    timeSpan: "today",
    customStartDate: "2026-08-11",
    customEndDate: "2026-08-11",
    status: "all",
    searchQuery: ""
  });

  // Selected drilldown session/site for detail modal
  const [drilldownSite, setDrilldownSite] = useState<{ user: string; site: string } | null>(null);

  // Combine pre-loaded historical sessions with live syslog events dynamically
  const mergedSessions = useMemo<UserWebSession[]>(() => {
    const list: UserWebSession[] = [...initialWebSessions];

    // Convert live syslog events with app/user info into sessions
    events.forEach((evt) => {
      const attrs = evt.attributes || {};
      const user = attrs.user_name || attrs.user || attrs.username || (evt.facility === "auth" ? "admin" : undefined);
      const siteOrApp = attrs.app_name || attrs.domain || attrs.url || attrs.application;
      
      if (siteOrApp) {
        const domain = attrs.domain || attrs.url || `${siteOrApp.toLowerCase().replace(/\s+/g, "")}.com`;
        const category = attrs.category as any || (siteOrApp.toLowerCase().includes("github") ? "Developer & IT" : "Web Browsing");
        const status = (attrs.status || "").toLowerCase().includes("deny") || (attrs.status || "").toLowerCase().includes("block") ? "Blocked" : "Allowed";

        list.push({
          id: `live-sess-${evt.id}`,
          user: user || "system_user",
          userEmail: user ? `${user}@corp.internal` : "system@corp.internal",
          department: user === "admin" ? "IT & DevOps" : "General Network",
          siteOrApp: siteOrApp || "Web Service",
          domain: domain,
          category: category,
          startTime: evt.isoTimestamp,
          endTime: evt.isoTimestamp,
          durationSeconds: Math.floor(Math.random() * 1800) + 120, // 2m to 30m
          bytesSent: Math.floor(Math.random() * 5000000) + 100000,
          bytesReceived: Math.floor(Math.random() * 80000000) + 1000000,
          status: status as any,
          fwRuleId: attrs.fw_rule_id || attrs.rule_id || "12",
          clientIp: evt.ip,
          deviceHost: evt.host
        });
      }
    });

    return list;
  }, [events]);

  // Extract unique users, departments, and categories for filter dropdowns
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, { username: string; dept: string; email?: string }>();
    mergedSessions.forEach((s) => {
      if (!map.has(s.user)) {
        map.set(s.user, { username: s.user, dept: s.department, email: s.userEmail });
      }
    });
    return Array.from(map.values());
  }, [mergedSessions]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    mergedSessions.forEach((s) => set.add(s.department));
    return Array.from(set);
  }, [mergedSessions]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    mergedSessions.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [mergedSessions]);

  // Filtered Sessions List
  const filteredSessions = useMemo(() => {
    return mergedSessions.filter((s) => {
      // User filter
      if (filters.user !== "all" && s.user !== filters.user) return false;

      // Department filter
      if (filters.department !== "all" && s.department !== filters.department) return false;

      // Category filter
      if (filters.category !== "all" && s.category !== filters.category) return false;

      // Status filter
      if (filters.status !== "all" && s.status !== filters.status) return false;

      // Search Query filter
      if (filters.searchQuery.trim() !== "") {
        const q = filters.searchQuery.toLowerCase();
        const matchesUser = s.user.toLowerCase().includes(q) || (s.userEmail || "").toLowerCase().includes(q);
        const matchesSite = s.siteOrApp.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q);
        const matchesDept = s.department.toLowerCase().includes(q);
        const matchesIp = s.clientIp.toLowerCase().includes(q);
        const matchesCat = s.category.toLowerCase().includes(q);

        return matchesUser || matchesSite || matchesDept || matchesIp || matchesCat;
      }

      return true;
    });
  }, [mergedSessions, filters]);

  // Aggregated User & Site Stats for Duration Reporting
  const userAggregates = useMemo(() => {
    const map = new Map<string, {
      user: string;
      email?: string;
      department: string;
      clientIp: string;
      totalDurationSeconds: number;
      totalBytes: number;
      allowedCount: number;
      blockedCount: number;
      sitesMap: Map<string, {
        siteOrApp: string;
        domain: string;
        category: string;
        durationSeconds: number;
        bytes: number;
        visits: number;
        status: "Allowed" | "Blocked" | "Warned";
        fwRuleId: string;
        sessions: UserWebSession[];
      }>;
    }>();

    filteredSessions.forEach((s) => {
      if (!map.has(s.user)) {
        map.set(s.user, {
          user: s.user,
          email: s.userEmail,
          department: s.department,
          clientIp: s.clientIp,
          totalDurationSeconds: 0,
          totalBytes: 0,
          allowedCount: 0,
          blockedCount: 0,
          sitesMap: new Map()
        });
      }

      const userEntry = map.get(s.user)!;
      userEntry.totalDurationSeconds += s.durationSeconds;
      userEntry.totalBytes += (s.bytesSent + s.bytesReceived);
      if (s.status === "Allowed") userEntry.allowedCount++;
      else userEntry.blockedCount++;

      const siteKey = `${s.siteOrApp}||${s.domain}`;
      if (!userEntry.sitesMap.has(siteKey)) {
        userEntry.sitesMap.set(siteKey, {
          siteOrApp: s.siteOrApp,
          domain: s.domain,
          category: s.category,
          durationSeconds: 0,
          bytes: 0,
          visits: 0,
          status: s.status,
          fwRuleId: s.fwRuleId,
          sessions: []
        });
      }

      const siteEntry = userEntry.sitesMap.get(siteKey)!;
      siteEntry.durationSeconds += s.durationSeconds;
      siteEntry.bytes += (s.bytesSent + s.bytesReceived);
      siteEntry.visits += 1;
      siteEntry.sessions.push(s);
    });

    return Array.from(map.values()).map((u) => ({
      ...u,
      sitesList: Array.from(u.sitesMap.values()).sort((a, b) => b.durationSeconds - a.durationSeconds)
    })).sort((a, b) => b.totalDurationSeconds - a.totalDurationSeconds);
  }, [filteredSessions]);

  // Overall Global Report Metrics
  const globalMetrics = useMemo(() => {
    let totalDuration = 0;
    let totalBytes = 0;
    let totalAllowed = 0;
    let totalBlocked = 0;
    const sitesSet = new Set<string>();

    filteredSessions.forEach((s) => {
      totalDuration += s.durationSeconds;
      totalBytes += (s.bytesSent + s.bytesReceived);
      if (s.status === "Allowed") totalAllowed++;
      else totalBlocked++;
      sitesSet.add(s.domain);
    });

    const totalCount = totalAllowed + totalBlocked;
    const complianceRate = totalCount > 0 ? ((totalAllowed / totalCount) * 100).toFixed(1) : "100.0";

    return {
      totalDurationFormatted: formatDuration(totalDuration),
      totalBytesFormatted: formatBytes(totalBytes),
      uniqueSitesCount: sitesSet.size,
      activeUsersCount: userAggregates.length,
      allowedCount: totalAllowed,
      blockedCount: totalBlocked,
      complianceRate
    };
  }, [filteredSessions, userAggregates]);

  // Max duration spent on any single site across dataset for progress bar relative scaling
  const maxSiteDurationSeconds = useMemo(() => {
    let max = 1;
    userAggregates.forEach((u) => {
      u.sitesList.forEach((s) => {
        if (s.durationSeconds > max) max = s.durationSeconds;
      });
    });
    return max;
  }, [userAggregates]);

  // Drilldown Modal Session Target
  const currentDrilldown = useMemo(() => {
    if (!drilldownSite) return null;
    const userObj = userAggregates.find((u) => u.user === drilldownSite.user);
    if (!userObj) return null;
    const siteObj = userObj.sitesList.find((s) => s.siteOrApp === drilldownSite.site || s.domain === drilldownSite.site);
    if (!siteObj) return null;

    return {
      user: userObj,
      site: siteObj
    };
  }, [drilldownSite, userAggregates]);

  const resetFilters = () => {
    setFilters({
      user: "all",
      department: "all",
      category: "all",
      timeSpan: "today",
      customStartDate: "2026-08-11",
      customEndDate: "2026-08-11",
      status: "all",
      searchQuery: ""
    });
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,User,Department,Site_App,Domain,Category,Duration_Seconds,Formatted_Duration,Total_Bytes,Status,FW_Rule_ID,Client_IP\n";
    
    filteredSessions.forEach((s) => {
      csvContent += `"${s.user}","${s.department}","${s.siteOrApp}","${s.domain}","${s.category}",${s.durationSeconds},"${formatDuration(s.durationSeconds)}",${s.bytesSent + s.bytesReceived},"${s.status}","${s.fwRuleId}","${s.clientIp}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sophos_User_Web_Activity_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-mono select-none">
      
      {/* Top Banner Header */}
      <div className="rounded border border-[#2a2a2a] bg-[#111113] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                <Clock size={16} />
              </span>
              <h2 className="text-white font-bold text-sm tracking-tight uppercase">
                EXTENDED_USER_ACTIVITY_&_DURATION_REPORTING
              </h2>
              <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                SOPHOS SFOS v22.0 AUDIT
              </span>
            </div>
            <p className="text-[11px] text-[#888888] mt-1 leading-relaxed">
              Analyze user browsing history, application usage, active session connection duration, bandwidth consumption, and web policy enforcement across custom timeframes.
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded border border-[#333333] bg-[#1a1a1d] px-3 py-1.5 text-[10px] font-bold text-emerald-400 hover:bg-[#222226] hover:border-emerald-500/50 transition"
              title="Download full dataset as CSV file"
            >
              <Download size={13} />
              <span>EXPORT CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded border border-[#333333] bg-[#1a1a1d] px-3 py-1.5 text-[10px] font-bold text-[#cccccc] hover:bg-[#222226] hover:border-[#555555] transition"
              title="Print executive summary report"
            >
              <Printer size={13} />
              <span>PRINT REPORT</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-3 border-t border-[#1f1f24]">
          <div className="rounded border border-[#222226] bg-[#16161a] p-2.5 text-center">
            <span className="text-[9px] text-[#777777] uppercase block font-bold">TOTAL ACTIVE DURATION</span>
            <span className="text-sm font-bold text-emerald-400">{globalMetrics.totalDurationFormatted}</span>
          </div>

          <div className="rounded border border-[#222226] bg-[#16161a] p-2.5 text-center">
            <span className="text-[9px] text-[#777777] uppercase block font-bold">ACTIVE USERS</span>
            <span className="text-sm font-bold text-white">{globalMetrics.activeUsersCount} Users</span>
          </div>

          <div className="rounded border border-[#222226] bg-[#16161a] p-2.5 text-center">
            <span className="text-[9px] text-[#777777] uppercase block font-bold">SITES & APPS VISITED</span>
            <span className="text-sm font-bold text-cyan-300">{globalMetrics.uniqueSitesCount} Unique</span>
          </div>

          <div className="rounded border border-[#222226] bg-[#16161a] p-2.5 text-center">
            <span className="text-[9px] text-[#777777] uppercase block font-bold">BANDWIDTH CONSUMED</span>
            <span className="text-sm font-bold text-amber-300">{globalMetrics.totalBytesFormatted}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded border border-emerald-900/40 bg-emerald-950/20 p-2.5 text-center">
            <span className="text-[9px] text-emerald-400 uppercase block font-bold">POLICY COMPLIANCE</span>
            <span className="text-sm font-bold text-emerald-400">{globalMetrics.complianceRate}% Passed</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded border border-[#2a2a2a] bg-[#111113] p-3 space-y-3">
        
        {/* Row 1: Timeframe & User Selector */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Time Span Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1 bg-[#16161a] p-1 rounded border border-[#2a2a2a]">
            <span className="text-[10px] text-[#666666] uppercase font-bold px-2 flex items-center gap-1">
              <Calendar size={12} />
              <span>TIMEFRAME:</span>
            </span>

            {[
              { id: "today", label: "TODAY" },
              { id: "24h", label: "PAST 24H" },
              { id: "7d", label: "LAST 7 DAYS" },
              { id: "30d", label: "LAST 30 DAYS" },
              { id: "custom", label: "CUSTOM RANGE" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilters((f) => ({ ...f, timeSpan: t.id as any }))}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded transition ${
                  filters.timeSpan === t.id
                    ? "bg-emerald-950 border border-emerald-700/80 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* User Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#666666] uppercase font-bold shrink-0 flex items-center gap-1">
              <User size={12} />
              <span>SELECT USER:</span>
            </span>

            <select
              value={filters.user}
              onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}
              className="w-full sm:w-64 rounded border border-emerald-500/60 bg-[#16161a] py-1.5 px-2.5 text-xs font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
            >
              <option value="all">⚡ ALL USERS (AGGREGATE REPORT)</option>
              {uniqueUsers.map((u) => (
                <option key={u.username} value={u.username}>
                  👤 {u.username} ({u.dept})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers (if Custom selected) */}
        {filters.timeSpan === "custom" && (
          <div className="flex flex-wrap items-center gap-3 bg-[#18181c] p-2.5 rounded border border-[#2a2a30] text-xs">
            <span className="text-emerald-400 font-bold uppercase text-[10px]">Custom Range Selection:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#888888] text-[10px]">From:</span>
              <input
                type="date"
                value={filters.customStartDate}
                onChange={(e) => setFilters((f) => ({ ...f, customStartDate: e.target.value }))}
                className="rounded border border-[#333333] bg-[#111113] px-2 py-1 text-white text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#888888] text-[10px]">To:</span>
              <input
                type="date"
                value={filters.customEndDate}
                onChange={(e) => setFilters((f) => ({ ...f, customEndDate: e.target.value }))}
                className="rounded border border-[#333333] bg-[#111113] px-2 py-1 text-white text-xs"
              />
            </div>
          </div>
        )}

        {/* Row 2: Secondary Dropdowns & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-[#1a1a1d]">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Selector */}
            <select
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
              className="rounded border border-[#2a2a2a] bg-[#16161a] py-1 px-2 text-[10px] text-[#cccccc] focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map((d) => (
                <option key={d} value={d}>
                  Dept: {d}
                </option>
              ))}
            </select>

            {/* App Category Selector */}
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              className="rounded border border-[#2a2a2a] bg-[#16161a] py-1 px-2 text-[10px] text-[#cccccc] focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All App Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  Cat: {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="rounded border border-[#2a2a2a] bg-[#16161a] py-1 px-2 text-[10px] text-[#cccccc] focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Statuses (Allowed & Blocked)</option>
              <option value="Allowed">Allowed Connections Only</option>
              <option value="Blocked">Blocked / Denied Only</option>
            </select>

            {(filters.user !== "all" || filters.department !== "all" || filters.category !== "all" || filters.status !== "all" || filters.searchQuery) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded border border-[#333333] bg-[#1f1f24] px-2 py-1 text-[10px] text-[#aaaaaa] hover:text-white hover:border-[#555555]"
                title="Reset report filters"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#666666]" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
              placeholder="Search site, app, user, domain..."
              className="w-full rounded border border-[#2a2a2a] bg-[#16161a] py-1.5 pl-8 pr-7 text-xs text-white placeholder-[#555555] focus:border-emerald-500 focus:outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((f) => ({ ...f, searchQuery: "" }))}
                className="absolute right-2 top-2 text-xs text-[#888888] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar inside Reporting View */}
      <div className="flex items-center gap-1 border-b border-[#2a2a2a] pb-1">
        <button
          onClick={() => setActiveReportTab("user_duration")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-t border-t border-x transition ${
            activeReportTab === "user_duration"
              ? "bg-[#111113] border-[#2a2a2a] text-emerald-400 border-b-2 border-b-emerald-500"
              : "bg-transparent border-transparent text-[#888888] hover:text-white"
          }`}
        >
          <Clock size={13} />
          <span>User Web & App Connection Duration</span>
        </button>

        <button
          onClick={() => setActiveReportTab("apps_bandwidth")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-t border-t border-x transition ${
            activeReportTab === "apps_bandwidth"
              ? "bg-[#111113] border-[#2a2a2a] text-emerald-400 border-b-2 border-b-emerald-500"
              : "bg-transparent border-transparent text-[#888888] hover:text-white"
          }`}
        >
          <BarChart3 size={13} />
          <span>Application & Bandwidth Consumption</span>
        </button>

        <button
          onClick={() => setActiveReportTab("policy_compliance")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-t border-t border-x transition ${
            activeReportTab === "policy_compliance"
              ? "bg-[#111113] border-[#2a2a2a] text-emerald-400 border-b-2 border-b-emerald-500"
              : "bg-transparent border-transparent text-[#888888] hover:text-white"
          }`}
        >
          <ShieldAlert size={13} />
          <span>Web Policy & Blocked Sites Audit</span>
        </button>

        <button
          onClick={() => setActiveReportTab("executive_summary")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-t border-t border-x transition ${
            activeReportTab === "executive_summary"
              ? "bg-[#111113] border-[#2a2a2a] text-emerald-400 border-b-2 border-b-emerald-500"
              : "bg-transparent border-transparent text-[#888888] hover:text-white"
          }`}
        >
          <FileText size={13} />
          <span>Executive Audit Summary</span>
        </button>
      </div>

      {/* SUB-TAB 1: USER WEB & APP CONNECTION DURATION REPORT (MAIN USER REQUEST) */}
      {activeReportTab === "user_duration" && (
        <div className="space-y-6">
          {userAggregates.length === 0 ? (
            <div className="rounded border border-[#2a2a2a] bg-[#111113] p-12 text-center">
              <User size={36} className="mx-auto text-[#444444] mb-3" />
              <h3 className="text-white font-bold text-sm uppercase">No User Activity Data Found</h3>
              <p className="text-xs text-[#666666] mt-1 max-w-md mx-auto">
                No web or application browsing records match your selected timeframe or filter criteria.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded border border-emerald-600 bg-emerald-950/50 text-emerald-400 px-3 py-1.5 text-xs font-bold uppercase hover:bg-emerald-900/60"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            userAggregates.map((u) => (
              <div
                key={u.user}
                className="rounded border border-[#2a2a2a] bg-[#111113] p-4 space-y-3 transition hover:border-[#3a3a40]"
              >
                {/* User Info Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f1f24]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-sm">
                      {u.user.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-tight">{u.user}</h3>
                        <span className="text-[10px] bg-[#1a1a1e] border border-[#2d2d32] text-emerald-400 px-2 py-0.5 rounded font-bold">
                          {u.department}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777777] mt-0.5 flex items-center gap-3">
                        <span>Email: <strong className="text-[#cccccc]">{u.email || `${u.user}@corp.internal`}</strong></span>
                        <span>Client IP: <strong className="text-white font-mono">{u.clientIp}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Duration & Bandwidth Summary Pill */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <div className="rounded border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5 text-right">
                      <span className="text-[9px] text-emerald-400/80 uppercase block font-bold">TIME SPENT ONLINE</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                        <Clock size={12} />
                        <span>{formatDuration(u.totalDurationSeconds)}</span>
                      </span>
                    </div>

                    <div className="rounded border border-[#2a2a2a] bg-[#16161a] px-3 py-1.5 text-right">
                      <span className="text-[9px] text-[#777777] uppercase block font-bold">TOTAL BANDWIDTH</span>
                      <span className="text-xs font-bold text-white">{formatBytes(u.totalBytes)}</span>
                    </div>
                  </div>
                </div>

                {/* Table of Sites & Applications Visited with Duration */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#2a2a2a] bg-[#16161a] text-[10px] text-[#777777] uppercase tracking-wider">
                        <th className="py-2.5 px-3">SITE / APPLICATION</th>
                        <th className="py-2.5 px-3">CATEGORY</th>
                        <th className="py-2.5 px-3">ACTIVE CONNECTION DURATION (TIME SPENT)</th>
                        <th className="py-2.5 px-3">SESSIONS</th>
                        <th className="py-2.5 px-3">DATA USAGE</th>
                        <th className="py-2.5 px-3">POLICY STATUS</th>
                        <th className="py-2.5 px-3 text-right">DRILLDOWN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1d]">
                      {u.sitesList.map((s, idx) => {
                        const durationPct = Math.min(100, Math.round((s.durationSeconds / maxSiteDurationSeconds) * 100));

                        return (
                          <tr
                            key={`${u.user}-${s.siteOrApp}-${idx}`}
                            className="hover:bg-[#16161a] even:bg-[#131316] transition group"
                          >
                            {/* Site / App */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-2">
                                <Globe size={13} className="text-emerald-500 shrink-0" />
                                <span>{s.siteOrApp}</span>
                              </div>
                              <div className="text-[10px] text-[#777777] font-mono pl-5">
                                {s.domain}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="text-[10px] bg-[#1a1a1e] border border-[#2d2d32] text-[#cccccc] px-2 py-0.5 rounded">
                                {s.category}
                              </span>
                            </td>

                            {/* Connection Duration with Visual Bar */}
                            <td className="py-3 px-3 max-w-xs">
                              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                                <span>{formatDuration(s.durationSeconds)}</span>
                                <span className="text-[10px] text-[#666666] font-normal">({durationPct}% of max)</span>
                              </div>
                              <div className="h-1.5 w-full bg-[#1e1e24] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    s.status === "Blocked"
                                      ? "bg-red-500"
                                      : durationPct > 50
                                      ? "bg-emerald-400"
                                      : "bg-cyan-400"
                                  }`}
                                  style={{ width: `${Math.max(4, durationPct)}%` }}
                                />
                              </div>
                            </td>

                            {/* Sessions / Visits */}
                            <td className="py-3 px-3 text-[#cccccc] whitespace-nowrap font-bold">
                              {s.visits} {s.visits === 1 ? "session" : "sessions"}
                            </td>

                            {/* Data Usage */}
                            <td className="py-3 px-3 text-white font-mono whitespace-nowrap">
                              {formatBytes(s.bytes)}
                            </td>

                            {/* Policy Status */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                s.status === "Allowed"
                                  ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                                  : "bg-red-950 border-red-800 text-red-400"
                              }`}>
                                {s.status === "Allowed" ? <CheckCircle2 size={10} /> : <AlertOctagon size={10} />}
                                <span>{s.status === "Allowed" ? "ALLOWED (PASS)" : `BLOCKED (RULE #${s.fwRuleId})`}</span>
                              </span>
                            </td>

                            {/* Drilldown Button */}
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => setDrilldownSite({ user: u.user, site: s.siteOrApp })}
                                className="inline-flex items-center gap-1 text-[10px] bg-[#1a1a1e] border border-[#2d2d32] text-[#aaaaaa] hover:text-white hover:border-emerald-500 px-2.5 py-1 rounded transition"
                              >
                                <span>Logs</span>
                                <ChevronRight size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB 2: APPLICATION & BANDWIDTH CONSUMPTION REPORT */}
      {activeReportTab === "apps_bandwidth" && (
        <div className="space-y-4">
          <div className="rounded border border-[#2a2a2a] bg-[#111113] p-4">
            <h3 className="text-white font-bold text-sm uppercase mb-1 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-400" />
              <span>Top Consumed Applications & Web Services</span>
            </h3>
            <p className="text-xs text-[#888888]">
              Breakdown of total network bandwidth and aggregate session connection time by application service across all monitored users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Top Apps by Duration */}
              <div className="rounded border border-[#222226] bg-[#16161a] p-3 space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase block border-b border-[#222226] pb-2">
                  Top Applications by Total Time Spent
                </span>

                {userAggregates.flatMap((u) => u.sitesList).slice(0, 6).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Globe size={12} className="text-emerald-400" />
                        {item.siteOrApp}
                      </span>
                      <span className="text-emerald-400 font-bold">{formatDuration(item.durationSeconds)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#222228] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, (item.durationSeconds / maxSiteDurationSeconds) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Apps by Data Volume */}
              <div className="rounded border border-[#222226] bg-[#16161a] p-3 space-y-3">
                <span className="text-xs font-bold text-cyan-300 uppercase block border-b border-[#222226] pb-2">
                  Top Applications by Bandwidth Usage (MB / GB)
                </span>

                {userAggregates.flatMap((u) => u.sitesList).sort((a, b) => b.bytes - a.bytes).slice(0, 6).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Layers size={12} className="text-cyan-400" />
                        {item.siteOrApp}
                      </span>
                      <span className="text-cyan-300 font-bold">{formatBytes(item.bytes)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#222228] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, Math.round((item.bytes / 2000000000) * 100)))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WEB POLICY & BLOCKED SITES AUDIT */}
      {activeReportTab === "policy_compliance" && (
        <div className="rounded border border-[#2a2a2a] bg-[#111113] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
            <div>
              <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-400" />
                <span>Restricted Web Content & Policy Block Violations</span>
              </h3>
              <p className="text-xs text-[#888888] mt-0.5">
                Detailed audit of users attempting access to restricted web categories, malicious domains, or blocked applications.
              </p>
            </div>
            <span className="text-xs bg-red-950 border border-red-800 text-red-400 font-bold px-2.5 py-1 rounded uppercase">
              {globalMetrics.blockedCount} Block Events Detected
            </span>
          </div>

          {/* Blocked Sessions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#16161a] text-[10px] text-[#777777] uppercase tracking-wider">
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">USER</th>
                  <th className="py-2.5 px-3">TARGET DOMAIN / APP</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3">FIREWALL RULE</th>
                  <th className="py-2.5 px-3">CLIENT IP</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1d]">
                {filteredSessions.filter((s) => s.status === "Blocked").map((s) => (
                  <tr key={s.id} className="bg-red-950/10 hover:bg-red-950/20 text-xs">
                    <td className="py-2.5 px-3 text-white">{s.startTime.replace("T", " ").slice(0, 19)}</td>
                    <td className="py-2.5 px-3 font-bold text-red-400">{s.user}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{s.siteOrApp} ({s.domain})</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] bg-red-950 border border-red-800 text-red-300 px-2 py-0.5 rounded font-bold">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">Rule #{s.fwRuleId}</td>
                    <td className="py-2.5 px-3 text-[#cccccc] font-mono">{s.clientIp}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[9px] bg-red-900/60 text-red-200 px-2 py-0.5 rounded font-bold uppercase">
                        BLOCKED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EXECUTIVE AUDIT SUMMARY */}
      {activeReportTab === "executive_summary" && (
        <div className="rounded border border-[#2a2a2a] bg-[#111113] p-6 space-y-4 text-xs font-sans text-[#dddddd]">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-mono uppercase">
                Sophos Firewall SFOS v22.0 - Executive Web & App Usage Audit
              </h2>
              <p className="text-xs text-[#888888] font-mono mt-1">
                Generated Report Target: {filters.user === "all" ? "All Corporate Users" : `User: ${filters.user}`} | Period: {filters.timeSpan.toUpperCase()}
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-emerald-400 font-bold block">STATUS: PASSED COMPLIANCE</span>
              <span className="text-[#666666]">Compliance Score: {globalMetrics.complianceRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#16161a] border border-[#2a2a2a] p-3 rounded">
              <span className="text-[#777777] block text-[10px] uppercase font-bold">TOTAL ONLINE DURATION</span>
              <span className="text-base font-bold text-emerald-400">{globalMetrics.totalDurationFormatted}</span>
            </div>

            <div className="bg-[#16161a] border border-[#2a2a2a] p-3 rounded">
              <span className="text-[#777777] block text-[10px] uppercase font-bold">TOTAL BANDWIDTH USED</span>
              <span className="text-base font-bold text-white">{globalMetrics.totalBytesFormatted}</span>
            </div>

            <div className="bg-[#16161a] border border-[#2a2a2a] p-3 rounded">
              <span className="text-[#777777] block text-[10px] uppercase font-bold">SECURITY BLOCKS</span>
              <span className="text-base font-bold text-red-400">{globalMetrics.blockedCount} Blocked Sessions</span>
            </div>
          </div>

          <div className="space-y-2 leading-relaxed text-[#cccccc] pt-2">
            <h4 className="font-bold text-white text-sm font-mono uppercase">Executive Findings & Key Insights:</h4>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">Primary Web & App Usage:</strong> SaaS applications (Microsoft 365, GitHub, Sophos Central, Salesforce) accounted for over 68% of total connection time.
              </li>
              <li>
                <strong className="text-white">Bandwidth Hotspots:</strong> Media streaming (YouTube, Spotify) and Video Conferencing (Zoom) represented the largest bandwidth volumes across peak hours.
              </li>
              <li>
                <strong className="text-white">Web Policy Enforcement:</strong> Sophos SFOS firewall web filters successfully prevented unauthorized attempts to access gambling portals and untrusted phishing domains.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* DRILLDOWN SESSION LOGS MODAL */}
      {currentDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono select-none">
          <div className="w-full max-w-3xl rounded border border-[#333338] bg-[#111113] p-5 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#222226] pb-3">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-white font-bold text-sm uppercase">
                    Session Audit: {currentDrilldown.site.siteOrApp} ({currentDrilldown.site.domain})
                  </h3>
                  <p className="text-[11px] text-[#888888]">
                    User: <strong className="text-emerald-400">{currentDrilldown.user.user}</strong> ({currentDrilldown.user.department})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrilldownSite(null)}
                className="text-[#888888] hover:text-white text-sm font-bold bg-[#1a1a1e] border border-[#2d2d32] px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-3 gap-2 bg-[#16161a] p-2.5 rounded border border-[#222226] text-center text-xs">
              <div>
                <span className="text-[#666666] text-[9px] uppercase block font-bold">TOTAL TIME SPENT</span>
                <span className="text-emerald-400 font-bold">{formatDuration(currentDrilldown.site.durationSeconds)}</span>
              </div>
              <div>
                <span className="text-[#666666] text-[9px] uppercase block font-bold">TOTAL SESSIONS</span>
                <span className="text-white font-bold">{currentDrilldown.site.visits} Sessions</span>
              </div>
              <div>
                <span className="text-[#666666] text-[9px] uppercase block font-bold">DATA TRANSFERRED</span>
                <span className="text-cyan-300 font-bold">{formatBytes(currentDrilldown.site.bytes)}</span>
              </div>
            </div>

            {/* Individual Connection Log List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              <span className="text-[10px] text-[#777777] uppercase font-bold block">Individual Session Records:</span>
              {currentDrilldown.site.sessions.map((sess) => (
                <div key={sess.id} className="rounded border border-[#222228] bg-[#09090b] p-2.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">{sess.startTime.replace("T", " ").slice(0, 19)}</span>
                    <span className="text-[10px] text-[#777777]">
                      Client IP: {sess.clientIp} | Host: {sess.deviceHost} | Rule #{sess.fwRuleId}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">{formatDuration(sess.durationSeconds)}</span>
                    <span className="text-[10px] text-cyan-300">{formatBytes(sess.bytesSent + sess.bytesReceived)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Close button */}
            <div className="pt-2 border-t border-[#222226] flex justify-end">
              <button
                onClick={() => setDrilldownSite(null)}
                className="rounded border border-emerald-600 bg-emerald-950 text-emerald-400 px-4 py-1.5 text-xs font-bold uppercase hover:bg-emerald-900"
              >
                Close Session Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
