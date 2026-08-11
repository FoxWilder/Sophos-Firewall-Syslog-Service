import { SyslogEvent } from "../types";

export interface HumanTranslatedLog {
  event: SyslogEvent;
  title: string;
  summary: string;
  statusCategory: "allowed" | "blocked" | "warning" | "info";
  statusBadgeText: string;
  logTypeLabel: string;
  logComponentLabel: string;
  severityLabel: string;
  explanation: string;
  securityImpact: "Critical Threat" | "High Risk" | "Medium Risk" | "Low / Info";
  recommendedAction: string;
  ruleInfo?: string;
  srcFormatted: string;
  dstFormatted: string;
  appOrUser: string;
  decodedLogId?: {
    typeId: string;
    componentId: string;
    subtypeId: string;
    severityCode: string;
    messageId: string;
  };
}

// Sophos SFOS 22.0 Status Code Map
const SOPHOS_STATUS_MAP: Record<string, { label: string; category: "allowed" | "blocked" | "warning" | "info" }> = {
  "0": { label: "Unspecified", category: "info" },
  "1": { label: "Allowed", category: "allowed" },
  "2": { label: "Denied / Blocked", category: "blocked" },
  "3": { label: "Allow Session", category: "allowed" },
  "4": { label: "Deny Session", category: "blocked" },
  "5": { label: "Success", category: "allowed" },
  "6": { label: "Failed", category: "warning" },
  "7": { label: "Established", category: "allowed" },
  "8": { label: "Terminated", category: "warning" },
  "9": { label: "Lease Renewed", category: "info" },
  "10": { label: "Lease Released", category: "info" },
  "11": { label: "Expired", category: "warning" },
  "12": { label: "Would Deny (Monitor)", category: "warning" },
  "13": { label: "Connected", category: "info" },
  "14": { label: "Disconnected", category: "info" },
  "15": { label: "Interim Update", category: "info" },
};

// Sophos SFOS 22.0 Log Type (c1c2) Map
const SOPHOS_TYPE_MAP: Record<string, string> = {
  "01": "Firewall Traffic",
  "02": "IPS / Intrusion Prevention",
  "03": "Anti-Virus / Malware",
  "04": "Web Filter / Content Control",
  "05": "Application Control",
  "06": "Email / Anti-Spam",
  "07": "Authentication & Access",
  "08": "System Daemon & Admin",
  "09": "Security Heartbeat",
  "10": "ATP / RED / VPN",
  "14": "WAF / Web Protection",
};

/**
 * Decodes 12-character Sophos SFOS Log ID:
 * Format: [c1c2][c3c4][c5c6][c7][c8c9c10c11c12]
 * c1c2 = Type, c3c4 = Component, c5c6 = Subtype, c7 = Severity, c8-c12 = Message ID
 */
export function decodeSophosLogId(logId?: string) {
  if (!logId || logId.length < 12) return null;
  const digits = logId.replace(/\D/g, "");
  if (digits.length < 12) return null;

  return {
    typeId: digits.substring(0, 2),
    componentId: digits.substring(2, 4),
    subtypeId: digits.substring(4, 6),
    severityCode: digits.substring(6, 7),
    messageId: digits.substring(7, 12),
  };
}

export function translateSophosEvent(evt: SyslogEvent): HumanTranslatedLog {
  const attrs = evt.attributes || {};
  const decodedId = decodeSophosLogId(evt.logId);

  // Extract core parameters
  const statusRaw = attrs.status || attrs.action || "";
  const statusNum = attrs.status_code || attrs.status_id;
  const logComp = evt.logComponent || attrs.log_component || attrs.subsystem || evt.facility;
  const logSubtype = evt.logSubtype || attrs.log_subtype || attrs.log_type || "";
  const srcIp = evt.ip || attrs.src_ip || attrs.source_ip || "Internal Network";
  const dstIp = attrs.dst_ip || attrs.destination_ip || "External Host";
  const srcPort = evt.srcPort || (attrs.src_port ? parseInt(attrs.src_port, 10) : undefined);
  const dstPort = evt.dstPort || (attrs.dst_port ? parseInt(attrs.dst_port, 10) : undefined);
  const proto = evt.protocol || attrs.protocol || "IP";
  const fwRule = attrs.fw_rule_id || attrs.rule_id || attrs.firewall_rule_id;
  const user = attrs.user_name || attrs.user || attrs.username;
  const appName = attrs.app_name || attrs.application || attrs.domain || attrs.url;
  const rawMsg = evt.message || attrs.message || "";

  // Formatted source and destination
  const srcFormatted = srcPort ? `${srcIp}:${srcPort}` : srcIp;
  const dstFormatted = dstPort ? `${dstIp}:${dstPort}` : dstIp;
  const appOrUser = user ? `User (${user})` : appName ? `App (${appName})` : `Protocol (${proto})`;

  // Determine status category & label
  let statusCategory: "allowed" | "blocked" | "warning" | "info" = "info";
  let statusBadgeText = "LOGGED";

  if (statusNum && SOPHOS_STATUS_MAP[statusNum]) {
    statusCategory = SOPHOS_STATUS_MAP[statusNum].category;
    statusBadgeText = SOPHOS_STATUS_MAP[statusNum].label.toUpperCase();
  } else if (statusRaw) {
    const s = statusRaw.toLowerCase();
    if (s.includes("allow") || s.includes("pass") || s.includes("success") || s.includes("accept")) {
      statusCategory = "allowed";
      statusBadgeText = "ALLOWED";
    } else if (s.includes("deny") || s.includes("block") || s.includes("drop") || s.includes("reject")) {
      statusCategory = "blocked";
      statusBadgeText = "BLOCKED";
    } else if (s.includes("warn") || s.includes("fail") || s.includes("expire") || s.includes("term")) {
      statusCategory = "warning";
      statusBadgeText = "WARNING";
    }
  } else if (evt.severity === "Critical" || evt.severity === "Error") {
    statusCategory = "blocked";
    statusBadgeText = "CRITICAL";
  } else if (evt.severity === "Warning") {
    statusCategory = "warning";
    statusBadgeText = "NOTICE";
  } else {
    statusCategory = "info";
    statusBadgeText = "INFO";
  }

  // Determine Log Type label
  let logTypeLabel = "Firewall Log";
  if (decodedId && SOPHOS_TYPE_MAP[decodedId.typeId]) {
    logTypeLabel = SOPHOS_TYPE_MAP[decodedId.typeId];
  } else if (evt.facility === "ips") {
    logTypeLabel = "Intrusion Prevention (IPS)";
  } else if (evt.facility === "atp") {
    logTypeLabel = "Advanced Threat Protection (ATP)";
  } else if (evt.facility === "auth") {
    logTypeLabel = "Authentication & Access";
  } else if (evt.facility === "vpn") {
    logTypeLabel = "VPN Tunneling";
  } else if (evt.facility === "webfilter") {
    logTypeLabel = "Web / Content Filtering";
  } else if (evt.facility === "antivirus") {
    logTypeLabel = "Anti-Virus Scanner";
  }

  // Construct Human Headlines and Explanations based on Sophos SFOS module logic
  let title = `${logTypeLabel}: ${statusBadgeText}`;
  let summary = "";
  let explanation = "";
  let securityImpact: "Critical Threat" | "High Risk" | "Medium Risk" | "Low / Info" = "Low / Info";
  let recommendedAction = "No action required. Standard network logging event.";

  const compLower = (logComp || "").toLowerCase();
  const msgLower = rawMsg.toLowerCase();

  // Scenario 1: Firewall Traffic Allowed
  if (statusCategory === "allowed" && (compLower.includes("firewall") || compLower.includes("traffic"))) {
    title = `Permitted Network Session (${proto})`;
    summary = `Sophos Firewall permitted connection from workstation ${srcFormatted} to remote target ${dstFormatted}.`;
    explanation = `The firewall processed the connection request against Rule #${fwRule || "Default"} and verified that the source host is authorized to access ${appName || dstFormatted} via ${proto}.`;
    securityImpact = "Low / Info";
    recommendedAction = "Normal network communication. Continue routine monitoring.";
  }
  // Scenario 2: Firewall Traffic Blocked / Denied
  else if (statusCategory === "blocked" && (compLower.includes("firewall") || compLower.includes("traffic"))) {
    title = `Connection Dropped / Blocked`;
    summary = `Sophos Firewall blocked connection attempt from ${srcFormatted} to ${dstFormatted}.`;
    explanation = `The packet was denied by Firewall Policy ${fwRule ? `#${fwRule}` : "Default Drop Rule"}. This indicates an unauthorized port connection attempt or restricted outbound request.`;
    securityImpact = "Medium Risk";
    recommendedAction = "Review source host IP if unexpected. Check if firewall rule #"+ (fwRule || "drop") +" requires rule adjustments.";
  }
  // Scenario 3: IPS Intrusion Prevention Threat
  else if (compLower.includes("ips") || compLower.includes("idp") || evt.facility === "ips") {
    title = statusCategory === "blocked" ? `IPS Cyber Threat Blocked!` : `IPS Anomaly Detected`;
    summary = `Sophos IPS engine intercepted a potential network intrusion attempt from ${srcFormatted} targeting ${dstFormatted}.`;
    explanation = `The Deep Packet Inspection (DPI) sensor matched network traffic against attack signatures (${attrs.message || "Malicious Payload / Port Scan"}). The firewall immediately dropped the packet sequence to protect internal resources.`;
    securityImpact = "Critical Threat";
    recommendedAction = "Investigate source IP address. Consider adding the remote IP to global firewall blocklist if attack persists.";
  }
  // Scenario 4: Malware / Anti-Virus Alert
  else if (compLower.includes("virus") || compLower.includes("malware") || evt.facility === "antivirus") {
    title = `Malware Threat Detected & Contained`;
    summary = `Sophos Anti-Virus stream engine caught infected content requested by host ${srcFormatted}.`;
    explanation = `A malicious file or payload signature (${attrs.virus_name || "Trojan/Malware"}) was identified during HTTP/HTTPS payload inspection. Sophos SFOS terminated the connection before the payload reached the client.`;
    securityImpact = "Critical Threat";
    recommendedAction = "Perform full endpoint antivirus scan on client host " + srcIp + ".";
  }
  // Scenario 5: Web Filter / Content Control Blocked
  else if (compLower.includes("web") || compLower.includes("http") || evt.facility === "webfilter") {
    title = statusCategory === "blocked" ? `Restricted Web Content Blocked` : `Web Access Logged`;
    summary = `User on ${srcFormatted} attempted to access domain '${appName || dstIp}'.`;
    explanation = `Sophos Web Filtering policy evaluated the site URL against web category restrictions. Action: ${statusBadgeText}.`;
    securityImpact = statusCategory === "blocked" ? "Medium Risk" : "Low / Info";
    recommendedAction = statusCategory === "blocked" ? "Review Web Filter policy if employee requires legitimate access to this domain." : "Standard web navigation log.";
  }
  // Scenario 6: User Authentication & Login
  else if (compLower.includes("auth") || compLower.includes("user") || evt.facility === "auth") {
    if (statusCategory === "allowed") {
      title = `User Authentication Successful (${user || "admin"})`;
      summary = `User '${user || "administrator"}' successfully logged into Sophos Firewall / SSL VPN from IP ${srcIp}.`;
      explanation = `Multi-factor / Directory authentication verified user credentials. Active management session initiated.`;
      securityImpact = "Low / Info";
      recommendedAction = "Verify admin login aligns with scheduled maintenance windows.";
    } else {
      title = `Authentication Failure Alert! (${user || "unknown user"})`;
      summary = `Failed login attempt for account '${user || "unknown"}' originating from ${srcIp}.`;
      explanation = `Sophos Auth service rejected invalid password or unauthorized account credentials. Repeated failures may trigger brute-force lockouts.`;
      securityImpact = "High Risk";
      recommendedAction = "Check for brute-force login attempts from host " + srcIp + ". Ensure strong MFA policies are enforced.";
    }
  }
  // Scenario 7: VPN Tunnels
  else if (compLower.includes("vpn") || compLower.includes("ipsec") || evt.facility === "vpn") {
    title = `VPN Service Event (${statusBadgeText})`;
    summary = `VPN Gateway event on host ${srcIp}. State: ${statusBadgeText}.`;
    explanation = `Sophos IPsec/SSL VPN daemon recorded tunnel state change or key exchange. Message: ${rawMsg}`;
    securityImpact = "Medium Risk";
    recommendedAction = "Monitor remote gateway stability if tunnel drops frequently.";
  }
  // Scenario 8: Fallback / General Event
  else {
    title = `${logComp || "System"} Event (${evt.severity})`;
    summary = rawMsg || `System event recorded on device ${evt.host}`;
    explanation = `Sophos SFOS system daemon logged operational status. Component: ${logComp}. Host: ${evt.host}.`;
    securityImpact = evt.severity === "Critical" ? "Critical Threat" : evt.severity === "Warning" ? "Medium Risk" : "Low / Info";
    recommendedAction = "Refer to Sophos SFOS Syslog documentation for detailed component diagnostic flags.";
  }

  const ruleInfo = fwRule ? `FW Rule #${fwRule}` : undefined;

  return {
    event: evt,
    title,
    summary,
    statusCategory,
    statusBadgeText,
    logTypeLabel,
    logComponentLabel: logComp || "General Firewall",
    severityLabel: evt.severity,
    explanation,
    securityImpact,
    recommendedAction,
    ruleInfo,
    srcFormatted,
    dstFormatted,
    appOrUser,
    decodedLogId: decodedId || undefined,
  };
}
