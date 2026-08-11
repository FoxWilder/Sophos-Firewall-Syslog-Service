import React, { useState } from "react";
import { SyslogEvent } from "../types";
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Filter, 
  Download, 
  Terminal, 
  Server, 
  Key, 
  CircleAlert, 
  CircleCheck 
} from "lucide-react";

interface EventDetailModalProps {
  event: SyslogEvent | null;
  onClose: () => void;
  onApplyFilterByAttribute: (key: "host" | "ip" | "facility" | "severity", value: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onApplyFilterByAttribute
}) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!event) return null;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(event.rawPayload);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(event, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `syslog-event-${event.id}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs font-mono select-none">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded border border-[#1f3354] bg-[#0b192c] text-[#a2bdde] shadow-2xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between border-b border-[#1f3354] bg-[#07111e] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0b192c] border border-[#1f3354] text-[#00a3e0]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a3e0]">
                  EVENT_INSPECTOR_INSPECTION
                </span>
                <span className="font-mono text-[10px] font-bold text-[#8ea8cb]">
                  {event.id}
                </span>
              </div>
              <h2 className="text-xs font-bold text-white uppercase truncate max-w-lg">
                {event.host} — {event.message}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-[#8ea8cb] hover:bg-[#13253f] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* Section 1: Summary Badges */}
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 text-[10px]">
            <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5">
              <span className="block font-bold uppercase text-[#8ea8cb]">TIMESTAMP</span>
              <span className="mt-0.5 font-mono font-bold text-white">{event.time}</span>
            </div>

            <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5">
              <span className="block font-bold uppercase text-[#8ea8cb]">SOURCE_HOST</span>
              <span className="mt-0.5 font-mono font-bold text-white">{event.host} ({event.ip})</span>
            </div>

            <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5">
              <span className="block font-bold uppercase text-[#8ea8cb]">SEVERITY</span>
              <span className="mt-0.5 inline-flex items-center gap-1 font-mono font-bold text-red-400 uppercase">
                {event.severity === "Critical" ? <CircleAlert size={12} /> : <CircleCheck size={12} />}
                {event.severity}
              </span>
            </div>

            <div className="rounded border border-[#1f3354] bg-[#07111e] p-2.5">
              <span className="block font-bold uppercase text-[#8ea8cb]">FACILITY</span>
              <span className="mt-0.5 font-mono font-bold text-white">
                {event.facility} ({event.logComponent || "Core"})
              </span>
            </div>
          </div>

          {/* Section 2: Parsed Sophos Key-Value Grid */}
          <div>
            <div className="mb-2 flex items-center justify-between border-b border-[#1f3354] pb-1">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
                <Key size={14} className="text-[#00a3e0]" />
                PARSED_ATTRIBUTES
              </h3>
            </div>

            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(event.attributes).map(([k, v]) => (
                <div key={k} className="rounded border border-[#1f3354] bg-[#07111e] p-2">
                  <span className="block font-mono text-[9px] font-bold uppercase text-[#8ea8cb]">
                    {k}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] font-bold text-[#00a3e0]" title={String(v)}>
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Raw RFC 5424 / 3164 Syslog Payload */}
          <div>
            <div className="mb-2 flex items-center justify-between border-b border-[#1f3354] pb-1">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
                <Terminal size={14} className="text-[#00a3e0]" />
                RAW_SYSLOG_PAYLOAD
              </h3>
              <button
                onClick={handleCopyRaw}
                className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#07111e] px-2 py-0.5 text-[10px] font-bold text-[#a2bdde] hover:bg-[#13253f]"
              >
                {copiedRaw ? <Check size={11} className="text-[#00a3e0]" /> : <Copy size={11} />}
                {copiedRaw ? "COPIED" : "COPY_RAW"}
              </button>
            </div>

            <div className="rounded border border-[#1f3354] bg-[#050c17] p-3 font-mono text-[11px] text-[#00a3e0] overflow-x-auto">
              <code>{event.rawPayload}</code>
            </div>
          </div>

          {/* Section 4: Quick Filter Shortcuts */}
          <div className="rounded border border-[#1f3354] bg-[#07111e] p-3 space-y-2">
            <span className="text-[10px] font-bold text-[#8ea8cb] uppercase">
              FAST_FILTER_SHORTCUTS:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <button
                onClick={() => {
                  onApplyFilterByAttribute("host", event.host);
                  onClose();
                }}
                className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#0b192c] px-2 py-1 font-bold text-white hover:bg-[#13253f] hover:text-[#00a3e0]"
              >
                <Filter size={10} /> HOST: {event.host}
              </button>

              <button
                onClick={() => {
                  onApplyFilterByAttribute("ip", event.ip);
                  onClose();
                }}
                className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#0b192c] px-2 py-1 font-bold text-white hover:bg-[#13253f] hover:text-[#00a3e0]"
              >
                <Filter size={10} /> IP: {event.ip}
              </button>

              <button
                onClick={() => {
                  onApplyFilterByAttribute("facility", event.facility);
                  onClose();
                }}
                className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#0b192c] px-2 py-1 font-bold text-white hover:bg-[#13253f] hover:text-[#00a3e0]"
              >
                <Filter size={10} /> FACILITY: {event.facility}
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1f3354] bg-[#07111e] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#0b192c] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#13253f]"
            >
              {copiedJson ? <Check size={12} className="text-[#00a3e0]" /> : <Copy size={12} />}
              COPY_JSON
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 rounded border border-[#1f3354] bg-[#0b192c] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#13253f]"
            >
              <Download size={12} /> DOWNLOAD_JSON
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded bg-[#0066cc] hover:bg-[#0052a3] px-4 py-1 text-xs font-bold text-white uppercase"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
