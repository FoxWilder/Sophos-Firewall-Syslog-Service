import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

export interface SyslogRecord {
  id: string;
  time: string;
  iso_timestamp: string;
  host: string;
  source: string;
  facility: string;
  severity: string;
  message: string;
  ip: string;
  src_port?: number | null;
  dst_port?: number | null;
  protocol?: string | null;
  log_id?: string | null;
  log_component?: string | null;
  log_subtype?: string | null;
  raw_payload: string;
  attributes_json: string;
  
  // Parsed Sophos Web/App Reporting Fields
  user_name?: string | null;
  domain?: string | null;
  app_name?: string | null;
  category?: string | null;
  status?: string | null; // Allowed | Blocked | Warned
  duration_seconds?: number | null;
  bytes_sent?: number | null;
  bytes_received?: number | null;
  fw_rule_id?: string | null;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "syslog_events.sqlite");

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(filebuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Create tables if they do not exist
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS syslog_events (
      id TEXT PRIMARY KEY,
      time TEXT,
      iso_timestamp TEXT,
      host TEXT,
      source TEXT,
      facility TEXT,
      severity TEXT,
      message TEXT,
      ip TEXT,
      src_port INTEGER,
      dst_port INTEGER,
      protocol TEXT,
      log_id TEXT,
      log_component TEXT,
      log_subtype TEXT,
      raw_payload TEXT,
      attributes_json TEXT,
      user_name TEXT,
      domain TEXT,
      app_name TEXT,
      category TEXT,
      status TEXT,
      duration_seconds INTEGER,
      bytes_sent INTEGER,
      bytes_received INTEGER,
      fw_rule_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_name ON syslog_events(user_name);
    CREATE INDEX IF NOT EXISTS idx_domain ON syslog_events(domain);
    CREATE INDEX IF NOT EXISTS idx_app_name ON syslog_events(app_name);
    CREATE INDEX IF NOT EXISTS idx_iso_timestamp ON syslog_events(iso_timestamp);
  `);

  saveDb();
  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error("[SQLite Save Error]", err);
  }
}

export async function insertSyslogEvent(event: {
  id: string;
  time: string;
  isoTimestamp: string;
  host: string;
  source: string;
  facility: string;
  severity: string;
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
}): Promise<void> {
  const db = await getDb();
  
  const attrs = event.attributes || {};
  const userName = attrs.user_name || attrs.user || attrs.username || (event.facility === "auth" ? "admin" : null);
  const domain = attrs.domain || attrs.url || attrs.host || (attrs.app_name ? `${attrs.app_name.toLowerCase().replace(/\s+/g, "")}.com` : null);
  const appName = attrs.app_name || attrs.application || attrs.site || (domain ? domain.split('.')[0] : null);
  const category = attrs.category || (appName?.toLowerCase().includes("flowgpt") || appName?.toLowerCase().includes("gpt") ? "AI & LLMs" : "Web Browsing");
  const status = (attrs.status || "").toLowerCase().includes("deny") || (attrs.status || "").toLowerCase().includes("block") ? "Blocked" : "Allowed";
  const duration = attrs.duration_seconds ? parseInt(attrs.duration_seconds, 10) : (attrs.duration ? parseInt(attrs.duration, 10) : 120);
  const bytesSent = attrs.bytes_sent ? parseInt(attrs.bytes_sent, 10) : (attrs.sent ? parseInt(attrs.sent, 10) : 15000);
  const bytesRecv = attrs.bytes_received ? parseInt(attrs.bytes_received, 10) : (attrs.received ? parseInt(attrs.received, 10) : 45000);
  const fwRuleId = attrs.fw_rule_id || attrs.rule_id || "12";

  db.run(
    `INSERT OR REPLACE INTO syslog_events (
      id, time, iso_timestamp, host, source, facility, severity, message, ip,
      src_port, dst_port, protocol, log_id, log_component, log_subtype,
      raw_payload, attributes_json, user_name, domain, app_name, category,
      status, duration_seconds, bytes_sent, bytes_received, fw_rule_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.time,
      event.isoTimestamp,
      event.host,
      event.source,
      event.facility,
      event.severity,
      event.message,
      event.ip,
      event.srcPort || null,
      event.dstPort || null,
      event.protocol || null,
      event.logId || null,
      event.logComponent || null,
      event.logSubtype || null,
      event.rawPayload,
      JSON.stringify(attrs),
      userName,
      domain,
      appName,
      category,
      status,
      duration,
      bytesSent,
      bytesRecv,
      fwRuleId
    ]
  );

  saveDb();
}

export async function getAllSyslogEvents(limit: number = 500): Promise<any[]> {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM syslog_events ORDER BY iso_timestamp DESC LIMIT ${limit}`);
  if (!res || res.length === 0) return [];

  const columns = res[0].columns;
  const values = res[0].values;

  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });

    let attrs = {};
    try {
      attrs = JSON.parse(obj.attributes_json || "{}");
    } catch (e) {}

    return {
      id: obj.id,
      time: obj.time,
      isoTimestamp: obj.iso_timestamp,
      host: obj.host,
      source: obj.source,
      facility: obj.facility,
      severity: obj.severity,
      message: obj.message,
      ip: obj.ip,
      srcPort: obj.src_port,
      dstPort: obj.dst_port,
      protocol: obj.protocol,
      logId: obj.log_id,
      logComponent: obj.log_component,
      logSubtype: obj.log_subtype,
      rawPayload: obj.raw_payload,
      attributes: attrs,
      userName: obj.user_name,
      domain: obj.domain,
      appName: obj.app_name,
      category: obj.category,
      status: obj.status,
      durationSeconds: obj.duration_seconds,
      bytesSent: obj.bytes_sent,
      bytesReceived: obj.bytes_received,
      fwRuleId: obj.fw_rule_id
    };
  });
}

export async function clearAllSyslogEvents(): Promise<void> {
  const db = await getDb();
  db.run(`DELETE FROM syslog_events;`);
  saveDb();
}

export async function queryReportingData(params: {
  userName?: string;
  domain?: string;
  department?: string;
  category?: string;
}): Promise<any[]> {
  const db = await getDb();
  let whereClauses: string[] = [];
  let queryParams: any[] = [];

  if (params.userName && params.userName !== "all") {
    whereClauses.push("LOWER(user_name) LIKE ?");
    queryParams.push(`%${params.userName.toLowerCase()}%`);
  }

  if (params.domain && params.domain !== "all") {
    whereClauses.push("(LOWER(domain) LIKE ? OR LOWER(app_name) LIKE ?)");
    queryParams.push(`%${params.domain.toLowerCase()}%`, `%${params.domain.toLowerCase()}%`);
  }

  if (params.category && params.category !== "all") {
    whereClauses.push("LOWER(category) = ?");
    queryParams.push(params.category.toLowerCase());
  }

  const whereStr = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
  const sql = `SELECT * FROM syslog_events ${whereStr} ORDER BY iso_timestamp DESC LIMIT 1000`;

  const stmt = db.prepare(sql);
  if (queryParams.length > 0) stmt.bind(queryParams);

  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    let attrs = {};
    try {
      attrs = JSON.parse((row.attributes_json as string) || "{}");
    } catch (e) {}

    results.push({
      id: row.id,
      time: row.time,
      isoTimestamp: row.iso_timestamp,
      host: row.host,
      source: row.source,
      facility: row.facility,
      severity: row.severity,
      message: row.message,
      ip: row.ip,
      userName: row.user_name || "unknown_user",
      domain: row.domain || "unknown_domain",
      appName: row.app_name || row.domain || "Web Service",
      category: row.category || "Web Browsing",
      status: row.status || "Allowed",
      durationSeconds: Number(row.duration_seconds) || 60,
      bytesSent: Number(row.bytes_sent) || 1000,
      bytesReceived: Number(row.bytes_received) || 5000,
      fwRuleId: row.fw_rule_id || "12",
      attributes: attrs
    });
  }
  stmt.free();

  return results;
}
