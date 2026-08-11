import { UserWebSession } from "../types";

export const initialWebSessions: UserWebSession[] = [
  // --- John Smith (jsmith) - IT & DevOps ---
  {
    id: "sess-001",
    user: "jsmith",
    userEmail: "jsmith@corp.internal",
    department: "IT & DevOps",
    siteOrApp: "GitHub",
    domain: "github.com",
    category: "Developer & IT",
    startTime: "2026-08-11T08:15:00.000Z",
    endTime: "2026-08-11T11:45:00.000Z",
    durationSeconds: 12600, // 3h 30m
    bytesSent: 45200000,
    bytesReceived: 380100000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.8.41",
    deviceHost: "WIN11-DEV-04"
  },
  {
    id: "sess-002",
    user: "jsmith",
    userEmail: "jsmith@corp.internal",
    department: "IT & DevOps",
    siteOrApp: "Microsoft 365",
    domain: "office.com",
    category: "Collaboration",
    startTime: "2026-08-11T09:00:00.000Z",
    endTime: "2026-08-11T12:15:00.000Z",
    durationSeconds: 11700, // 3h 15m
    bytesSent: 82000000,
    bytesReceived: 620000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.8.41",
    deviceHost: "WIN11-DEV-04"
  },
  {
    id: "sess-003",
    user: "jsmith",
    userEmail: "jsmith@corp.internal",
    department: "IT & DevOps",
    siteOrApp: "YouTube",
    domain: "youtube.com",
    category: "Media & Streaming",
    startTime: "2026-08-11T12:30:00.000Z",
    endTime: "2026-08-11T13:45:00.000Z",
    durationSeconds: 4500, // 1h 15m
    bytesSent: 12000000,
    bytesReceived: 1450000000, // 1.45 GB
    status: "Allowed",
    fwRuleId: "14",
    clientIp: "10.24.8.41",
    deviceHost: "WIN11-DEV-04"
  },
  {
    id: "sess-004",
    user: "jsmith",
    userEmail: "jsmith@corp.internal",
    department: "IT & DevOps",
    siteOrApp: "AWS Management Console",
    domain: "aws.amazon.com",
    category: "Cloud SaaS",
    startTime: "2026-08-11T13:00:00.000Z",
    endTime: "2026-08-11T15:20:00.000Z",
    durationSeconds: 8400, // 2h 20m
    bytesSent: 28000000,
    bytesReceived: 195000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.8.41",
    deviceHost: "WIN11-DEV-04"
  },
  {
    id: "sess-005",
    user: "jsmith",
    userEmail: "jsmith@corp.internal",
    department: "IT & DevOps",
    siteOrApp: "Stack Overflow",
    domain: "stackoverflow.com",
    category: "Web Browsing",
    startTime: "2026-08-11T10:20:00.000Z",
    endTime: "2026-08-11T11:12:00.000Z",
    durationSeconds: 3120, // 52m
    bytesSent: 4200000,
    bytesReceived: 38000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.8.41",
    deviceHost: "WIN11-DEV-04"
  },
  {
    id: "sess-006",
    user: "jsmith",
    userEmail: "jsmith@corp.internal",
    department: "IT & DevOps",
    siteOrApp: "Online Gambling Portal",
    domain: "onlinepoker-casino.com",
    category: "Restricted / Threat",
    startTime: "2026-08-11T11:50:00.000Z",
    endTime: "2026-08-11T11:50:02.000Z",
    durationSeconds: 2,
    bytesSent: 1200,
    bytesReceived: 0,
    status: "Blocked",
    fwRuleId: "18",
    clientIp: "10.24.8.41",
    deviceHost: "WIN11-DEV-04"
  },

  // --- Alex Devos (a_devos) - Security Operations ---
  {
    id: "sess-010",
    user: "a_devos",
    userEmail: "a_devos@corp.internal",
    department: "Security Operations",
    siteOrApp: "Sophos Central",
    domain: "central.sophos.com",
    category: "Cloud SaaS",
    startTime: "2026-08-11T07:30:00.000Z",
    endTime: "2026-08-11T14:45:00.000Z",
    durationSeconds: 26100, // 7h 15m
    bytesSent: 110000000,
    bytesReceived: 890000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.1.85",
    deviceHost: "SOC-WORKSTATION-01"
  },
  {
    id: "sess-011",
    user: "a_devos",
    userEmail: "a_devos@corp.internal",
    department: "Security Operations",
    siteOrApp: "ChatGPT / OpenAI",
    domain: "chatgpt.com",
    category: "AI & LLMs",
    startTime: "2026-08-11T09:15:00.000Z",
    endTime: "2026-08-11T11:30:00.000Z",
    durationSeconds: 8100, // 2h 15m
    bytesSent: 15000000,
    bytesReceived: 180000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.1.85",
    deviceHost: "SOC-WORKSTATION-01"
  },
  {
    id: "sess-012",
    user: "a_devos",
    userEmail: "a_devos@corp.internal",
    department: "Security Operations",
    siteOrApp: "VirusTotal Threat Intelligence",
    domain: "virustotal.com",
    category: "Developer & IT",
    startTime: "2026-08-11T10:00:00.000Z",
    endTime: "2026-08-11T11:40:00.000Z",
    durationSeconds: 6000, // 1h 40m
    bytesSent: 32000000,
    bytesReceived: 210000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.1.85",
    deviceHost: "SOC-WORKSTATION-01"
  },
  {
    id: "sess-013",
    user: "a_devos",
    userEmail: "a_devos@corp.internal",
    department: "Security Operations",
    siteOrApp: "LinkedIn",
    domain: "linkedin.com",
    category: "Social Media",
    startTime: "2026-08-11T12:00:00.000Z",
    endTime: "2026-08-11T12:42:00.000Z",
    durationSeconds: 2520, // 42m
    bytesSent: 8500000,
    bytesReceived: 92000000,
    status: "Allowed",
    fwRuleId: "15",
    clientIp: "10.24.1.85",
    deviceHost: "SOC-WORKSTATION-01"
  },
  {
    id: "sess-014",
    user: "a_devos",
    userEmail: "a_devos@corp.internal",
    department: "Security Operations",
    siteOrApp: "Malicious Phishing Test Domain",
    domain: "malicious-phish-domain.xyz",
    category: "Restricted / Threat",
    startTime: "2026-08-11T13:10:00.000Z",
    endTime: "2026-08-11T13:10:01.000Z",
    durationSeconds: 1,
    bytesSent: 800,
    bytesReceived: 0,
    status: "Blocked",
    fwRuleId: "99",
    clientIp: "10.24.1.85",
    deviceHost: "SOC-WORKSTATION-01"
  },

  // --- Sarah Connor (s_connor) - Finance & HR ---
  {
    id: "sess-020",
    user: "s_connor",
    userEmail: "s_connor@corp.internal",
    department: "Finance & HR",
    siteOrApp: "Salesforce CRM",
    domain: "salesforce.com",
    category: "Cloud SaaS",
    startTime: "2026-08-11T08:30:00.000Z",
    endTime: "2026-08-11T13:15:00.000Z",
    durationSeconds: 17100, // 4h 45m
    bytesSent: 94000000,
    bytesReceived: 780000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.32.18",
    deviceHost: "FIN-PC-02"
  },
  {
    id: "sess-021",
    user: "s_connor",
    userEmail: "s_connor@corp.internal",
    department: "Finance & HR",
    siteOrApp: "Workday HR SaaS",
    domain: "workday.com",
    category: "Cloud SaaS",
    startTime: "2026-08-11T09:10:00.000Z",
    endTime: "2026-08-11T11:00:00.000Z",
    durationSeconds: 6600, // 1h 50m
    bytesSent: 18000000,
    bytesReceived: 140000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.32.18",
    deviceHost: "FIN-PC-02"
  },
  {
    id: "sess-022",
    user: "s_connor",
    userEmail: "s_connor@corp.internal",
    department: "Finance & HR",
    siteOrApp: "Spotify Music",
    domain: "spotify.com",
    category: "Media & Streaming",
    startTime: "2026-08-11T08:30:00.000Z",
    endTime: "2026-08-11T14:30:00.000Z",
    durationSeconds: 21600, // 6h 00m
    bytesSent: 15000000,
    bytesReceived: 1100000000, // 1.1 GB
    status: "Allowed",
    fwRuleId: "14",
    clientIp: "10.24.32.18",
    deviceHost: "FIN-PC-02"
  },

  // --- Marcus Taylor (m_taylor) - Remote VPN User ---
  {
    id: "sess-030",
    user: "m_taylor",
    userEmail: "m_taylor@corp.internal",
    department: "Remote VPN Users",
    siteOrApp: "Zoom Video Conferencing",
    domain: "zoom.us",
    category: "Collaboration",
    startTime: "2026-08-11T10:00:00.000Z",
    endTime: "2026-08-11T12:45:00.000Z",
    durationSeconds: 9900, // 2h 45m
    bytesSent: 340000000,
    bytesReceived: 2100000000, // 2.1 GB
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.81.0.14",
    deviceHost: "VPN-LAPTOP-MT"
  },
  {
    id: "sess-031",
    user: "m_taylor",
    userEmail: "m_taylor@corp.internal",
    department: "Remote VPN Users",
    siteOrApp: "Google Workspace & Drive",
    domain: "google.com",
    category: "Cloud SaaS",
    startTime: "2026-08-11T09:00:00.000Z",
    endTime: "2026-08-11T14:10:00.000Z",
    durationSeconds: 18600, // 5h 10m
    bytesSent: 220000000,
    bytesReceived: 1650000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.81.0.14",
    deviceHost: "VPN-LAPTOP-MT"
  },
  {
    id: "sess-032",
    user: "m_taylor",
    userEmail: "m_taylor@corp.internal",
    department: "Remote VPN Users",
    siteOrApp: "Netflix Streaming",
    domain: "netflix.com",
    category: "Restricted / Threat",
    startTime: "2026-08-11T11:15:00.000Z",
    endTime: "2026-08-11T11:15:05.000Z",
    durationSeconds: 5,
    bytesSent: 4200,
    bytesReceived: 0,
    status: "Blocked",
    fwRuleId: "22",
    clientIp: "10.81.0.14",
    deviceHost: "VPN-LAPTOP-MT"
  },

  // --- Kevin Vance (k_vance) - Marketing ---
  {
    id: "sess-040",
    user: "k_vance",
    userEmail: "k_vance@corp.internal",
    department: "Marketing",
    siteOrApp: "TikTok",
    domain: "tiktok.com",
    category: "Social Media",
    startTime: "2026-08-11T13:00:00.000Z",
    endTime: "2026-08-11T14:15:00.000Z",
    durationSeconds: 4500, // 1h 15m
    bytesSent: 24000000,
    bytesReceived: 980000000,
    status: "Allowed",
    fwRuleId: "15",
    clientIp: "10.24.72.6",
    deviceHost: "MKT-MAC-01"
  },
  {
    id: "sess-041",
    user: "k_vance",
    userEmail: "k_vance@corp.internal",
    department: "Marketing",
    siteOrApp: "Canva Design Studio",
    domain: "canva.com",
    category: "Cloud SaaS",
    startTime: "2026-08-11T09:30:00.000Z",
    endTime: "2026-08-11T12:00:00.000Z",
    durationSeconds: 9000, // 2h 30m
    bytesSent: 68000000,
    bytesReceived: 420000000,
    status: "Allowed",
    fwRuleId: "12",
    clientIp: "10.24.72.6",
    deviceHost: "MKT-MAC-01"
  }
];

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m${secs > 0 ? ` ${secs}s` : ""}`;
  }
  return `${mins}m ${secs}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
