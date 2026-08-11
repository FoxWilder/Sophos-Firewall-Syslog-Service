# Sophos Firewall Syslog Receiver

A real-time, high-performance Sophos SFOS Syslog Receiver and Monitoring Dashboard built with React, Vite, Tailwind CSS, Recharts, and Lucide Icons.

## 🌟 Key Features

- **Real-Time Live Syslog Monitoring**: Ingests, streams, and displays high-volume RFC 5424 / RFC 3164 Sophos SFOS log streams.
- **Sophos Key-Value Attribute Parser**: Automatically extracts key-value parameters (`device_name`, `src_ip`, `dst_ip`, `log_id`, `rule_id`, `user_name`, `fw_rule`, `app_name`).
- **Interactive Event Explorer & Search**: Instant full-text searching, multi-attribute column filtering, facility and severity toggles.
- **Visual Event Analytics**: Time-series volume trends, threat severity distribution ratios, top firewall host volume bar charts, and facility breakdowns.
- **Receiver Configuration**: Custom UDP/TCP/TLS port settings, log retention windows, file size rotation thresholds, and automated alert trigger rules.
- **Packet Injector & Simulator**: Integrated test packet generator for testing alert rules and live stream filters without needing live firewall traffic.
- **Windows Deployment Guide**: Step-by-step PowerShell scripts and Windows Defender Firewall commands for host deployment.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or bun

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/sophos-syslog-receiver.git
   cd sophos-syslog-receiver
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Type check / Lint:**
   ```bash
   npm run lint
   ```

## 🛡️ Syslog Listener Configuration (Python Service)

The project includes Python receiver scripts for running on Windows Server or Linux host collectors:

```powershell
# Windows PowerShell Launcher
cd syslog-server
.\start-syslog-server.ps1

# Windows Firewall Port Allow (PowerShell Admin)
New-NetFirewallRule -DisplayName "Sophos Syslog UDP 5514" -Direction Inbound -Protocol UDP -LocalPort 5514 -Action Allow
New-NetFirewallRule -DisplayName "Sophos Syslog TCP 5514" -Direction Inbound -Protocol TCP -LocalPort 5514 -Action Allow
```

## 📊 Sophos SFOS Log Format Supported
- Standard RFC 5424 Syslog
- Sophos SFOS Key-Value Format (`device_name="XG" src_ip="192.168.1.50" dst_ip="8.8.8.8" fw_rule_id="10"`)
- Facilities: `firewall`, `auth`, `system`, `vpn`, `atp`, `ips`, `waf`, `wireless`
- Severities: `Debug`, `Info`, `Notice`, `Warning`, `Error`, `Critical`

## 📄 License
MIT License
