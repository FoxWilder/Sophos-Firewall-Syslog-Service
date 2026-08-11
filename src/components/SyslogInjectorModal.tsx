import React, { useState } from "react";
import { SyslogEvent, Severity, Facility } from "../types";
import { X, Send, ShieldAlert, Check } from "lucide-react";

interface SyslogInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectEvent: (event: SyslogEvent) => void;
}

export const SyslogInjectorModal: React.FC<SyslogInjectorModalProps> = ({
  isOpen,
  onClose,
  onInjectEvent,
}) => {
  const [host, setHost] = useState("FW-HQ-01");
  const [ip, setIp] = useState("10.24.1.12");
  const [userName, setUserName] = useState("faithmobiel");
  const [domain, setDomain] = useState("flowgpt.com");
  const [durationSeconds, setDurationSeconds] = useState(180);
  const [facility, setFacility] = useState<Facility>("firewall");
  const [severity, setSeverity] = useState<Severity>("Info");
  const [message, setMessage] = useState("HTTP web session allowed by FW Rule 12 for domain flowgpt.com");
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const now = new Date();
    const isoStr = now.toISOString();
    const timeStr = now.toTimeString().split(" ")[0];
    const logId = `01010${Math.floor(Math.random() * 900000 + 100000)}`;

    const newEvent: SyslogEvent = {
      id: `evt-inj-${Date.now()}`,
      time: timeStr,
      isoTimestamp: isoStr,
      host,
      source: "SFOS",
      facility,
      severity,
      message,
      ip,
      srcPort: 54321,
      dstPort: 443,
      protocol: "TCP",
      logId,
      logComponent: facility.toUpperCase(),
      logSubtype: severity === "Critical" ? "Threat" : "Activity",
      rawPayload: `<134>1 ${isoStr} ${host} SFOS 104 - - device_name="${host}" log_id="${logId}" log_type="Event" log_component="${facility}" status="${severity}" src_ip="${ip}" user_name="${userName}" domain="${domain}" app_name="${domain}" bytes_sent="25000" bytes_received="150000" duration_seconds="${durationSeconds}" message="${message}"`,
      attributes: {
        device_name: host,
        log_id: logId,
        log_type: "Event",
        log_component: facility,
        status: severity,
        src_ip: ip,
        user_name: userName,
        domain: domain,
        app_name: domain,
        duration_seconds: String(durationSeconds),
        bytes_sent: "25000",
        bytes_received: "150000",
        message,
        injected: "true"
      }
    };

    onInjectEvent(newEvent);
    setInjectedSuccess(true);
    setTimeout(() => {
      setInjectedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs font-mono select-none">
      <div className="relative w-full max-w-lg rounded border border-[#1f3354] bg-[#0b192c] p-4 text-[#a2bdde] shadow-2xl space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f3354] pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#07111e] border border-[#1f3354] text-[#00a3e0]">
              <Send size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">INJECT_TEST_SYSLOG_PACKET</h3>
              <p className="text-[9px] text-[#8ea8cb]">Simulate an incoming Sophos Firewall syslog payload</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8ea8cb] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {injectedSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-[#0066cc]/20 border border-[#00a3e0]/40 text-[#00a3e0]">
              <Check size={20} />
            </div>
            <p className="text-xs font-bold text-[#00a3e0] uppercase">PACKET_INJECTED_SUCCESSFULLY</p>
            <p className="text-[10px] text-[#8ea8cb]">Message ingested into stream and evaluated against active alert filters.</p>
          </div>
        ) : (
          <form onSubmit={handleInject} className="space-y-3 text-xs">
            
            <div className="grid gap-3 grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">User Name</label>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="faithmobiel"
                  className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white outline-none focus:border-[#00a3e0] font-mono"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Target Domain</label>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="flowgpt.com"
                  className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white outline-none focus:border-[#00a3e0] font-mono"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Duration (Secs)</label>
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white outline-none focus:border-[#00a3e0] font-mono"
                />
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Syslog Facility</label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value as Facility)}
                  className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white outline-none focus:border-[#00a3e0] font-mono"
                >
                  <option value="firewall">firewall</option>
                  <option value="auth">auth</option>
                  <option value="daemon">daemon</option>
                  <option value="system">system</option>
                  <option value="vpn">vpn</option>
                  <option value="dns">dns</option>
                  <option value="atp">atp</option>
                  <option value="ips">ips</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white outline-none focus:border-[#00a3e0] font-mono"
                >
                  <option value="Info">Info</option>
                  <option value="Notice">Notice</option>
                  <option value="Warning">Warning</option>
                  <option value="Error">Error</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Message Content</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white outline-none focus:border-[#00a3e0] font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f3354]">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-[#1f3354] bg-[#07111e] px-3 py-1.5 text-xs font-bold text-[#8ea8cb] hover:bg-[#13253f] hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-[#0066cc] hover:bg-[#0052a3] px-3 py-1.5 text-xs font-bold text-white uppercase"
              >
                <Send size={12} /> INJECT_PACKET
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
