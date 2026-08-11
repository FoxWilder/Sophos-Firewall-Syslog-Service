import React from "react";
import { 
  ShieldCheck, 
  Activity, 
  SlidersHorizontal, 
  BookOpen, 
  BarChart3, 
  Filter, 
  Send, 
  Pause, 
  Play, 
  RefreshCw,
  Menu,
  X,
  Server,
  Radio,
  Zap,
  FileText,
  PieChart
} from "lucide-react";

export type NavTab = "dashboard" | "human_logs" | "explorer" | "reporting" | "analytics" | "settings" | "setup" | "injector";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean | ((prev: boolean) => boolean)) => void;
  streamMode: "live" | "demo";
  setStreamMode: (mode: "live" | "demo") => void;
  eventCount: number;
  onRefresh: () => void;
  onOpenInjector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  streamMode,
  setStreamMode,
  eventCount,
  onRefresh,
  onOpenInjector
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "dashboard", label: "DASHBOARD", icon: Activity },
    { id: "human_logs", label: "HUMAN_LOGS", icon: FileText, badge: "PARSER" },
    { id: "explorer", label: "LOG_EXPLORER", icon: Filter, badge: String(eventCount) },
    { id: "reporting", label: "REPORTING", icon: PieChart, badge: "EXTENDED" },
    { id: "analytics", label: "ANALYTICS", icon: BarChart3 },
    { id: "settings", label: "SETTINGS", icon: SlidersHorizontal },
    { id: "setup", label: "SETUP_GUIDE", icon: BookOpen },
  ];

  return (
    <header className="mb-4 rounded border border-[#1f3354] bg-[#0b192c] p-3 sm:p-4 font-mono select-none shadow-lg">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Brand & Collector Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#0066cc] text-white shadow-[0_0_12px_rgba(0,102,204,0.4)]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${streamMode === 'live' ? 'bg-[#00a3e0] shadow-[0_0_8px_rgba(0,163,224,0.8)] animate-pulse' : 'bg-amber-400'}`}></div>
              <h1 className="text-white font-bold text-base tracking-tight uppercase flex items-center gap-2">
                <span className="text-[#00a3e0] font-black">SOPHOS</span> Firewall Syslog Receiver
              </h1>
              <span className="text-[10px] bg-[#0066cc]/40 border border-[#00a3e0]/60 text-[#00a3e0] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                SFOS v22.0
              </span>
            </div>
            <p className="text-[11px] text-[#8ea8cb] mt-0.5 tracking-wide flex items-center gap-2">
              <span>UDP/TCP 5514 LISTENER</span>
              <span>•</span>
              <span className="text-[#00a3e0] font-semibold">SQLITE STORAGE</span>
              <span>•</span>
              <span>ADMIN MONITORING</span>
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Stream Mode Toggle (Live Server vs Demo Simulation) */}
          <button
            onClick={() => setStreamMode(streamMode === "live" ? "demo" : "live")}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition ${
              streamMode === "live"
                ? "border-[#00a3e0]/60 bg-[#0066cc]/20 text-[#00a3e0] hover:bg-[#0066cc]/40"
                : "border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50"
            }`}
            title={streamMode === "live" ? "Receiving real firewall logs from UDP/TCP 5514. Click to switch to Demo Simulation." : "Running demo dummy logs generator. Click to switch to Live Firewall Stream."}
          >
            {streamMode === "live" ? (
              <>
                <Radio size={12} className="text-[#00a3e0] animate-pulse" />
                <span>MODE: LIVE FIREWALL</span>
              </>
            ) : (
              <>
                <Zap size={12} className="text-amber-300" />
                <span>MODE: DEMO SIMULATION</span>
              </>
            )}
          </button>

          {/* Pause / Resume Live Stream */}
          <button
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`flex items-center gap-2 rounded border px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition ${
              isStreaming
                ? "border-[#00a3e0]/50 bg-[#0b2545] text-[#00a3e0] hover:bg-[#003366]"
                : "border-[#1f3354] bg-[#112238] text-[#8ea8cb] hover:bg-[#192b45]"
            }`}
            title={isStreaming ? "Pause real-time stream" : "Resume real-time stream"}
          >
            {isStreaming ? (
              <>
                <Pause size={12} className="text-[#00a3e0]" />
                <span className="flex items-center gap-1.5">
                  STREAMING <span className="h-1.5 w-1.5 rounded-full bg-[#00a3e0] animate-ping" />
                </span>
              </>
            ) : (
              <>
                <Play size={12} className="text-[#8ea8cb]" />
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded border border-[#1f3354] bg-[#112238] px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-white hover:bg-[#1a2e4c] transition"
            title="Fetch latest events"
          >
            <RefreshCw size={12} className="text-[#00a3e0]" />
            <span className="hidden sm:inline">POLL DB</span>
          </button>

          {/* Inject Test Packet */}
          <button
            onClick={onOpenInjector}
            className="flex items-center gap-1.5 rounded border border-[#0066cc] bg-[#0066cc] hover:bg-[#0052a3] text-white px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase shadow-md transition"
          >
            <Send size={12} />
            <span>TEST_LOG</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded border border-[#1f3354] bg-[#112238] p-1.5 text-[#8ea8cb] lg:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Desktop) */}
      <nav className="mt-3 hidden border-t border-[#1f3354] pt-2.5 lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                  isActive
                    ? "border-[#00a3e0] bg-[#0066cc] text-white shadow-[0_0_10px_rgba(0,102,204,0.5)]"
                    : "border-transparent text-[#a2bdde] hover:bg-[#13253f] hover:text-white"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-[#00a3e0]"} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-mono ${
                      isActive
                        ? "bg-[#0b192c] text-[#00a3e0] font-bold"
                        : "bg-[#172b47] text-[#8ea8cb]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System Host Badge */}
        <div className="flex items-center gap-2 rounded border border-[#1f3354] bg-[#07111e] px-3 py-1 text-[10px] text-[#8ea8cb]">
          <Server size={12} className={streamMode === "live" ? "text-[#00a3e0]" : "text-amber-400"} />
          <span>SOPHOS SFOS STORAGE: <strong className="text-white">SQLITE DB</strong></span>
        </div>
      </nav>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="mt-3 flex flex-col gap-1 border-t border-[#2a2a2a] pt-2 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between rounded px-3 py-2 text-[10px] font-bold uppercase transition ${
                  isActive
                    ? "bg-[#1c1c1f] text-white border border-emerald-500/50"
                    : "bg-[#16161a] text-[#888888] hover:bg-[#1c1c1f]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} className={isActive ? "text-emerald-400" : ""} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-[#222226] px-1.5 py-0.5 text-[9px] text-[#888888]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
