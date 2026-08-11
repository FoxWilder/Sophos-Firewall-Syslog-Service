import React, { useMemo } from "react";
import { SyslogEvent } from "../types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  CartesianGrid,
  Legend
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Server, ShieldAlert, Activity, Layers, UserCheck, Shield } from "lucide-react";

interface AnalyticsViewProps {
  events: SyslogEvent[];
}

const SEVERITY_COLORS: Record<string, string> = {
  Debug: "#888888",
  Info: "#00a3e0",
  Notice: "#0066cc",
  Warning: "#f59e0b",
  Error: "#ef4444",
  Critical: "#dc2626",
  Alert: "#b91c1c",
  Emergency: "#7f1d1d"
};

const CATEGORY_COLORS = ["#00a3e0", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#06b6d4"];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ events }) => {
  
  // Severity Distribution Data (Dynamic)
  const severityData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.severity] = (counts[e.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_COLORS[name] || "#00a3e0",
    }));
  }, [events]);

  // Host Volume Data (Dynamic)
  const hostData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      const h = e.host || "unknown-firewall";
      counts[h] = (counts[h] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // Facility Distribution Data (Dynamic)
  const facilityData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      const f = e.logComponent || e.facility || "general";
      counts[f] = (counts[f] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([facility, count]) => ({ facility, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // Category Distribution Pie Chart Data (Dynamic)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      const cat = e.attributes.category || e.attributes.cat_name || e.attributes.web_category || "General Traffic";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value], idx) => ({
        name,
        value,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  // Firewall Rule ID Hit Counter (Dynamic)
  const ruleHitData = useMemo(() => {
    const counts: Record<string, { ruleId: string; total: number; allowed: number; blocked: number }> = {};
    events.forEach((e) => {
      const rId = e.attributes.fw_rule_id || e.attributes.rule_id || "Rule 12 (Default)";
      if (!counts[rId]) {
        counts[rId] = { ruleId: `Rule ${rId}`, total: 0, allowed: 0, blocked: 0 };
      }
      counts[rId].total += 1;
      const isBlock = (e.attributes.status || e.attributes.action || "").toLowerCase().includes("block") || (e.attributes.status || e.attributes.action || "").toLowerCase().includes("deny");
      if (isBlock) counts[rId].blocked += 1;
      else counts[rId].allowed += 1;
    });
    return Object.values(counts).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [events]);

  // Dynamic Time Series Trend Data from Events
  const trendData = useMemo(() => {
    if (events.length === 0) {
      return [
        { time: "08:00", events: 0, threats: 0 },
        { time: "10:00", events: 0, threats: 0 },
        { time: "12:00", events: 0, threats: 0 },
        { time: "14:00", events: 0, threats: 0 },
      ];
    }

    const hourlyMap = new Map<string, { events: number; threats: number }>();

    events.forEach((e) => {
      let hourStr = "12:00";
      if (e.time && e.time.includes(":")) {
        const parts = e.time.split(":");
        hourStr = `${parts[0].padStart(2, "0")}:00`;
      } else if (e.isoTimestamp) {
        const d = new Date(e.isoTimestamp);
        if (!isNaN(d.getTime())) {
          hourStr = `${String(d.getHours()).padStart(2, "0")}:00`;
        }
      }

      if (!hourlyMap.has(hourStr)) {
        hourlyMap.set(hourStr, { events: 0, threats: 0 });
      }

      const item = hourlyMap.get(hourStr)!;
      item.events += 1;

      const isThreat =
        e.severity === "Critical" ||
        e.severity === "Error" ||
        e.severity === "Alert" ||
        (e.attributes.status || e.attributes.action || "").toLowerCase().includes("block") ||
        (e.attributes.status || e.attributes.action || "").toLowerCase().includes("deny");

      if (isThreat) {
        item.threats += 1;
      }
    });

    return Array.from(hourlyMap.entries())
      .map(([time, val]) => ({ time, ...val }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events]);

  // Top User Activity Breakdown (Dynamic)
  const topUsers = useMemo(() => {
    const counts: Record<string, { user: string; eventCount: number; blockedCount: number }> = {};
    events.forEach((e) => {
      const u = e.attributes.user || e.attributes.user_name || e.attributes.src_user || "System / Unauthenticated";
      if (!counts[u]) {
        counts[u] = { user: u, eventCount: 0, blockedCount: 0 };
      }
      counts[u].eventCount += 1;
      if ((e.attributes.status || e.attributes.action || "").toLowerCase().includes("block")) {
        counts[u].blockedCount += 1;
      }
    });
    return Object.values(counts).sort((a, b) => b.eventCount - a.eventCount).slice(0, 5);
  }, [events]);

  return (
    <div className="space-y-4 font-mono select-none">
      
      {/* Top Banner */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#07111e] border border-[#1f3354] text-[#00a3e0]">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                SYSLOG_ANALYTICS_METRICS
              </h2>
              <p className="text-[10px] text-[#8ea8cb]">
                Real-time distribution metrics across severity, firewall rules, user activity, and categories
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#00a3e0] font-bold">
            <span className="rounded bg-[#07111e] border border-[#1f3354] px-2 py-1">
              TOTAL LOGS: {events.length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Volume Trend & Severity Donut */}
      <div className="grid gap-4 lg:grid-cols-3">
        
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <Activity size={14} className="text-[#00a3e0]" />
              DYNAMIC_EVENT_VOLUME_&_THREAT_TREND
            </h3>
            <span className="text-[9px] text-[#00a3e0] font-bold uppercase">HOURLY_AGGREGATION</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066cc" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0066cc" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3354" />
                <XAxis dataKey="time" stroke="#8ea8cb" fontSize={10} />
                <YAxis stroke="#8ea8cb" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07111e",
                    borderColor: "#1f3354",
                    borderRadius: "4px",
                    color: "#a2bdde",
                    fontSize: "11px",
                    fontFamily: "monospace"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#00a3e0"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#eventGrad)"
                  name="Syslog Events"
                />
                <Area
                  type="monotone"
                  dataKey="threats"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#threatGrad)"
                  name="Threats / Drops"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Pie Chart */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <PieChartIcon size={14} className="text-[#00a3e0]" />
              SEVERITY_RATIO
            </h3>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07111e",
                    borderColor: "#1f3354",
                    color: "#a2bdde",
                    fontSize: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 pt-1 text-[10px] max-h-24 overflow-y-auto">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-bold text-[#8ea8cb] uppercase">{s.name}</span>
                </div>
                <span className="font-mono text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Row 2: Category Pie Chart & Firewall Rule Hits */}
      <div className="grid gap-4 lg:grid-cols-2">
        
        {/* Web Category Donut Chart */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <Layers size={14} className="text-purple-400" />
              CATEGORY_DISTRIBUTION_PIE
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-44 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cat-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#07111e",
                      borderColor: "#1f3354",
                      color: "#a2bdde",
                      fontSize: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-1 text-[10px] max-h-40 overflow-y-auto pr-1">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[#a2bdde] truncate">{c.name}</span>
                  </div>
                  <span className="font-bold text-white font-mono">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Firewall Rule ID Hit Counter */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <Shield size={14} className="text-emerald-400" />
              TOP_FIREWALL_POLICY_HITS
            </h3>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ruleHitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3354" />
                <XAxis dataKey="ruleId" stroke="#8ea8cb" fontSize={10} />
                <YAxis stroke="#8ea8cb" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07111e",
                    borderColor: "#1f3354",
                    color: "#a2bdde",
                    fontSize: "10px",
                  }}
                />
                <Bar dataKey="allowed" fill="#10b981" stackId="a" name="Allowed Hits" />
                <Bar dataKey="blocked" fill="#ef4444" stackId="a" name="Blocked Hits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid Row 3: Top Hosts & Top User Activity Table */}
      <div className="grid gap-4 lg:grid-cols-2">
        
        {/* Top Hosts Bar Chart */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <Server size={14} className="text-[#00a3e0]" />
              EVENTS_BY_FIREWALL_HOST
            </h3>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3354" />
                <XAxis dataKey="host" stroke="#8ea8cb" fontSize={10} />
                <YAxis stroke="#8ea8cb" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07111e",
                    borderColor: "#1f3354",
                    color: "#a2bdde",
                    fontSize: "10px",
                  }}
                />
                <Bar dataKey="count" fill="#0066cc" radius={[2, 2, 0, 0]} name="Log Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Users Activity Leaderboard */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <UserCheck size={14} className="text-[#00a3e0]" />
              TOP_USER_ACTIVITY_STREAM
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-[#07111e] text-[9px] text-[#8ea8cb] uppercase border-b border-[#1f3354]">
                <tr>
                  <th className="px-2 py-1.5 font-bold">USER IDENTIFIER</th>
                  <th className="px-2 py-1.5 font-bold text-right">TOTAL LOGS</th>
                  <th className="px-2 py-1.5 font-bold text-right">BLOCKED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f3354]">
                {topUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-[#13253f]">
                    <td className="px-2 py-1.5 font-bold text-[#00a3e0]">👤 {u.user}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-white">{u.eventCount}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-red-400">
                      {u.blockedCount > 0 ? `${u.blockedCount} drops` : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

