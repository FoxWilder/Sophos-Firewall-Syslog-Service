import { SyslogEvent, ReceiverSettings, FilterPreset } from "../types";

export const initialEvents: SyslogEvent[] = [
  {
    id: "evt-001",
    time: "14:42:08",
    isoTimestamp: "2026-08-11T14:42:08.000Z",
    host: "FW-BRANCH-03",
    source: "SFOS",
    facility: "daemon",
    severity: "Info",
    message: "Web admin session opened from trusted network 10.24.8.41 for user 'admin'",
    ip: "10.24.8.41",
    srcPort: 54321,
    dstPort: 4444,
    protocol: "TCP",
    logId: "010106000001",
    logComponent: "Authentication",
    logSubtype: "Admin",
    rawPayload: "<134>1 2026-08-11T14:42:08.000Z FW-BRANCH-03 SFOS 1284 - - device_name=\"FW-BRANCH-03\" log_id=\"010106000001\" log_type=\"Event\" log_component=\"Authentication\" log_subtype=\"Admin\" status=\"Success\" priority=\"Information\" src_ip=\"10.24.8.41\" user_name=\"admin\" message=\"Web admin session opened\"",
    attributes: {
      device_name: "FW-BRANCH-03",
      log_id: "010106000001",
      log_type: "Event",
      log_component: "Authentication",
      log_subtype: "Admin",
      status: "Success",
      priority: "Information",
      src_ip: "10.24.8.41",
      user_name: "admin",
      auth_mechanism: "Local"
    }
  },
  {
    id: "evt-002",
    time: "14:41:56",
    isoTimestamp: "2026-08-11T14:41:56.000Z",
    host: "FW-HQ-01",
    source: "SFOS",
    facility: "firewall",
    severity: "Notice",
    message: "Policy updated: Allow DNS over TLS (Rule ID: 42)",
    ip: "10.24.1.12",
    srcPort: 58921,
    dstPort: 853,
    protocol: "TCP",
    logId: "010101600002",
    logComponent: "Firewall",
    logSubtype: "Allowed",
    rawPayload: "<133>1 2026-08-11T14:41:56.000Z FW-HQ-01 SFOS 942 - - device_name=\"FW-HQ-01\" log_id=\"010101600002\" log_type=\"Firewall\" log_component=\"Firewall\" log_subtype=\"Allowed\" status=\"Allow\" rule_id=\"42\" src_ip=\"10.24.1.12\" dst_ip=\"1.1.1.1\" src_port=\"58921\" dst_port=\"853\" protocol=\"TCP\" message=\"Policy updated\"",
    attributes: {
      device_name: "FW-HQ-01",
      log_id: "010101600002",
      log_type: "Firewall",
      log_component: "Firewall",
      log_subtype: "Allowed",
      status: "Allow",
      rule_id: "42",
      src_ip: "10.24.1.12",
      dst_ip: "1.1.1.1",
      src_port: "58921",
      dst_port: "853",
      protocol: "TCP"
    }
  },
  {
    id: "evt-003",
    time: "14:41:22",
    isoTimestamp: "2026-08-11T14:41:22.000Z",
    host: "FW-HQ-01",
    source: "SFOS",
    facility: "auth",
    severity: "Warning",
    message: "Failed administrator login attempt for user 'root' from untrusted IP 185.72.14.9",
    ip: "185.72.14.9",
    srcPort: 41208,
    dstPort: 4444,
    protocol: "TCP",
    logId: "010106000009",
    logComponent: "Authentication",
    logSubtype: "Admin",
    rawPayload: "<132>1 2026-08-11T14:41:22.000Z FW-HQ-01 SFOS 942 - - device_name=\"FW-HQ-01\" log_id=\"010106000009\" log_type=\"Event\" log_component=\"Authentication\" log_subtype=\"Admin\" status=\"Failure\" priority=\"Warning\" src_ip=\"185.72.14.9\" user_name=\"root\" reason=\"Invalid Credentials\"",
    attributes: {
      device_name: "FW-HQ-01",
      log_id: "010106000009",
      log_type: "Event",
      log_component: "Authentication",
      log_subtype: "Admin",
      status: "Failure",
      priority: "Warning",
      src_ip: "185.72.14.9",
      user_name: "root",
      reason: "Invalid Credentials"
    }
  },
  {
    id: "evt-004",
    time: "14:40:48",
    isoTimestamp: "2026-08-11T14:40:48.000Z",
    host: "FW-DC-02",
    source: "SFOS",
    facility: "firewall",
    severity: "Info",
    message: "Connection permitted by LAN-to-WAN policy (Rule ID: 12)",
    ip: "10.24.32.18",
    srcPort: 62104,
    dstPort: 443,
    protocol: "TCP",
    logId: "010101600001",
    logComponent: "Firewall",
    logSubtype: "Allowed",
    rawPayload: "<134>1 2026-08-11T14:40:48.000Z FW-DC-02 SFOS 104 - - device_name=\"FW-DC-02\" log_id=\"010101600001\" log_type=\"Firewall\" log_component=\"Firewall\" log_subtype=\"Allowed\" status=\"Allow\" rule_id=\"12\" src_ip=\"10.24.32.18\" dst_ip=\"142.250.190.46\" src_port=\"62104\" dst_port=\"443\" protocol=\"TCP\"",
    attributes: {
      device_name: "FW-DC-02",
      log_id: "010101600001",
      log_type: "Firewall",
      log_component: "Firewall",
      log_subtype: "Allowed",
      status: "Allow",
      rule_id: "12",
      src_ip: "10.24.32.18",
      dst_ip: "142.250.190.46",
      src_port: "62104",
      dst_port: "443",
      protocol: "TCP"
    }
  },
  {
    id: "evt-005",
    time: "14:39:17",
    isoTimestamp: "2026-08-11T14:39:17.000Z",
    host: "FW-BRANCH-07",
    source: "SFOS",
    facility: "system",
    severity: "Critical",
    message: "High CPU utilization detected: 93% on core #2 for process 'snort'",
    ip: "10.24.72.6",
    logId: "010105000045",
    logComponent: "System",
    logSubtype: "CPU",
    rawPayload: "<130>1 2026-08-11T14:39:17.000Z FW-BRANCH-07 SFOS 77 - - device_name=\"FW-BRANCH-07\" log_id=\"010105000045\" log_type=\"Event\" log_component=\"System\" log_subtype=\"CPU\" status=\"Critical\" priority=\"Critical\" cpu_usage=\"93\" process=\"snort\" message=\"High CPU utilization detected\"",
    attributes: {
      device_name: "FW-BRANCH-07",
      log_id: "010105000045",
      log_type: "Event",
      log_component: "System",
      log_subtype: "CPU",
      status: "Critical",
      priority: "Critical",
      cpu_usage: "93%",
      process: "snort"
    }
  },
  {
    id: "evt-006",
    time: "14:38:51",
    isoTimestamp: "2026-08-11T14:38:51.000Z",
    host: "FW-HQ-01",
    source: "SFOS",
    facility: "vpn",
    severity: "Notice",
    message: "IPsec tunnel re-established with London Branch (Tunnel ID: ipsec_ldn_01)",
    ip: "10.24.1.12",
    logId: "010104000012",
    logComponent: "VPN",
    logSubtype: "IPsec",
    rawPayload: "<133>1 2026-08-11T14:38:51.000Z FW-HQ-01 SFOS 942 - - device_name=\"FW-HQ-01\" log_id=\"010104000012\" log_type=\"Event\" log_component=\"VPN\" log_subtype=\"IPsec\" status=\"Connected\" priority=\"Notice\" tunnel_name=\"ipsec_ldn_01\" remote_gateway=\"195.12.89.4\"",
    attributes: {
      device_name: "FW-HQ-01",
      log_id: "010104000012",
      log_type: "Event",
      log_component: "VPN",
      log_subtype: "IPsec",
      status: "Connected",
      tunnel_name: "ipsec_ldn_01",
      remote_gateway: "195.12.89.4"
    }
  },
  {
    id: "evt-007",
    time: "14:37:33",
    isoTimestamp: "2026-08-11T14:37:33.000Z",
    host: "FW-DC-02",
    source: "SFOS",
    facility: "dns",
    severity: "Info",
    message: "DNS request forwarded to configured resolver 8.8.8.8 for query 'api.sophos.com'",
    ip: "10.24.32.18",
    srcPort: 51299,
    dstPort: 53,
    protocol: "UDP",
    logId: "010107000003",
    logComponent: "DNS",
    logSubtype: "Query",
    rawPayload: "<134>1 2026-08-11T14:37:33.000Z FW-DC-02 SFOS 104 - - device_name=\"FW-DC-02\" log_id=\"010107000003\" log_type=\"DNS\" log_component=\"DNS\" log_subtype=\"Query\" domain=\"api.sophos.com\" src_ip=\"10.24.32.18\" dst_ip=\"8.8.8.8\"",
    attributes: {
      device_name: "FW-DC-02",
      log_id: "010107000003",
      log_type: "DNS",
      log_component: "DNS",
      logSubtype: "Query",
      domain: "api.sophos.com",
      src_ip: "10.24.32.18",
      dst_ip: "8.8.8.8"
    }
  },
  {
    id: "evt-008",
    time: "14:36:04",
    isoTimestamp: "2026-08-11T14:36:04.000Z",
    host: "FW-BRANCH-03",
    source: "SFOS",
    facility: "firewall",
    severity: "Warning",
    message: "Connection dropped by Web Server Protection WAF rule #104 (SQL Injection attempt detected)",
    ip: "203.0.113.74",
    srcPort: 34102,
    dstPort: 443,
    protocol: "TCP",
    logId: "010102000088",
    logComponent: "WAF",
    logSubtype: "Drop",
    rawPayload: "<132>1 2026-08-11T14:36:04.000Z FW-BRANCH-03 SFOS 1284 - - device_name=\"FW-BRANCH-03\" log_id=\"010102000088\" log_type=\"WAF\" log_component=\"WAF\" log_subtype=\"Drop\" status=\"Denied\" rule_id=\"104\" src_ip=\"203.0.113.74\" dst_ip=\"10.24.8.10\" attack_type=\"SQLi\"",
    attributes: {
      device_name: "FW-BRANCH-03",
      log_id: "010102000088",
      log_type: "WAF",
      log_component: "WAF",
      log_subtype: "Drop",
      status: "Denied",
      rule_id: "104",
      src_ip: "203.0.113.74",
      dst_ip: "10.24.8.10",
      attack_type: "SQL Injection"
    }
  },
  {
    id: "evt-009",
    time: "14:34:12",
    isoTimestamp: "2026-08-11T14:34:12.000Z",
    host: "FW-HQ-01",
    source: "SFOS",
    facility: "atp",
    severity: "Critical",
    message: "Advanced Threat Protection (ATP) alert: Command & Control traffic blocked to 198.51.100.42",
    ip: "10.24.1.85",
    srcPort: 49152,
    dstPort: 8080,
    protocol: "TCP",
    logId: "010109000015",
    logComponent: "ATP",
    logSubtype: "Block",
    rawPayload: "<130>1 2026-08-11T14:34:12.000Z FW-HQ-01 SFOS 942 - - device_name=\"FW-HQ-01\" log_id=\"010109000015\" log_type=\"ATP\" log_component=\"ATP\" log_subtype=\"Block\" status=\"Threat Blocked\" src_ip=\"10.24.1.85\" dst_ip=\"198.51.100.42\" threat_name=\"Trojan.Win32.CobaltStrike\"",
    attributes: {
      device_name: "FW-HQ-01",
      log_id: "010109000015",
      log_type: "ATP",
      log_component: "ATP",
      log_subtype: "Block",
      status: "Threat Blocked",
      src_ip: "10.24.1.85",
      dst_ip: "198.51.100.42",
      threat_name: "Trojan.Win32.CobaltStrike"
    }
  },
  {
    id: "evt-010",
    time: "14:32:50",
    isoTimestamp: "2026-08-11T14:32:50.000Z",
    host: "FW-BRANCH-07",
    source: "SFOS",
    facility: "ips",
    severity: "Error",
    message: "Intrusion Prevention (IPS): Signature matched 'EXPLOIT-KIT Apache Struts RCE' from 198.51.100.99",
    ip: "198.51.100.99",
    srcPort: 52109,
    dstPort: 80,
    protocol: "TCP",
    logId: "010108000042",
    logComponent: "IPS",
    logSubtype: "Signature",
    rawPayload: "<131>1 2026-08-11T14:32:50.000Z FW-BRANCH-07 SFOS 77 - - device_name=\"FW-BRANCH-07\" log_id=\"010108000042\" log_type=\"IPS\" log_component=\"IPS\" log_subtype=\"Signature\" status=\"Dropped\" src_ip=\"198.51.100.99\" dst_ip=\"10.24.72.100\" signature_id=\"31402\"",
    attributes: {
      device_name: "FW-BRANCH-07",
      log_id: "010108000042",
      log_type: "IPS",
      log_component: "IPS",
      log_subtype: "Signature",
      status: "Dropped",
      src_ip: "198.51.100.99",
      dst_ip: "10.24.72.100",
      signature_id: "31402",
      signature_name: "EXPLOIT-KIT Apache Struts RCE"
    }
  }
];

export const defaultSettings: ReceiverSettings = {
  udpPort: 5514,
  udpEnabled: true,
  tcpPort: 5514,
  tcpEnabled: true,
  tlsPort: 6514,
  tlsEnabled: false,
  tlsRequireClientCert: false,
  bindAddress: "0.0.0.0",
  retentionDays: 14,
  maxFileSizeMb: 100,
  compressRotated: true,
  autoPrune: true,
  logDirectory: "syslog-server/logs/",
  strictRfc5424: false,
  extractSophosKv: true,
  collectorName: "WIN-COLLECTOR-01",
  serviceStatus: "running",
  autoSimulateStream: false,
  streamRateMs: 3000,
  soundAlerts: true,
  alertSeverityThreshold: "Critical"
};

export const defaultFilterPresets: FilterPreset[] = [
  {
    id: "preset-all",
    name: "All Events",
    description: "Show complete un-filtered stream",
    filters: { severity: "All", facility: "All facilities", searchQuery: "" },
    isBuiltIn: true
  },
  {
    id: "preset-critical",
    name: "Critical & Errors",
    description: "High severity threats, system failures, and ATP alerts",
    filters: { severity: "Critical", facility: "All facilities" },
    isBuiltIn: true
  },
  {
    id: "preset-auth",
    name: "Auth & Login Failures",
    description: "Failed admin logins and user authentication events",
    filters: { facility: "auth", severity: "All" },
    isBuiltIn: true
  },
  {
    id: "preset-vpn",
    name: "VPN Activity",
    description: "IPsec tunnels, SSL VPN client connects/disconnects",
    filters: { facility: "vpn" },
    isBuiltIn: true
  },
  {
    id: "preset-firewall-drops",
    name: "Dropped Traffic",
    description: "Firewall rule denies, IPS drops, and WAF blocks",
    filters: { facility: "firewall", searchQuery: "dropped" },
    isBuiltIn: true
  }
];

// Helper to generate a new realistic Sophos event
export function generateRandomEvent(idCounter: number): SyslogEvent {
  const hosts = ["FW-HQ-01", "FW-BRANCH-03", "FW-DC-02", "FW-BRANCH-07", "FW-EDGE-09"];
  const facilities: Array<{ fac: SyslogEvent["facility"]; sev: SyslogEvent["severity"]; msgs: string[]; comp: string }> = [
    {
      fac: "firewall",
      sev: "Info",
      msgs: [
        "Connection permitted by Outbound Default rule",
        "NAT rule applied for web traffic: WAN translation 1.2.3.4",
        "HTTPS session established to cloud endpoint 142.250.190.46",
        "Port forwarding rule #15 active for HTTPS service"
      ],
      comp: "Firewall"
    },
    {
      fac: "firewall",
      sev: "Warning",
      msgs: [
        "Packet dropped: Invalid TCP flag combination from 198.51.100.22",
        "Connection attempt to blocked country region (Geo-IP filter)",
        "Rate limit exceeded on interface Port1: ICMP flood suspected",
        "ICMP ping echo request denied by WAN interface policy"
      ],
      comp: "Firewall"
    },
    {
      fac: "auth",
      sev: "Warning",
      msgs: [
        "Failed User Portal authentication for user 'jsmith' - invalid password",
        "Active Directory RADIUS authentication timeout on server DC01",
        "Multiple failed password attempts detected for account 'administrator'",
        "SSL VPN authentication failed: Client certificate expired"
      ],
      comp: "Authentication"
    },
    {
      fac: "system",
      sev: "Critical",
      msgs: [
        "Memory usage exceeded threshold: 89% used on module RAM_0",
        "Interface Port3 link down - Ethernet cable disconnected or peer down",
        "HA Cluster status warning: Peer heartbeat delayed by 450ms",
        "High CPU load spike detected on process 'garner' (91% usage)"
      ],
      comp: "System"
    },
    {
      fac: "vpn",
      sev: "Notice",
      msgs: [
        "SSL VPN user 'm_taylor' connected from 82.165.197.10 (assigned IP 10.81.0.14)",
        "IPsec DPD (Dead Peer Detection) keepalive acknowledged",
        "IPsec SA re-keying completed successfully for connection 'Corp_Tunnel'",
        "User 'j_doe' disconnected from SSL VPN session (duration 04:12:00)"
      ],
      comp: "VPN"
    },
    {
      fac: "atp",
      sev: "Critical",
      msgs: [
        "ATP alert: Host 10.24.1.99 attempted connection to known C2 domain 'malware-cnc-server.xyz'",
        "ATP threat blocked: Malicious payload download prevented for client 10.24.8.77",
        "ATP threat alert: DNS query matched threat intelligence feeds"
      ],
      comp: "ATP"
    },
    {
      fac: "ips",
      sev: "Error",
      msgs: [
        "IPS signature match: PROTOCOL-DNS Spoofed response attempt detected",
        "IPS signature match: WEB-ATTACK SQL injection attempt in HTTP query string",
        "IPS anomaly detected: SYN flood targeted at host 10.24.32.18"
      ],
      comp: "IPS"
    }
  ];

  const choice = facilities[Math.floor(Math.random() * facilities.length)];
  const host = hosts[Math.floor(Math.random() * hosts.length)];
  const msg = choice.msgs[Math.floor(Math.random() * choice.msgs.length)];

  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0]; // HH:MM:SS
  const isoStr = now.toISOString();

  const randomIp = `10.24.${Math.floor(Math.random() * 80)}.${Math.floor(Math.random() * 200 + 1)}`;
  const dstIp = `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254 + 1)}`;
  const srcPort = Math.floor(Math.random() * 40000 + 10000);
  const dstPort = [80, 443, 53, 4444, 8443, 22, 500][Math.floor(Math.random() * 7)];
  const logId = `010${Math.floor(Math.random() * 8 + 1)}0${Math.floor(Math.random() * 900000 + 100000)}`;

  const uniqueSuffix = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substring(2, 8);

  return {
    id: `evt-${Date.now()}-${idCounter}-${uniqueSuffix}`,
    time: timeStr,
    isoTimestamp: isoStr,
    host,
    source: "SFOS",
    facility: choice.fac,
    severity: choice.sev,
    message: msg,
    ip: randomIp,
    srcPort,
    dstPort,
    protocol: dstPort === 53 ? "UDP" : "TCP",
    logId,
    logComponent: choice.comp,
    logSubtype: choice.sev === "Critical" ? "Threat" : "Activity",
    rawPayload: `<${choice.sev === "Critical" ? "130" : "134"}>1 ${isoStr} ${host} SFOS 104 - - device_name="${host}" log_id="${logId}" log_type="Event" log_component="${choice.comp}" status="${choice.sev}" src_ip="${randomIp}" dst_ip="${dstIp}" src_port="${srcPort}" dst_port="${dstPort}" message="${msg}"`,
    attributes: {
      device_name: host,
      log_id: logId,
      log_type: "Event",
      log_component: choice.comp,
      status: choice.sev,
      src_ip: randomIp,
      dst_ip: dstIp,
      src_port: String(srcPort),
      dst_port: String(dstPort),
      message: msg
    }
  };
}
