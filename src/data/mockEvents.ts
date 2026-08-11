import { SyslogEvent, ReceiverSettings, FilterPreset } from "../types";

export const initialEvents: SyslogEvent[] = [];

export const defaultSettings: ReceiverSettings = {
  udpPort: 5514,
  udpEnabled: true,
  tcpPort: 5514,
  tcpEnabled: true,
  tlsPort: 6514,
  tlsEnabled: false,
  tlsRequireClientCert: false,
  bindAddress: "0.0.0.0",
  retentionDays: 30,
  maxFileSizeMb: 500,
  compressRotated: true,
  autoPrune: true,
  logDirectory: "/var/log/sophos_syslog",
  strictRfc5424: false,
  extractSophosKv: true,
  collectorName: "Sophos_SFOS_Primary",
  serviceStatus: "running",
  autoSimulateStream: false,
  streamRateMs: 2000,
  soundAlerts: false,
  alertSeverityThreshold: "Error"
};

export const defaultFilterPresets: FilterPreset[] = [
  {
    id: "preset-web-browsing",
    name: "Web & App Traffic",
    description: "HTTP / Web Traffic Logs",
    filters: {
      logComponent: "Http",
      facility: "firewall"
    },
    isBuiltIn: true
  },
  {
    id: "preset-threats",
    name: "Critical & High Severity",
    description: "Critical security events",
    filters: {
      severity: "Critical"
    },
    isBuiltIn: true
  },
  {
    id: "preset-denied",
    name: "Denied / Blocked Traffic",
    description: "Traffic blocked by firewall rules",
    filters: {
      searchQuery: "deny"
    },
    isBuiltIn: true
  },
  {
    id: "preset-vpn",
    name: "VPN Sessions",
    description: "Remote access & SSL VPN",
    filters: {
      facility: "vpn"
    },
    isBuiltIn: true
  }
];

export function generateRandomEvent(seq?: number): SyslogEvent {
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];
  const isoStr = now.toISOString();

  return {
    id: `evt-gen-${Date.now()}-${seq || Math.floor(Math.random() * 1000)}`,
    time: timeStr,
    isoTimestamp: isoStr,
    host: "SFOS-HEADQUARTERS",
    source: "SFOS",
    facility: "firewall",
    severity: "Info",
    message: "HTTP traffic permitted by rule 12",
    ip: "10.24.1.85",
    srcPort: 52100,
    dstPort: 443,
    protocol: "TCP",
    logId: "010101600001",
    logComponent: "Http",
    logSubtype: "Traffic",
    rawPayload: `<134>1 ${isoStr} SFOS-HEADQUARTERS SFOS 1284 - - device_name="SFOS-HEADQUARTERS" log_id="010101600001" log_type="Content Filtering" log_component="Http" log_subtype="Traffic" status="Allow" priority="Information" src_ip="10.24.1.85" dst_ip="104.18.2.100" user_name="faithmobiel" domain="flowgpt.com" app_name="FlowGPT" category="AI & LLMs" bytes_sent="12000" bytes_received="85000" duration_seconds="3600" fw_rule_id="12"`,
    attributes: {
      device_name: "SFOS-HEADQUARTERS",
      log_id: "010101600001",
      log_type: "Content Filtering",
      log_component: "Http",
      log_subtype: "Traffic",
      status: "Allow",
      priority: "Information",
      src_ip: "10.24.1.85",
      dst_ip: "104.18.2.100",
      user_name: "faithmobiel",
      domain: "flowgpt.com",
      app_name: "FlowGPT",
      category: "AI & LLMs",
      bytes_sent: "12000",
      bytes_received: "85000",
      duration_seconds: "3600",
      fw_rule_id: "12"
    }
  };
}

export function generateRandomSophosEvent(): SyslogEvent {
  return generateRandomEvent();
}
