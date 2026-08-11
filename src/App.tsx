import React, { useState, useEffect, useCallback } from "react";
import { 
  SyslogEvent, 
  ReceiverSettings, 
  FilterState, 
  FilterPreset, 
  Severity 
} from "./types";
import { 
  initialEvents, 
  defaultSettings, 
  defaultFilterPresets, 
  generateRandomEvent 
} from "./data/mockEvents";
import { Header, NavTab } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { HumanLogsView } from "./components/HumanLogsView";
import { EventExplorer } from "./components/EventExplorer";
import { AnalyticsView } from "./components/AnalyticsView";
import { SettingsView } from "./components/SettingsView";
import { SetupGuideView } from "./components/SetupGuideView";
import { EventDetailModal } from "./components/EventDetailModal";
import { SyslogInjectorModal } from "./components/SyslogInjectorModal";
import { CircleAlert, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamMode, setStreamMode] = useState<"live" | "demo">(() => {
    try {
      const saved = localStorage.getItem("syslog_receiver_stream_mode");
      return (saved === "live" || saved === "demo") ? saved : "live";
    } catch {
      return "live";
    }
  });

  // Settings persistence
  const [settings, setSettings] = useState<ReceiverSettings>(() => {
    try {
      const saved = localStorage.getItem("syslog_receiver_settings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Save stream mode helper
  useEffect(() => {
    try {
      localStorage.setItem("syslog_receiver_stream_mode", streamMode);
    } catch (err) {
      console.error("Failed to save stream mode", err);
    }
  }, [streamMode]);

  // Events stream persistence with strict ID deduplication
  const [events, setEvents] = useState<SyslogEvent[]>(() => {
    try {
      const saved = localStorage.getItem("syslog_receiver_events");
      const list: SyslogEvent[] = saved ? JSON.parse(saved) : initialEvents;
      const seen = new Set<string>();
      return list.filter((evt) => {
        if (!evt.id || seen.has(evt.id)) return false;
        seen.add(evt.id);
        return true;
      });
    } catch {
      return initialEvents;
    }
  });

  // Filter Presets persistence
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    try {
      const saved = localStorage.getItem("syslog_receiver_presets");
      return saved ? JSON.parse(saved) : defaultFilterPresets;
    } catch {
      return defaultFilterPresets;
    }
  });

  // Active Filter state
  const [activeFilter, setActiveFilter] = useState<FilterState>({
    searchQuery: "",
    severity: "All",
    facility: "All facilities",
    host: "All hosts",
    logComponent: "All components",
    timeRange: "all",
    ipFilter: ""
  });

  // Modal inspection states
  const [selectedEvent, setSelectedEvent] = useState<SyslogEvent | null>(null);
  const [isInjectorOpen, setIsInjectorOpen] = useState<boolean>(false);
  
  // Toast notification state
  const [toastNotification, setToastNotification] = useState<{ id: string; msg: string; host: string } | null>(null);

  // Counter for unique ID generation
  const [eventSeq, setEventSeq] = useState<number>(100);

  // Save state helpers
  useEffect(() => {
    try {
      localStorage.setItem("syslog_receiver_settings", JSON.stringify(settings));
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem("syslog_receiver_events", JSON.stringify(events.slice(0, 300)));
    } catch (err) {
      console.error("Failed to save events", err);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem("syslog_receiver_presets", JSON.stringify(presets));
    } catch (err) {
      console.error("Failed to save presets", err);
    }
  }, [presets]);

  // Handle live incoming stream event
  const addSyslogEvent = useCallback((newEvent: SyslogEvent) => {
    setEvents((prev) => {
      let eventToAdd = newEvent;
      if (prev.some((e) => e.id === eventToAdd.id)) {
        eventToAdd = {
          ...eventToAdd,
          id: `${eventToAdd.id}-${Math.random().toString(36).substring(2, 7)}`,
        };
      }
      const combined = [eventToAdd, ...prev];
      const seen = new Set<string>();
      const deduplicated: SyslogEvent[] = [];
      for (const evt of combined) {
        if (!seen.has(evt.id)) {
          seen.add(evt.id);
          deduplicated.push(evt);
        }
      }
      return deduplicated.slice(0, 500);
    });
    
    // Check for critical alert toast notification
    if (newEvent.severity === "Critical" || newEvent.severity === "Error") {
      setToastNotification({
        id: newEvent.id,
        msg: newEvent.message,
        host: newEvent.host,
      });
    }
  }, []);

  // Real-time Live Server Connection (SSE Stream for Real Firewall Traffic)
  useEffect(() => {
    if (streamMode !== "live" || !isStreaming) return;

    // Fetch initial event buffer from server on connect
    fetch("/api/syslog/events")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.events) && data.events.length > 0) {
          data.events.forEach((evt: SyslogEvent) => addSyslogEvent(evt));
        }
      })
      .catch((err) => {
        console.warn("API server fetch notice:", err);
      });

    // Connect to SSE stream
    const eventSource = new EventSource("/api/syslog/stream");

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed && parsed.id && parsed.host) {
          addSyslogEvent(parsed as SyslogEvent);
        }
      } catch (err) {
        // ignore non-JSON heartbeat
      }
    };

    eventSource.onerror = (err) => {
      console.warn("Live SSE stream notice:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [streamMode, isStreaming, addSyslogEvent]);

  // Demo simulation loop (Active ONLY in Demo Mode)
  useEffect(() => {
    if (streamMode !== "demo" || !isStreaming) return;

    const interval = setInterval(() => {
      setEventSeq((seq) => {
        const nextSeq = seq + 1;
        const newEvt = generateRandomEvent(nextSeq);
        addSyslogEvent(newEvt);
        return nextSeq;
      });
    }, settings.streamRateMs || 3000);

    return () => clearInterval(interval);
  }, [streamMode, isStreaming, settings.streamRateMs, addSyslogEvent]);

  // Quick filter jump helpers
  const handleOpenExplorerWithFilter = (severity?: Severity, facility?: string) => {
    setActiveFilter((prev) => ({
      ...prev,
      severity: severity || "All",
      facility: facility || "All facilities",
    }));
    setActiveTab("explorer");
  };

  const handleApplyFilterByAttribute = (key: "host" | "ip" | "facility" | "severity", value: string) => {
    setActiveFilter((prev) => ({
      ...prev,
      [key === "ip" ? "ipFilter" : key]: value,
    }));
    setActiveTab("explorer");
  };

  const handleSavePreset = (name: string, description: string) => {
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      filters: { ...activeFilter }
    };
    setPresets((prev) => [...prev, newPreset]);
  };

  const handleClearLogs = () => {
    setEvents([]);
  };

  const handleResetDefaults = () => {
    setSettings(defaultSettings);
    setEvents(initialEvents);
    setPresets(defaultFilterPresets);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#d1d1d1] font-mono text-[11px] selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Subtle background dark grid line pattern */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.2]" 
        style={{ 
          backgroundImage: "radial-gradient(#2a2a2a 1px, transparent 1px)", 
          backgroundSize: "16px 16px" 
        }} 
      />

      <div className="relative mx-auto max-w-[1520px] px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
        
        {/* Global Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isStreaming={isStreaming}
          setIsStreaming={setIsStreaming}
          streamMode={streamMode}
          setStreamMode={setStreamMode}
          eventCount={events.length}
          onRefresh={() => {
            if (streamMode === "live") {
              fetch("/api/syslog/events")
                .then((res) => res.json())
                .then((data) => {
                  if (data && Array.isArray(data.events)) {
                    data.events.forEach((evt: SyslogEvent) => addSyslogEvent(evt));
                  }
                })
                .catch((err) => console.warn(err));
            } else {
              const newEvt = generateRandomEvent(eventSeq + 1);
              setEventSeq((s) => s + 1);
              addSyslogEvent(newEvt);
            }
          }}
          onOpenInjector={() => setIsInjectorOpen(true)}
        />

        {/* Tab Content Rendering */}
        {activeTab === "dashboard" && (
          <DashboardView
            events={events}
            settings={settings}
            onOpenExplorerWithFilter={handleOpenExplorerWithFilter}
            onSelectEvent={setSelectedEvent}
            onOpenSetupGuide={() => setActiveTab("setup")}
            onOpenSettings={() => setActiveTab("settings")}
          />
        )}

        {activeTab === "human_logs" && (
          <HumanLogsView
            events={events}
            onSelectEvent={setSelectedEvent}
            onOpenExplorerWithFilter={handleOpenExplorerWithFilter}
          />
        )}

        {activeTab === "explorer" && (
          <EventExplorer
            events={events}
            presets={presets}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onSelectEvent={setSelectedEvent}
            onClearLogs={handleClearLogs}
            onSavePreset={handleSavePreset}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView events={events} />
        )}

        {activeTab === "settings" && (
          <SettingsView
            settings={settings}
            onSaveSettings={setSettings}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeTab === "setup" && (
          <SetupGuideView />
        )}

        {/* Floating Toast Notification for Critical Threats */}
        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-50 flex max-w-md items-center justify-between gap-3 rounded border border-[#ef4444]/50 bg-[#1c1113] p-3 text-xs shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <CircleAlert className="shrink-0 text-[#ef4444]" size={18} />
              <div>
                <p className="font-bold text-[#ef4444] uppercase tracking-wider text-[10px]">
                  CRITICAL THREAT AT {toastNotification.host}
                </p>
                <p className="text-[11px] text-[#d1d1d1] truncate max-w-[260px]">
                  {toastNotification.msg}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-[#888888] hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Event Inspector Modal */}
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onApplyFilterByAttribute={handleApplyFilterByAttribute}
        />

        {/* Packet Injector Modal */}
        <SyslogInjectorModal
          isOpen={isInjectorOpen}
          onClose={() => setIsInjectorOpen(false)}
          onInjectEvent={addSyslogEvent}
        />

        {/* Global Footer */}
        <footer className="mt-6 flex flex-col gap-2 border-t border-[#2a2a2a] pt-3 text-[10px] text-[#666666] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5 font-mono">
            SYS_RECEIVER v2.4 · SOPHOS_SFOS_COLLECTOR (WIN11/2022)
          </span>
          <span className="font-mono text-emerald-500/80">
            PORTS_ACTIVE: UDP {settings.udpPort} | TCP {settings.tcpPort} | TLS {settings.tlsPort}
          </span>
        </footer>

      </div>
    </main>
  );
}
