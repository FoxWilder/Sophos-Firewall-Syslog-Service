export type Severity = "Debug" | "Info" | "Notice" | "Warning" | "Error" | "Critical" | "Alert" | "Emergency";

export type Facility = 
  | "firewall" 
  | "auth" 
  | "daemon" 
  | "system" 
  | "vpn" 
  | "dns" 
  | "atp" 
  | "ips" 
  | "webfilter" 
  | "antivirus" 
  | "user" 
  | "local0";

export interface SyslogEvent {
  id: string;
  time: string;
  isoTimestamp: string;
  host: string;
  source: string;
  facility: Facility;
  severity: Severity;
  message: string;
  ip: string;
  srcPort?: number;
  dstPort?: number;
  protocol?: string;
  logId?: string;
  logComponent?: string;
  logSubtype?: string;
  rawPayload: string;
  attributes: Record<string, string>;
}

export interface FilterState {
  searchQuery: string;
  severity: Severity | "All";
  facility: string;
  host: string;
  logComponent: string;
  userFilter?: string;
  categoryFilter?: string;
  appFilter?: string;
  statusFilter?: string;
  timeRange: "15m" | "1h" | "24h" | "7d" | "all" | "custom";
  customStartDate?: string;
  customEndDate?: string;
  ipFilter: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<FilterState>;
  isBuiltIn?: boolean;
}

export interface ReceiverSettings {
  udpPort: number;
  udpEnabled: boolean;
  tcpPort: number;
  tcpEnabled: boolean;
  tlsPort: number;
  tlsEnabled: boolean;
  tlsRequireClientCert: boolean;
  bindAddress: string;
  retentionDays: number;
  maxFileSizeMb: number;
  compressRotated: boolean;
  autoPrune: boolean;
  logDirectory: string;
  strictRfc5424: boolean;
  extractSophosKv: boolean;
  collectorName: string;
  serviceStatus: "running" | "stopped" | "starting";
  autoSimulateStream: boolean;
  streamRateMs: number;
  soundAlerts: boolean;
  alertSeverityThreshold: Severity;
}

export interface UserWebSession {
  id: string;
  user: string;
  userEmail?: string;
  department: string;
  siteOrApp: string;
  domain: string;
  category: "Cloud SaaS" | "Web Browsing" | "Media & Streaming" | "Social Media" | "Collaboration" | "Developer & IT" | "AI & LLMs" | "Restricted / Threat";
  startTime: string; // ISO String
  endTime: string;   // ISO String
  durationSeconds: number;
  bytesSent: number;
  bytesReceived: number;
  status: "Allowed" | "Blocked" | "Warned";
  fwRuleId: string;
  clientIp: string;
  deviceHost: string;
}

export interface ReportFilterState {
  user: string;
  department: string;
  category: string;
  timeSpan: "today" | "24h" | "7d" | "30d" | "custom";
  customStartDate?: string;
  customEndDate?: string;
  status: "all" | "Allowed" | "Blocked";
  searchQuery: string;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  severity: Severity | "All";
  facility?: string;
  keyword?: string;
  action: "toast" | "highlight" | "sound";
}
