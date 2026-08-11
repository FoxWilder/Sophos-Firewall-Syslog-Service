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
  CartesianGrid 
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Server, ShieldAlert, Activity } from "lucide-react";

interface AnalyticsViewProps {
  events: SyslogEvent[];
}

const SEVERITY_COLORS: Record<string, string> = {
  Debug: "#888888",
  Info: "#10b981",
  Notice: "#60a5fa",
  Warning: "#f59e0b",
  Error: "#ef4444",
  Critical: "#dc2626",
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ events }) => {
  
  // Severity Distribution Data
  const severityData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.severity] = (counts[e.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_COLORS[name] || "#10b981",
    }));
  }, [events]);

  // Host Volume Data
  const hostData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.host] = (counts[e.host] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // Facility Distribution Data
  const facilityData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.facility] = (counts[e.facility] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([facility, count]) => ({ facility, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  // Time Series Trend Data
  const trendData = useMemo(() => {
    return [
      { time: "10:00", events: 120, threats: 4 },
      { time: "11:00", events: 210, threats: 8 },
      { time: "12:00", events: 340, threats: 15 },
      { time: "13:00", events: 280, threats: 9 },
      { time: "14:00", events: 490, threats: 24 },
      { time: "15:00", events: 390, threats: 11 },
    ];
  }, []);

  return (
    <div className="space-y-4 font-mono select-none">
      
      {/* Top Banner */}
      <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#07111e] border border-[#1f3354] text-[#00a3e0]">
            <BarChart3 size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              SYSLOG_ANALYTICS_METRICS
            </h2>
            <p className="text-[10px] text-[#8ea8cb]">
              Real-time distribution metrics across severity, host, and facility layers
            </p>
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
              EVENT_VOLUME_&_THREAT_TREND
            </h3>
            <span className="text-[9px] text-[#00a3e0] font-bold uppercase">HOURLY_WINDOW</span>
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
                  name="Threats"
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
                  innerRadius={40}
                  outerRadius={65}
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

          <div className="space-y-1 pt-1 text-[10px]">
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

      {/* Grid Row 2: Top Hosts & Facility Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        
        {/* Top Hosts Bar Chart */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <Server size={14} className="text-[#00a3e0]" />
              EVENTS_BY_FIREWALL_HOST
            </h3>
          </div>

          <div className="h-48 w-full">
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

        {/* Facility Distribution Bar Chart */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
            <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <ShieldAlert size={14} className="text-[#00a3e0]" />
              EVENTS_BY_FACILITY
            </h3>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3354" />
                <XAxis type="number" stroke="#8ea8cb" fontSize={10} />
                <YAxis dataKey="facility" type="category" stroke="#8ea8cb" fontSize={10} width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#07111e",
                    borderColor: "#1f3354",
                    color: "#a2bdde",
                    fontSize: "10px",
                  }}
                />
                <Bar dataKey="count" fill="#00a3e0" radius={[0, 2, 2, 0]} name="Facility Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
