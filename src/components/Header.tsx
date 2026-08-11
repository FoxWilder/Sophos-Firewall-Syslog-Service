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
  Zap
} from "lucide-react";

export type NavTab = "dashboard" | "explorer" | "analytics" | "settings" | "setup" | "injector";

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
    { id: "explorer", label: "LOG_EXPLORER", icon: Filter, badge: String(eventCount) },
    { id: "analytics", label: "ANALYTICS", icon: BarChart3 },
    { id: "settings", label: "SETTINGS", icon: SlidersHorizontal },
    { id: "setup", label: "SETUP_GUIDE", icon: BookOpen },
  ];

  return (
    <header className="mb-4 rounded border border-[#2a2a2a] bg-[#111113] p-3 sm:p-4 font-mono select-none">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Brand & Collector Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#16161a] border border-[#2a2a2a] text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${streamMode === 'live' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-amber-400'}`}></div>
              <h1 className="text-white font-bold text-sm tracking-tighter uppercase flex items-center gap-2">
                Sophos Firewall Syslog Service
              </h1>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                streamMode === 'live' 
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' 
                  : 'text-amber-300 bg-amber-950/60 border-amber-800/60'
              }`}>
                {streamMode === 'live' ? 'LIVE_FIREWALL' : 'DEMO_MODE'}
              </span>
            </div>
            <p className="text-[10px] text-[#666666] mt-0.5 tracking-wide">
              SOPHOS_SFOS :: UDP/TCP 5514 LISTENER :: REAL-TIME MONITORING
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Stream Mode Toggle (Live Server vs Demo Simulation) */}
          <button
            onClick={() => setStreamMode(streamMode === "live" ? "demo" : "live")}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition ${
              streamMode === "live"
                ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50"
                : "border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50"
            }`}
            title={streamMode === "live" ? "Receiving real firewall logs from UDP/TCP 5514. Click to switch to Demo Simulation." : "Running demo dummy logs generator. Click to switch to Live Firewall Stream."}
          >
            {streamMode === "live" ? (
              <>
                <Radio size={12} className="text-emerald-400 animate-pulse" />
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
            className={`flex items-center gap-2 rounded border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition ${
              isStreaming
                ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50"
                : "border-[#333333] bg-[#1a1a1d] text-[#888888] hover:bg-[#222226]"
            }`}
            title={isStreaming ? "Pause real-time stream" : "Resume real-time stream"}
          >
            {isStreaming ? (
              <>
                <Pause size={12} className="text-emerald-400" />
                <span className="flex items-center gap-1.5">
                  STREAMING <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                </span>
              </>
            ) : (
              <>
                <Play size={12} className="text-[#888888]" />
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded border border-[#333333] bg-[#16161a] px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-[#d1d1d1] hover:bg-[#222226] hover:border-[#444444]"
            title="Fetch latest events"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">POLL</span>
          </button>

          {/* Inject Test Packet */}
          <button
            onClick={onOpenInjector}
            className="flex items-center gap-1.5 rounded border border-[#333333] bg-[#222226] hover:bg-[#333338] text-white px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
          >
            <Send size={12} className="text-emerald-400" />
            <span>TEST_LOG</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded border border-[#2a2a2a] bg-[#16161a] p-1.5 text-[#888888] lg:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Desktop) */}
      <nav className="mt-3 hidden border-t border-[#2a2a2a] pt-2 lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  isActive
                    ? "border-emerald-500/60 bg-[#1c1c1f] text-white shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                    : "border-transparent text-[#888888] hover:bg-[#1c1c1f] hover:text-white"
                }`}
              >
                <Icon size={13} className={isActive ? "text-emerald-400" : "text-[#666]"} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-mono ${
                      isActive
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                        : "bg-[#1f1f23] text-[#666666]"
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
        <div className="flex items-center gap-2 rounded border border-[#2a2a2a] bg-[#0d0d0f] px-2.5 py-1 text-[10px] text-[#666666]">
          <Server size={12} className={streamMode === "live" ? "text-emerald-500" : "text-amber-400"} />
          <span>RECEIVER: {streamMode === "live" ? "LIVE UDP/TCP 5514" : "DEMO GENERATOR"}</span>
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
