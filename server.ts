import express, { Request, Response } from "express";
import path from "path";
import dgram from "dgram";
import net from "net";
import { createServer as createViteServer } from "vite";

interface SyslogEvent {
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
}

const PORT = 3000;
const SYSLOG_UDP_PORT = parseInt(process.env.SYSLOG_UDP_PORT || "5514", 10);
const SYSLOG_TCP_PORT = parseInt(process.env.SYSLOG_TCP_PORT || "5514", 10);

// In-memory event buffer and active SSE client subscribers
const eventBuffer: SyslogEvent[] = [];
const sseClients = new Set<Response>();
let totalPacketsReceived = 0;
let eventSeqCounter = 1;

// Helper to parse key-value attributes from Sophos SFOS log string
function parseSophosKV(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const kvRegex = /([a-zA-Z0-9_]+)=(?:"([^"]*)"|(\S+))/g;
  let match: RegExpExecArray | null;
  while ((match = kvRegex.exec(raw)) !== null) {
    const key = match[1];
    const val = match[2] !== undefined ? match[2] : match[3];
    attrs[key] = val;
  }
  return attrs;
}

// Convert raw Syslog packet into structured SyslogEvent
function parseSyslogMessage(rawMessage: string, sourceIp: string, transport: 'udp' | 'tcp' | 'http'): SyslogEvent {
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0]; // HH:MM:SS
  const isoStr = now.toISOString();

  // Extract <PRI> header if present
  let severity = "Info";
  let facility = "firewall";
  const priMatch = rawMessage.match(/^<(\d{1,3})>/);
  if (priMatch) {
    const pri = parseInt(priMatch[1], 10);
    const facilityCode = Math.floor(pri / 8);
    const severityCode = pri % 8;

    const facilityMap: Record<number, string> = {
      0: "kernel", 1: "user", 2: "mail", 3: "system", 4: "auth", 5: "syslog",
      6: "printer", 7: "news", 8: "uucp", 9: "cron", 10: "auth", 16: "local0",
      17: "vpn", 18: "atp", 19: "ips", 20: "firewall"
    };
    const severityMap: Record<number, string> = {
      0: "Critical", 1: "Critical", 2: "Critical", 3: "Error",
      4: "Warning", 5: "Notice", 6: "Info", 7: "Debug"
    };

    if (facilityMap[facilityCode]) facility = facilityMap[facilityCode];
    if (severityMap[severityCode]) severity = severityMap[severityCode];
  }

  const attrs = parseSophosKV(rawMessage);

  // Extract Sophos specific parameters
  const host = attrs.device_name || attrs.device_id || attrs.hostname || sourceIp || "SFOS-FW";
  const srcIp = attrs.src_ip || attrs.source_ip || sourceIp;
  const dstIp = attrs.dst_ip || attrs.destination_ip || "10.0.0.1";
  const srcPort = attrs.src_port ? parseInt(attrs.src_port, 10) : undefined;
  const dstPort = attrs.dst_port ? parseInt(attrs.dst_port, 10) : undefined;
  const logId = attrs.log_id || attrs.logid || `010${Math.floor(Math.random() * 900000 + 100000)}`;
  const logComponent = attrs.log_component || attrs.subsystem || "Firewall";
  const logSubtype = attrs.log_subtype || attrs.log_type || "Traffic";
  const message = attrs.message || attrs.msg || rawMessage.replace(/^<\d+>(?:\d\s+)?/, '').trim();
  const protocol = attrs.protocol || (dstPort === 53 ? "UDP" : "TCP");

  // Determine refined severity
  if (attrs.priority) {
    const p = attrs.priority.toLowerCase();
    if (p.includes("crit") || p.includes("emerg") || p.includes("alert")) severity = "Critical";
    else if (p.includes("err")) severity = "Error";
    else if (p.includes("warn")) severity = "Warning";
    else if (p.includes("notice")) severity = "Notice";
    else if (p.includes("info")) severity = "Info";
    else if (p.includes("debug")) severity = "Debug";
  }

  // Refine facility from component
  const compLower = logComponent.toLowerCase();
  if (compLower.includes("auth")) facility = "auth";
  else if (compLower.includes("vpn")) facility = "vpn";
  else if (compLower.includes("ips")) facility = "ips";
  else if (compLower.includes("atp")) facility = "atp";
  else if (compLower.includes("system")) facility = "system";

  const uniqueId = `evt-live-${Date.now()}-${eventSeqCounter++}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: uniqueId,
    time: timeStr,
    isoTimestamp: isoStr,
    host,
    source: "SFOS_LIVE",
    facility,
    severity,
    message,
    ip: srcIp,
    srcPort,
    dstPort,
    protocol,
    logId,
    logComponent,
    logSubtype,
    rawPayload: rawMessage,
    attributes: {
      ...attrs,
      transport_protocol: transport,
      source_ip: sourceIp,
      ingest_time: isoStr
    }
  };
}

// Add event to buffer and push to all SSE connected clients
function broadcastEvent(evt: SyslogEvent) {
  totalPacketsReceived++;
  eventBuffer.unshift(evt);
  if (eventBuffer.length > 500) {
    eventBuffer.pop();
  }

  const payload = `data: ${JSON.stringify(evt)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- API Endpoints ---

  // Health and Status
  app.get("/api/syslog/status", (req: Request, res: Response) => {
    res.json({
      status: "running",
      mode: "live",
      udpPort: SYSLOG_UDP_PORT,
      tcpPort: SYSLOG_TCP_PORT,
      totalReceived: totalPacketsReceived,
      bufferedEvents: eventBuffer.length,
      activeSseClients: sseClients.size
    });
  });

  // Get current event buffer
  app.get("/api/syslog/events", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      count: eventBuffer.length,
      events: eventBuffer
    });
  });

  // Clear log buffer
  app.post("/api/syslog/clear", (req: Request, res: Response) => {
    eventBuffer.length = 0;
    res.json({ status: "ok", message: "Event buffer cleared" });
  });

  // HTTP Ingestion Endpoint (from Python receiver or external webhooks)
  app.post("/api/syslog/ingest", (req: Request, res: Response) => {
    try {
      const { rawPayload, raw_payload, source_ip, ip, message, attributes } = req.body;
      const raw = rawPayload || raw_payload || message || JSON.stringify(req.body);
      const clientIp = source_ip || ip || req.ip || "127.0.0.1";

      let evt: SyslogEvent;
      if (attributes && typeof attributes === 'object') {
        // If pre-parsed by Python receiver script
        evt = parseSyslogMessage(raw, clientIp, 'http');
        evt.attributes = { ...evt.attributes, ...attributes };
      } else {
        evt = parseSyslogMessage(raw, clientIp, 'http');
      }

      broadcastEvent(evt);
      res.json({ status: "success", id: evt.id });
    } catch (err) {
      res.status(400).json({ status: "error", message: String(err) });
    }
  });

  // Real-Time SSE Stream Endpoint
  app.get("/api/syslog/stream", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    sseClients.add(res);

    // Send connection established event
    res.write(`data: ${JSON.stringify({ type: "CONNECTED", time: new Date().toISOString() })}\n\n`);

    req.on("close", () => {
      sseClients.delete(res);
    });
  });

  // --- Native Node Syslog Sockets ---

  // 1. UDP Socket Listener
  try {
    const udpServer = dgram.createSocket("udp4");
    udpServer.on("message", (msg, rinfo) => {
      const raw = msg.toString("utf-8").trim();
      const evt = parseSyslogMessage(raw, rinfo.address, "udp");
      broadcastEvent(evt);
    });

    udpServer.on("error", (err) => {
      console.warn(`[Syslog UDP Warning] UDP socket error: ${err.message}`);
    });

    udpServer.bind(SYSLOG_UDP_PORT, "0.0.0.0", () => {
      console.log(`[Syslog UDP] Receiver bound to UDP 0.0.0.0:${SYSLOG_UDP_PORT}`);
    });
  } catch (err: any) {
    console.warn(`[Syslog UDP Error] Could not bind UDP socket: ${err.message}`);
  }

  // 2. TCP Socket Listener
  try {
    const tcpServer = net.createServer((socket) => {
      const clientIp = socket.remoteAddress || "127.0.0.1";
      socket.on("data", (data) => {
        const raw = data.toString("utf-8").trim();
        const evt = parseSyslogMessage(raw, clientIp, "tcp");
        broadcastEvent(evt);
      });
    });

    tcpServer.on("error", (err) => {
      console.warn(`[Syslog TCP Warning] TCP socket error: ${err.message}`);
    });

    tcpServer.listen(SYSLOG_TCP_PORT, "0.0.0.0", () => {
      console.log(`[Syslog TCP] Receiver bound to TCP 0.0.0.0:${SYSLOG_TCP_PORT}`);
    });
  } catch (err: any) {
    console.warn(`[Syslog TCP Error] Could not bind TCP socket: ${err.message}`);
  }

  // --- Vite Dev Middleware or Static Production Serving ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Web Server] Sophos Firewall Syslog Service running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
