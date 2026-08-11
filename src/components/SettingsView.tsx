import React, { useState } from "react";
import { ReceiverSettings, AlertRule } from "../types";
import { 
  SlidersHorizontal, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Server, 
  Database, 
  Bell, 
  Wifi, 
  Network, 
  LockKeyhole, 
  Plus, 
  Trash2, 
  CheckCircle2 
} from "lucide-react";

interface SettingsViewProps {
  settings: ReceiverSettings;
  onSaveSettings: (newSettings: ReceiverSettings) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<ReceiverSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Mock Alert Rules state
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: "rule-1",
      name: "Critical Threat Detection",
      enabled: true,
      severity: "Critical",
      action: "sound"
    },
    {
      id: "rule-2",
      name: "Auth Login Failures",
      enabled: true,
      facility: "auth",
      severity: "Warning",
      action: "toast"
    }
  ]);

  const [newRuleName, setNewRuleName] = useState("");

  const handleChange = <K extends keyof ReceiverSettings>(key: K, value: ReceiverSettings[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddRule = () => {
    if (!newRuleName.trim()) return;
    setAlertRules((prev) => [
      ...prev,
      {
        id: `rule-${Date.now()}`,
        name: newRuleName,
        enabled: true,
        severity: "Warning",
        action: "toast"
      }
    ]);
    setNewRuleName("");
  };

  const handleDeleteRule = (id: string) => {
    setAlertRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-mono select-none">
      
      {/* Settings Header */}
      <div className="flex flex-col gap-3 rounded border border-[#1f3354] bg-[#0b192c] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#07111e] border border-[#1f3354] text-[#00a3e0]">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              SYSLOG_RECEIVER_CONFIGURATION
            </h2>
            <p className="text-[10px] text-[#8ea8cb]">
              Manage transport endpoints, retention policy, and Sophos SFOS parser rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 rounded border border-[#1f3354] bg-[#07111e] px-3 py-1.5 text-[11px] font-bold text-[#8ea8cb] hover:bg-[#13253f] hover:text-white transition"
          >
            <RotateCcw size={12} /> RESET_DEFAULTS
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded bg-[#0066cc] hover:bg-[#0052a3] px-3 py-1.5 text-[11px] font-bold text-white uppercase transition"
          >
            <Save size={12} /> SAVE_CONFIG
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded border border-[#00a3e0]/40 bg-[#0066cc]/20 p-2.5 text-[11px] font-bold text-[#00a3e0] uppercase">
          <CheckCircle2 size={14} className="text-[#00a3e0]" />
          CONFIG_SAVED: Settings updated and committed to local receiver storage.
        </div>
      )}

      {/* Grid Settings Panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        
        {/* Section 1: Network & Transport Listeners */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1f3354] pb-2">
            <Wifi size={14} className="text-[#00a3e0]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">NETWORK_LISTENERS</h3>
          </div>

          <div className="space-y-3 text-[11px]">
            {/* Collector Identity */}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Collector Host Name</label>
              <input
                value={formData.collectorName}
                onChange={(e) => handleChange("collectorName", e.target.value)}
                className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white font-mono outline-none focus:border-[#00a3e0]"
              />
            </div>

            {/* Bind Address */}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Bind Interface Address</label>
              <input
                value={formData.bindAddress}
                onChange={(e) => handleChange("bindAddress", e.target.value)}
                placeholder="0.0.0.0"
                className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white font-mono outline-none focus:border-[#00a3e0]"
              />
              <span className="mt-1 block text-[9px] text-[#8ea8cb]/70">
                0.0.0.0 listens on all IPv4 interfaces.
              </span>
            </div>

            {/* UDP Port */}
            <div className="flex items-center justify-between rounded border border-[#1f3354] bg-[#07111e] p-2.5">
              <div className="flex items-center gap-2">
                <Wifi size={14} className="text-[#00a3e0]" />
                <div>
                  <span className="block font-bold text-white uppercase text-[10px]">UDP Port</span>
                  <span className="text-[9px] text-[#8ea8cb]">Standard Sophos UDP syslog</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.udpPort}
                  onChange={(e) => handleChange("udpPort", Number(e.target.value))}
                  className="w-16 rounded border border-[#1f3354] bg-[#050c17] p-1 text-center text-xs font-bold text-white"
                />
                <input
                  type="checkbox"
                  checked={formData.udpEnabled}
                  onChange={(e) => handleChange("udpEnabled", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0066cc]"
                />
              </div>
            </div>

            {/* TCP Port */}
            <div className="flex items-center justify-between rounded border border-[#1f3354] bg-[#07111e] p-2.5">
              <div className="flex items-center gap-2">
                <Network size={14} className="text-[#00a3e0]" />
                <div>
                  <span className="block font-bold text-white uppercase text-[10px]">TCP Port</span>
                  <span className="text-[9px] text-[#8ea8cb]">Reliable TCP stream</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.tcpPort}
                  onChange={(e) => handleChange("tcpPort", Number(e.target.value))}
                  className="w-16 rounded border border-[#1f3354] bg-[#050c17] p-1 text-center text-xs font-bold text-white"
                />
                <input
                  type="checkbox"
                  checked={formData.tcpEnabled}
                  onChange={(e) => handleChange("tcpEnabled", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0066cc]"
                />
              </div>
            </div>

            {/* TLS Port */}
            <div className="flex items-center justify-between rounded border border-[#1f3354] bg-[#07111e] p-2.5">
              <div className="flex items-center gap-2">
                <LockKeyhole size={14} className="text-amber-400" />
                <div>
                  <span className="block font-bold text-white uppercase text-[10px]">TLS Encrypted Port</span>
                  <span className="text-[9px] text-[#8ea8cb]">Encrypted TLS syslog endpoint</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.tlsPort}
                  onChange={(e) => handleChange("tlsPort", Number(e.target.value))}
                  className="w-16 rounded border border-[#1f3354] bg-[#050c17] p-1 text-center text-xs font-bold text-white"
                />
                <input
                  type="checkbox"
                  checked={formData.tlsEnabled}
                  onChange={(e) => handleChange("tlsEnabled", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0066cc]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Storage & Log File Rotation */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1f3354] pb-2">
            <Database size={14} className="text-[#00a3e0]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">LOG_RETENTION_&_STORAGE</h3>
          </div>

          <div className="space-y-3 text-[11px]">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">Log Storage Path</label>
              <input
                value={formData.logDirectory}
                onChange={(e) => handleChange("logDirectory", e.target.value)}
                className="w-full rounded border border-[#1f3354] bg-[#050c17] p-2 text-xs text-white font-mono outline-none focus:border-[#00a3e0]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-[#8ea8cb] uppercase">Retention Window</label>
                <span className="font-mono text-[#00a3e0] font-bold">{formData.retentionDays} DAYS</span>
              </div>
              <input
                type="range"
                min={1}
                max={90}
                value={formData.retentionDays}
                onChange={(e) => handleChange("retentionDays", Number(e.target.value))}
                className="w-full accent-[#0066cc]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-[#8ea8cb] uppercase">Rotation File Size</label>
                <span className="font-mono text-[#00a3e0] font-bold">{formData.maxFileSizeMb} MB</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={formData.maxFileSizeMb}
                onChange={(e) => handleChange("maxFileSizeMb", Number(e.target.value))}
                className="w-full accent-[#0066cc]"
              />
            </div>

            <div className="space-y-2 pt-1 text-[10px]">
              <label className="flex items-center gap-2 text-[#a2bdde]">
                <input
                  type="checkbox"
                  checked={formData.compressRotated}
                  onChange={(e) => handleChange("compressRotated", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0066cc]"
                />
                Compress rotated log archives (.gz format)
              </label>

              <label className="flex items-center gap-2 text-[#a2bdde]">
                <input
                  type="checkbox"
                  checked={formData.autoPrune}
                  onChange={(e) => handleChange("autoPrune", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0066cc]"
                />
                Auto-prune logs older than retention limit
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Sophos SFOS Parser Options */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1f3354] pb-2">
            <ShieldCheck size={14} className="text-[#00a3e0]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">SOPHOS_PARSER_RULES</h3>
          </div>

          <div className="space-y-3 text-[10px]">
            <label className="flex items-start gap-2 text-[#a2bdde]">
              <input
                type="checkbox"
                checked={formData.extractSophosKv}
                onChange={(e) => handleChange("extractSophosKv", e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 accent-[#0066cc]"
              />
              <div>
                <span className="block font-bold text-white uppercase">
                  EXTRACT_SOPHOS_KEY_VALUES
                </span>
                <span className="text-[9px] text-[#8ea8cb]">
                  Parse key="value" parameters (src_ip, log_id, rule_id, device_name)
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 text-[#a2bdde]">
              <input
                type="checkbox"
                checked={formData.strictRfc5424}
                onChange={(e) => handleChange("strictRfc5424", e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 accent-[#0066cc]"
              />
              <div>
                <span className="block font-bold text-white uppercase">
                  STRICT_RFC_5424_COMPLIANCE
                </span>
                <span className="text-[9px] text-[#8ea8cb]">
                  Reject non-RFC5424 headers (leave un-checked for RFC 3164 backward support)
                </span>
              </div>
            </label>

            <div className="pt-1">
              <label className="mb-1 block text-[10px] font-bold text-[#8ea8cb] uppercase">
                GENERATOR_STREAM_RATE
              </label>
              <select
                value={formData.streamRateMs}
                onChange={(e) => handleChange("streamRateMs", Number(e.target.value))}
                className="w-full rounded border border-[#1f3354] bg-[#050c17] p-1.5 text-xs text-white outline-none"
              >
                <option value={1000}>FAST (1 event / 1 sec)</option>
                <option value={3000}>NORMAL (1 event / 3 sec)</option>
                <option value={5000}>RELAXED (1 event / 5 sec)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Alert & Notification Rules */}
        <div className="rounded border border-[#1f3354] bg-[#0b192c] p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1f3354] pb-2">
            <Bell size={14} className="text-[#00a3e0]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ALERT_TRIGGER_RULES</h3>
          </div>

          <div className="space-y-3 text-[10px]">
            <label className="flex items-center gap-2 text-[#a2bdde]">
              <input
                type="checkbox"
                checked={formData.soundAlerts}
                onChange={(e) => handleChange("soundAlerts", e.target.checked)}
                className="h-3.5 w-3.5 accent-[#0066cc]"
              />
              Audio signal on CRITICAL syslog events
            </label>

            <div className="pt-1 space-y-2">
              <span className="block text-[10px] font-bold text-[#8ea8cb] uppercase">ACTIVE_RULE_TRIGGERS</span>
              {alertRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded border border-[#1f3354] bg-[#07111e] p-2"
                >
                  <div>
                    <span className="font-bold text-white">{rule.name}</span>
                    <span className="ml-2 font-mono text-[9px] text-[#00a3e0]">
                      [{rule.severity.toUpperCase()} / {rule.facility ? rule.facility.toUpperCase() : "ALL"}]
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="New rule identifier..."
                  className="flex-1 rounded border border-[#1f3354] bg-[#050c17] p-1.5 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="flex items-center gap-1 rounded bg-[#0066cc] hover:bg-[#0052a3] px-2.5 py-1.5 font-bold text-white text-xs"
                >
                  <Plus size={12} /> ADD
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </form>
  );
};
